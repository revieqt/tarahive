import { TText, TView, TIcon } from '@/components/ui/Themed';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import StickyScrollView from '@/components/ui/StickyScrollView';
import { useSession } from '@/context/SessionContext';
import SpeedDial from '@/components/ui/SpeedDial';
import EmptyMessage from '@/components/common/EmptyMessage';
import { useGetUserRooms } from '@/hooks/room/useGetUserRooms';
import RoomCard from '@/components/cards/RoomCard';

export default function RoomsScreen() {
  const { session } = useSession();
  const {
    rooms,
    isLoading,
    isError,
    refetch,
    openRoom,
    navigateToCreateRoom,
    navigateToSearchRooms,
    navigateToJoinRoom,
  } = useGetUserRooms();

  return (
    <TView style={{flex: 1}}>
      <StickyScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{  }} 
        showBackButton={false}
        headerAppearOn={60}
        title={"Rooms"}
        subtitle={'@'+session?.user?.username}
      >

        <View style={styles.header}>
          <TText type='title'>Rooms</TText>
          <TouchableOpacity>
            <TIcon name='help-circle' size={15}/>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <EmptyMessage title="Loading rooms" description="" loading />
        ) : isError ? (
          <EmptyMessage
            title="Failed to load rooms"
            description="Please try again"
            iconName="alert-circle"
            buttonLabel="Retry"
            buttonAction={() => { void refetch(); }}
          />
        ) : rooms.length === 0 ? (
          <EmptyMessage
            title="No rooms yet"
            description="Create or join a room to get started"
            iconName="account-group"
          />
        ) : (
          <FlatList
            data={rooms}
            keyExtractor={(room) => room.id}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={styles.roomList}
            columnWrapperStyle={styles.roomRow}
            renderItem={({ item: room }) => (
              <RoomCard
                {...room}
                onPress={() => openRoom(room.id)}
              />
            )}
          />
        )}
      </StickyScrollView>

      <SpeedDial
        icon="plus"
        closeIcon="close"
        fabColor="#FF6B6B"
        style={styles.dialButton}
        actions={[
          {
            key: 'search',
            label: 'Search Rooms',
            icon: 'account-supervisor-circle-outline',
            onPress: navigateToSearchRooms,
          },
          {
            key: 'join',
            label: 'Join Room',
            icon: 'account-star',
            onPress: navigateToJoinRoom,
          },
          {
            key: 'create',
            label: 'Create New Room',
            icon: 'account-multiple-plus',
            onPress: navigateToCreateRoom,
          },
        ]}
      />
    </TView>
    
  );
}

const styles = StyleSheet.create({
  header:{
    marginTop: 20,
    justifyContent: 'space-between',
    marginHorizontal: '3%',
    flexDirection: 'row',
    alignItems: 'center'
  },
  roomList: {
    gap: 8,
    paddingHorizontal: '3%',
    paddingTop: 12,
  },
  roomRow: {
    justifyContent: 'space-between',
  },
  dialButton:{
    position: 'absolute',
    bottom: 75,
    right: 8
  }
});