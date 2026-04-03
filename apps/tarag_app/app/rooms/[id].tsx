import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, FlatList, ActivityIndicator, TouchableOpacity, ImageBackground, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import BackButton from '@/components/BackButton';
import { getSpecificRoom, RoomDetail } from '@/services/roomService';
import ProfileImage from '@/components/ProfileImage';
import Wave from '@/components/Wave';
import { LinearGradient } from 'expo-linear-gradient';
import { useSession } from '@/context/SessionContext';
import { BACKEND_URL } from '@/constants/Config';
import OptionsPopup from '@/components/OptionsPopup';
import { ThemedIcons } from '@/components/ThemedIcons';
import EmptyMessage from '@/components/EmptyMessage';
import RoomsSettingsSection from './settings';
import { Image } from 'expo-image';
import ShareModal from '@/components/modals/ShareModal';
import { useGetSpecificRoom, useAttachItinerary, useUnattachItinerary, useInviteUser, useApproveInvite, useRequestToJoin, useApproveJoinRequest, useKickUser, useElevateToAdmin, useChangeUserNickname } from '@/hooks/useRoom';
import ItineraryPickerModal from '@/components/modals/ItineraryPickerModal';
import UserPickerModal from '@/components/modals/UserPickerModal';
import InputModal from '@/components/modals/InputModal';
import Button from '@/components/Button';

