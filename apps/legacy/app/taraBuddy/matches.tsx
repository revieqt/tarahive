import React, { useMemo } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import WaveHeader from '@/components/WaveHeader';
import { useGetMatches, useUnmatch } from '@/hooks/useTarabuddy';
import { CustomAlert } from '@/components/Alert';
import ProfileImage from '@/components/ProfileImage';
import Button from '@/components/Button';
import ThemedIcons from '@/components/ThemedIcons';
import { useState } from 'react';
import EmptyMessage from '@/components/EmptyMessage';
import { useCreateRoom } from '@/hooks/useRoom';

export default function TaraBuddyMatches() {
  const router = useRouter();
  const { data: matches = [], isLoading, isError, error } = useGetMatches();
  const unmatchMutation = useUnmatch();
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{ title: string; message: string }>({ title: '', message: '' });
  const createRoomMutation = useCreateRoom();
  const handleUnmatch = async (userID: string, fname: string) => {
    try {
      await unmatchMutation.mutateAsync(userID);
      setAlertConfig({
        title: '👋 Unmatched',
        message: `You've unmatched with ${fname}`,
      });
      setAlertVisible(true);
    } catch (error) {
      setAlertConfig({
        title: 'Error',
        message: 'Failed to unmatch. Please try again.',
      });
      setAlertVisible(true);
    }
  };

  const handleInviteToRoom = async (userID: string, fname: string) => {
  try {
    await createRoomMutation.mutateAsync({
      name: `Room with ${fname}`, // or any naming logic you prefer
      invitedMembers: [userID],   // invite this match
    });

    setAlertConfig({
      title: '🎉 Room Created',
      message: `A new room has been created and ${fname} has been invited!`,
    });
    setAlertVisible(true);
  } catch (error: any) {
    setAlertConfig({
      title: 'Error',
      message: error.message || 'Failed to create room. Please try again.',
    });
    setAlertVisible(true);
  }
};

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <WaveHeader title='Your Matches' subtitle='Matched TaraBuddies' color='red'
          image={<Image source={require('@/assets/images/slide3-img.png')} style={{ width: 120, height: 250, marginTop: -20 }} />} />
        <View style={{height: 300, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
          <EmptyMessage 
            title="Please wait..." 
            description="Loading your matches." 
            loading
          />
        </View>
      </ThemedView>
    );
  }

  if (isError) {
    return (
      <ThemedView style={styles.container}>
        <WaveHeader title='Your Matches' subtitle='Matched TaraBuddies' color='red'
          image={<Image source={require('@/assets/images/slide3-img.png')} style={{ width: 120, height: 250, marginTop: -20 }} />} />
        
        <View style={{height: 300, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
          <EmptyMessage 
            title="Oh no!" 
            description="Something went wrong while loading your matches." 
            iconName="heart-off" 
          />
        </View>
      </ThemedView>
    );
  }

  if (matches.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <WaveHeader title='Your Matches' subtitle='Matched TaraBuddies' color='red'
          image={<Image source={require('@/assets/images/slide3-img.png')} style={{ width: 120, height: 250, marginTop: -20 }} />} />
        <View style={{height: 300, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
          <EmptyMessage 
            title="No Matches Yet!" 
            description="Start swiping to find your TaraBuddy!" 
            iconName="heart-off" 
          />
        </View>
        

      </ThemedView>
    );
  }

  return (  
    <ThemedView style={styles.container}>
      <WaveHeader title='Your Matches' subtitle='Matched TaraBuddies' color='red'
        image={<Image source={require('@/assets/images/slide3-img.png')} style={{ width: 120, height: 250, marginTop: -20 }} />} />

      <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 16 }}>
        {matches.map((match) => (
          <ThemedView key={match.userID} style={styles.matchCard} color='primary'>
            <View style={styles.imageContainer}>
              <ProfileImage imagePath={match.profileImage} />
            </View>

            <View style={styles.infoContainer}>
              <ThemedText type="subtitle">
                {match.fname} {match.lname}
              </ThemedText>
              <ThemedText style={styles.detailText}>
                {match.gender.charAt(0).toUpperCase() + match.gender.slice(1)}, {match.age}
              </ThemedText>

              <View style={styles.buttonsContainer}>
                <TouchableOpacity
  style={[styles.button, styles.primaryButton]}
  onPress={() => handleInviteToRoom(match.userID, match.fname)}
  disabled={createRoomMutation.isPending} // disable during creation
>
  {createRoomMutation.isPending ? (
    <ActivityIndicator size="small" color="white" />
  ) : (
    <ThemedText style={styles.buttonText}>Invite to Room</ThemedText>
  )}
</TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.dangerButton]}
                  onPress={() => handleUnmatch(match.userID, match.fname)}
                  disabled={unmatchMutation.isPending}
                >
                  {unmatchMutation.isPending ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <ThemedText style={styles.buttonText}>Unmatch</ThemedText>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ThemedView>
        ))}
      </ScrollView>

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setAlertVisible(false)}
        fadeAfter={3000}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  matchCard: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  imageContainer: {
    width: 80,
    aspectRatio: 1,
    borderRadius: 100,
    overflow: 'hidden',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  detailText: {
    opacity: 0.8,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 3,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 50,
    gap: 6,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});
