import { TText, TView, TIcon } from '@/components/ui/Themed';
import { FlatList, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import StickyScrollView from '@/components/ui/StickyScrollView';
import { useSession } from '@/context/SessionContext';
import SpeedDial from '@/components/ui/SpeedDial';
import EmptyMessage from '@/components/common/EmptyMessage';
import { useGetUserRooms } from '@/hooks/room/useGetUserRooms';
import RoomCard from '@/components/cards/RoomCard';
import NewPost from '@/components/common/NewPost';
import ProfileImage from '@/components/ui/ProfileImage';
import BackButton from '@/components/common/BackButton';
import RoundButton from '@/components/ui/RoundButton';
import { useThemeColor } from '@/hooks/shared/useThemeColor';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

export default function CreatePostScreen() {
  const { session } = useSession();
  const user = session?.user;
  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const [inputHeight, setInputHeight] = useState(48);

  return (
    <TView style={{flex: 1}}>
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ paddingBottom: 100 }} 
        showsVerticalScrollIndicator={false}
      >
        <BackButton/>

        <View style={styles.header}>
          <View style={styles.profilePic}>
            <ProfileImage/>
          </View>

          <View>
            <TText style={{fontWeight: 600}}>{user?.fname } {user?.lname }</TText>
            <TText style={{opacity: 0.7, fontSize: 11}}>@{user?.username }</TText>
          </View>
        </View>

        <TextInput
          placeholder="What's on your mind?"
          multiline
          onContentSizeChange={({ nativeEvent }) => {
            setInputHeight(Math.max(40, nativeEvent.contentSize.height));
          }}
          style={[styles.textInput, { height: inputHeight, color: textColor }]}
          placeholderTextColor={textColor + '60'}
        />

      </ScrollView>

      <LinearGradient
        colors={['transparent', backgroundColor]}
        style={styles.options}
      >
        <ScrollView 
          style={[styles.toolbar, {backgroundColor: primaryColor}]}
          contentContainerStyle={{paddingHorizontal: 8, alignItems: 'center', gap: 4}}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          <TouchableOpacity style={[styles.toolbarButton, {backgroundColor}]}>
            <TIcon name="image" size={20} color="#36804d"/>
            <TText>Add Image</TText>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.toolbarButton, {backgroundColor}]}>
            <TIcon name="image" size={20} color="orange"/>
            <TText>Attach Itinerary</TText>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.toolbarButton, {backgroundColor}]}>
            <TIcon name="image" size={20} color="red"/>
            <TText>Mention People</TText>
          </TouchableOpacity>
        </ScrollView>

        <RoundButton
          iconName="check"
          style={{width: 50, height: 50}}
          onPress={() => {}}
        />
      </LinearGradient>
    </TView>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    padding: '3%',
    overflow: 'hidden',
    gap: 8,
    marginVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    width: '100%',
    paddingHorizontal: '3%',
    fontSize: 13,
    lineHeight: 20,
    marginVertical: 4,
    fontFamily: 'PlusJakartaSans',
    overflow: 'hidden',
  },
  profilePic: {
    width: 35,
    height: 35,
    borderRadius: 20,
    backgroundColor: '#ccc2',
    overflow: 'hidden',
  },
  options: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    paddingHorizontal: '3%',
    paddingVertical: 16,
    flexDirection: 'row',
    gap: 4,
  },
  toolbar: {
    flex: 1,
    height: 50,
    borderRadius: 25,
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 25,
  }
});