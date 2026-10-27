import { ActivityIndicator, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { TText, TView } from '@/components/ui/Themed';
import BackButton from '@/components/common/BackButton';
import StickyScrollView from '@/components/ui/StickyScrollView';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColor } from '@/hooks/shared/useThemeColor';
import { useGetRoom } from '@/hooks/room/useGetRoom';
import { router } from 'expo-router';
import ItineraryCard from '@/components/itinerary/ItineraryCard';

const formatDateTime = (value: string) => new Date(value).toLocaleString();

export default function RoomLayout() {
  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'primary');
  const {
    room,
    isLoading,
    isError,
    selectedTab,
    setSelectedTab,
    navigateToChat,
    navigateToMap,
  } = useGetRoom();

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
          <BackButton type='floating' color='#fff'/>
          <LinearGradient
            colors={['transparent', backgroundColor]}
            style={styles.headerGradient}
          >
            <TText type='title' numberOfLines={1}>{room.name}</TText>
            {room.description ? (
              <TText numberOfLines={2} style={styles.description}>{room.description}</TText>
            ) : null}
          </LinearGradient>
        </TView>

        <TView style={styles.roomDetails}>
          <TText type="title">Room details</TText>
          <TText>Room ID: {room.id}</TText>
          <TText>Itinerary ID: {room.itineraryId || 'None'}</TText>
          <TText>Description: {room.description || 'None'}</TText>
          <TText>Privacy: {room.privacy}</TText>
          <TText>Theme color: {room.themeColor}</TText>
          <TText>Room image: {room.roomImage || 'None'}</TText>
          <TText>Created: {formatDateTime(room.createdOn)}</TText>
          <TText>Updated: {formatDateTime(room.updatedOn)}</TText>

          <TText type="title" style={styles.itineraryHeading}>Itinerary</TText>
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

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
          style={styles.tabsScroll}
        >
          <TouchableOpacity
            style={[
              styles.tabs,
              { backgroundColor: primaryColor }
            ]}
            onPress={() => setSelectedTab('feed')}
            accessibilityState={{ selected: selectedTab === 'feed' }}
          >
            <TText>Feed</TText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabs, { backgroundColor: primaryColor }]}
            onPress={() => setSelectedTab('members')}
            accessibilityState={{ selected: selectedTab === 'members' }}
          >
            <TText>Members</TText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabs, { backgroundColor: primaryColor }]}
            onPress={navigateToChat}
          >
            <TText>Chat</TText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabs, { backgroundColor: primaryColor }]}
            onPress={navigateToMap}
          >
            <TText>Map</TText>
          </TouchableOpacity>
        </ScrollView>

      </StickyScrollView>
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
    height: 170
  },
  headerGradient:{
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    paddingHorizontal: '3%',
    paddingBottom: 8,
    paddingTop: 20
  },
  description: {
    opacity: 0.7,
    fontSize: 12,
  },
  roomDetails: {
    padding: '3%',
    gap: 6,
  },
  itineraryHeading: {
    marginTop: 12,
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
