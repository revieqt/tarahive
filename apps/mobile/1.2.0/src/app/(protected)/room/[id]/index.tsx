import { ActivityIndicator, StyleSheet, TouchableOpacity, ScrollView, View } from 'react-native';
import { TIcon, TText, TView } from '@/components/ui/Themed';
import BackButton from '@/components/common/BackButton';
import StickyScrollView from '@/components/ui/StickyScrollView';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { BACKEND_URL } from '@/constants/Config';
import { useThemeColor } from '@/hooks/shared/useThemeColor';
import { useGetRoom } from '@/hooks/room/useGetRoom';
import ItineraryCard from '@/components/itinerary/ItineraryCard';
import ShareModal from '@/components/modals/ShareModal';
import { useState } from 'react';
import { useRoomMembershipActions } from '@/hooks/room/useRoomMembershipActions';

const formatDateTime = (value: string) => new Date(value).toLocaleString();

export default function RoomLayout() {
  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'primary');
  const [ shareModalVisible, setShareModalVisible ] = useState(false);
  const {
    room,
    member,
    isLoading,
    isError,
    selectedTab,
    setSelectedTab,
    navigateToChat,
    navigateToMembers,
    navigateToUpdate,
  } = useGetRoom();
  const {
    requestJoin,
    cancelJoinRequest,
    acceptInvite,
    isRequesting,
    isCancellingRequest,
    isAcceptingInvite,
  } = useRoomMembershipActions();

  if (isLoading) {
    return (
      <TView style={styles.stateContainer}>
        <ActivityIndicator />
      </TView>
    );
  }

  if (isError || !room) {
    return (
      <TView style={styles.stateContainer}>
        <TText>{isError ? 'Failed to load room' : 'Room not found'}</TText>
      </TView>
    );
  }

  const roomImageUri = room.roomImage
    ? /^[a-z][a-z0-9+.-]*:/i.test(room.roomImage)
      ? room.roomImage
      : `${BACKEND_URL}${room.roomImage}`
    : null;

  return (
    <TView style={{flex: 1}}>
      <StickyScrollView
        style={{ flex: 1 }} 
        contentContainerStyle={{ height: 2000 }}
        headerAppearOn={150}
        title={room.name}
        subtitle="Room"
      >
        <TView style={[styles.header, { backgroundColor: room.themeColor || primaryColor }]}>
          {roomImageUri ? (
            <Image
              source={{ uri: roomImageUri }}
              style={{...StyleSheet.absoluteFillObject,}}
              contentFit="cover"
              transition={200}
              accessibilityLabel={`${room.name} room image`}
            />
          ) : null}

          <BackButton type='floating' color='#fff'/>

          <View style={styles.headerButtonsContainer}>
            <TouchableOpacity
              style={styles.headerButtons}
              onPress={navigateToUpdate}
            >
              <TIcon name="pencil" size={20} color='white'/>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerButtons}
              onPress={() => setShareModalVisible(true)}
            >
              <TIcon name="share" size={20} color='white'/>
            </TouchableOpacity>
          </View>

          <LinearGradient
            colors={['transparent', primaryColor]}
            style={styles.headerGradient}
          >
            <TText type='title' numberOfLines={1} style={{textAlign: 'center'}}>{room.name}</TText>
            <View style={styles.privacy}>
              <TIcon
                name={room.privacy === 'PRIVATE' ? 'lock' : 'earth'}
                size={14}
              />
              <TText style={styles.privacyText}>
                {room.privacy === 'PRIVATE' ? 'Private Room' : 'Public Room'}
              </TText>
            </View>
          </LinearGradient>
        </TView>

        <TView color='primary' style={styles.roomDetails}>
          {room.description ? (
            <TText numberOfLines={2} style={styles.description}>{room.description}</TText>
          ) : null}
          {room.privacy === 'PUBLIC' && !member ? (
            <TouchableOpacity
              style={[styles.membershipButton, { backgroundColor: primaryColor }]}
              onPress={requestJoin}
              disabled={isRequesting}
              accessibilityRole="button"
            >
              {isRequesting ? <ActivityIndicator /> : <TText>Request to join</TText>}
            </TouchableOpacity>
          ) : null}
          {member?.status === 'REQUESTED' ? (
            <TouchableOpacity
              style={[styles.membershipButton, { backgroundColor: primaryColor }]}
              onPress={cancelJoinRequest}
              disabled={isCancellingRequest}
              accessibilityRole="button"
            >
              {isCancellingRequest ? <ActivityIndicator /> : <TText>Cancel join request</TText>}
            </TouchableOpacity>
          ) : null}
          {member?.status === 'INVITED' ? (
            <TouchableOpacity
              style={[styles.membershipButton, { backgroundColor: primaryColor }]}
              onPress={acceptInvite}
              disabled={isAcceptingInvite}
              accessibilityRole="button"
            >
              {isAcceptingInvite ? <ActivityIndicator /> : <TText>Accept invitation</TText>}
            </TouchableOpacity>
          ) : null}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContainer}
            style={styles.tabsScroll}
          >
            <TouchableOpacity
              style={[styles.tabs, { backgroundColor: primaryColor }]}
              onPress={navigateToMembers}
            >
              <TText>Members</TText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabs, { backgroundColor: primaryColor }]}
              onPress={navigateToChat}
            >
              <TText>Chat</TText>
            </TouchableOpacity>
          </ScrollView>
        </TView>

        <TView color='primary' style={styles.itineraryInfo}>
          {room.itinerary ? (
            <ItineraryCard
              id={room.itinerary.id}
              title={room.itinerary.title}
              type={room.itinerary.type}
              startDate={room.itinerary.startDate}
              endDate={room.itinerary.endDate}
            />
          ) : (
            <TText>No itinerary attached</TText>
          )}
        </TView>
      </StickyScrollView>

      <ShareModal
        visible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        path={`/room/${room.id ?? ''}`}
      />
    </TView>
  );
}

const styles = StyleSheet.create({
  stateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header:{
    height: 200,
    overflow: 'hidden',
  },
  headerGradient:{
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    paddingHorizontal: '3%',
    paddingBottom: 8,
    paddingTop: 70,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerButtonsContainer:{
    position: 'absolute',
    right: '3%',
    top: 16,
    flexDirection: 'row',
    gap: 4
  },
  headerButtons:{
    backgroundColor: '#fff5',
    borderWidth: 1,
    borderColor: "#fff6",
    padding: 4,
    borderRadius: 20
  },
  description: {
    fontSize: 12,
    textAlign: 'center'
  },
  membershipButton: {
    minHeight: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    marginVertical: 8,
  },
  privacy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  privacyText: {
    fontSize: 11,
    opacity: .7
  },
  roomDetails: {
    padding: '3%',
    marginBottom: 10
  },
  itineraryInfo: {
    marginTop: 12,
    marginHorizontal: '3%'
  },
  tabs: {
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#ccc2',
    borderRadius: 20,
    opacity: 0.5,
    height: 30,
    justifyContent: 'center'
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 4,
    paddingLeft: '3%'
  },
  tabsScroll: {
    // flex: 1,
  },
});
