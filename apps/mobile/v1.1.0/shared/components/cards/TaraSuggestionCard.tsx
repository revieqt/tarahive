import React, { useRef, useEffect } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";
import { useThemeColor } from "@/shared/hooks/useThemeColor";
import { TText, TIcon, TView } from "../ui/Themed";
import { useLanguage } from "@/shared/context/LanguageContext";
import HiveBg from "../common/HiveBg";

export default function TaraSuggestionCard() {
    const { t } = useLanguage();
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
        <TView style={styles.container} color="primary">
            <View style={styles.taraContainer}>
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
                                },{ scaleX: -1 }

                            ],
                        }
                    ]}
                />
            </View>
        </TView>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 15,
        padding: 16,
        overflow: "hidden",
        gap: 8,
        borderWidth: 1,
        borderColor: '#ccc4',
        justifyContent: "center",
        alignItems: "center",
        height: 150
    },
    taraContainer: {
        position: 'absolute',
        bottom: 16,
        right: 0,
        zIndex: 100,
        width: '100%',
        height: Dimensions.get('window').width * 0.45,
        overflow: 'visible',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
    },
    taraImage: {
        position: 'absolute',
        bottom: -80,
        right: '-10%',
        width: '47%',
        height: 250,
        resizeMode: 'contain',
        opacity: 1,
        alignSelf: 'flex-end',
    },
});