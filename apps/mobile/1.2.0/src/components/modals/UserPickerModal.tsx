import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyMessage from '@/components/common/EmptyMessage';
import ProfileImage from '@/components/ui/ProfileImage';
import { TText, TView } from '@/components/ui/Themed';
import { useSearchUser } from '@/hooks/user/useSearchUser';
import { useThemeColor } from '@/hooks/shared/useThemeColor';
import { UserSearchResult } from '@/types/userTypes';

interface UserPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (users: UserSearchResult[]) => void;
  selectedUsers?: UserSearchResult[];
}

export default function UserPickerModal({
  visible,
  onClose,
  onSelect,
  selectedUsers = [],
}: UserPickerModalProps) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<UserSearchResult[]>(selectedUsers);
  const query = useSearchUser(search);
  const accentColor = useThemeColor({}, 'accent');
  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({}, 'icon');

  const results = useMemo(() => query.data ?? [], [query.data]);
  const toggle = (user: UserSearchResult) => {
    setSelected((current) =>
      current.some((item) => item.id === user.id)
        ? current.filter((item) => item.id !== user.id)
        : [...current, user],
    );
  };

  const close = () => {
    setSearch('');
    onClose();
  };

  const confirm = () => {
    onSelect(selected);
    close();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={close} />
          <TView color="primary" style={styles.sheet}>
            <View style={styles.header}>
              <TText type="subtitle">Mention people</TText>
              <TouchableOpacity onPress={confirm}>
                <TText style={{ color: accentColor, fontWeight: '700' }}>Done</TText>
              </TouchableOpacity>
            </View>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search by name or username"
              placeholderTextColor={placeholderColor as string}
              style={[styles.search, { color: textColor, borderColor: accentColor }]}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {search.trim().length > 0 && search.trim().length < 3 ? (
              <TText style={styles.helper}>Enter at least 3 characters.</TText>
            ) : null}
            {search.trim().length >= 3 && (query.isDebouncing || query.isLoading || query.isFetching) ? (
              <ActivityIndicator color={accentColor} style={styles.state} />
            ) : search.trim().length < 3 ? (
              <EmptyMessage title="Search for a user" description="Type at least 3 characters." iconName="magnify" />
            ) : results.length === 0 ? (
              <EmptyMessage title="No users found" description="Try another search." iconName="account-search-outline" />
            ) : (
              <FlatList
                data={results}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                  const isSelected = selected.some((user) => user.id === item.id);
                  return (
                    <TouchableOpacity style={styles.row} onPress={() => toggle(item)}>
                      <View style={styles.avatar}><ProfileImage imagePath={item.profileImage} /></View>
                      <View style={styles.details}>
                        <TText>{[item.fname, item.lname].filter(Boolean).join(' ') || item.username}</TText>
                        <TText style={styles.username}>@{item.username}</TText>
                      </View>
                      <TText style={{ color: accentColor }}>{isSelected ? 'Selected' : 'Select'}</TText>
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </TView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, justifyContent: 'flex-end' },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#0008' },
  sheet: { maxHeight: '85%', minHeight: '45%', padding: 18, borderTopLeftRadius: 18, borderTopRightRadius: 18 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  search: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 8 },
  helper: { fontSize: 11, opacity: 0.7, marginBottom: 8 },
  state: { marginTop: 24 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, overflow: 'hidden' },
  details: { flex: 1 },
  username: { fontSize: 11, opacity: 0.7 },
});