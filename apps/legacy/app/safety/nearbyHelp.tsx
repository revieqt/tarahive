import { ThemedIcons } from '@/components/ThemedIcons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { BACKEND_URL } from '@/constants/Config';
import { useLocation } from '@/context/LocationContext';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View, Alert, Linking } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { router } from 'expo-router';
import WaveHeader from '@/components/WaveHeader';
import LoadingContainerAnimation from '@/components/LoadingContainerAnimation';
import EmptyMessage from '@/components/EmptyMessage';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function NearbyHelpSection() {
  const { latitude, longitude, loading: locationLoading } = useLocation();
  const [amenities, setAmenities] = useState<any[]>([]);
  const [amenityLoading, setAmenityLoading] = useState(false);
  const [amenityError, setAmenityError] = useState<string | null>(null);
  const [selectedAmenityType, setSelectedAmenityType] = useState<string | null>(null);
  const primaryColor = useThemeColor({}, 'primary');
  const backgroundColor = useThemeColor({}, 'background');

  const handleCallAmenity = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Error', 'Unable to open phone dialer');
    });
  };

  const handleGetDirections = (amenity: any) => {
    if (!amenity.latitude || !amenity.longitude || !amenity.name) {
      Alert.alert('Error', 'Unable to get directions to this location.');
      return;
    }
    
    router.push({
      pathname: '/routes/routes-create',
      params: {
        latitude: amenity.latitude.toString(),
        longitude: amenity.longitude.toString(),
        locationName: amenity.name
      }
    });
  };

  const fetchAmenities = async (amenityType: string) => {
    if (!latitude || !longitude) {
      setAmenityError('Location not available.');
      return;
    }
    setAmenityLoading(true);
    setAmenityError(null);
    setAmenities([]);
    
    try {
      let amenitiesToFetch: string[] = [];
      if (amenityType === 'hospital') {
        amenitiesToFetch = ['hospital', 'clinic', 'doctors'];
      } else if (amenityType === 'fire_station') {
        amenitiesToFetch = ['fire_station', 'rescue_station'];
      } else {
        amenitiesToFetch = [amenityType];
      }
      const amenityPromises = amenitiesToFetch.map(async (amenity) => {
        const requestBody = { 
          amenity: amenity, 
          latitude, 
          longitude 
        };
        const res = await fetch(`${BACKEND_URL}/api/safety/nearest`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Failed to fetch ${amenity}: ${res.status} ${errorText}`);
        }
        const data = await res.json();
        return data.map((item: any) => ({
          ...item,
          amenityType: amenity
        }));
      });
      const results = await Promise.all(amenityPromises);
      const allAmenities = results.flat();
      setAmenities(allAmenities);
    } catch (err: any) {
      setAmenityError('You might have network issues. Please try again');
    } finally {
      setAmenityLoading(false);
    }
  };

  const renderAmenityCard = (amenity: any, index: number) => (
    <View key={amenity.id || index} style={styles.amenityCard}>
      <MapView
        style={{width: '100%', height: 180}}
        initialRegion={{
        latitude: amenity.latitude,
        longitude: amenity.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
        }}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
      >
        <Marker
          coordinate={{latitude: amenity.latitude,longitude: amenity.longitude,}}
          title={amenity.name}
        />
      </MapView>

      <LinearGradient
        colors={['transparent', primaryColor, primaryColor]}
        style={styles.amenityDescription}
      >
        <ThemedText>{amenity.name}</ThemedText>
        {amenity.address && (
        <View style={styles.infoRow}>
          <ThemedIcons name="map-marker" size={16}/>
          <ThemedText numberOfLines={2}>
          {amenity.address}
          </ThemedText>
        </View>
        )}
        {amenity.phone && (
        <View style={styles.infoRow}>
          <ThemedIcons name="phone" size={16}/>
          <ThemedText>
          {amenity.phone}
          </ThemedText>
        </View>
        )}
        {amenity.website && (
        <View style={styles.infoRow}>
          <ThemedIcons name="language" size={16}/>
          <ThemedText numberOfLines={1}>
          {amenity.website}
          </ThemedText>
        </View>
        )}
        <View style={styles.amenityCardButtons}>
          {amenity.phone && (
            <TouchableOpacity 
              style={[styles.amenitiesButton, {backgroundColor}]}
              onPress={() => handleCallAmenity(amenity.phone)}
            >
              <ThemedIcons name='phone' size={15}/>
              <ThemedText style={{fontSize: 11}}>Call</ThemedText>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={[styles.amenitiesButton,{backgroundColor}]}
            onPress={() => handleGetDirections(amenity)}
          >
            <ThemedIcons name='directions' size={15}/>
            <ThemedText style={{fontSize: 11}}>Directions</ThemedText>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <ThemedView style={{flex:1}}>
      <ScrollView 
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <WaveHeader title='Nearby Help' subtitle='Find help in your area' iconName='alert-octagon'
         {...selectedAmenityType === 'hospital' && {iconName: 'hospital-box', color: 'red'}}
         {...selectedAmenityType === 'police' && {iconName: 'police-badge', color: 'blue'}}
         {...selectedAmenityType === 'fire_station' && {iconName: 'fire', color: 'orange'}}
        />
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.amenitiesButtonsContainer}
          contentContainerStyle={{paddingHorizontal: 16, gap: 7}}
        >
          {locationLoading ? (
            <>
              <ThemedView color='primary' style={styles.amenitiesButton}>
                <ActivityIndicator size={20}/>
                <ThemedText>Looking for the nearest amenity</ThemedText>
              </ThemedView>
            </>
          ) : (
            <>
              <TouchableOpacity 
                onPress={() => {
                  fetchAmenities('hospital');
                  setSelectedAmenityType('hospital');
                }}
                style={[
                  styles.amenitiesButton, 
                  selectedAmenityType === 'hospital' ? {backgroundColor: 'red'} : {backgroundColor: primaryColor}
                ]}
              >
                <ThemedIcons 
                  name='hospital-box' 
                  size={20}
                  color={selectedAmenityType === 'hospital' ? 'white' : undefined}
                />
                <ThemedText style={selectedAmenityType === 'hospital' ? {color: 'white'} : undefined}>
                  Medical
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => {
                  fetchAmenities('police');
                  setSelectedAmenityType('police');
                }}
                style={[
                  styles.amenitiesButton, 
                  selectedAmenityType === 'police' ? {backgroundColor: 'blue'} : {backgroundColor: primaryColor}
                ]}
              >
                <ThemedIcons 
                  name='police-badge' 
                  size={20}
                  color={selectedAmenityType === 'police' ? 'white' : undefined}
                />
                <ThemedText style={selectedAmenityType === 'police' ? {color: 'white'} : undefined}>
                  Police
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => {
                  fetchAmenities('fire_station');
                  setSelectedAmenityType('fire_station');
                }}
                style={[
                  styles.amenitiesButton, 
                  selectedAmenityType === 'fire_station' ? {backgroundColor: 'orange'} : {backgroundColor: primaryColor}
                ]}
              >
                <ThemedIcons 
                  name='fire' 
                  size={20}
                  color={selectedAmenityType === 'fire_station' ? 'white' : undefined}
                />
                <ThemedText style={selectedAmenityType === 'fire_station' ? {color: 'white'} : undefined}>
                  Fire Department
                </ThemedText>
              </TouchableOpacity>
              </>
            )}
        </ScrollView>
        {amenityLoading && (
          <ThemedView color='primary' shadow style={styles.loadingContainer}>
            <LoadingContainerAnimation/>
          </ThemedView>
        )}
        {amenityError && (
          <View style={styles.errorContainer}>
            <EmptyMessage title='Uh oh...' description={amenityError}
              iconName='emoticon-sad'
            />
          </View>
        )}
        {amenities.length > 0 && (
          <View>
            {amenities.map((amenity, index) => (
              <TouchableOpacity
                key={amenity.id || index}
                activeOpacity={0.8}
                onPress={() => setSelectedAmenityType(amenity.amenityType)}
              >
                {renderAmenityCard(amenity, index)}
              </TouchableOpacity>
            ))}
          </View>
        )}
        {selectedAmenityType===null && (
          <View style={styles.errorContainer}>
            <EmptyMessage title='Look for help' description='Please select an amenity'
              iconName='alert-circle'
            />
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  amenitiesButtonsContainer: {
    paddingTop: 5,
    paddingBottom: 10,
  },
  amenitiesButton: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
  },
  scrollContent: {
    paddingBottom: 200,
  },
  loadingContainer: {
    marginVertical: 7,
    height: 220,
    overflow: 'hidden',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  amenityCard: {
    marginVertical: 7,
    height: 220,
    overflow: 'hidden',
  },
  amenityDescription: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 10,
    paddingTop: 50,
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 5,
    gap: 8,
    opacity: 0.5,
  },
  amenityCardButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 7,
    marginTop: 5,
  }
});