import { ActivityIndicator, FlatList, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { TIcon, TText, TView } from '@/components/ui/Themed';
import BackButton from '@/components/common/BackButton';
import EmptyMessage from '@/components/common/EmptyMessage';
import { BACKEND_URL } from '@/constants/Config';
import { useThemeColor } from '@/hooks/shared/useThemeColor';
import { useRoomInvites } from '@/hooks/room/useRoomInvites';
import { RoomMember } from '@/types/roomTypes';
import { UserSearchResult } from '@/types/userTypes';

const getMemberName = (member: RoomMember) =>
  `${member.user.fname ?? ''} ${member.user.lname ?? ''}`.trim() ||
  member.user.username ||
  member.nickname;

const getProfileImageUri = (path: string | null) => {
  if (!path) return null;
  return /^[a-z][a-z0-9+.-]*:/i.test(path) ? path : `${BACKEND_URL}${path}`;
};

export default function RoomMembersScreen() {
  const accentColor = useThemeColor({}, 'accent');
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({}, 'icon');
  const {
    members,
    isLoading,
    isError,
    refetch,
    isAdmin,
    search,
    setSearch,
    searchQuery,
    availableUsers,
    invite,
    isInviting,
    cancelInvite,
    isRemovingInvite,
    currentUserId,
    approveJoinRequest,
    isApproving,
    cancelJoinRequest,
    isCancellingRequest,
    acceptInvite,
    isAcceptingInvite,
  } = useRoomInvites();
  const renderSearchResult = (user: UserSearchResult) => {
    const imageUri = getProfileImageUri(user.profileImage || null);
    return (
      <View key={user.id} style={styles.searchResult}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.avatar} contentFit="cover" />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <TIcon name="account" size={22} />
          </View>
        )}
        <View style={styles.memberInfo}>
          <TText numberOfLines={1} style={styles.memberName}>
            {[user.fname, user.lname].filter(Boolean).join(' ') || user.username}
          </TText>
          <TText numberOfLines={1} style={styles.username}>@{user.username}</TText>
        </View>
        <TouchableOpacity
          onPress={() => invite(user)}
          disabled={isInviting}
          accessibilityRole="button"
          accessibilityLabel={`Invite ${user.username}`}
        >
          {isInviting ? (
            <ActivityIndicator color={accentColor} />
          ) : (
            <TIcon name="account-plus-outline" size={21} color={accentColor} />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <TView style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <TText type="title">Members</TText>
      </View>

      {isAdmin ? (
        <View>
          <View style={[styles.searchField, { backgroundColor: primaryColor, borderColor: accentColor }]}>
            <TIcon name="magnify" size={20} color={placeholderColor as string} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search users to invite"
              placeholderTextColor={placeholderColor as string}
              style={[styles.searchInput, { color: textColor }]}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
          </View>
          {search.trim().length > 0 && search.trim().length < 3 ? (
            <TText style={styles.helperText}>Enter at least 3 characters to search</TText>
          ) : null}
          {search.trim().length >= 3 ? (
            <View style={styles.searchResults}>
              {searchQuery.isDebouncing || searchQuery.isLoading || searchQuery.isFetching ? (
                <ActivityIndicator color={accentColor} />
              ) : availableUsers.length ? availableUsers.map(renderSearchResult) : (
                <TText style={styles.helperText}>
                  {searchQuery.isError
                    ? 'Could not search users. Please try again.'
                    : 'No users available to invite'}
                </TText>
              )}
            </View>
          ) : null}
        </View>
      ) : null}

      <TText style={styles.sectionTitle}>Room members</TText>
      {isLoading ? (
        <View style={styles.stateContainer}>
          <ActivityIndicator />
        </View>
      ) : isError ? (
        <EmptyMessage
          title="Failed to load members"
          description="Please try again"
          iconName="alert-circle"
          buttonLabel="Retry"
          buttonAction={() => { void refetch(); }}
        />
      ) : members.length === 0 ? (
        <EmptyMessage
          title="No members found"
          description="This room does not have any members yet"
          iconName="account-group"
        />
      ) : (
        <FlatList
          data={members}
          keyExtractor={(member) => member.id}
          contentContainerStyle={styles.list}
          renderItem={({ item: member }) => {
            const imageUri = getProfileImageUri(member.user.profileImage);
            return (
              <View style={styles.memberRow}>
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={styles.avatar} contentFit="cover" />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <TIcon name="account" size={24} />
                  </View>
                )}
                <View style={styles.memberInfo}>
                  <TText numberOfLines={1} style={styles.memberName}>
                    {getMemberName(member)}
                  </TText>
                  {member.user.username ? (
                    <TText numberOfLines={1} style={styles.username}>
                      @{member.user.username}
                    </TText>
                  ) : null}
                </View>
                <View style={styles.memberMeta}>
                  <TText style={styles.role}>{member.role}</TText>
                  {member.status !== 'ACTIVE' ? (
                    <TText style={styles.status}>{member.status}</TText>
                  ) : null}
                </View>
                {isAdmin && member.status === 'REQUESTED' ? (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => approveJoinRequest(member.userId)}
                    disabled={isApproving}
                    accessibilityRole="button"
                    accessibilityLabel={`Approve join request from ${getMemberName(member)}`}
                  >
                    {isApproving ? (
                      <ActivityIndicator color={accentColor} />
                    ) : (
                      <TIcon name="check-circle-outline" size={21} color={accentColor} />
                    )}
                  </TouchableOpacity>
                ) : null}
                {member.status === 'REQUESTED' && member.userId === currentUserId ? (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={cancelJoinRequest}
                    disabled={isCancellingRequest}
                    accessibilityRole="button"
                    accessibilityLabel="Cancel join request"
                  >
                    {isCancellingRequest ? (
                      <ActivityIndicator color="#D9534F" />
                    ) : (
                      <TIcon name="close-circle-outline" size={21} color="#D9534F" />
                    )}
                  </TouchableOpacity>
                ) : null}
                {member.status === 'INVITED' && member.userId === currentUserId ? (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={acceptInvite}
                    disabled={isAcceptingInvite}
                    accessibilityRole="button"
                    accessibilityLabel="Accept room invitation"
                  >
                    {isAcceptingInvite ? (
                      <ActivityIndicator color={accentColor} />
                    ) : (
                      <TIcon name="check-circle-outline" size={21} color={accentColor} />
                    )}
                  </TouchableOpacity>
                ) : null}
                {isAdmin && member.status === 'INVITED' ? (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => cancelInvite(member.userId)}
                    disabled={isRemovingInvite}
                    accessibilityRole="button"
                    accessibilityLabel={`Cancel invitation for ${getMemberName(member)}`}
                  >
                    {isRemovingInvite ? (
                      <ActivityIndicator color="#D9534F" />
                    ) : (
                      <TIcon name="close-circle-outline" size={21} color="#D9534F" />
                    )}
                  </TouchableOpacity>
                ) : null}
              </View>
            );
          }}
        />
      )}
    </TView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: '3%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
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
  searchResults: {
    marginBottom: 8,
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
  sectionTitle: {
    marginTop: 12,
    marginBottom: 8,
    fontSize: 15,
    fontWeight: '700',
  },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    gap: 10,
    paddingBottom: 20,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#8882',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8883',
  },
  memberInfo: {
    flex: 1,
    gap: 3,
  },
  memberName: {
    fontWeight: '700',
  },
  username: {
    fontSize: 11,
    opacity: 0.7,
  },
  memberMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  role: {
    fontSize: 10,
    fontWeight: '700',
  },
  status: {
    fontSize: 9,
    opacity: 0.65,
  },
  removeButton: {
    width: 34,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
