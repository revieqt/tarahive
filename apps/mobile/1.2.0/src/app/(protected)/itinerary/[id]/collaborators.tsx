import React, { useMemo, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TIcon, TText, TView } from '@/components/ui/Themed';
import Header from '@/components/common/Header';
import DropDownField from '@/components/ui/DropDownField';
import ProfileImage from '@/components/ui/ProfileImage';
import { useThemeColor } from '@/hooks/shared/useThemeColor';
import { useLanguage } from '@/context/LanguageContext';
import { useSession } from '@/context/SessionContext';
import { useGetCollaborators } from '@/hooks/itinerary/useGetCollaborators';
import { useAddCollaborator } from '@/hooks/itinerary/useAddCollaborator';
import { useUpdateCollaborator } from '@/hooks/itinerary/useUpdateCollaborator';
import { useDeleteCollaborator } from '@/hooks/itinerary/useDeleteCollaborator';
import { useSearchUser } from '@/hooks/user/useSearchUser';
import {
  CollaboratorPermission,
  ItineraryCollaborator,
} from '@/types/itineraryTypes';
import { UserSearchResult } from '@/types/userTypes';

type CollaboratorSelection = { kind: 'add'; user: UserSearchResult };

export default function ItineraryCollaboratorsScreen() {
  const params = useLocalSearchParams<{ id?: string | string[]; title?: string | string[] }>();
  const itineraryId = Array.isArray(params.id) ? params.id[0] : params.id;
  const itineraryTitle = Array.isArray(params.title) ? params.title[0] : params.title;
  const { session } = useSession();
  const { t } = useLanguage();
  const accentColor = useThemeColor({}, 'accent');
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({}, 'icon');
  const [search, setSearch] = useState('');
  const [selection, setSelection] = useState<CollaboratorSelection | null>(null);
  const [permission, setPermission] = useState<CollaboratorPermission.EDIT | CollaboratorPermission.VIEW>(
    CollaboratorPermission.VIEW
  );

  const collaboratorsQuery = useGetCollaborators(itineraryId);
  const collaborators = collaboratorsQuery.data ?? [];
  const searchQuery = useSearchUser(search);
  const addMutation = useAddCollaborator(itineraryId);
  const updateMutation = useUpdateCollaborator(itineraryId);
  const deleteMutation = useDeleteCollaborator(itineraryId);
  const ownerCollaborator = collaborators.find(
    (collaborator) => collaborator.permissions === CollaboratorPermission.OWNER
  );
  const canManage = Boolean(
    session?.user?.id && ownerCollaborator?.userId === session.user.id
  );

  const availableUsers = useMemo(() => {
    const collaboratorIds = new Set(collaborators.map((collaborator) => collaborator.userId));
    return (searchQuery.data ?? []).filter((user) => !collaboratorIds.has(user.id));
  }, [collaborators, searchQuery.data]);

  const permissionOptions = [
    { label: t('itinerary.viewType.viewer'), value: CollaboratorPermission.VIEW },
    { label: t('itinerary.viewType.editor'), value: CollaboratorPermission.EDIT },
  ];

  const closeModal = () => setSelection(null);

  const openAddModal = (user: UserSearchResult) => {
    setPermission(CollaboratorPermission.VIEW);
    setSelection({ kind: 'add', user });
  };

  const saveSelection = () => {
    if (!selection || !canManage || !itineraryId) return;

    addMutation.addCollaborator(
      { itineraryId, userId: selection.user.id, permission },
      () => {
        setSearch('');
        closeModal();
      }
    );
  };

  const renderCollaborator = ({ item }: { item: ItineraryCollaborator }) => {
    const isOwner = item.permissions === CollaboratorPermission.OWNER;
    const roleLabel = isOwner
      ? t('itinerary.viewType.owner')
      : item.permissions === CollaboratorPermission.EDIT
        ? t('itinerary.viewType.editor')
        : t('itinerary.viewType.viewer');

    return (
      <View style={[styles.personRow, { backgroundColor: primaryColor }]}>
        <View style={styles.personInfo}>
          <View style={styles.avatar}>
            <ProfileImage imagePath={item.profileImage || undefined} />
          </View>
          <View style={styles.personDetails}>
            <TText style={styles.personName}>{[item.fname, item.lname].filter(Boolean).join(' ') || item.username}</TText>
            <TText style={styles.username}>@{item.username}</TText>
          </View>
        </View>
        <View style={styles.rowActions}>
          {canManage && !isOwner ? (
            <>
              <DropDownField
                value={item.permissions}
                onValueChange={(value) => updateMutation.updateCollaborator({
                  collaboratorId: item.collaboratorId,
                  permission: value as CollaboratorPermission.EDIT | CollaboratorPermission.VIEW,
                })}
                values={permissionOptions}
                enabled={!updateMutation.isPending}
                custom
                customButtonStyle={[styles.roleButton, { borderColor: accentColor }]}
                customLabelStyle={styles.roleText}
                customIconName="chevron-down"
                customIconSize={16}
              />
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteMutation.deleteCollaborator(item.collaboratorId)}
              disabled={deleteMutation.isPending}
              accessibilityRole="button"
              accessibilityLabel={t('itinerary.form.collaborator_remove')}
            >
              <TIcon name="trash-can-outline" size={19} color="#D9534F" />
            </TouchableOpacity>
            </>
          ) : (
            <View style={[styles.roleBadge, { borderColor: accentColor }]}>
              <TText style={styles.roleText}>{roleLabel}</TText>
            </View>
          )}
        </View>
      </View>
    );
  };

  const selectedUser = selection?.user;

  return (
    <TView style={styles.container}>
      <FlatList
        data={collaborators}
        keyExtractor={(item) => item.collaboratorId}
        renderItem={renderCollaborator}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={(
          <View>
            <Header
              title={t('itinerary.form.collaborators_button')}
              subtitle={t('itinerary.form.collaborators_subtitle') + " " + itineraryTitle}
            />
            {canManage ? (
              <>
                <View style={[styles.searchField, { backgroundColor: primaryColor, borderColor: accentColor }]}>
                  <TIcon name="magnify" size={20} color={placeholderColor as string} />
                  <TextInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder={t('itinerary.form.collaborator_search_placeholder')}
                    placeholderTextColor={placeholderColor as string}
                    style={[styles.searchInput, { color: textColor }]}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="search"
                  />
                </View>
                {search.trim().length > 0 && search.trim().length < 3 ? (
                  <TText style={styles.helperText}>{t('itinerary.form.collaborator_search_minimum')}</TText>
                ) : null}
                {search.trim().length >= 3 ? (
                  <View style={styles.searchResults}>
                    {searchQuery.isDebouncing || searchQuery.isLoading || searchQuery.isFetching ? (
                      <ActivityIndicator color={accentColor} />
                    ) : availableUsers.length ? availableUsers.map((user) => (
                      <TouchableOpacity
                        key={user.id}
                        style={styles.searchResult}
                        onPress={() => openAddModal(user)}
                      >
                        <View style={styles.avatar}>
                          <ProfileImage imagePath={user.profileImage || undefined} />
                        </View>
                        <View style={styles.personDetails}>
                          <TText style={styles.personName}>{[user.fname, user.lname].filter(Boolean).join(' ') || user.username}</TText>
                          <TText style={styles.username}>@{user.username}</TText>
                        </View>
                        <TIcon name="account-plus-outline" size={20} color={accentColor} />
                      </TouchableOpacity>
                    )) : (
                      <TText style={styles.helperText}>
                        {searchQuery.isError
                          ? t('itinerary.form.collaborator_search_error')
                          : t('itinerary.form.collaborator_search_empty')}
                      </TText>
                    )}
                  </View>
                ) : null}
              </>
            ) : null}
            <TText style={styles.sectionTitle}>{t('itinerary.form.collaborator_list_title')}</TText>
            {collaboratorsQuery.isLoading ? (
              <ActivityIndicator color={accentColor} style={styles.listLoader} />
            ) : null}
            {collaboratorsQuery.isError ? (
              <TText style={styles.helperText}>{t('itinerary.form.collaborator_list_error')}</TText>
            ) : null}
          </View>
        )}
        ListEmptyComponent={
          !collaboratorsQuery.isLoading && !collaboratorsQuery.isError ? (
            <TText style={styles.helperText}>{t('itinerary.form.collaborator_list_empty')}</TText>
          ) : null
        }
      />

      <Modal visible={Boolean(selection)} transparent animationType="fade" onRequestClose={closeModal}>
        <SafeAreaView style={styles.modalOverlay}>
          <TView color="primary" style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TText type="title" style={styles.modalTitle}>
                {t('itinerary.form.collaborator_add_title')}
              </TText>
              <TouchableOpacity onPress={closeModal} accessibilityLabel={t('common.common.cancel')}>
                <TIcon name="close" size={22} />
              </TouchableOpacity>
            </View>

            {selectedUser ? (
              <View style={styles.modalPerson}>
                <View style={[styles.avatar, styles.modalAvatar]}>
                  <ProfileImage imagePath={selectedUser.profileImage || undefined} />
                </View>
                <View style={styles.personDetails}>
                  <TText style={styles.personName}>{[selectedUser.fname, selectedUser.lname].filter(Boolean).join(' ') || selectedUser.username}</TText>
                  <TText style={styles.username}>@{selectedUser.username}</TText>
                </View>
              </View>
            ) : null}

            <DropDownField
              placeholder={t('itinerary.form.collaborator_permission')}
              value={permission}
              onValueChange={(value) => setPermission(value as typeof permission)}
              values={permissionOptions}
              enabled={!addMutation.isPending && !updateMutation.isPending}
            />

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: accentColor }]}
              onPress={saveSelection}
              disabled={addMutation.isPending || updateMutation.isPending}
            >
              {addMutation.isPending || updateMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <TText style={styles.saveButtonText}>
                  {t('itinerary.form.collaborator_add_button')}
                </TText>
              )}
            </TouchableOpacity>
          </TView>
        </SafeAreaView>
      </Modal>
    </TView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: '3%',
  },
  listContent: {
    paddingBottom: 28,
  },
  searchField: {
    minHeight: 46,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  searchInput: {
    flex: 1,
    minHeight: 44,
    fontSize: 14,
  },
  helperText: {
    opacity: 0.65,
    marginVertical: 8,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 15,
    fontWeight: '700',
  },
  itineraryTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  searchResults: {
    marginBottom: 4,
  },
  searchResult: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#8885',
  },
  personRow: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 8,
    borderRadius: 8,
    gap: 8,
    marginBottom: 8,
  },
  personInfo: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowActions: {
    minHeight: 36,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: 'hidden',
    backgroundColor: '#8884',
  },
  personDetails: {
    flex: 1,
    minWidth: 0,
  },
  personName: {
    fontWeight: '700',
  },
  username: {
    fontSize: 12,
    opacity: 0.65,
    marginTop: 2,
  },
  roleBadge: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  roleButton: {
    minHeight: 34,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
  },
  deleteButton: {
    width: 34,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listLoader: {
    marginVertical: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#0009',
  },
  modalContent: {
    borderRadius: 8,
    padding: 18,
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 18,
  },
  modalPerson: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  saveButton: {
    minHeight: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
