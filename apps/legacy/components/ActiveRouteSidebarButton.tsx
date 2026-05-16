import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { ThemedText } from './ThemedText';
import {
  View,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Easing,
} from 'react-native';
import ThemedIcons from './ThemedIcons';
import { useRoute } from '@/context/RouteContext';

const ActiveRouteSidebarButton: React.FC = () => {
    const { activeRoute} = useRoute();
  const borderAnim = useRef(new Animated.Value(0)).current;
  const formatDistance = (meters: number) => {
    return (meters / 1000).toFixed(2);
  };

  // Get icon based on route mode
  const getRouteIcon = (mode: string) => {
    switch (mode) {
      case 'driving-car':
        return 'car';
      case 'cycling-regular':
        return 'bike';
      case 'foot-walking':
        return 'walk';
      case 'foot-hiking':
        return 'hiking';
      default:
        return 'route';
    }
  };

  useEffect(() => {
    const loopAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(borderAnim, {
          toValue: 1,
          duration: 1000, // fade in
          useNativeDriver: false, // must be false for borderColor
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(borderAnim, {
          toValue: 0,
          duration: 1000, // fade out
          useNativeDriver: false,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    );
    loopAnimation.start();
    return () => loopAnimation.stop();
  }, [borderAnim]);

  const animatedBorderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#fff', '#00FFDE'],
  });

  return (
    <View style={styles.container}>
        <TouchableOpacity
        style={styles.wrapper}
        onPress={() => router.push('/(tabs)/maps')}
        >
        <Animated.View
            style={[
            styles.button,
            {
                borderColor: animatedBorderColor,
                backgroundColor: 'rgba(0, 202, 255, .8)',
            },
            ]}
        >
            <ThemedIcons 
            name={getRouteIcon(activeRoute?.mode || 'route')} 
            size={18} 
            color="white" 
            />
            <ThemedText style={{color: '#fff', fontSize: 9}}>
            {formatDistance(activeRoute?.distanceTravelled || 0)} km
            </ThemedText>
        </Animated.View>
        </TouchableOpacity>
    </View>
    
  );
};

export default ActiveRouteSidebarButton;


const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    marginBottom: 4,
  },
});