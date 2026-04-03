import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, FlatList, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedIcons } from '@/components/ThemedIcons';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedView } from '@/components/ThemedView';
import { KeyboardAvoidingView, Platform } from 'react-native';
import Wave from '@/components/Wave';
import BackButton from '@/components/BackButton';
import Button from '@/components/Button';
import TextField from '@/components/TextField';
import { CustomAlert } from '@/components/Alert';
import ItineraryPickerModal from '@/components/modals/ItineraryPickerModal';
import UserPickerModal from '@/components/modals/UserPickerModal';
import ProfileImage from '@/components/ProfileImage';
import { createRoom, CreateRoomData } from '@/services/roomService';


interface SelectedMember {
  userID: string;
  fname: string;
  lname: string;
  profileImage?: string;
}

interface Itinerary {
  _id: string;
  title: string;
  description?: string;
}

export default function CreateRoomScreen() {
  const router = useRouter();
  const accentColor = useThemeColor({}, 'accent');
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const { itineraryId } = useLocalSearchParams();

  useEffect(() => {
  if (itineraryId) {
    setSelectedItinerary({
      _id: itineraryId as string,
      title: 'Selected Itinerary', // placeholder
    });
  }
}, [itineraryId]);
  // Room creation states
  const [roomName, setRoomName] = useState('');
  const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<SelectedMember[]>([]);

  // Modal states
  const [showItineraryModal, setShowItineraryModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  // UI states
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{ title: string; message: string }>({ title: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  // Handle create room
  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      setAlertConfig({
        title: 'Error',
        message: 'Please enter a room name',
      });
      setAlertVisible(true);
      return;
    }

    setIsLoading(true);
    try {
      const roomData: CreateRoomData = {
        name: roomName,
        itineraryID: selectedItinerary?._id,
        invitedMembers: selectedMembers.map(m => m.userID),
      };

      const response = await createRoom(roomData);

      setAlertConfig({
        title: 'Success',
        message: `Room "${roomName}" created!`,
      });
      setAlertVisible(true);

      // Navigate to the newly created room after a short delay
      setTimeout(() => {
        router.replace(`/rooms/${response.id}`);
      }, 1000);
    } catch (error: any) {
      setAlertConfig({
        title: 'Error',
        message: error.message || 'Failed to create room',
      });
      setAlertVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={{ flex: 1 }} color="primary">
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <BackButton />
        <ThemedText type="title">
          Create a new room
        </ThemedText>
        <ThemedText style={{ marginBottom: 20, opacity: 0.7 }}>
          Enter the details for your new room.
        </ThemedText>

        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>

          <TextField
            placeholder="Enter room name"
            value={roomName}
            onChangeText={setRoomName}
          />

          <TouchableOpacity
            style={[styles.pickerButton, { borderColor: selectedItinerary ? accentColor : textColor, opacity: selectedItinerary ? 1 : 0.5 }]}
            onPress={() => setShowItineraryModal(true)}
          >
            <ThemedText style={{ flex: 1 }}>
              {selectedItinerary ? selectedItinerary.title : 'Attach an itinerary (optional)'}
            </ThemedText>
            {selectedItinerary && !itineraryId && (
              <TouchableOpacity
                onPress={() => setSelectedItinerary(null)}
              >
                <ThemedIcons name="close" size={18} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pickerButton, {marginTop: 15, borderColor: selectedMembers.length > 0 ? accentColor : textColor, opacity: selectedMembers.length > 0 ? 1 : 0.5 }]}
            onPress={() => setShowUserModal(true)}
          >
            <ThemedText style={{ flex: 1 }}>
              {selectedMembers.length > 0 ? `${selectedMembers.length} Member(s) Added` : 'Invite Members (optional)'}
            </ThemedText>
            {selectedItinerary && (
              <TouchableOpacity
                onPress={() => setSelectedItinerary(null)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <ThemedIcons name="close" size={18} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          {/* Selected Members Display */}
          {selectedMembers.length > 0 && (
            <View style={{marginBottom: 12}}>
              <FlatList
                data={selectedMembers}
                keyExtractor={(item) => item.userID}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <View style={styles.memberCard}>
                    <View style={styles.profileImageContainer}>
                      <ProfileImage imagePath={item.profileImage}/>
                    </View>
                    
                    <View style={{ flex: 1 }}>
                      <ThemedText>
                        {item.fname} {item.lname}
                      </ThemedText>
                    </View>
                    <TouchableOpacity
                      onPress={() => setSelectedMembers(selectedMembers.filter((m) => m.userID !== item.userID))}
                    >
                      <ThemedIcons name="close" size={24}/>
                    </TouchableOpacity>
                  </View>
                )}
              />
            </View>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>

          <Button
            title={isLoading ? "Creating..." : "Create Room"}
            onPress={handleCreateRoom}
            type="primary"
            disabled={isLoading}
            buttonStyle={{ position: 'absolute', bottom: 80, left: 16, right: 16 }}
          />
      </KeyboardAvoidingView>

      {/* Itinerary Picker Modal */}
      <ItineraryPickerModal
        visible={showItineraryModal}
        onClose={() => setShowItineraryModal(false)}
        onSelectItinerary={setSelectedItinerary}
        selectedItinerary={selectedItinerary}
      />

      {/* User Picker Modal */}
      <UserPickerModal
        visible={showUserModal}
        onClose={() => setShowUserModal(false)}
        onMembersSelected={setSelectedMembers}
        selectedMembers={selectedMembers}
      />

      {/* Alert */}
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setAlertVisible(false)}
        fadeAfter={3000}
      />

      <Wave
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, opacity: 0.7 }}
        color={accentColor}
        height={70}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#000',
    borderStyle: 'dashed',
    justifyContent: 'space-between',
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 10,
    marginTop: 8,
    borderRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc4',
  },
  createButtonContainer: {
    paddingVertical: 16,
  },
  profileImageContainer: {
    width: 40,
    aspectRatio: 1,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 12,
  }
});