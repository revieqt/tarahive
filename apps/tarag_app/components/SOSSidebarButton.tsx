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
import { useSession } from '@/context/SessionContext';

const SOSSidebarButton: React.FC = () => {
    const { session } = useSession();
  const borderAnim = useRef(new Animated.Value(0)).current;

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
    outputRange: ['#FFDEB9', '#DC0000'],
  });

  return (
  <View style={styles.container}>
        <TouchableOpacity
        style={styles.wrapper}
        onPress={() => router.push('/safety/safety')}
        >
        <Animated.View
            style={[
            styles.button,
            {
                borderColor: animatedBorderColor,
                backgroundColor: 'rgba(255, 56, 56, .8)',
            },
            ]}
        >
            <ThemedIcons 
            name='alert-circle'
            size={18} 
            color="white" 
            />
            <ThemedText style={{color: '#fff', fontSize: 9}}>
            {session?.user?.safetyState?.emergencyType[0]?.toUpperCase()}
            {session?.user?.safetyState?.emergencyType?.slice(1)}
            </ThemedText>
        </Animated.View>
        </TouchableOpacity>
    </View>
  );
};

export default SOSSidebarButton;


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