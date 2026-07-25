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
import { ProBadge } from '@/shared/components/ui/ProBadge';
import HiveBg from '@/shared/components/common/HiveBg';
import StickyScrollView from '@/shared/components/ui/StickyScrollView';
import ErrorOverlayModal from '@/shared/components/modals/ErrorOverlayModal';
import { ShareButton } from '@/shared/components/common/ShareButton';
import SOSInfoCard from '@/shared/components/cards/SOSInfoCard';

export default function ProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
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

  // Show not loaded state if other user data hasn't loaded yet
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
      headerAppearOn={200}
      title={displayUser?.fname ? `${displayUser.fname} ${displayUser.lname}` : 'Profile'}
      subtitle={displayUser?.username ? `@${displayUser.username}` : 'Profile'}
    >
      <LinearGradient style={styles.headerBackground} colors={[accentColor, secondaryColor]}>
        <BackButton type='floating' color='white' />


        <HiveBg fade={false} />
        <HiveBg fade={false} flipHorizontal />
        <TView style={styles.headerBottom} />
      </LinearGradient>

      <TView style={styles.userInfoContainer}>
        <View style={styles.profileImage}>
          <ProfileImage imagePath={displayUser?.profileImage} />
        </View>
        <View style={styles.row}>
          <TText type='title' style={{ fontSize: 16 }}>{displayUser?.fname} {displayUser?.lname}</TText>
          <ProBadge isProUser size={15} />
        </View>

        <TText style={{ opacity: .5, marginBottom: 10 }}>@{displayUser?.username}</TText>
        <TText style={{ opacity: .5, marginBottom: 10 }}>
          {displayUser?.bio ? displayUser.bio : isCurrentUser && 'You have not set a bio yet'}
        </TText>

        {isCurrentUser &&
          <View style={styles.row}>
            <TouchableOpacity
              onPress={() => router.push('/user/settings/edit-profile')}
              style={styles.userInfoButton}>
              <TText>Edit Profile</TText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push({
                pathname: '/share',
                params: { path: `user/${displayUser?.username}` },
              } as any)}
              style={styles.userInfoButton}>
              <TText>Share Profile</TText>
            </TouchableOpacity>

          </View>
        }

        <SOSInfoCard userData={displayUser ? displayUser : undefined}/>

        <TView style={styles.badgeContainer} color='primary'>
          <ExpBadge expPoints={displayUser?.expPoints || 0} />
          <View style={styles.progressContainer}>
            <ExpLevel expPoints={displayUser?.expPoints || 0} />
            <ExpProgress expPoints={displayUser?.expPoints || 0} />
          </View>
        </TView>
      </TView>
    </StickyScrollView>
  );
}

const styles = StyleSheet.create({
  headerBackground: {
    width: '100%',
    height: 150,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  userInfoContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: '3%'
  },
  profileImage: {
    zIndex: 1,
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginTop: -85,
    marginBottom: 10
  },
  headerBottom: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    zIndex: 200,
  },
  userInfoButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc3',
  },
  badgeContainer: {
    width: '100%',
    padding: 5,
    marginVertical: 16,
    overflow: 'hidden',
    borderRadius: 12,
    justifyContent: 'center',
  },
  progressContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 70,
    right: 0,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
});