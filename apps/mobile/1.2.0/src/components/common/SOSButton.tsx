import React, { useEffect, useRef } from 'react';
import {
  View,
  Pressable,
  Animated,
  StyleSheet,
  Easing,
  StyleProp,
  ViewStyle,
} from 'react-native';
import {TIcon} from '../ui/Themed';

interface SOSButtonProps {
  onLongPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  style?: StyleProp<ViewStyle>;
  state?: 'active' | 'notActive';
  disabled?: boolean;
  children?: React.ReactNode;
}

export const SOS_HOLD_DURATION_MS = 2500;

const SOSButton: React.FC<SOSButtonProps> = ({
  onLongPress,
  onPressIn,
  onPressOut,
  style,
  state = 'notActive',
  disabled = false,
  children,
}) => {
  const pulse1 = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;
  const holdProgress = useRef(new Animated.Value(0)).current;

  const isActive = state === 'active';
  const targetColor = isActive ? 'white' : 'red';

  const handlePressIn = () => {
    Animated.timing(holdProgress, {
      toValue: 1,
      duration: SOS_HOLD_DURATION_MS,
      useNativeDriver: true,
      easing: Easing.linear,
    }).start();
    onPressIn?.();
  };

  const handlePressOut = () => {
    holdProgress.stopAnimation();
    Animated.timing(holdProgress, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();
    onPressOut?.();
  };

  useEffect(() => {
    const createPulse = (animatedValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease),
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.in(Easing.ease),
          }),
        ])
      );
    };

    createPulse(pulse1, 0).start();
    createPulse(pulse2, 500).start();
  }, [pulse1, pulse2]);

  const getAnimatedStyle = (animatedValue: Animated.Value) => ({
    ...styles.ring,
    borderColor: isActive ? 'red' : '#ccc',
    transform: [
      {
        scale: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.3],
        }),
      },
    ],
    opacity: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.4, 0],
    }),
  });

  return (
    <View style={[styles.container, style]}>
      <View style={styles.wrapper}>
        <Animated.View style={getAnimatedStyle(pulse1)} />
        <Animated.View style={getAnimatedStyle(pulse2)} />
        <Pressable
          style={[
            styles.button,
            { backgroundColor: isActive ? 'red' : 'white' },
          ]}
          onLongPress={onLongPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
        >
          <Animated.View
            pointerEvents="none"
            style={[
              styles.fill,
              {
                backgroundColor: targetColor,
                transform: [
                  {
                    scale: holdProgress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1.2],
                    }),
                  },
                ],
              },
            ]}
          />
          <TIcon name="exclamation-thick" size={70} color={isActive ? 'white' : '#ccc'}/>
          <Animated.View
            pointerEvents="none"
            style={[styles.iconOverlay, { opacity: holdProgress }]}
          >
            <TIcon name="exclamation-thick" size={70} color={targetColor} />
          </Animated.View>
        </Pressable>
      </View>
    </View>
  );
};

export default SOSButton;

const BUTTON_SIZE = 150;
const RING_SIZE = 170;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  wrapper: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ring: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 10,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    borderWidth: 10,
    borderColor: '#ccc4',
    overflow: 'hidden',
  },
  fill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BUTTON_SIZE / 2,
  },
  iconOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});