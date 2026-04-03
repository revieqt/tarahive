import { StyleSheet, View, TouchableOpacity, ScrollView} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import EmptyMessage from '@/components/EmptyMessage';
import { ThemedView } from '@/components/ThemedView';
import BackButton from '@/components/BackButton';
import Wave from '@/components/Wave';
import { useThemeColor } from '@/hooks/useThemeColor';
import OptionsPopup from '@/components/OptionsPopup';
import ThemedIcons from '@/components/ThemedIcons';
import { CustomAlert } from '@/components/Alert';
import { useInternetConnection } from '@/utils/checkInternetConnection';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useRoute } from '@/context/RouteContext';
import GradientBlobs from '@/components/GradientBlobs';
import RoundedButton from '@/components/RoundedButton';

export default function ExploreScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const buttonColor = useThemeColor({}, 'secondary');
  const isConnected = useInternetConnection();
  const [showNoInternetAlert, setShowNoInternetAlert] = useState(false);
  const router = useRouter();
  const { activeRoute } = useRoute();

  return (
    <>
      <ThemedView style={{flex: 1}}>
        <ScrollView contentContainerStyle={{flexGrow: 1}}>
          <OptionsPopup
            key="settings"
            style={styles.settingsButton}
            options={[
              <TouchableOpacity style={styles.settingsOption}>
                <ThemedIcons name='delete' size={18}/>
                <ThemedText style={{marginLeft: 10}}>Clear Route History</ThemedText>
              </TouchableOpacity>,
              !isConnected && <TouchableOpacity 
                style={styles.settingsOption}>
                <ThemedIcons name='information' size={18}/>
                <ThemedText style={{marginLeft: 10}}>Route Guide</ThemedText>
              </TouchableOpacity>
            ]}
          >
            <ThemedIcons name='dots-vertical' size={20} color='#fff'/>
          </OptionsPopup>
          <ThemedView color='secondary' style={styles.headerContainer}>
            <GradientBlobs/>
            <BackButton style={{padding: 16}} color='#fff'/>
            
            <View style={styles.activeRouteContainer}>
            {!activeRoute ? 
              <EmptyMessage
                iconName="map-search"
                title="No Active Route"
                description="Start a new route to begin tracking your journey." 
                isWhite
                isSolid
              />
              : (
              <View>
                {activeRoute?.location?.map((loc, index) => (
                  <View key={index}>
                    <ThemedText>
                      {loc.locationName}
                    </ThemedText>
                    <ThemedText style={{opacity: .7}}>
                      {index === 0 ? 'Start' : 
                      index === activeRoute!.location!.length - 1 ? 'Destination' : 
                      `Waypoint ${index}`}
                    </ThemedText>
                    
                  </View>
                ))}

                
                {activeRoute?.routeData && (
                  <View style={styles.routeSummary}>
                    <View style={styles.routeStats}>
                      <View style={styles.statItem}>
                        <ThemedIcons name="clock-time-three" size={20} color='#fff'/>
                          <ThemedText style={{marginTop: 5}}>Duration</ThemedText>
                          <ThemedText>
                            {Math.round(activeRoute!.routeData!.duration / 60)} min
                          </ThemedText>
                      </View>
                      
                      <View style={styles.statItem}>
                        <ThemedIcons name="chart-timeline-variant" size={20} color='#fff'/>
                          <ThemedText style={{marginTop: 5}}>Distance</ThemedText>
                          <ThemedText>
                            {(activeRoute!.routeData!.distance / 1000).toFixed(2)} km
                          </ThemedText>
                      </View>
                      
                      <View style={styles.statItem}>
                        <ThemedIcons name="elevation-rise" size={20} color='#fff'/>
                          <ThemedText style={{marginTop: 5}}>Elevation</ThemedText>
                          <ThemedText>
                            {activeRoute!.routeData!.geometry.coordinates.some(coord => coord[2] !== undefined) 
                              ? `${Math.round(Math.max(...activeRoute!.routeData!.geometry.coordinates.map(coord => coord[2] || 0)) - Math.min(...activeRoute!.routeData!.geometry.coordinates.map(coord => coord[2] || 0)))}m gain`
                              : 'N/A'
                            }
                          </ThemedText>
                      </View>
                    </View>
                  </View>
                )}
              
              </View>
            )}
            </View>
            <Wave color={backgroundColor}/>
          </ThemedView>
        </ScrollView>
      </ThemedView>
    

      <RoundedButton
       style={[styles.optionsButton, activeRoute ? {backgroundColor: buttonColor, opacity: .5} : {backgroundColor: buttonColor}]}
        onPress={() => router.push('/routes/routes-create')}
        iconName='play'
      />

      <CustomAlert
        visible={showNoInternetAlert}
        title="No Internet Connection"
        message="You need an internet connection to create routes. Please try again later."
        icon='alert'
        fadeAfter={3000}
        onClose={() => setShowNoInternetAlert(false)}
        buttons={[
          { text: 'OK', style: 'default', onPress: () => setShowNoInternetAlert(false) }
        ]}
      />
    </>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    overflow: 'hidden',
  },
  settingsButton: {
    position: 'absolute',
    top: 5,
    right: 0,
    padding: 16,
    zIndex: 10,
  },
  settingsOption: {
    flexDirection: 'row',
    alignItems: 'center',
    flex:1
  },
  activeRouteContainer: {
    marginHorizontal: 16,
  },
  optionsButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    width: 60,
    aspectRatio: 1,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  options: {
    width: '48%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 222,.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgb(0, 255, 222)',
    padding: 10
  },
  optionsDescription: {
    fontSize: 10,
    opacity: 0.7,
    textAlign: 'center',
  },
  routeSummary: {
    marginVertical: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#ccc4',
  },
  routeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    marginTop: 5,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
});
