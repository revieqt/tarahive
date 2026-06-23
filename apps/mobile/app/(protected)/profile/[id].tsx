import { StyleSheet, TouchableOpacity, View, ScrollView, Dimensions, Image, Alert } from 'react-native';
import { TText, TView, TIcon } from '@/shared/components/ui/Themed';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSession } from '@/features/auth/context/SessionContext';
import { useThemeColor } from '@/shared/hooks/useThemeColor';
// import { useGetUser } from '@/features/user/hooks/useGetUser';
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


export default function ProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const primaryColor = useThemeColor({}, 'primary');
  const { session } = useSession();
//   const { searchUser, isLoading } = useGetUser();
  const [activeTab, setActiveTab] = useState<String>('travels');
  const [otherUser, setOtherUser] = useState<any>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showShare, setShowShare] = useState(false);
  const isConnected = useInternetConnection();
  
  let user = session?.user;
  
  // Check if the identifier matches current user's ID or username
  const isCurrentUser = !id || id === user?.id || id === user?.username;
  const displayUser = isCurrentUser ? user : otherUser;

  useEffect(() => {
    if (id && !isCurrentUser && isConnected) {
      // Fetch other user data from API by searching with identifier (username or ID)
      const fetchOtherUser = async () => {
        try {
          setFetchError(null);
          const userData = await searchOtherUser(id as string);
          setOtherUser(userData);
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Failed to fetch user';
          setFetchError(errorMsg);
          console.error('Error fetching user:', error);
          Alert.alert('Error', errorMsg);
        }
      };
      
      fetchOtherUser();
    }
  }, [id, isCurrentUser, isConnected]);

  // Determine if tabs should be visible
  const showTravelInfo = isCurrentUser || displayUser?.visibilitySettings?.isTravelInfoPublic;
  const showAbout = isCurrentUser || displayUser?.visibilitySettings?.isPersonalInfoPublic;
  const isProfileLocked = !isCurrentUser && !displayUser?.visibilitySettings?.isProfilePublic;

  // Show loading state if fetching other user
  if (!isCurrentUser && isLoading) {
    return (
      <TView style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <TText>Loading profile...</TText>
      </TView>
    );
  }

  if ((!isCurrentUser && fetchError)||isProfileLocked) {
    return (
      <TView style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <TIcon name="alert-circle" size={48}/>
        <TText type='subtitle' style={{marginTop: 16, textAlign: 'center'}}>
          {isProfileLocked ? 'This profile is private' : 'Unable to load profile'}
        </TText>
        <TText style={{marginTop: 8, textAlign: 'center', opacity: 0.7}}>
          {isProfileLocked ? 'This user has made their profile private' : fetchError}
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
    <TView style={{flex: 1}}>
      <TView style={[styles.imageHeaderContainer,{height: (showTravelInfo && showAbout) == false ? Dimensions.get('window').height : Dimensions.get('window').height /1.25}]} color='secondary'>
        <BackButton type='floating' color='white'/>
        <ProfileImage imagePath={displayUser?.profileImage}/>
      </TView>

      <ScrollView style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}}>
        <View style={{height: (showTravelInfo && showAbout) == false ? Dimensions.get('window').height : Dimensions.get('window').height /1.25, 
          pointerEvents: isProfileLocked ? 'none' : 'box-none'}}>
          <ScrollView style={styles.tabsContainer}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContentContainer}
          >
            {showTravelInfo && (
              <TouchableOpacity style={styles.tabs}
                onPress={() => setActiveTab('travels')}
              >
                <TText style={{color: '#fff'}}>Travel Info</TText>
              </TouchableOpacity>
            )}
            {showAbout && (
              <TouchableOpacity style={styles.tabs}
                onPress={() => setActiveTab('about')}
              >
                <TText style={{color: '#fff'}}>About</TText>
              </TouchableOpacity>
            )}
            {isCurrentUser && isConnected && (
              <TouchableOpacity style={styles.tabs}
                onPress={() => router.push('/account/settings-accountControl')}
              >
                <TText style={{color: '#fff'}}>Edit Profile</TText>
              </TouchableOpacity>
            )}
            {isCurrentUser && isConnected && (
              <TouchableOpacity style={styles.tabs}
                onPress={() => setShowShare(true)}
              >
                <TText style={{color: '#fff'}}>Share Profile</TText>
              </TouchableOpacity>
            )}
          </ScrollView>
              <LinearGradient
                colors={['transparent', '#000']}
                style={styles.imageHeaderGradient}
              >
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                  <TText type='title' style={{color: '#fff'}}>
                    {displayUser?.fname} {displayUser?.lname}
                  </TText>
                  <ProBadge isProUser={displayUser?.isProUser || false} size={24}/>
                </View>
                
                <TText style={{color: '#fff9'}}>
                  @{displayUser?.username}
                </TText>
                <TText style={{color: '#fff9'}}>
                  {displayUser?.type[0].toUpperCase()}{displayUser?.type.slice(1)}
                </TText>
                {displayUser?.bio && (
                  <TText style={{color: '#fff9', marginTop: 8}}>
                    {displayUser?.bio}
                  </TText>
                )}
              </LinearGradient>
          <TView style={styles.headerBottom}/>
        </View>
        <TView>

          <View style={activeTab==='travels' && showTravelInfo ? {flex: 1, opacity: 1, paddingHorizontal:16} : {flex: 0, height: 0, opacity: 0}}>
            <TView style={styles.badgeContainer} color='primary'>
              <ExpBadge expPoints={displayUser?.expPoints}/>
              <View style={styles.progressContainer}>
                <ExpLevel expPoints={displayUser?.expPoints} />
                <ExpProgress expPoints={displayUser?.expPoints} />
              </View>
            </TView>
            {/* <View style={styles.gridContainer}>
              <TView color='primary' shadow style={[styles.gridChildContainer, styles.leftGridContainer]}>

              </TView>
              <View style={[styles.gridChildContainer, {gap: '4%'}]}>
                <TView color='primary' shadow style={styles.rightGridContainer}>
                </TView>
                <TView color='primary' shadow style={styles.rightGridContainer}>
                
                </TView>
              </View>
            </View> */}
          </View>
          
          <View style={activeTab==='about' && showAbout ? {flex: 1, opacity: 1} : {flex: 0, height: 0, opacity: 0}}>
            <View style={styles.rowContainer}>
              <TText type='subtitle'>Gender</TText>
              <TText>{displayUser?.gender[0].toUpperCase()}{displayUser?.gender.slice(1)}</TText>
            </View>
            <View style={styles.rowContainer}>
              <TText type='subtitle'>Age</TText>
              <TText>{calculateAge(displayUser?.bdate)}</TText>
            </View>
            <View style={styles.rowContainer}>
              <TText type='subtitle'>Birthdate</TText>
              <TText>{formatDateToString(displayUser?.bdate)}</TText>
            </View>
          </View>
        </TView>
        
      </ScrollView>
      {user?.settings.visibility.isProfilePublic === false && (
        <TView style={styles.noteContainer} color='primary'>
          <TText style={styles.note}>Your Profile is currently Private</TText>
          <TouchableOpacity onPress={()=> router.push('/account/settings-accountControl')}>
            <TText style={[styles.note, {textDecorationLine: 'underline'}]}>Change</TText>
          </TouchableOpacity>
        </TView>
      )}

      <ShareModal
        visible={showShare}
        link={displayUser ? `exp://tarag-v2.exp.app/account/${displayUser.username}` : ''}
        onClose={() => setShowShare(false)}
      />
      
    </TView>
  );
}

