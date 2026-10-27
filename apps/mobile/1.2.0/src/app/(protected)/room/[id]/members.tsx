import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { TIcon, TText, TView } from '@/components/ui/Themed';
import BackButton from '@/components/common/BackButton';
import EmptyMessage from '@/components/common/EmptyMessage';
import { BACKEND_URL } from '@/constants/Config';
import { useGetRoomMembers } from '@/hooks/room/useGetRoomMembers';
import { RoomMember } from '@/types/roomTypes';

const getMemberName = (member: RoomMember) =>
  `${member.user.fname ?? ''} ${member.user.lname ?? ''}`.trim() ||
  member.user.username ||
  member.nickname;

const getProfileImageUri = (path: string | null) => {
  if (!path) return null;
  return /^[a-z][a-z0-9+.-]*:/i.test(path) ? path : `${BACKEND_URL}${path}`;
};

export default function RoomMembersScreen() {
  const { members, isLoading, isError, refetch } = useGetRoomMembers();

  return (
    <TView style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <TText type="title">Members</TText>
      </View>

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
});
