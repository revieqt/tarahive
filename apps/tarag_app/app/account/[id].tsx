import { StyleSheet, TouchableOpacity, View, ScrollView, Dimensions, Image, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSession } from '@/context/SessionContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useUser } from '@/hooks/useUser';
import React, { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {ThemedIcons} from '@/components/ThemedIcons';
import { calculateAge } from '@/utils/calculateAge';
import { formatDateToString } from '@/utils/formatDateToString';
import BackButton from '@/components/BackButton';
import ProfileImage from '@/components/ProfileImage';
import GradientBlobs from '@/components/GradientBlobs';
import { ExpBadge, ExpLevel, ExpProgress } from '@/components/ExpFeature';
import { useInternetConnection } from '@/utils/checkInternetConnection';
import ShareModal from '@/components/modals/ShareModal';
import { ProBadge } from '@/components/ProBadge';


export default function ProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const primaryColor = useThemeColor({}, 'primary');
  const { session } = useSession();
  const { searchOtherUser, isLoading } = useUser();
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
      <ThemedView style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ThemedText>Loading profile...</ThemedText>
      </ThemedView>
    );
  }

  if ((!isCurrentUser && fetchError)||isProfileLocked) {
    return (
      <ThemedView style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <GradientBlobs/>
        <ThemedIcons name="alert-circle" size={48}/>
        <ThemedText type='subtitle' style={{marginTop: 16, textAlign: 'center'}}>
          {isProfileLocked ? 'This profile is private' : 'Unable to load profile'}
        </ThemedText>
        <ThemedText style={{marginTop: 8, textAlign: 'center', opacity: 0.7}}>
          {isProfileLocked ? 'This user has made their profile private' : fetchError}
        </ThemedText>
        <TouchableOpacity 
          style={{marginTop: 20, paddingHorizontal: 16, paddingVertical: 8}}
          onPress={() => router.back()}
        >
          <ThemedText style={{textDecorationLine: 'underline'}}>Go Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  // Show not loaded state if other user data hasn't loaded yet
  if (!isCurrentUser && !displayUser) {
    return (
      <ThemedView style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ThemedText>Unable to load profile</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{flex: 1}}>
      <ThemedView style={[styles.imageHeaderContainer,{height: (showTravelInfo && showAbout) == false ? Dimensions.get('window').height : Dimensions.get('window').height /1.25}]} color='secondary'>
        <BackButton type='floating' color='white'/>
        <ProfileImage imagePath={displayUser?.profileImage}/>
      </ThemedView>

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
                <ThemedText style={{color: '#fff'}}>Travel Info</ThemedText>
              </TouchableOpacity>
            )}
            {showAbout && (
              <TouchableOpacity style={styles.tabs}
                onPress={() => setActiveTab('about')}
              >
                <ThemedText style={{color: '#fff'}}>About</ThemedText>
              </TouchableOpacity>
            )}
            {isCurrentUser && isConnected && (
              <TouchableOpacity style={styles.tabs}
                onPress={() => router.push('/account/settings-accountControl')}
              >
                <ThemedText style={{color: '#fff'}}>Edit Profile</ThemedText>
              </TouchableOpacity>
            )}
            {isCurrentUser && isConnected && (
              <TouchableOpacity style={styles.tabs}
                onPress={() => setShowShare(true)}
              >
                <ThemedText style={{color: '#fff'}}>Share Profile</ThemedText>
              </TouchableOpacity>
            )}
          </ScrollView>
              <LinearGradient
                colors={['transparent', '#000']}
                style={styles.imageHeaderGradient}
              >
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                  <ThemedText type='title' style={{color: '#fff'}}>
                    {displayUser?.fname} {displayUser?.lname}
                  </ThemedText>
                  <ProBadge isProUser={displayUser?.isProUser || false} size={24}/>
                </View>
                
                <ThemedText style={{color: '#fff9'}}>
                  @{displayUser?.username}
                </ThemedText>
                <ThemedText style={{color: '#fff9'}}>
                  {displayUser?.type[0].toUpperCase()}{displayUser?.type.slice(1)}
                </ThemedText>
                {displayUser?.bio && (
                  <ThemedText style={{color: '#fff9', marginTop: 8}}>
                    {displayUser?.bio}
                  </ThemedText>
                )}
              </LinearGradient>
          <ThemedView style={styles.headerBottom}/>
        </View>
        <ThemedView>

          <View style={activeTab==='travels' && showTravelInfo ? {flex: 1, opacity: 1, paddingHorizontal:16} : {flex: 0, height: 0, opacity: 0}}>
            <ThemedView style={styles.badgeContainer} color='primary'>
              <GradientBlobs/>
              <ExpBadge expPoints={displayUser?.expPoints}/>
              <View style={styles.progressContainer}>
                <ExpLevel expPoints={displayUser?.expPoints} />
                <ExpProgress expPoints={displayUser?.expPoints} />
              </View>
            </ThemedView>
            {/* <View style={styles.gridContainer}>
              <ThemedView color='primary' shadow style={[styles.gridChildContainer, styles.leftGridContainer]}>

              </ThemedView>
              <View style={[styles.gridChildContainer, {gap: '4%'}]}>
                <ThemedView color='primary' shadow style={styles.rightGridContainer}>
                </ThemedView>
                <ThemedView color='primary' shadow style={styles.rightGridContainer}>
                
                </ThemedView>
              </View>
            </View> */}
          </View>
          
          <View style={activeTab==='about' && showAbout ? {flex: 1, opacity: 1} : {flex: 0, height: 0, opacity: 0}}>
            <View style={styles.rowContainer}>
              <ThemedText type='subtitle'>Gender</ThemedText>
              <ThemedText>{displayUser?.gender[0].toUpperCase()}{displayUser?.gender.slice(1)}</ThemedText>
            </View>
            <View style={styles.rowContainer}>
              <ThemedText type='subtitle'>Age</ThemedText>
              <ThemedText>{calculateAge(displayUser?.bdate)}</ThemedText>
            </View>
            <View style={styles.rowContainer}>
              <ThemedText type='subtitle'>Birthdate</ThemedText>
              <ThemedText>{formatDateToString(displayUser?.bdate)}</ThemedText>
            </View>
          </View>
        </ThemedView>
        
      </ScrollView>
      {user?.visibilitySettings.isProfilePublic === false && (
        <ThemedView style={styles.noteContainer} color='primary'>
          <ThemedText style={styles.note}>Your Profile is currently Private</ThemedText>
          <TouchableOpacity onPress={()=> router.push('/account/settings-accountControl')}>
            <ThemedText style={[styles.note, {textDecorationLine: 'underline'}]}>Change</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      )}

      <ShareModal
        visible={showShare}
        link={displayUser ? `exp://tarag-v2.exp.app/account/${displayUser.username}` : ''}
        onClose={() => setShowShare(false)}
      />
      
    </ThemedView>
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
