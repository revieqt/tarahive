import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { RoomDetail } from '@/services/roomService';
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedIcons } from "@/components/ThemedIcons";
import Button from "@/components/Button";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSession } from "@/context/SessionContext";
import InputModal from "@/components/modals/InputModal";
import { useUpdateRoomName, useUpdateRoomColor, useUpdateRoomImage, useLeaveRoom } from "@/hooks/useRoom";
import { useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from 'expo-image-picker';

interface RoomsSettingsSectionProps {
  room: RoomDetail;
  roomID?: string;
}

export default function RoomsSettingsSection({ room, roomID: passedRoomID }: RoomsSettingsSectionProps){
  const router = useRouter();
  const { id: paramRoomID } = useLocalSearchParams<{ id: string }>();
  const roomID = passedRoomID || paramRoomID || '';
  
  const { session } = useSession();
  const user = session?.user;
  const isAdmin = room?.admins.includes(user?.id || '');
  
  const accentColor = useThemeColor({}, 'accent');
  const queryClient = useQueryClient();
  
  // Modals
  const [showNameModal, setShowNameModal] = useState(false);
  const [showColorModal, setShowColorModal] = useState(false);
  const [nameValue, setNameValue] = useState(room.name);
  const [colorValue, setColorValue] = useState(room.roomColor);

  // Reset values when modal closes
  useEffect(() => {
    if (!showNameModal) {
      setNameValue(room.name);
    }
  }, [showNameModal, room.name]);

  useEffect(() => {
    if (!showColorModal) {
      setColorValue(room.roomColor);
    }
  }, [showColorModal, room.roomColor]);

  // Mutations
  const updateNameMutation = useUpdateRoomName(roomID);
  const updateColorMutation = useUpdateRoomColor(roomID);
  const updateImageMutation = useUpdateRoomImage(roomID);
  const leaveMutation = useLeaveRoom();

  const handleUpdateName = (value: string | { areaCode: string; number: string }) => {
    const newName = typeof value === 'string' ? value : '';
    
    updateNameMutation.mutate(newName, {
      onSuccess: () => {
        // Invalidate and refetch the room data
        queryClient.invalidateQueries({ queryKey: ['rooms', 'detail', roomID] });
        Alert.alert('Success', 'Room name updated successfully');
        setShowNameModal(false);
      },
      onError: (error: any) => {
        Alert.alert('Error', error.message || 'Failed to update room name');
      },
    });
  };

  const handleUpdateColor = (value: string | { areaCode: string; number: string }) => {
    const newColor = typeof value === 'string' ? value : '';
    
    updateColorMutation.mutate(newColor, {
      onSuccess: () => {
        // Invalidate and refetch the room data
        queryClient.invalidateQueries({ queryKey: ['rooms', 'detail', roomID] });
        Alert.alert('Success', 'Room color updated successfully');
        setShowColorModal(false);
      },
      onError: (error: any) => {
        Alert.alert('Error', error.message || 'Failed to update room color');
      },
    });
  };

  const handleUpdateImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        
        updateImageMutation.mutate(imageUri, {
          onSuccess: () => {
            // Invalidate and refetch the room data
            queryClient.invalidateQueries({ queryKey: ['rooms', 'detail', roomID] });
            Alert.alert('Success', 'Room image updated successfully');
          },
          onError: (error: any) => {
            Alert.alert('Error', error.message || 'Failed to update room image');
          },
        });
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update room image');
    }
  };

  const handleLeaveRoom = () => {
    Alert.alert(
      'Leave Room',
      'Are you sure you want to leave this room?',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Leave',
          onPress: () => {
            leaveMutation.mutate(roomID, {
              onSuccess: () => {
                Alert.alert('Success', 'You have left the room', [
                  { text: 'OK', onPress: () => router.push('/(tabs)/explore') }
                ]);
              },
              onError: (error: any) => {
                Alert.alert('Error', error.message || 'Failed to leave room');
              },
            });
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <View style={styles.sectionContainer}>
      <TouchableOpacity 
        style={styles.sectionChild}
        onPress={() => setShowNameModal(true)}
      >
        <View>
          <ThemedText>{room.name}</ThemedText>
          <ThemedText style={styles.sectionChildDescription}>Update Room Name</ThemedText>
        </View>
        <ThemedIcons name='chevron-right' size={20} />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.sectionChild}
        onPress={handleUpdateImage}
      >
        <View>
          <ThemedText>Room Image</ThemedText>
          <ThemedText style={styles.sectionChildDescription}>Update Room Image</ThemedText>
        </View>
        <ThemedIcons name='chevron-right' size={20} />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.sectionChild}
        onPress={() => setShowColorModal(true)}
      >
        <View>
          <ThemedText>{room.roomColor}</ThemedText>
          <ThemedText style={styles.sectionChildDescription}>Update Room Color</ThemedText>
        </View>
        <ThemedIcons name='chevron-right' size={20} />
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.sectionChild, styles.leaveButton]}
        onPress={handleLeaveRoom}
      >
        <View>
          <ThemedText style={{ color: '#ff6b6b' }}>Leave Room</ThemedText>
          <ThemedText style={[styles.sectionChildDescription, { color: '#ff6b6b' }]}>Leave this room</ThemedText>
        </View>
        <ThemedIcons name='chevron-right' size={20} />
      </TouchableOpacity>

      {/* Name Modal */}
      <InputModal
        visible={showNameModal}
        onClose={() => setShowNameModal(false)}
        onSubmit={handleUpdateName}
        label="Update Room Name"
        description="Enter the new room name"
        type="text"
        initialValue={room.name}
        placeholder="New room name"
      />

      {/* Color Modal */}
      <InputModal
        visible={showColorModal}
        onClose={() => setShowColorModal(false)}
        onSubmit={handleUpdateColor}
        label="Update Room Color"
        description="Choose a color for your room"
        type="color"
        initialValue={room.roomColor}
      />


    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer:{
    padding: 16,
    marginTop: 10,
    gap: 12,
  },
  sectionChild:{
    flexDirection: 'row',
    paddingBottom: 5,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionChildDescription:{
    fontSize: 12,
    opacity: 0.7,
  },

  leaveButton: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ff6b6b30',
  },
});