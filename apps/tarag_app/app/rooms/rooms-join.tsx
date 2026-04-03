import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, FlatList, ScrollView } from 'react-native';
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
import { router } from 'expo-router';

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

export default function JoinRoomScreen() {
  const accentColor = useThemeColor({}, 'accent');
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');

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

    // TODO: Implement room creation API call
    setAlertConfig({
      title: 'Success',
      message: `Room "${roomName}" created!`,
    });
    setAlertVisible(true);

    // Reset form
    setRoomName('');
    setSelectedItinerary(null);
    setSelectedMembers([]);
  };

  return (
    <ThemedView style={{ flex: 1 }} color="primary">
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <BackButton />
        <ThemedText type="title">
          Join a Room
        </ThemedText>
        <ThemedText style={{ marginBottom: 20, opacity: 0.7 }}>
          Enter the room code provided by your friend to join an existing room.
        </ThemedText>

        {/* <TextField
          placeholder="Enter room code"
          value={roomName}
          onChangeText={setRoomName}
        /> */}

        <TouchableOpacity
          style={[styles.pickerButton, { borderColor: selectedItinerary ? accentColor : textColor, opacity: selectedItinerary ? 1 : 0.5 }]}
          onPress={() => router.push('/camera/qr-scan')}
        >
          <ThemedIcons name="qrcode-scan" size={20}/>
          <ThemedText style={{ flex: 1, marginLeft: 10 }}>
            scan QR Code instead
          </ThemedText>
        </TouchableOpacity>


          {/* <Button
            title="Create Room"
            onPress={handleCreateRoom}
            type="primary"
            buttonStyle={{ position: 'absolute', bottom: 80, left: 16, right: 16 }}
          /> */}
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
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 8,
  },
  removeMemberButton: {
    marginLeft: 8,
  },
  createButtonContainer: {
    paddingVertical: 16,
  },
});