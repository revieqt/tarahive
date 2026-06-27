import { StyleSheet, TouchableOpacity, View, ScrollView, Dimensions, Image, Alert } from 'react-native';
import { TText, TView, TIcon } from '@/shared/components/ui/Themed';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSession } from '@/features/auth/context/SessionContext';
import { useThemeColor } from '@/shared/hooks/useThemeColor';
import { useGetUser } from '@/features/user/hooks/useGetUser';
import React, { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { calculateAge } from '@/shared/utils/calculateAge';
import { formatDateToString } from '@/shared/utils/formatDateToString';
import BackButton from '@/shared/components/common/BackButton';
import ProfileImage from '@/shared/components/ui/ProfileImage';
import { ExpBadge, ExpLevel, ExpProgress } from '@/shared/components/common/ExpFeature';
import { useInternetConnection } from '@/shared/utils/checkInternetConnection';
import ShareModal from '@/shared/components/modals/ShareModal';
import { ProBadge } from '@/shared/components/ui/ProBadge';
import HiveBg from '@/shared/components/common/HiveBg';
import StickyScrollView from '@/shared/components/ui/StickyScrollView';

export default function ProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const primaryColor = useThemeColor({}, 'primary');
  const { session } = useSession();
  const [activeTab, setActiveTab] = useState<String>('travels');
  const [showShare, setShowShare] = useState(false);
  const isConnected = useInternetConnection();

  let user = session?.user;
  const isCurrentUser = !id || id === user?.id || id === user?.username;
  const { user: otherUser, isLoading } = useGetUser(isCurrentUser ? null : (id as string));
  const displayUser = isCurrentUser ? user : otherUser;

  const showTravelInfo = isCurrentUser || displayUser?.settings?.visibility?.isTravelInfoPublic !== false;
  const showAbout = isCurrentUser || displayUser?.settings?.visibility?.isPersonalInfoPublic !== false;
  const isProfileLocked = !isCurrentUser && displayUser && !displayUser?.settings?.visibility?.isProfilePublic;

  if (!isCurrentUser && isLoading) {
    return (
      <TView style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <TText>Loading profile...</TText>
      </TView>
    );
  }

  if (isProfileLocked) {
    return (
      <TView style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <TIcon name="alert-circle" size={48}/>
        <TText type='subtitle' style={{marginTop: 16, textAlign: 'center'}}>
          This profile is private
        </TText>
        <TText style={{marginTop: 8, textAlign: 'center', opacity: 0.7}}>
          This user has made their profile private
        </TText>
        <TouchableOpacity 
          style={{marginTop: 20, paddingHorizontal: 16, paddingVertical: 8}}
          onPress={() => router.back()}
        >
          <TText style={{textDecorationLine: 'underline'}}>Go Back</TText>
        </TouchableOpacity>
      </TView>
    );
  }

  // Show not loaded state if other user data hasn't loaded yet
  if (!isCurrentUser && !displayUser) {
    return (
      <TView style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <TText>Unable to load profile</TText>
      </TView>
    );
  }

  return (
    <StickyScrollView 
      style={{flex: 1}}
      contentContainerStyle={{height: 2000}}
      headerAppearOn={200}
      title={displayUser?.fname ? `${displayUser.fname} ${displayUser.lname}` : 'Profile'}
      subtitle={displayUser?.username ? `@${displayUser.username}` : 'Profile'}
    >
      <TView style={styles.headerBackground} color='secondary'>
        <BackButton type='floating' color='white'/>

        
        <HiveBg fade={false}/>
        <HiveBg fade={false} flipHorizontal/>
        <TView style={styles.headerBottom} color='primary'/>
      </TView>

      <TView style={styles.userInfoContainer} color='primary'>
        <View style={styles.profileImage}>
          <ProfileImage imagePath={displayUser?.profileImage}/>
        </View>
        <TText type='subtitle' style={{marginTop: 8}}>{displayUser?.fname} {displayUser?.lname}</TText>
        <TText style={{opacity: .5}}>@{displayUser?.username}</TText>
        <TText style={{opacity: .5}}>
          {displayUser?.bio? displayUser.bio : isCurrentUser && 'You have not set a bio yet' }
        </TText>
      </TView>
      
    </StickyScrollView>
  );
}

