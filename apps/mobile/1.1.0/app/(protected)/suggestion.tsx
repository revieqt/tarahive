import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { TView, TText } from "@/shared/components/ui/Themed";
import BackButton from "@/shared/components/common/BackButton";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeColor } from "@/shared/hooks/useThemeColor";
import HiveBg from "@/shared/components/common/HiveBg";

export default function SuggestionScreen() {
  const accentColor = useThemeColor({}, 'accent');
  const secondaryColor = useThemeColor({}, 'secondary');

  const floatAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startFloatingAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnimation, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnimation, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startFloatingAnimation();
  }, [floatAnimation]);
  return (
    <TView style={{ flex: 1 }}>
      <LinearGradient
        colors={[accentColor, secondaryColor]}
        style={styles.header}
      >
        <BackButton type="floating" color="white" />
        <HiveBg />
        <HiveBg flipHorizontal />
        <TText type='title'>
          Hello!
        </TText>

        <Animated.Image
          source={require('@/shared/assets/images/mascot-side.png')}
          style={[
            styles.taraImage,
            {
              transform: [
                {
                  translateY: floatAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -10],
                  }),
                },
                {
                  rotate: floatAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '-3deg'],
                  }),
                }, { scaleX: -1 }

              ],
            }
          ]}
        />

      </LinearGradient>
    </TView>
  );
}

const styles = StyleSheet.create({
  header: {
    zIndex: 10,
    minHeight: 200,
    paddingTop: 50,
    paddingHorizontal: '3%',
    overflow: 'hidden'
  },
  taraImage: {
    position: 'absolute',
    bottom: -80,
    right: '-30%',
    width: '80%',
    height: 150,
    resizeMode: 'contain',
    opacity: 1,
    alignSelf: 'flex-end',
  },
});