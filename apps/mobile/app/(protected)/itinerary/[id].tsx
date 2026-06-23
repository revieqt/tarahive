import OptionsPopup from '@/shared/components/ui/OptionsPopup';
import { TIcon, TText, TView } from '@/shared/components/ui/Themed';
import BackButton from '@/shared/components/common/BackButton';
import { useLocation } from '@/shared/context/LocationContext';
import { usePlaceWeather } from '@/shared/hooks/useWeather';
import { useSession } from '@/features/auth/context/SessionContext';
import { useLocalSearchParams, router } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View, Dimensions, Linking, ScrollView, Platform } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog } from '@/shared/services/dialog.service';
import { LinearGradient } from 'expo-linear-gradient';
import { formatDateToString } from '@/shared/utils/formatDateToString';
import ShareModal from '@/shared/components/modals/ShareModal';
import LocationDisplay from '@/shared/components/common/LocationDisplay';
import { useThemeColor } from '@/shared/hooks/useThemeColor';
import { Location, Address, getStatusColor } from '@/features/itinerary/types/itineraryTypes';
import { useGetItinerary } from '@/features/itinerary/hooks/useGetItinerary';
import { useDeleteItinerary } from '@/features/itinerary/hooks/useDeleteItinerary';
import EmptyMessage from '@/shared/components/common/EmptyMessage';

interface LocationWithDate extends Location {
  date?: number | Date | string;
}

