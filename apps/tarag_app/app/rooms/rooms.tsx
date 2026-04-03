import OptionsPopup from "@/components/OptionsPopup";
import TextField from "@/components/TextField";
import { ThemedText } from "@/components/ThemedText";
import { View, StyleSheet, TouchableOpacity, Alert, ScrollView, FlatList, ActivityIndicator } from "react-native";
import ThemedIcons from "@/components/ThemedIcons";
import { ThemedView } from "@/components/ThemedView";
import React, { useState, useCallback, useEffect } from "react";
import { useFocusEffect } from '@react-navigation/native';
import EmptyMessage from '@/components/EmptyMessage';
import { useSession } from "@/context/SessionContext";
import LoadingContainerAnimation from "@/components/LoadingContainerAnimation";
import { useThemeColor } from "@/hooks/useThemeColor";
import { router } from "expo-router";
import RoundedButton from "@/components/RoundedButton";
import { useGetRooms } from "@/hooks/useRoom";
import { BACKEND_URL } from "@/constants/Config";
import { Image } from "expo-image";

export default function GroupsSection({ activeTab ="all", refreshTrigger }: {activeTab?: string, refreshTrigger?: boolean}){
    const { session } = useSession();
    const [selectedTab, setSelectedTab] = useState<'member' | 'pending'>('member');
    const primaryColor = useThemeColor({}, 'primary');
    const secondaryColor = useThemeColor({}, 'secondary');
    const accentColor = useThemeColor({}, 'accent');  
    const textColor = useThemeColor({}, 'text');
    
    // Fetch rooms based on selected tab
    const { data: memberRooms, isLoading: isMemberLoading, error: memberError } = useGetRooms('member');
    const { data: pendingRooms, isLoading: isPendingLoading, error: pendingError } = useGetRooms('invited,waiting');
    
    const rooms = selectedTab === 'member' ? (memberRooms || []) : (pendingRooms || []);
    const isLoading = selectedTab === 'member' ? isMemberLoading : isPendingLoading;
    const error = selectedTab === 'member' ? memberError : pendingError;

    const handleSelectRoom = (roomId: string) => {
      router.push(`/rooms/${roomId}`);
    };
    
    return (
    <View style={{flex: 1}}>
        <View style={{padding: 16}}>
            <ScrollView style={styles.buttonsRow} horizontal showsHorizontalScrollIndicator={false} 
                contentContainerStyle={{gap: 10}}>
                <TouchableOpacity 
                    style={[styles.buttons, {backgroundColor: selectedTab === 'member' ? secondaryColor + '80' : primaryColor}]}
                    onPress={() => setSelectedTab('member')}
                >
                    <ThemedText>Your Rooms</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.buttons, {backgroundColor: selectedTab === 'pending' ? secondaryColor + '80' : primaryColor}]}
                    onPress={() => setSelectedTab('pending')}
                >
                    <ThemedText>Pending Rooms</ThemedText>
                </TouchableOpacity>
            </ScrollView>
        </View>

        {isLoading && (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={accentColor} />
            </View>
        )}

        {error && (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
                <ThemedText type="subtitle" style={{ textAlign: 'center', marginBottom: 10 }}>
                    Error Loading Rooms
                </ThemedText>
                <ThemedText style={{ textAlign: 'center', opacity: 0.7 }}>
                    {error instanceof Error ? error.message : 'Failed to load rooms'}
                </ThemedText>
            </View>
        )}

        {!isLoading && !error && rooms.length === 0 && (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <EmptyMessage
                    iconName="inbox"
                    title={selectedTab === 'member' ? 'No Rooms Yet' : 'No Pending Rooms'}
                    description={selectedTab === 'member' ? 'Create or join a room to get started' : 'All invitations have been handled'}
                />
            </View>
        )}

        {!isLoading && !error && rooms.length > 0 && (
            <FlatList
                data={rooms}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16, paddingTop: 0 }}
                scrollEnabled={true}
                renderItem={({ item: room }) => (
                    <TouchableOpacity 
                        style={[styles.roomCard, { backgroundColor: primaryColor }]}
                        onPress={() => handleSelectRoom(room.id)}
                    >
                        {room.roomImage ? (
                            <Image
                                source={{ uri: `${BACKEND_URL}${room.roomImage}` }}
                                style={styles.roomImage}
                                contentFit="cover"
                            />
                        ):(
                            <ThemedView style={styles.roomImage} color="secondary">
                                <ThemedText style={{ fontSize: 20, fontWeight: 'bold', color: 'white' }}>
                                    {room.name.charAt(0).toUpperCase()}
                                </ThemedText>
                            </ThemedView>
                        )}
                        <View style={styles.roomContent}>
                            <ThemedText style={{ fontWeight: '600', fontSize: 14 }}>
                                {room.name}
                            </ThemedText>
                            <ThemedText style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>
                                {room.memberCount || 0} {room.memberCount === 1 ? 'member' : 'members'}
                            </ThemedText>
                            {room.membershipStatus && room.membershipStatus !== 'member' && (
                                <ThemedText style={{ fontSize: 11, opacity: 0.7, marginTop: 4, color: accentColor }}>
                                    {room.membershipStatus === 'invited' ? 'Invitation Pending' : 'Waiting for Approval'}
                                </ThemedText>
                            )}
                        </View>
                        <ThemedIcons name="chevron-right" size={20} />
                    </TouchableOpacity>
                )}
            />
        )}
    </View>
    
   ); 
}

const styles = StyleSheet.create({
    buttonsRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 10,
    },
    buttons:{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 7,
        paddingHorizontal: 14,
        borderRadius: 50,
        gap: 4,
    },
    roomCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        padding: 12,
        borderRadius: 12,
        gap: 12,
        paddingRight: 16,
    },
    roomImage: {
        width: 50,
        height: 50,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    roomContent: {
        flex: 1,
        justifyContent: 'center',
    }
});