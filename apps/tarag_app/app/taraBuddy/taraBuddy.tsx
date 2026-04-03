import React, { act, useState } from 'react';
import { ThemedText } from "@/components/ThemedText";
import { View, StyleSheet, Image, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import Button from "@/components/Button";
import { router } from "expo-router";
import { useSession } from "@/context/SessionContext";
import { useThemeColor } from '@/hooks/useThemeColor';
import { useSearchTaraBuddies, useLikeTaraBuddy } from '@/hooks/useTarabuddy';
import { CustomAlert } from '@/components/Alert';
import ThemedIcons from '@/components/ThemedIcons';
import ProfileImage from '@/components/ProfileImage';
import { LinearGradient } from 'expo-linear-gradient';
import { ProBadge } from '@/components/ProBadge';
import Wave from '@/components/Wave';
import EmptyMessage from '@/components/EmptyMessage';
import GradientBlobs from '@/components/GradientBlobs';

export default function TaraBuddySection({ activeTab = "taraBuddy", refreshTrigger }: { activeTab?: string, refreshTrigger?: boolean }) {
  const { session } = useSession();
  const user = session?.user;
  const primaryColor = useThemeColor({}, 'primary');
  const accentColor = useThemeColor({}, 'accent');
  const secondaryColor = useThemeColor({}, 'secondary');

  // Matching state
  const { data: matches = [], isLoading, isError, error, refetch } = useSearchTaraBuddies();
  const likeMutation = useLikeTaraBuddy();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{ title: string; message: string }>({ title: '', message: '' });

  const currentUser = matches[currentIndex];
  const remainingCount = matches.length - currentIndex;

  const handlePreferencesPress = () => {
    router.push('/tarabuddy/preference');
  };

  const calculateAge = (bdate: Date | string): number => {
    const birthDate = new Date(bdate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleLike = async () => {
    if (!currentUser) return;

    try {
      console.log('❤️ Liking user:', currentUser.userID);
      const result = await likeMutation.mutateAsync(currentUser.userID);

      console.log('✅ Like result:', result);

      if (result.match) {
        setAlertConfig({
          title: '🎉 It\'s a Match!',
          message: `You and ${result.matchedFname} both like each other! Start chatting now.`,
        });
      } else {
        setAlertConfig({
          title: '❤️ Liked!',
          message: `You liked ${currentUser.fname}!`,
        });
      }
      setAlertVisible(true);

      // Move to next user
      setTimeout(() => {
        goToNextUser();
      }, 1500);
    } catch (err) {
      console.error('❌ Error liking user:', err);
      setAlertConfig({
        title: 'Error',
        message: (err as Error).message || 'Failed to like this user.',
      });
      setAlertVisible(true);
    }
  };

  const handlePass = () => {
    if (!currentUser) return;
    console.log('👋 Passing on user:', currentUser.userID);
    goToNextUser();
  };

  const goToNextUser = () => {
    setCurrentIndex(currentIndex + 1);
  };

  if (!user?.taraBuddySettings?.isTaraBuddyEnabled) {
    return (
      <View style={{ flex: 1 }}>
        <ThemedView style={[styles.card, styles.introCard]} color='primary' shadow>
          <Image source={require('@/assets/images/slide3-img.png')} style={styles.introImage} />
          <ThemedText type='title' style={{ textAlign: 'center' }}>
            Discover Travel Buddies
          </ThemedText>
          <ThemedText style={{ textAlign: 'center', marginHorizontal: 20, opacity: 0.7 }}>
            Find like-minded travelers and explore together with TaraBuddy!
          </ThemedText>
          <Button title="Enable TaraBuddy" buttonStyle={{ minWidth: '50%', marginTop: 10 }} onPress={handlePreferencesPress} />
        </ThemedView>
      </View>
    );
  }

  // Render matching enabled state
  return (
    <View style={{ flex: 1}}>
        <View style={styles.moreButtonsContainer}>
            <TouchableOpacity onPress={handlePreferencesPress} style={styles.moreButton}>
                <ThemedIcons name="account" size={20} color={accentColor} />
                <ThemedText style={{ color: "#fff", marginLeft: 4 }}>Preferences</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.moreButton} onPress={() => router.push('/tarabuddy/matches')}>
                <ThemedIcons name="heart" size={20} color={accentColor} />
                <ThemedText style={{ color: "#fff", marginLeft: 4 }}>Matches</ThemedText>
            </TouchableOpacity>
        </View>
      {/* Loading State */}
      {isLoading && (
        <ThemedView style={[styles.card, styles.introCard]} color='primary'>
          <GradientBlobs/>
          <ActivityIndicator size="large" color={accentColor} />
          <EmptyMessage title='Loading' description='Please wait while we find your matches.'
            isSolid
            loading
            />
            <Wave style={{ position: 'absolute', bottom: 0, left: 0, right: 0}} color={primaryColor} height={70} />
        </ThemedView>
      )}

      {/* Error State */}
      {isError && (
        <ThemedView style={[styles.card, styles.introCard]} color='primary'>
            <GradientBlobs/>
            <EmptyMessage title='Something Went Wrong' description={(error as Error)?.message || 'Failed to load matches'}
          iconName='close-circle'
          buttonLabel='Try Again'
          buttonAction={() => refetch()}
          isSolid
        />
        <Wave style={{ position: 'absolute', bottom: 0, left: 0, right: 0}} color={primaryColor} height={70} />
        </ThemedView>
      )}

      {/* No More Matches State */}
      {!isLoading && !isError && (matches.length === 0 || currentIndex >= matches.length) && (
        <ThemedView style={[styles.card, styles.introCard]} color='primary'>
          <GradientBlobs/>
          <EmptyMessage title="You've seen all available TaraBuddies!" description="Check back later to find more travel buddies."
            iconName='close-circle'
            buttonLabel='Try Again'
            buttonAction={() => refetch()}
            isSolid
            />
            <TouchableOpacity onPress={handlePreferencesPress} style={{ marginTop: 12 }}>
              <ThemedText style={{ opacity: 0.5 }}>Update Preferences</ThemedText>
            </TouchableOpacity>
            <Wave style={{ position: 'absolute', bottom: 0, left: 0, right: 0}} color={primaryColor} height={70} />
        </ThemedView>
      )}

      {/* Matching Card */}
      {!isLoading && !isError && currentUser && currentIndex < matches.length && (
        <ThemedView style={styles.card} color='primary'>
          <ProfileImage imagePath={currentUser.profileImage}/>

          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.matchGradient}>
            <View style={{ paddingHorizontal: 16, paddingTop:100 }}>
                <View style={styles.rowContainer}>
                    <ThemedText type="title" style={{ color: "#fff" }}>
                    {currentUser.fname} {currentUser.lname}
                </ThemedText>
                <ProBadge isProUser={currentUser.isProUser || false} />
                </View>

                <View style={[styles.rowContainer, {justifyContent: 'space-between', width: '100%'}]}>
                    <ThemedText style={{ color: "#fff", fontSize: 14, opacity: 0.9 }}>
                        {currentUser.gender.charAt(0).toUpperCase() + currentUser.gender.slice(1)}, {calculateAge(currentUser.bdate)}
                    </ThemedText>

                    <TouchableOpacity style={styles.viewProfile} onPress={() => router.push(`/account/${currentUser.userID}`)}>
                        <ThemedText style={{ color: "#fff" }}>
                            View Profile
                        </ThemedText>
                    </TouchableOpacity>
                </View>
                

                {currentUser.bio && (
                <ThemedText style={{color: "#fff"}}>
                {currentUser.bio}
                </ThemedText>
                )}
            </View>

            <View style={styles.buttonsContainer}>
            <TouchableOpacity
                style={[styles.actionButton,{backgroundColor: 'green'}]}
                onPress={handlePass}
                disabled={likeMutation.isPending}
            >
                <ThemedIcons name="close" size={30} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.actionButton, {backgroundColor: 'red'}, likeMutation.isPending && { opacity: 0.6 }]}
                onPress={handleLike}
                disabled={likeMutation.isPending}
            >
                {likeMutation.isPending ? (
                <ActivityIndicator color="white" />
                ) : (
                <ThemedIcons name="heart" size={30} color="#fff" />
                )}
            </TouchableOpacity>
            </View>
            <Wave style={{ position: 'absolute', bottom: 0, left: 0, right: 0}} color={primaryColor} height={70} />
        </LinearGradient>
        </ThemedView>
      )}

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setAlertVisible(false)}
        fadeAfter={3000}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    marginTop: 50,
    flex: 1,
  },
  introCard: {
    padding: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  introImage: {
    width: '60%',
    height: '40%',
  },
  matchGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 100,
  },
    rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
    detailsRow: {
    flexDirection: 'row',
    marginTop: 3,
    gap: 7,
    },
    detailBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 50,
    },
    viewProfile:{
    backgroundColor: 'rgba(0,0,0, 0.3)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 50,
    },
    buttonsContainer: {
        flexDirection: 'row',
        gap: 10,
        alignContent: 'center',
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 10,
        zIndex: 10,
    },
    actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 12,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    },
    moreButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 7,
    paddingHorizontal: 10,
    position: 'absolute',
    top: 60,
    right: 0,
    zIndex: 99,
    },
    moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    }
});