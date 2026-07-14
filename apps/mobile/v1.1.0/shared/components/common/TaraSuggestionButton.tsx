import { useThemeColor } from '@/shared/hooks/useThemeColor';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    TouchableOpacity,
    Animated,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { useSession } from '@/features/auth/context/SessionContext';
import { TText } from '@/shared/components/ui/Themed';

const ActiveRouteSidebarButton: React.FC = () => {
    const primaryColor = useThemeColor({}, 'primary');
    const accentColor = useThemeColor({}, 'accent');
    const floatAnimation = useRef(new Animated.Value(0)).current;
    const fadeAnimation = useRef(new Animated.Value(0)).current;
    const slideAnimation = useRef(new Animated.Value(24)).current;
    const [isVisible, setIsVisible] = useState(true);
    const { session } = useSession();

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

        Animated.sequence([
            Animated.parallel([
                Animated.timing(fadeAnimation, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnimation, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]),
            Animated.delay(7000),
            Animated.parallel([
                Animated.timing(fadeAnimation, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnimation, {
                    toValue: 24,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]),
        ]).start(({ finished }) => {
            if (finished) {
                setIsVisible(false);
            }
        });
    }, [fadeAnimation, floatAnimation]);

    return (
        <View style={styles.container}>
            {isVisible ? (
                <Animated.View
                    pointerEvents="none"
                    style={[
                        styles.messageOverlay,
                        {
                            opacity: fadeAnimation,
                            backgroundColor: accentColor,
                            transform: [
                                {
                                    translateY: fadeAnimation.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [8, 0],
                                    }),
                                },
                                {
                                    translateX: slideAnimation.interpolate({
                                        inputRange: [0, 24],
                                        outputRange: [0, 24],
                                    }),
                                },
                            ],
                        },
                    ]}
                >
                    <TouchableOpacity style={{ flex: 1}} onPress={() => router.push('/suggestion')}>
                        <TText style={styles.messageText}>
                            Hello {session?.user?.fname}! I've got some suggestions for you. Click me!
                        </TText>
                    </TouchableOpacity>
                    
                </Animated.View>
            ) : null}
            <TouchableOpacity
                style={styles.wrapper}
                onPress={() => router.push('/suggestion')}
            >
                <Animated.Image
                    source={require('@/shared/assets/images/mascot-side.png')}
                    style={[
                        styles.taraImage,
                        {
                            backgroundColor: accentColor,
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
                                },
                                { scaleX: -1 },
                            ],
                        },
                    ]}
                />
            </TouchableOpacity>
        </View>
    );
};

export default ActiveRouteSidebarButton;

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    messageOverlay: {
        position: 'absolute',
        top: 0,
        left: Dimensions.get('window').width * -0.8,
        right: 10,
        height: 60,
        zIndex: 10,
        paddingVertical: 14,
        paddingLeft: 16,
        paddingRight: 55,
        backgroundColor: 'rgba(0, 0, 0, 0.72)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "rgba(120,120,120,0.6)",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.18,
        shadowRadius: 24,
        elevation: 10,
        borderRadius: 30,
    },
    messageText: {
        textAlign: 'center',
        opacity: .7,
        fontSize: 12,
    },
    wrapper: {
        width: 60,
        aspectRatio: 1,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
        overflow: 'hidden',
        zIndex: 10,
        shadowColor: "rgba(120,120,120,0.6)",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.18,
        shadowRadius: 24,
        elevation: 10,
    },
    taraImage: {
        position: 'absolute',
        bottom: -80,
        right: '-30%',
        width: '130%',
        height: 200,
        resizeMode: 'contain',
        opacity: 1,
        alignSelf: 'flex-end',
    },
});