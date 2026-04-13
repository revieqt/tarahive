import React, { useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { ThemedIcons } from '../ThemedIcons';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useUser } from '@/hooks/useUser';
import { SafeAreaView } from 'react-native-safe-area-context';
import Wave from '../Wave';
import ProfileImage from '../ProfileImage';

interface SelectedMember {
  userID: string;
  fname: string;
  lname: string;
  profileImage?: string;
}

interface UserPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onMembersSelected: (members: SelectedMember[]) => void;
  selectedMembers: SelectedMember[];
}

export default function UserPickerModal({
  visible,
  onClose,
  onMembersSelected,
  selectedMembers,
}: UserPickerModalProps) {
  const accentColor = useThemeColor({}, 'accent');
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const { searchUsers, isLoading: userSearchLoading } = useUser();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SelectedMember[]>([]);

  // Handle member search
  const handleMemberSearch = async (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await searchUsers(query);
      // Filter out already selected members
      const filtered = results.filter(
        (user) => !selectedMembers.some((member) => member.userID === user.userID)
      );
      setSearchResults(filtered);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    }
  };

  // Handle add member - directly update and close
  const handleAddMember = (user: SelectedMember) => {
    const updatedMembers = [...selectedMembers, user];
    onMembersSelected(updatedMembers);
    onClose();
  };

  // Reset state when modal closes
  const handleModalClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleModalClose}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ThemedView style={styles.modalContainer} color="primary">
          <View style={{ padding: 16, flex: 1 }}>
            <TouchableOpacity onPress={handleModalClose}>
              <ThemedIcons name="arrow-left" size={24} />
            </TouchableOpacity>
            <ThemedText type="title">Search Users</ThemedText>

            <View style={styles.searchInputContainer}>
                <TextInput
                    style={[styles.searchInput, { color: textColor }]}
                    placeholder="Search by name or username"
                    placeholderTextColor={textColor + '99'}
                    value={searchQuery}
                    onChangeText={handleMemberSearch}
                />
                {searchQuery && (
                    <TouchableOpacity onPress={() => { setSearchQuery(''); setSearchResults([]); }}>
                    <ThemedIcons name="close" size={18} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Search Results */}
            {searchQuery.trim() && (
              <View style={styles.resultsSection}>
                {userSearchLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" />
                    <ThemedText style={{ marginTop: 8 }}>Searching...</ThemedText>
                  </View>
                ) : searchResults.length > 0 ? (
                  <FlatList
                    data={searchResults}
                    keyExtractor={(item) => item.userID}
                    scrollEnabled={true}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.userResultItem}
                        onPress={() => handleAddMember(item)}
                      >
                        <View style={styles.profileImageContainer}>
                            <ProfileImage imagePath={item.profileImage}/>
                        </View>
                        <ThemedText style={{flex: 1}}>
                        {item.fname} {item.lname}
                        </ThemedText>

                        <ThemedIcons name="plus" size={20}/>
                      </TouchableOpacity>
                    )}
                  />
                ) : (
                  <View style={styles.noResults}>
                    <ThemedText style={{ opacity: 0.5 }}>No users found</ThemedText>
                  </View>
                )}
              </View>
            )}
          </View>

          <Wave
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, opacity: 0.7 }}
            color={accentColor}
            height={70}
          />
        </ThemedView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  searchSection: {
    paddingHorizontal: 0,
    paddingVertical: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ccc4',
    paddingVertical: 3,
    marginVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 13,
    fontFamily: 'Poppins',

  },
  resultsSection: {
    flex: 1,
    paddingHorizontal: 0,
    paddingVertical: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
    opacity: 0.7,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResults: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc4',
  },
  userResultName: {
    fontSize: 14,
    fontWeight: '500',
  },
    profileImageContainer: {
    width: 40,
    aspectRatio: 1,
    borderRadius: 20,
    marginRight: 12,
    overflow: 'hidden',
  }
});
