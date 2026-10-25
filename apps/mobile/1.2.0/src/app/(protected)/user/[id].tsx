import { StyleSheet, TouchableOpacity, View, ScrollView, Dimensions, Alert } from 'react-native';
import { TText, TView, TIcon } from '@/components/ui/Themed';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSession } from '@/context/SessionContext';
import { useThemeColor } from '@/hooks/shared/useThemeColor';
import { useGetUser } from '@/hooks/user/useGetUser';
import React, { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { calculateAge } from '@/utils/calculateAge';
import { formatDateToString } from '@/utils/formatDateToString';
import BackButton from '@/components/common/BackButton';
import ProfileImage from '@/components/ui/ProfileImage';
import { ExpBadge, ExpLevel, ExpProgress } from '@/components/common/ExpFeature';
import { useInternetConnection } from '@/utils/checkInternetConnection';
import ProBadge from '@/components/ui/ProBadge';
import HiveBg from '@/components/common/HiveBg';
import StickyScrollView from '@/components/ui/StickyScrollView';
import ShareModal from '@/components/modals/ShareModal';
import { Image } from 'expo-image';
import OptionsPopup from '@/components/ui/OptionsPopup';
// import SOSInfoCard from '@/components/cards/SOSInfoCard';

export default function ProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const accentColor = useThemeColor({}, 'accent');
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
      <TView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <TText>Loading profile...</TText>
      </TView>
    );
  }

  if (isProfileLocked) {
    return (
      <TView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <TIcon name="alert-circle" size={48} />
        <TText type='subtitle' style={{ marginTop: 16, textAlign: 'center' }}>
          This profile is private
        </TText>
        <TText style={{ marginTop: 8, textAlign: 'center', opacity: 0.7 }}>
          This user has made their profile private
        </TText>
        <TouchableOpacity
          style={{ marginTop: 20, paddingHorizontal: 16, paddingVertical: 8 }}
          onPress={() => router.back()}
        >
          <TText style={{ textDecorationLine: 'underline' }}>Go Back</TText>
        </TouchableOpacity>
      </TView>
    );
  }

  if (!isCurrentUser && !displayUser) {
    return (
      <TView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <TText>Unable to load profile</TText>
      </TView>
    );
  }

  return (
    <StickyScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ height: 2000 }}
      headerAppearOn={80}
      title={displayUser?.fname ? `${displayUser.fname} ${displayUser.lname}` : 'Profile'}
      subtitle={displayUser?.username ? `@${displayUser.username}` : 'Profile'}
    >
      <BackButton type='floating' color='white' />
      <LinearGradient style={styles.headerBackground} colors={[accentColor, secondaryColor]}/>

      <View style={[styles.profileImage, { borderColor: backgroundColor }]}>
        <View style={{flex: 1, overflow: 'hidden', borderRadius: 100}}>
          <ProfileImage imagePath={displayUser?.profileImage} />
        </View>
        
        <ExpBadge expPoints={displayUser?.expPoints || 0} size={30} style={styles.profileBadge}/>
      </View>

      <View style={styles.nameContainer}>
        <View style={styles.row}>
          <TText type='title' style={{ fontSize: 13 }}>{displayUser?.fname} {displayUser?.lname}</TText>
          <ProBadge isProUser size={15} />
        </View>
        <TText style={{ opacity: .8, marginTop: -8, fontSize: 11 }}>@{displayUser?.username}</TText>
        <ExpLevel expPoints={displayUser?.expPoints || 0} style={styles.level}/>
      </View>

      <View style={styles.userInfoContainer}>
        { displayUser?.bio && <TText style={{ opacity: .5, marginBottom: 10 }}>{displayUser.bio}</TText> }
        
        <View style={styles.userOptionContainer}>
          {isCurrentUser &&
            <TouchableOpacity
              onPress={() => router.push('/user/edit')}
              style={[styles.userOptionButton, {backgroundColor: primaryColor}]}>
              <TText>Edit Profile</TText>
            </TouchableOpacity>
          }

          <TouchableOpacity
            style={[styles.userOptionButton, {backgroundColor: primaryColor}]}
            onPress={() => setShowShare(true)}>
            <TText>Share Profile</TText>
          </TouchableOpacity>
        </View>
      </View>

      <TView style={styles.journalContainer} color='primary'>
        <View style={styles.journalTitle}>
          <TText style={{fontWeight: 700, flex: 1}}>{isCurrentUser ? 'My' : user?.fname} Journal</TText>

          <OptionsPopup
            options={[
              { label: "Itinerary Archives", iconName: "archive", onPress: () => router.push('itinerary/archives')},
              { label: "Help", iconName: "help-circle" },
            ]}
          >
            <TIcon name="dots-vertical" size={18}/>
          </OptionsPopup>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.journalItemContainer}>
          { isCurrentUser &&
            <TouchableOpacity style={[styles.journalItem, styles.newJournalItem]} onPress={() => router.push('/journal')}>
              <TIcon name='plus' size={30}/>
              <TText style={styles.journalItemTitle}>Create New Journal</TText>
            </TouchableOpacity>
          }
          {/* SAMPLE JOURNAL ITEM */}
          <TouchableOpacity style={styles.journalItem} onPress={() => router.push('/journal')}>
            <Image
              source={require('../../../../assets/images/default-bg-1.2.0.jpg')}
              style={{ flex: 1, width: '100%', height: '100%' }}
              contentFit="cover"
            />

            <LinearGradient
              colors={['transparent', '#000']}
              style={styles.journalItemGradient}
            >
              <TText style={[styles.journalItemTitle, {color: 'white'}]}>Sample Journal Title</TText>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.journalItem} onPress={() => router.push('/journal')}>
            <Image
              source={require('../../../../assets/images/default-bg-1.2.0.jpg')}
              style={{ flex: 1, width: '100%', height: '100%' }}
              contentFit="cover"
            />

            <LinearGradient
              colors={['transparent', '#000']}
              style={styles.journalItemGradient}
            >
              <TText style={[styles.journalItemTitle, {color: 'white'}]}>Sample Journal Title</TText>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.journalItem} onPress={() => router.push('/journal')}>
            <Image
              source={require('../../../../assets/images/default-bg-1.2.0.jpg')}
              style={{ flex: 1, width: '100%', height: '100%' }}
              contentFit="cover"
            />

            <LinearGradient
              colors={['transparent', '#000']}
              style={styles.journalItemGradient}
            >
              <TText style={[styles.journalItemTitle, {color: 'white'}]}>Sample Journal Title</TText>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </TView>
      
      <ShareModal
        visible={showShare}
        onClose={() => setShowShare(false)}
        path={`/user/${displayUser?.username || displayUser?.id || id}`}
      />
    </StickyScrollView>
  );
}

