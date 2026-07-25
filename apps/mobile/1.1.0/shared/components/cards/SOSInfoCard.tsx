import React, {useState} from 'react';
import { StyleSheet, TouchableOpacity, View, Platform, Linking, Alert } from 'react-native';
import { useThemeColor } from '@/shared/hooks/useThemeColor';
import { TIcon, TText, TView } from '../ui/Themed';
import { useLanguage } from '@/shared/context/LanguageContext';
import { EMERGENCY_TYPES } from '@/features/sos/types/emergencyTypes';
import { User } from '@/features/auth/context/SessionContext';
import OSMMapView from '../ui/OSMMapView';
import { LinearGradient } from 'expo-linear-gradient';

interface SOSInfoCardProps {
  userData?: User
}

const SOSInfoCard: React.FC<SOSInfoCardProps> = ({ userData }) => {
  const secondaryColor = useThemeColor({}, 'secondary');
  const accentColor = useThemeColor({}, 'accent');
  const [ viewMap, setViewMap ] = useState(false);

  const openInMaps = async (lat?: number, lon?: number, label?: string) => {
    if (typeof lat !== 'number' || typeof lon !== 'number') {
      Alert.alert('Location not available', 'No coordinates to open in maps');
      return;
    }

    try {
      let url = '';
      if (Platform.OS === 'ios') {
        url = `http://maps.apple.com/?ll=${lat},${lon}&q=${encodeURIComponent(label || 'Location')}`;
      } else if (Platform.OS === 'android') {
        url = `geo:${lat},${lon}?q=${lat},${lon}(${encodeURIComponent(label || 'Location')})`;
      } else {
        url = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
      }

      const supported = await Linking.canOpenURL(url);
      if (!supported && Platform.OS === 'android') {
        url = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
      }

      await Linking.openURL(url);
    } catch (err) {
      console.error('Failed to open maps:', err);
      Alert.alert('Unable to open maps');
    }
  };

  if (!userData || !userData.safetyState.isInAnEmergency) {
    return null;
  }

  const { t } = useLanguage();
  const emergencyTypeObj = EMERGENCY_TYPES.find(e => e.id === userData.safetyState?.emergencyType);

  return (
    <TView
      color='primary'
      style={[
        styles.container,
        {
          height: viewMap ? 350 : 90,
        },
      ]}
    >
      <View style={styles.infoContainer}>
        <TText>{userData.fname} {t('sos.main.info')} {t(emergencyTypeObj?.labelKey || 'sos.emergency_types.other')}</TText>
        <TText style={{opacity: .7, fontSize: 11}}>
          {userData.safetyState?.lastKnownLocation?.latitude} {userData.safetyState?.lastKnownLocation?.longitude}
        </TText>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={() => setViewMap(!viewMap)} style={[styles.button, {backgroundColor: accentColor}]}>
            <TText style={{color: '#fff'}}>View Location</TText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              openInMaps(
                userData.safetyState?.lastKnownLocation?.latitude,
                userData.safetyState?.lastKnownLocation?.longitude,
                `${userData.fname} ${userData.lname || ''}`.trim() || 'Location',
              )
            }
            style={styles.button}
          >
            <TText>Open on Maps</TText>
          </TouchableOpacity>
        </View>
          
        <LinearGradient
          colors={[accentColor + '70', 'transparent']}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 0 }}
          style={styles.gridCircle}
          pointerEvents="none"
        />

        <TIcon name={emergencyTypeObj?.icon || 'help-circle'} size={80} style={styles.icon} color={secondaryColor}/>
      </View>
      <View style={{ height: 265 }}>
        <OSMMapView 
          latitude={userData.safetyState?.lastKnownLocation?.latitude} 
          longitude={userData.safetyState?.lastKnownLocation?.longitude}
        />
      </View>
    </TView>
  );
};

const styles = StyleSheet.create({
  container:{
    width: '100%',
    height: 300,
    overflow: 'hidden',
    borderRadius: 15
  },
  infoContainer:{
    padding: 10,
    gap: 8, 
    width: '100%'
  },
  buttonContainer:{
    flexDirection: 'row',
    gap: 5
  },
  button:{
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#ccc5',
    borderRadius: 20
  },
  gridCircle: {
    height: '150%',
    aspectRatio: 1,
    borderRadius: 1000,
    position: 'absolute',
    bottom: '-50%',
    right: '-13%',
  },
  icon: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    opacity: .5,
    zIndex:10
  },
});

export default SOSInfoCard; 