export default function ItineraryViewScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();

  const { itinerary, isLoading, error } = useGetItinerary(id || null);
  const deleteItineraryMutation = useDeleteItinerary();
  const queryClient = useQueryClient();

  const { latitude: userLat, longitude: userLng } = useLocation();
  const { session, updateSession } = useSession();
  const [selectedLocation, setSelectedLocation] = useState<LocationWithDate | null>(null);
  const secondaryColor = useThemeColor({}, 'secondary');
  const [groupName, setGroupName] = useState('');
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [is3DMode, setIs3DMode] = useState(true);
  const [currentHeading, setCurrentHeading] = useState(0);


  const handleLocationClick = (location: LocationWithDate) => {
    setSelectedLocation(location);
    setCurrentHeading(0);
  };

  const formatMapDate = (dateValue: any): string => {
    if (!dateValue) return 'N/A';

    try {
      if (typeof dateValue === 'string') {
        return dateValue.slice(0, 10);
      }
      if (dateValue instanceof Date) {
        return dateValue.toISOString().slice(0, 10);
      }
      if (typeof dateValue === 'number') {
        return new Date(dateValue).toISOString().slice(0, 10);
      }
      if (dateValue.toDate && typeof dateValue.toDate === 'function') {
        return dateValue.toDate().toISOString().slice(0, 10);
      }
      return 'Invalid Date';
    } catch (error) {
      console.warn('Error formatting date:', dateValue, error);
      return 'Invalid Date';
    }
  };

  const renderDayLocations = (loc: any) => {
    return (
      <LocationDisplay
        content={loc.locations && Array.isArray(loc.locations) ? loc.locations.map((l: any, i: number) => (
          <TouchableOpacity
            key={i}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'space-between', marginBottom: 10 }}
            onPress={() => handleLocationClick(l)}
            activeOpacity={0.7}
          >
            <View>
              <TText>{l.locationName} </TText>
              {l.address && (l.address.city || l.address.district || l.address.region) && (
                <TText style={{ opacity: .6, fontSize: 12 }}>
                  {[l.address.district, l.address.city, l.address.region].filter(Boolean).join(', ')}
                </TText>
              )}
              <TText style={{ opacity: .5 }}>{l.note ? `${l.note}` : ''}</TText>
            </View>
          </TouchableOpacity>
        )) : []}
      />
    );
  };

  const handleGetDirections = async (amenity: any) => {
    if (!amenity.latitude || !amenity.longitude || !amenity.name) {
      Alert.alert('Error', 'Unable to get directions to this location.');
      return;
    }

    const { latitude, longitude, name } = amenity;
    const encodedLabel = encodeURIComponent(name);

    try {
      let url = '';

      if (Platform.OS === 'ios') {
        // Apple Maps
        url = `maps://maps.apple.com/?q=${encodedLabel}&ll=${latitude},${longitude}`;
        await Linking.openURL(url);
      } else if (Platform.OS === 'web') {
        // Web: Open Google Maps in new tab
        url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
        window.open(url, '_blank');
      } else {
        // Android: Google Maps
        url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
        await Linking.openURL(url);
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open maps application.');
    }
  };


  const handleSearchLocation = async (location: Location) => {
    try {
      const searchQuery = encodeURIComponent(location.locationName);
      const googleSearchUrl = `https://www.google.com/search?q=${searchQuery}`;
      await Linking.openURL(googleSearchUrl);
    } catch (error) {
      Dialog.alert('Error', 'Unable to open search. Please try again.');
    }
  };

  const handleDeleteItinerary = () => {
    Dialog.confirm(
      'Delete Itinerary',
      'Are you sure you want to delete this itinerary?',
      {
        onConfirm: () => {
          if (id) {
            deleteItineraryMutation.delete(id, {
              onSuccess: async () => {
                await queryClient.invalidateQueries({ queryKey: ['user-itineraries'] });
                router.back();
              },
            });
          }
        },
        confirmText: 'Delete',
        destructive: true,
      }
    );
  };

  const showFirstOptions =
    itinerary && (itinerary.status === 'active');



  // Component to display weather for selected location
  const SelectedLocationWeather = ({ selectedLocation, secondaryColor }: any) => {
    const { data: weatherData, isLoading } = usePlaceWeather(
      selectedLocation.latitude,
      selectedLocation.longitude,
      selectedLocation.address?.city
    );

    if (isLoading || !weatherData) return null;

    return (
      <View style={styles.weatherInfoContainer}>
        <View style={styles.weatherInfo}>
          <TIcon name="thermometer" size={16} color="#B36B6B" />
          <TText style={{ color: '#fff', fontSize: 11, marginTop: 4 }}>
            {weatherData.temperature !== null ? `${Math.round(weatherData.temperature)}°C` : 'N/A'}
          </TText>
          <TText style={{ color: '#fff', fontSize: 9 }}>Heat</TText>
        </View>
        <View style={styles.weatherInfo}>
          <TIcon name="cloud" size={16} color="#5A7D9A" />
          <TText style={{ color: '#fff', fontSize: 11, marginTop: 4 }}>
            {weatherData.precipitation !== null ? `${weatherData.precipitation}mm` : 'N/A'}
          </TText>
          <TText style={{ color: '#fff', fontSize: 9 }}>Rain</TText>
        </View>
        <View style={styles.weatherInfo}>
          <TIcon name="water" size={16} color="#5A7D9A" />
          <TText style={{ color: '#fff', fontSize: 11, marginTop: 4 }}>
            {weatherData.humidity !== null ? `${Math.round(weatherData.humidity)}%` : 'N/A'}
          </TText>
          <TText style={{ color: '#fff', fontSize: 9 }}>Humid</TText>
        </View>
        <View style={styles.weatherInfo}>
          <TIcon name="fan" size={16} color="#5A7D9A" />
          <TText style={{ color: '#fff', fontSize: 11, marginTop: 4 }}>
            {weatherData.windSpeed !== null ? `${Math.round(weatherData.windSpeed)}km/h` : 'N/A'}
          </TText>
          <TText style={{ color: '#fff', fontSize: 9 }}>Wind</TText>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>

      {(!itinerary?.isPrivate || (itinerary?.user?.id === session?.user?.id)) && (<>
        <LinearGradient
          colors={['#000', 'transparent']}
          style={styles.headerGradient}
        >
          {(itinerary?.user && itinerary?.user.id === session?.user?.id) && (
            showFirstOptions ? (
              <OptionsPopup
                options={[
                  { label: 'Delete Itinerary', iconName: 'delete', onPress: handleDeleteItinerary },
                ]}
                style={styles.options}
              >
                <TIcon name="dots-vertical" size={20} color="#fff" />
              </OptionsPopup>
            ) : (
              <OptionsPopup
                options={[
                  { label: 'Delete Itinerary', iconName: 'delete', onPress: handleDeleteItinerary },
                ]}
                style={styles.options}
              >
                <TIcon name="dots-vertical" size={20} color="#fff" />
              </OptionsPopup>
            ))
          }

          <BackButton type="close" color="#fff" style={styles.backButton} />
          <View style={styles.headerRow}>
            <TText type='subtitle' style={{ color: '#fff' }}>
              {itinerary?.title}
            </TText>
            {itinerary?.isPrivate && (
              <TIcon name="lock" size={15} color='white' />
            )}
          </View>
          <TText style={{ color: '#fff' }}>
            {formatDateToString(itinerary?.startDate || "")} - {formatDateToString(itinerary?.endDate || "")}
          </TText>
          <TText style={{ color: '#fff7', fontSize: 11 }}>
            Created by {itinerary?.user?.username}
          </TText>



          <View style={styles.headerRow}>
            <View style={[styles.headerBubble, { backgroundColor: getStatusColor(itinerary?.status || 'active') }]}>
              <TText style={{ color: '#fff', fontSize: 11 }}>
                {itinerary?.status ? itinerary.status[0].toUpperCase() + itinerary.status.slice(1) : 'N/A'}
              </TText>
            </View>
            <View style={styles.headerBubble}>
              <TText style={{ color: '#fff', fontSize: 11 }}>
                {itinerary?.type || 'N/A'}
              </TText>
            </View>
          </View>
        </LinearGradient>
      </>)}


      {(!itinerary?.isPrivate || (itinerary?.user?.id === session?.user?.id)) && (
        <>
          {selectedLocation ? (
            <LinearGradient
              colors={['transparent', '#000']}
              style={styles.bottomGradient}
            >

              <TouchableOpacity onPress={() => setSelectedLocation(null)} style={styles.goBack}>
                <TIcon name="arrow-left" size={20} color="#fff" />
                <TText style={{ color: '#fff', fontSize: 11 }}>Back</TText>
              </TouchableOpacity>
              <TText type="subtitle" style={{ color: '#fff' }}>
                {selectedLocation.locationName}
              </TText>
              {selectedLocation.address && (selectedLocation.address.city || selectedLocation.address.district || selectedLocation.address.region || selectedLocation.address.country) && (
                <TText style={{ color: '#fff', opacity: 0.7, marginBottom: 8, fontSize: 12 }}>
                  {[selectedLocation.address.district, selectedLocation.address.city, selectedLocation.address.region, selectedLocation.address.country].filter(Boolean).join(', ')}
                </TText>
              )}

              <View style={styles.locationButtonsContainer}>
                <TouchableOpacity
                  style={[styles.locationButtons, { backgroundColor: is3DMode ? secondaryColor : '#0008' }]}
                  onPress={() => setIs3DMode(!is3DMode)}
                >
                  <TIcon name={is3DMode ? "cube-outline" : "square-outline"} size={20} color="#fff" />
                  <TText style={{ color: '#fff', fontSize: 11 }}>{is3DMode ? '3D' : '2D'}</TText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.locationButtons}
                  onPress={() => handleGetDirections(selectedLocation)
                  }>
                  <TIcon name="directions" size={20} color="#fff" />
                  <TText style={{ color: '#fff', fontSize: 11 }}>Get Directions</TText>
                </TouchableOpacity>

                <TouchableOpacity style={styles.locationButtons}
                  onPress={() => handleSearchLocation(selectedLocation)}>
                  <TIcon name="magnify" size={20} color="#fff" />
                  <TText style={{ color: '#fff', fontSize: 11 }}>Search</TText>
                </TouchableOpacity>

              </View>

              <SelectedLocationWeather selectedLocation={selectedLocation} secondaryColor={secondaryColor} />

              {selectedLocation.note && (
                <TText style={styles.locationNote}>
                  {selectedLocation.note}
                </TText>
              )}
            </LinearGradient>
          ) : (
            itinerary && (
              <TView style={styles.bottomSheet} color='primary'>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: '3%', paddingVertical: 20 }}>
                  <TText style={styles.description}>{itinerary.description}</TText>
                  {Array.isArray(itinerary.locations) && itinerary.locations.length > 0 && (
                    // Check if planDaily (has nested locations) or direct locations
                    (itinerary.locations[0] as any)?.locations ? (
                      // planDaily = true: locations have date and nested locations array
                      itinerary.locations.map((loc: any, idx: number) => (
                        <View key={idx}>
                          {loc.date && (
                            <>
                              <TText type='subtitle' style={{ fontSize: 15 }}>Day {idx + 1} </TText>
                              <TText style={{ marginBottom: 12, opacity: .5 }}>({formatMapDate(loc.date)})</TText>
                            </>
                          )}
                          {renderDayLocations(loc)}
                        </View>
                      ))
                    ) : (
                      // planDaily = false: locations are direct objects
                      <LocationDisplay
                        content={itinerary.locations.map((loc: any, i: number) => (
                          <TouchableOpacity
                            key={i}
                            style={{ flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'space-between', marginBottom: 10 }}
                            onPress={() => handleLocationClick(loc)}
                            activeOpacity={0.7}
                          >
                            <View>
                              <TText>{loc.locationName} </TText>
                              {loc.address && (loc.address.city || loc.address.district || loc.address.region) && (
                                <TText style={{ opacity: .6, fontSize: 12 }}>
                                  {[loc.address.district, loc.address.city, loc.address.region].filter(Boolean).join(', ')}
                                </TText>
                              )}
                              <TText style={{ opacity: .5 }}>{loc.note ? `${loc.note}` : ''}</TText>
                            </View>
                          </TouchableOpacity>
                        ))}
                      />
                    )
                  )}
                </ScrollView>

              </TView>
            )
          )}
        </>
      )}
      <ShareModal
        visible={showShare}
        link={itinerary ? `exp://tarag-v2.exp.app/itineraries/${itinerary.id}` : ''}
        onClose={() => setShowShare(false)}
      />

      {itinerary && itinerary.isPrivate && itinerary.user?.id !== session?.user?.id && (
        <View style={styles.privateOverlay}>
          <EmptyMessage
            iconName="lock"
            title="This itinerary is private"
            description="You do not have permission to view this itinerary."
            buttonLabel="Go Back"
            buttonAction={() => router.back()}
            isWhite
          />
        </View>
      )}

      {isLoading || error && (
        <View style={styles.privateOverlay}>
          <EmptyMessage
            iconName="lock"
            title={error ? "Failed to load itinerary" : "Loading itinerary..."}
            description={error ? "Please try again later." : "Please wait while we load the itinerary details."}
            buttonLabel="Go Back"
            buttonAction={() => router.back()}
            isWhite
            loading={isLoading}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  options: {
    position: 'absolute',
    top: 0,
    right: 30,
    zIndex: 10,
    padding: 8,
  },
  optionsChild: {
    flexDirection: 'row',
    gap: 10,
    flex: 1,
  },
  createGroupTrip: {
    flexDirection: 'row',
    height: 20,
    gap: 10,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: '3%',
    paddingBottom: 50,
    gap: 6,
    zIndex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 11,
    right: '3%',
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row',
    gap: 4,
  },
  headerBubble: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    backgroundColor: '#0004',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: '3%',
    justifyContent: 'flex-end',
  },
  goBack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#0008',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 10,
    opacity: .7
  },
  locationButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginVertical: 5,
    paddingBottom: 10,
  },
  locationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#0008',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
  },
  bottomSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '40%',
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  description: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc4',
    paddingBottom: 10,
    marginBottom: 10,
  },
  weatherInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 5,
  },
  weatherInfo: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#0005',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 8,
    gap: 2,
  },
  locationNote: {
    zIndex: 100,
    color: '#fff',
    backgroundColor: '#0005',
    padding: 10,
    borderRadius: 10,
    marginVertical: 10,
  },
  privateOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
    gap: 12,
  },
});