const styles = StyleSheet.create({
  headerBackground: {
    width: '100%',
    height: 80,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  userInfoContainer: {
    width: '100%',
    paddingHorizontal: '3%',
    marginTop: 16,
  },
  profileImage: {
    zIndex: 1,
    width: 85,
    height: 85,
    borderRadius: 60,
    marginTop: -20,
    marginLeft: '3%',
    borderWidth: 3,
  },
  profileBadge:{
    position: 'absolute',
    right: -10,
    bottom: 0
  },
  level:{
    fontSize: 11,
    fontWeight: 500,
    marginTop: 3,
    opacity: .5,
  },
  nameContainer: {
    width: '100%',
    paddingRight: '3%',
    marginLeft: '3%',
    paddingLeft: 95,
    marginTop: -62,
  },
  userOptionContainer:{
    flexDirection: 'row',
    gap: 3,
  },
  userOptionButton: {
    padding: 5,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc3'
  },
  journalContainer:{
    marginTop: 10,
    paddingVertical: 10
  },
  journalTitle:{
    flexDirection: 'row',
    marginHorizontal: '3%',
    marginBottom: 7,
  },
  journalItemContainer:{
    paddingHorizontal: '3%',
    gap: 4
  },
  journalItem:{
    borderWidth: 1,
    height: 150,
    width: 100,
    borderColor: "#ccc4",
    borderRadius: 10,
    backgroundColor: "#0001",
    overflow: 'hidden'
  },
  newJournalItem:{
    justifyContent: 'center',
    alignItems: 'center',
    opacity: .5,
    borderWidth: 2,
    borderStyle: 'dashed'
  },
  journalItemGradient:{
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10
  },
  journalItemTitle:{
    textAlign: 'center', 
    fontSize: 11, 
    fontWeight: 600
  }
});