import { TText, TView, TIcon } from '@/components/ui/Themed';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import StickyScrollView from '@/components/ui/StickyScrollView';
import { useSession } from '@/context/SessionContext';
import SpeedDial from '@/components/ui/SpeedDial';
import EmptyMessage from '@/components/common/EmptyMessage';
import { useGetUserRooms } from '@/hooks/room/useGetUserRooms';
import RoomCard from '@/components/cards/RoomCard';
import NewPost from '@/components/common/NewPost';

export default function FeedScreen() {
  const { session } = useSession();

  return (
    <TView style={{flex: 1}}>
      <StickyScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ padding: '3%', paddingBottom: 100 }} 
        showBackButton={false}
        headerAppearOn={60}
        title={"Rooms"}
        subtitle={'@'+session?.user?.username}
      >
        <NewPost />
      </StickyScrollView>
    </TView>
  );
}

const styles = StyleSheet.create({
});