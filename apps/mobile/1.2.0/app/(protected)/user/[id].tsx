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
      headerAppearOn={120}
      title={displayUser?.fname ? `${displayUser.fname} ${displayUser.lname}` : 'Profile'}
      subtitle={displayUser?.username ? `@${displayUser.username}` : 'Profile'}
    >
      <LinearGradient style={styles.headerBackground} colors={[accentColor, secondaryColor]}>
        <BackButton type='floating' color='white' />
        <HiveBg fade={false} />
        <HiveBg fade={false} flipHorizontal />

        <View style={styles.userOptionContainer}>
          {isCurrentUser &&
            <TouchableOpacity
              onPress={() => router.push('/settings/edit-profile')}
              style={styles.userOptionButton}>
              <TIcon name='pencil' size={20} color='white' />
            </TouchableOpacity>
          }

          <TouchableOpacity
            onPress={() => router.push({
              pathname: '/share',
              params: { path: `user/${displayUser?.username}` },
            } as any)}
            style={styles.userOptionButton}>
            <TIcon name='share' size={20} color='white' />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={[styles.profileImage, { borderColor: backgroundColor }]}>
        <ProfileImage imagePath={displayUser?.profileImage} />
      </View>

      <View style={styles.nameContainer}>
        <View style={styles.row}>
          <TText type='title' style={{ fontSize: 15 }}>{displayUser?.fname} {displayUser?.lname}</TText>
          <ProBadge isProUser size={15} />
        </View>

        <TText style={{ opacity: .5, marginTop: -5, fontSize: 12 }}>@{displayUser?.username}</TText>
      </View>

      <View style={styles.userInfoContainer}>
        { displayUser?.bio && <TText style={{ opacity: .5, marginBottom: 10 }}>{displayUser.bio}</TText> }
        
        <TView style={styles.badgeContainer} color='primary'>
          <ExpBadge expPoints={displayUser?.expPoints || 0} />
          <View style={styles.progressContainer}>
            <ExpLevel expPoints={displayUser?.expPoints || 0} />
            <ExpProgress expPoints={displayUser?.expPoints || 0} />
          </View>
        </TView>

        <SOSInfoCard userData={displayUser ? displayUser : undefined}/>
      </View>
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
    overflow: 'hidden',
    marginTop: -20,
    marginLeft: '3%',
    borderWidth: 5,
  },
  nameContainer: {
    width: '100%',
    paddingRight: '3%',
    marginLeft: '3%',
    paddingLeft: 95,
    marginTop: -60,
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
  userOptionContainer:{
    position: 'absolute',
    top: 16,
    right: '3%',
    flexDirection: 'row',
    gap: 5,
    zIndex: 200,
  },
  userOptionButton: {
    padding: 5,
    borderRadius: 50,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff'
  },
  badgeContainer: {
    width: '100%',
    padding: 5,
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