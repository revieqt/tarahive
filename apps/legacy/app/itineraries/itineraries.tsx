import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import ThemedIcons from '@/components/ThemedIcons';
import React, { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native';
import WaveHeader from '@/components/WaveHeader';
import RoundedButton from '@/components/RoundedButton';
import { useRouter } from 'expo-router';
import EmptyMessage from '@/components/EmptyMessage';
import { 
  useGetUserItineraries,
  useDeleteItinerary,
  useMarkItineraryAsDone,
  useCancelItinerary
} from '@/hooks/useItinerary';
import { useThemeColor } from '@/hooks/useThemeColor';
import OptionsPopup from '@/components/OptionsPopup';
import ShareModal from '@/components/modals/ShareModal';

export default function ItinerariesScreen() {
  const router = useRouter();
  const primaryColor = useThemeColor({}, 'primary');
  const { data: itineraries, isLoading, error } = useGetUserItineraries();
  const deleteItineraryMutation = useDeleteItinerary();
  const markAsDoneMutation = useMarkItineraryAsDone();
  const cancelItineraryMutation = useCancelItinerary();
  const [selectedItineraryId, setSelectedItineraryId] = useState<string | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [shareLink, setShareLink] = useState('');

  // Sort itineraries: active first, then by createdOn date
  const sortedItineraries = itineraries ? [...itineraries].sort((a, b) => {
    if (a.status === 'active' && b.status !== 'active') return -1;
    if (a.status !== 'active' && b.status === 'active') return 1;
    return new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime();
  }) : [];

  const handleViewItinerary = (itineraryId: string) => {
    router.push(`/itineraries/${itineraryId}`);
  };

  const handleEditItinerary = (itinerary: any) => {
    router.push({
      pathname: '/itineraries/itineraries-form',
      params: { itineraryData: JSON.stringify(itinerary) }
    });
  };

  const handleRepeatItinerary = (itinerary: any) => {
    const itineraryToRepeat = {
      ...itinerary,
      startDate: undefined,
      endDate: undefined,
      status: 'pending'
    };
    router.push({
      pathname: '/itineraries/itineraries-form',
      params: { itineraryData: JSON.stringify(itineraryToRepeat) }
    });
  };

  const handleDeleteItinerary = (itineraryId: string) => {
    Alert.alert(
      'Delete Itinerary',
      'Are you sure you want to delete this itinerary? This action cannot be undone.',
      [
        { text: 'Cancel', onPress: () => null },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              setSelectedItineraryId(null);
              await deleteItineraryMutation.mutateAsync(itineraryId);
              // Mutation will automatically refetch the list via invalidateQueries
            } catch (error) {
              const errorMsg = error instanceof Error ? error.message : 'Failed to delete itinerary';
              Alert.alert('Error', errorMsg);
              setSelectedItineraryId(null);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleMarkAsDone = (itineraryId: string) => {
    Alert.alert(
      'Mark as Done',
      'Mark this itinerary as completed?',
      [
        { text: 'Cancel', onPress: () => null },
        {
          text: 'Done',
          onPress: async () => {
            try {
              await markAsDoneMutation.mutateAsync(itineraryId);
              Alert.alert('Success', 'Itinerary marked as done');
            } catch (error) {
              const errorMsg = error instanceof Error ? error.message : 'Failed to mark as done';
              Alert.alert('Error', errorMsg);
            }
          },
        },
      ]
    );
  };

  const handleCancelItinerary = (itineraryId: string) => {
    Alert.alert(
      'Cancel Itinerary',
      'Are you sure you want to cancel this itinerary?',
      [
        { text: 'No', onPress: () => null },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              await cancelItineraryMutation.mutateAsync(itineraryId);
              Alert.alert('Success', 'Itinerary cancelled');
            } catch (error) {
              const errorMsg = error instanceof Error ? error.message : 'Failed to cancel itinerary';
              Alert.alert('Error', errorMsg);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const isOperating = deleteItineraryMutation.isPending || 
                      markAsDoneMutation.isPending || 
                      cancelItineraryMutation.isPending;

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView>
        <WaveHeader title='Itineraries' subtitle='Your travel plans' iconName='google-earth'/>
        
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#00CAFF" />
            <ThemedText style={{ marginTop: 10 }}>Loading itineraries...</ThemedText>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <ThemedText type='subtitle' style={{ color: '#FF6B6B' }}>Failed to load itineraries</ThemedText>
            <ThemedText style={{ marginTop: 5, opacity: 0.6 }}>{error.message}</ThemedText>
          </View>
        ) : !sortedItineraries || sortedItineraries.length === 0 ? (
          <View style={styles.centerContainer}>
            <EmptyMessage title='You have no itineraries' description='Please create an itinerary to get started'
              iconName='note-plus'
            />
          </View>
        ) : (
          <View style={styles.container}>
            {sortedItineraries.map((itinerary) => (
              <TouchableOpacity 
                key={itinerary._id} 
                style={[styles.itineraryCard, { backgroundColor: primaryColor, opacity: isOperating && selectedItineraryId === itinerary._id ? 0.6 : 1 }]}
                onPress={() => handleViewItinerary(itinerary._id)}
                disabled={isOperating && selectedItineraryId === itinerary._id}
              >
                <View style={styles.headerRow}>
                  <ThemedText type='subtitle' style={{flex: 1 }}>
                    {itinerary.title}
                  </ThemedText>
                  <ThemedText style={[styles.statusBadge, { color: getStatusColor(itinerary.status) }]}>
                    {itinerary.status.charAt(0).toUpperCase() + itinerary.status.slice(1)}
                  </ThemedText>
                  {itinerary.status === 'active' ? (
                    <OptionsPopup
                      key="settings"
                      style={{padding: 5}}
                      options={[
                        <TouchableOpacity 
                          style={styles.option}
                          onPress={() => handleViewItinerary(itinerary._id)}>
                          <ThemedIcons name='information' size={18}/>
                          <ThemedText style={{marginLeft: 10}}>View Itinerary</ThemedText>
                        </TouchableOpacity>,
                        <TouchableOpacity style={styles.option} 
                          onPress={() => router.push({
                            pathname: '/rooms/rooms-create',
                            params: { itineraryId: itinerary._id }
                          })}>
                          <ThemedIcons name='account-group' size={18}/>
                          <ThemedText style={{marginLeft: 10}}>Create Group with Itinerary</ThemedText>
                        </TouchableOpacity>
                        ,
                        <TouchableOpacity style={styles.option} onPress={() => {
                          setShareLink(`exp://tarag-v2.exp.app/itineraries/${itinerary._id}`);
                          setShowShare(true);
                        }}>
                          <ThemedIcons name="share" size={20} />
                          <ThemedText style={{marginLeft: 10}}>Share Itinerary</ThemedText>
                        </TouchableOpacity>,
                        <TouchableOpacity 
                          style={styles.option}
                          onPress={() => handleEditItinerary(itinerary)}>
                          <ThemedIcons name='pencil' size={18}/>
                          <ThemedText style={{marginLeft: 10}}>Edit Itinerary</ThemedText>
                        </TouchableOpacity>,
                        <TouchableOpacity 
                          style={styles.option}
                          onPress={() => {
                            setSelectedItineraryId(itinerary._id);
                            handleMarkAsDone(itinerary._id);
                          }}>
                          <ThemedIcons name='check-circle' size={18}/>
                          <ThemedText style={{marginLeft: 10}}>Mark as Done</ThemedText>
                        </TouchableOpacity>
                        ,
                        <TouchableOpacity 
                          style={styles.option}
                          onPress={() => {
                            setSelectedItineraryId(itinerary._id);
                            handleCancelItinerary(itinerary._id);
                          }}>
                          <ThemedIcons name='minus-circle' size={18}/>
                          <ThemedText style={{marginLeft: 10}}>Cancel Itinerary</ThemedText>
                        </TouchableOpacity>
                        ,
                        <TouchableOpacity 
                          style={styles.option}
                          onPress={() => {
                            setSelectedItineraryId(itinerary._id);
                            handleDeleteItinerary(itinerary._id);
                          }}>
                          <ThemedIcons name='delete' size={18}/>
                          <ThemedText style={{marginLeft: 10}}>Delete Itinerary</ThemedText>
                        </TouchableOpacity>,
                      ]}
                    >
                      <ThemedIcons name='dots-vertical' size={20}/>
                    </OptionsPopup>
                    )
                  : (
                    <OptionsPopup
                      key="settings"
                      style={{padding: 5}}
                      options={[
                        <TouchableOpacity 
                          style={styles.option}
                          onPress={() => handleViewItinerary(itinerary._id)}>
                          <ThemedIcons name='information' size={18}/>
                          <ThemedText style={{marginLeft: 10}}>View Itinerary</ThemedText>
                        </TouchableOpacity>,
                        <TouchableOpacity 
                          style={styles.option}
                          onPress={() => handleRepeatItinerary(itinerary)}>
                          <ThemedIcons name='history' size={18}/>
                          <ThemedText style={{marginLeft: 10}}>Repeat Itinerary</ThemedText>
                        </TouchableOpacity>,
                        <TouchableOpacity 
                          style={styles.option}
                          onPress={() => {
                            setSelectedItineraryId(itinerary._id);
                            handleDeleteItinerary(itinerary._id);
                          }}>
                          <ThemedIcons name='delete' size={18}/>
                          <ThemedText style={{marginLeft: 10}}>Delete Itinerary</ThemedText>
                        </TouchableOpacity>,
                      ]}
                    >
                      <ThemedIcons name='dots-vertical' size={20}/>
                    </OptionsPopup>
                  )}
                  
                </View>

                <View style={styles.dateRow}>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={{ fontSize: 11, opacity: 0.5 }}>Start</ThemedText>
                    <ThemedText style={{ fontSize: 12, fontWeight: '500', marginTop: 2 }}>
                      {formatDate(itinerary.startDate)}
                    </ThemedText>
                  </View>
                  <ThemedIcons name="arrow-right" size={20} style={{ opacity: 0.4 }} />
                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <ThemedText style={{ fontSize: 11, opacity: 0.5 }}>End</ThemedText>
                    <ThemedText style={{ fontSize: 12, fontWeight: '500', marginTop: 2 }}>
                      {formatDate(itinerary.endDate)}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.detailsRow}>
                  <ThemedText style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>
                      {itinerary.type}
                    </ThemedText>
                  <View style={styles.locationRow}>
                    <ThemedIcons name="map-marker" size={12} style={{ opacity: 0.5 }} />
                    <ThemedText style={{ fontSize: 12, opacity: 0.6, marginLeft: 4 }}>
                      {itinerary.locations.length} {itinerary.locations.length === 1 ? 'location' : 'locations'}
                    </ThemedText>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <RoundedButton
        iconName="plus"
        onPress={() => router.push('/itineraries/itineraries-form')}
        style={styles.addButton}
      />

      <ShareModal
        visible={showShare}
        link={shareLink}
        onClose={() => setShowShare(false)}
      />
    </ThemedView>
  );
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateString;
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return '#00CAFF';
    case 'done':
      return '#4CAF50';
    case 'cancelled':
      return '#FF6B6B';
    default:
      return '#999';
  }
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    paddingBottom: 100,
  },
  addButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    minHeight: 300,
  },
  itineraryCard: {
    padding: 16,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 100,
    opacity: 0.7,
    fontSize: 11,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});