const styles = StyleSheet.create({
  imageHeaderContainer:{
    height: Dimensions.get('window').height /1.25,
  },
  profileImage: {
    width: '100%',
    height: Dimensions.get('window').height /1.25,
  },
  imageHeaderGradient:{
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 70,
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
  tabsContainer:{
    flexDirection: 'row',
    maxHeight: 50,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 30,
    zIndex: 300,
  },
  tabsContentContainer:{
    paddingHorizontal: 10,
    gap: 7,
  },
  tabs:{
    paddingHorizontal: 12,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#ccc3',
  },
  badgeContainer:{
    width: '100%',
    padding: 10,
    marginBottom: 16,
    overflow: 'hidden',
    borderRadius: 12,
    justifyContent: 'center',
  },
  progressContainer:{
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 70,
    right: 0,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  // gridContainer:{
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   alignItems: 'center',
  //   marginBottom: 16,
  // },
  // gridChildContainer:{
  //   width: Dimensions.get('window').width * 0.445,
  //   aspectRatio: 1,
  //   borderRadius: 12,
  // },
  // leftGridContainer:{
  //   padding: 14,
  //   overflow: 'hidden',
  //   borderWidth: 1,
  //   borderColor: '#ccc3'
  // },
  // rightGridContainer:{
  //   height: '48%',
  //   width: '100%',
  //   borderRadius: 12,
  //   overflow: 'hidden',
  //   borderWidth: 1,
  //   borderColor: '#ccc3'
  // },
  rowContainer:{
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#ccc3',
    justifyContent: 'center',
    opacity: 0.7,
  },
  lockedProfileContainer:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  noteContainer:{
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    padding:10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc3',
    justifyContent: 'space-between',
    flexDirection: 'row',
    zIndex: 10000,
  },
  note:{
    fontSize: 12,
    opacity: 0.7,
  }
});