export default function RoomDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useSession();
  const user = session?.user;
  const router = useRouter();
  const accentColor = useThemeColor({}, 'accent');
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const [activeTab, setActiveTab] = useState<'home' | 'settings'>('home');
  const [showShare, setShowShare] = useState(false);
  const [showItineraryPicker, setShowItineraryPicker] = useState(false);
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [selectedInviteMembers, setSelectedInviteMembers] = useState<any[]>([]);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [selectedMemberForNickname, setSelectedMemberForNickname] = useState<{ userID: string; nickname: string } | null>(null);

  // Use the hook instead of useState/useEffect for automatic refetching
  const { data: room, isLoading, error } = useGetSpecificRoom(id);
  const isUserInvited = room?.members.some(member => member.userID === user?.id && member.status === 'invited');
  const isUserWaiting = room?.members.some(member => member.userID === user?.id && member.status === 'waiting');
  const isUserMember = room?.members.some(member => member.userID === user?.id && member.status === 'member');
  const isUserInRoom = isUserMember || isUserInvited || isUserWaiting;
  
  // Mutations for attach/unattach itinerary
  const attachItineraryMutation = useAttachItinerary(id || '');
  const unattachItineraryMutation = useUnattachItinerary(id || '');
  
  // Mutations for invite and approval
  const inviteUserMutation = useInviteUser(id || '');
  const approveInviteMutation = useApproveInvite(id || '');
  const requestToJoinMutation = useRequestToJoin(id || '');
  const approveJoinRequestMutation = useApproveJoinRequest(id || '');
  const kickUserMutation = useKickUser(id || '');
  const elevateToAdminMutation = useElevateToAdmin(id || '');
  const changeUserNicknameMutation = useChangeUserNickname(id || '');

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]} color="primary">
        <ActivityIndicator size="large" color={accentColor} />
      </ThemedView>
    );
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to load room details';
    return (
      <ThemedView style={styles.container} color="primary">
        <BackButton />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ThemedText type="subtitle" style={{ textAlign: 'center', marginBottom: 10 }}>
            Error Loading Room
          </ThemedText>
          <ThemedText style={{ textAlign: 'center', opacity: 0.7 }}>
            {errorMessage || 'Room not found'}
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!room) {
    return (
      <ThemedView style={styles.container} color="primary">
        <BackButton />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ThemedText type="subtitle" style={{ textAlign: 'center', marginBottom: 10 }}>
            Room Not Found
          </ThemedText>
          <ThemedText style={{ textAlign: 'center', opacity: 0.7 }}>
            Unable to load room information
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  // After the null check, room is guaranteed to be defined
  const isAdmin = room.admins?.includes(user?.id || '') || false;

  return (
    <ThemedView style={styles.container}>
        <ScrollView>
            <View style={styles.headerContainer}>
                {room.roomImage !== '' && (
                  <Image
                    source={{ uri: `${BACKEND_URL}${room.roomImage}` }}
                    style={styles.headerImage}
                    contentFit="cover"
                  />
                )}
                <LinearGradient colors={['transparent', '#000']} style={styles.headerGradient}>
                    <BackButton color='white' style={{marginBottom: 90}}/>
                    <View style={{paddingHorizontal: 16, paddingTop: 20, paddingBottom: 10}}>
                        <ThemedText type="title" style={{color: '#fff'}}>{room.name}</ThemedText>
                        <ThemedText style={{ color:"#fff", opacity: 0.8}}>
                            Invite Code: {room.inviteCode}
                        </ThemedText>
                    </View>

                    <ScrollView horizontal style={{ paddingHorizontal: 16, marginBottom: 50}} contentContainerStyle={{gap: 7}}  showsHorizontalScrollIndicator={false}>
                        <TouchableOpacity style={styles.buttons} onPress={() => setActiveTab('home')}>
                            <ThemedText style={{color: '#fff'}}>Home</ThemedText>
                        </TouchableOpacity>
                        {(isUserInRoom || isUserWaiting || isUserInvited) && (
                            <>
                                <TouchableOpacity style={styles.buttons} onPress={() => router.push(`/rooms/rooms-chat`)}>
                                    <ThemedText style={{color: '#fff'}}>Chat</ThemedText>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.buttons} onPress={() => setShowShare(true)}>
                                    <ThemedText style={{color: '#fff'}}>Share</ThemedText>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.buttons} onPress={() => setActiveTab('settings')}>
                                    <ThemedText style={{color: '#fff'}}>Settings</ThemedText>
                                </TouchableOpacity>
                            </>
                        )}
                    </ScrollView>
                    
                    <Wave
                        style={{ position: 'absolute', bottom: 0, left: 0, right: 0}}
                        color={backgroundColor}
                    />
                </LinearGradient>
            </View>

            {activeTab === 'home' && (
                <View style={styles.content}>
                    {room.itineraryTitle ? (
                    <View style={[styles.infoCard, {backgroundColor: primaryColor, flexDirection: 'row', alignItems: 'center'}]}>
                        <TouchableOpacity style={{flex: 1}} onPress={() => router.push(`/itineraries/${room.itineraryID}`)}>
                            <ThemedText>
                            Attached Itinerary
                            </ThemedText>
                            <ThemedText type="subtitle">
                            {room.itineraryTitle}
                            </ThemedText>
                            {room.itineraryStartDate && (
                            <ThemedText style={{ fontSize: 12, opacity: 0.6, marginTop: 5 }}>
                                {new Date(room.itineraryStartDate).toLocaleDateString()} - {new Date(room.itineraryEndDate || '').toLocaleDateString()}
                            </ThemedText>
                            )}
                        </TouchableOpacity>
                        
                        {isAdmin && (
                            <OptionsPopup
                                options={[
                                <TouchableOpacity 
                                  style={styles.optionsChild}
                                  onPress={() => {
                                    Alert.alert (
                                      'Unattach Itinerary',
                                      'Are you sure you want to unattach this itinerary?',
                                      [
                                        { text: 'Cancel', onPress: () => {} },
                                        {
                                          text: 'Unattach',
                                          onPress: () => {
                                            unattachItineraryMutation.mutate();
                                          },
                                          style: 'destructive',
                                        },
                                      ]
                                    );
                                  }}
                                >
                                    <ThemedIcons name='note-off' size={20} />
                                    <ThemedText>Unattach Itinerary</ThemedText>
                                </TouchableOpacity>,
                                ]}
                            >
                                <ThemedIcons name="dots-vertical" size={24}/>
                            </OptionsPopup>
                        )}
                    </View>
                    ):(
                        isAdmin ? (
                            <TouchableOpacity 
                              style={styles.emptyItinerary}
                              onPress={() => setShowItineraryPicker(true)}
                            >
                                <EmptyMessage
                                    iconName="plus"
                                    title="No itinerary attached"
                                    description="Attach an itinerary to this room"
                                />
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.emptyItinerary}>
                                <EmptyMessage
                                    iconName="note-off"
                                    title="No itinerary attached"
                                    description="Admin has not attached an itinerary to this room yet"
                                />
                            </View>
                        )
                    )}

                    {isUserInRoom && (
                        <>
                            {isAdmin && (
                                <Button
                                    title="+ Invite New Member"
                                    onPress={() => setShowUserPicker(true)}
                                    buttonStyle={{ marginBottom: 12 }}
                                />
                            )}
                            <ThemedView color='primary' style={{ borderRadius: 12, padding: 10 }}>
                                    <FlatList
                                    data={room.members}
                                    keyExtractor={(item) => item.userID}
                                    scrollEnabled={false}
                                    renderItem={({ item }) => (
                                        <View style={styles.memberCard}>
                                            <TouchableOpacity style={styles.profileImageContainer} onPress={() => router.push(`/account/${item.userID}`)}>
                                                <ProfileImage imagePath={item.profileImage} />
                                            </TouchableOpacity>
                                            <View style={{ flex: 1 }}>
                                                <ThemedText style={{ fontWeight: '600' }}>
                                                    {item.nickname || item.username || 'Unknown User'}
                                                </ThemedText>
                                                <ThemedText style={{ fontSize: 12, opacity: 0.6, marginTop: 3 }}>
                                                    {item.status}
                                                </ThemedText>
                                            </View>
                                            {isAdmin && user?.id !== item.userID && (
                                                <OptionsPopup
                                                    options={[
                                                        item.status === 'waiting' && (
                                                            <>
                                                                <TouchableOpacity 
                                                                    style={styles.optionsChild}
                                                                    onPress={() => {
                                                                        approveJoinRequestMutation.mutate({ userID: item.userID, approval: true });
                                                                    }}
                                                                >
                                                                    <ThemedIcons name='check-circle' size={20} />
                                                                    <ThemedText>Approve Join</ThemedText>
                                                                </TouchableOpacity>
                                                                <TouchableOpacity 
                                                                    style={styles.optionsChild}
                                                                    onPress={() => {
                                                                        approveJoinRequestMutation.mutate({ userID: item.userID, approval: false });
                                                                    }}
                                                                >
                                                                    <ThemedIcons name='close-circle' size={20} />
                                                                    <ThemedText>Reject Join</ThemedText>
                                                                </TouchableOpacity>
                                                            </>
                                                        ),
                                                        !room.admins.includes(item.userID) && item.status !== 'waiting' && (
                                                            <TouchableOpacity 
                                                                style={styles.optionsChild}
                                                                onPress={() => {
                                                                    Alert.alert('Elevate to Admin', 'Make this user an admin?', [
                                                                        { text: 'Cancel', onPress: () => {} },
                                                                        {
                                                                            text: 'Confirm',
                                                                            onPress: () => {
                                                                                elevateToAdminMutation.mutate(item.userID);
                                                                            },
                                                                        },
                                                                    ]);
                                                                }}
                                                            >
                                                                <ThemedIcons name='star' size={20} />
                                                                <ThemedText>Make Admin</ThemedText>
                                                            </TouchableOpacity>
                                                        ),
                                                        item.status === 'member' && (
                                                            <TouchableOpacity 
                                                                style={styles.optionsChild}
                                                                onPress={() => {
                                                                    setSelectedMemberForNickname({ userID: item.userID, nickname: item.nickname || '' });
                                                                    setShowNicknameModal(true);
                                                                }}
                                                            >
                                                                <ThemedIcons name='pencil' size={20} />
                                                                <ThemedText>Change Nickname</ThemedText>
                                                            </TouchableOpacity>
                                                        ),
                                                        <TouchableOpacity 
                                                            style={styles.optionsChild}
                                                            onPress={() => {
                                                                Alert.alert('Kick User', 'Are you sure you want to kick this user?', [
                                                                    { text: 'Cancel', onPress: () => {} },
                                                                    {
                                                                        text: 'Kick',
                                                                        onPress: () => {
                                                                            kickUserMutation.mutate(item.userID);
                                                                        },
                                                                        style: 'destructive',
                                                                    },
                                                                ]);
                                                            }}
                                                        >
                                                            <ThemedIcons name='account-remove' size={20} />
                                                            <ThemedText>Kick User</ThemedText>
                                                        </TouchableOpacity>,
                                                    ].filter(Boolean)}
                                                >
                                                    <ThemedIcons name="dots-vertical" size={24}/>
                                                </OptionsPopup>
                                            )}
                                        </View>
                                    )}
                                />
                            </ThemedView>
                            
                        </>
                    )}
                </View>
            )}

            {activeTab === 'settings' && (
                <RoomsSettingsSection room={room} roomID={id}/>
            )}
            
        </ScrollView>
      
      
      

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>

        {/* Members Section */}
        

        

        <View style={{ height: 30 }} />
      </ScrollView>

      <ShareModal
        visible={showShare}
        link={`exp://tarag-v2.exp.app/rooms/${room._id}`}
        onClose={() => setShowShare(false)}
      />

      <ItineraryPickerModal
        visible={showItineraryPicker}
        onClose={() => setShowItineraryPicker(false)}
        onSelectItinerary={(itinerary) => {
          attachItineraryMutation.mutate(itinerary._id);
        }}
      />

      <UserPickerModal
        visible={showUserPicker}
        onClose={() => {
          setShowUserPicker(false);
          setSelectedInviteMembers([]);
        }}
        onMembersSelected={(members) => {
          if (members.length > 0) {
            inviteUserMutation.mutate(members[0].userID);
            setShowUserPicker(false);
            setSelectedInviteMembers([]);
          }
        }}
        selectedMembers={selectedInviteMembers}
      />

      <InputModal
        visible={showNicknameModal}
        onClose={() => {
          setShowNicknameModal(false);
          setSelectedMemberForNickname(null);
        }}
        onSubmit={(nickname) => {
          if (selectedMemberForNickname) {
            changeUserNicknameMutation.mutate({
              userID: selectedMemberForNickname.userID,
              nickname: nickname as string,
            });
            setShowNicknameModal(false);
            setSelectedMemberForNickname(null);
          }
        }}
        label="Change Nickname"
        description={`Enter a new nickname for ${selectedMemberForNickname?.nickname || 'this user'}`}
        type="text"
        initialValue={selectedMemberForNickname?.nickname || ''}
        placeholder="Enter new nickname"
      />

      {isUserInvited ? (
        <LinearGradient
          colors={['transparent', primaryColor]}
          style={styles.invitedOptions}
        >
          <Button 
            title="Decline Invite"
            onPress={() => {
              Alert.alert('Decline Invite', 'Are you sure you want to decline this invite?', [
                { text: 'Cancel', onPress: () => {} },
                {
                  text: 'Decline',
                  onPress: () => {
                    approveInviteMutation.mutate(false);
                  },
                  style: 'destructive',
                },
              ]);
            }}
            buttonStyle={{ flex: 1 }}
          />
          <Button 
            title="Accept Invite"
            type="primary"
            onPress={() => {
              approveInviteMutation.mutate(true);
            }}
            buttonStyle={{ flex: 1 }}
          />
        </LinearGradient>
      ) : isUserWaiting ? (
        <LinearGradient
          colors={['transparent', primaryColor]}
          style={styles.invitedOptions}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 16 }}>
            <ThemedText style={{ textAlign: 'center', color: '#fff' }}>
              Waiting for admin approval...
            </ThemedText>
          </View>
        </LinearGradient>
      ) : !isUserInRoom ? (
        <LinearGradient
          colors={['transparent', primaryColor]}
          style={styles.invitedOptions}
        >
          <Button 
            title="Request to Join"
            type="primary"
            onPress={() => {
              requestToJoinMutation.mutate();
            }}
            buttonStyle={{ flex: 1 }}
          />
        </LinearGradient>
      ) : (
        <TouchableOpacity style={[styles.mapIconContainer, {borderColor: room.roomColor}]} onPress={() => router.push(`/rooms/rooms-map`)}>
          <Image source={require('@/assets/images/map-hybrid.png')} style={styles.mapIcon} />
        </TouchableOpacity>
      )}
      
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer:{
    width: '100%',
    height: 250,
    position: 'relative',
  },
  headerImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    
  },
  headerGradient:{
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  buttons:{
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  content:{
    padding: 16,
  },
  optionsChild:{
    flexDirection: 'row',
    gap: 10,
    flex: 1,
  },
  infoCard: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc4',
  },
  emptyItinerary: {
    padding: 12,
    paddingBottom: 5,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc4',
  },
  profileImageContainer: {
    width: 40,
    aspectRatio: 1,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 12,
  },
    mapIconContainer: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        zIndex: 10,
        width: 70,
        height: 70,
        borderRadius: 100,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        borderWidth: 5,
        borderColor: 'blue',
    },
    mapIcon: {
        width: '100%',
        height: '100%',
    },
    invitedOptions: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    }
});
