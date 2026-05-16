import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { useThemeColor } from '@/hooks/useThemeColor';

interface PointMarkerProps {
  coordinate: {
    latitude: number;
    longitude: number;
  };
  color?: string;
  title?: string;
  description?: string;
  identifier?: string;
  onPress?: () => void;
}

const PointMarker: React.FC<PointMarkerProps> = ({
  coordinate,
  color,
  title,
  description,
  identifier,
  onPress,
}) => {
  const secondaryColor = useThemeColor({}, 'secondary');
  
  const markerColor = color || secondaryColor || '#FF6B6B';
  return (
    <Marker
      coordinate={coordinate}
      title={title}
      description={description}
      identifier={identifier}
      anchor={{ x: 0.5, y: 0.5 }}
      onPress={onPress}
    >
      <View style={[styles.dotMarker, { backgroundColor: markerColor }]} />
    </Marker>
  );
};

export default PointMarker;

const styles = StyleSheet.create({
  dotMarker: {
    width: 14,
    height: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  },
});