const styles = StyleSheet.create({
  headerBackground:{
    width: '100%',
    height: 150,
    overflow: 'hidden',
  },
  userInfoContainer:{
    width: '100%',
    alignItems: 'center',
  },
  profileImage: {
    zIndex: 1,
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginTop: -85,
  },
  headerBottom:{
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    zIndex: 200,
  },
  // imageHeaderContainer:{
  //   height: Dimensions.get('window').height /1.25,
  // },
  // profileImage: {
  //   width: '100%',
  //   height: Dimensions.get('window').height /1.25,
  // },
  // imageHeaderGradient:{
  //   position: 'absolute',
  //   bottom: 0,
  //   left: 0,
  //   right: 0,
  //   paddingHorizontal: 16,
  //   paddingTop: 40,
  //   paddingBottom: 70,
  // },
  // headerBottom:{
  //   position: 'absolute',
  //   bottom: -1,
  //   left: 0,
  //   right: 0,
  //   height: 20,
  //   borderTopLeftRadius: 20,
  //   borderTopRightRadius: 20,
  //   zIndex: 200,
  // },
  // tabsContainer:{
  //   flexDirection: 'row',
  //   maxHeight: 50,
  //   overflow: 'hidden',
  //   position: 'absolute',
  //   bottom: 30,
  //   zIndex: 300,
  // },
  // tabsContentContainer:{
  //   paddingHorizontal: 10,
  //   gap: 7,
  // },
  // tabs:{
  //   paddingHorizontal: 12,
  //   height: 35,
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   borderRadius: 20,
  //   backgroundColor: '#ccc3',
  // },
  // badgeContainer:{
  //   width: '100%',
  //   padding: 10,
  //   marginBottom: 16,
  //   overflow: 'hidden',
  //   borderRadius: 12,
  //   justifyContent: 'center',
  // },
  // progressContainer:{
  //   position: 'absolute',
  //   top: 0,
  //   bottom: 0,
  //   left: 70,
  //   right: 0,
  //   justifyContent: 'center',
  //   paddingHorizontal: 16,
  // },
  // // gridContainer:{
  // //   flexDirection: 'row',
  // //   justifyContent: 'space-between',
  // //   alignItems: 'center',
  // //   marginBottom: 16,
  // // },
  // // gridChildContainer:{
  // //   width: Dimensions.get('window').width * 0.445,
  // //   aspectRatio: 1,
  // //   borderRadius: 12,
  // // },
  // // leftGridContainer:{
  // //   padding: 14,
  // //   overflow: 'hidden',
  // //   borderWidth: 1,
  // //   borderColor: '#ccc3'
  // // },
  // // rightGridContainer:{
  // //   height: '48%',
  // //   width: '100%',
  // //   borderRadius: 12,
  // //   overflow: 'hidden',
  // //   borderWidth: 1,
  // //   borderColor: '#ccc3'
  // // },
  // rowContainer:{
  //   padding: 16,
  //   borderBottomWidth: 1,
  //   borderColor: '#ccc3',
  //   justifyContent: 'center',
  //   opacity: 0.7,
  // },
  // lockedProfileContainer:{
  //   flex: 1,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   pointerEvents: 'box-none',
  // },
  // noteContainer:{
  //   position: 'absolute',
  //   bottom: 10,
  //   left: 10,
  //   right: 10,
  //   padding:10,
  //   borderRadius: 8,
  //   borderWidth: 1,
  //   borderColor: '#ccc3',
  //   justifyContent: 'space-between',
  //   flexDirection: 'row',
  //   zIndex: 10000,
  // },
  // note:{
  //   fontSize: 12,
  //   opacity: 0.7,
  // }
});