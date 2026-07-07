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
    const floatAnimation = useRef(new Animated.Value(0)).current;
    const fadeAnimation = useRef(new Animated.Value(0)).current;
    const slideAnimation = useRef(new Animated.Value(24)).current;
    const [isVisible, setIsVisible] = useState(true);
    const [displayedText, setDisplayedText] = useState('');
    const [isTypingComplete, setIsTypingComplete] = useState(false);
    const { session } = useSession();
    const fullMessage = `Hello ${session?.user?.fname ?? 'there'}! I've got some suggestions for you. Click me!`;

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

        let currentIndex = 0;
        const typingInterval = setInterval(() => {
            setDisplayedText(fullMessage.slice(0, currentIndex + 1));
            currentIndex += 1;

            if (currentIndex >= fullMessage.length) {
                setIsTypingComplete(true);
                clearInterval(typingInterval);
            }
        }, 45);

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
            Animated.delay(5000),
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

        return () => {
            clearInterval(typingInterval);
        };
    }, [fadeAnimation, floatAnimation, fullMessage]);

    return (
        <View style={styles.container}>
            {isVisible ? (
                <Animated.View
                    pointerEvents="none"
                    style={[
                        styles.messageOverlay,
                        {
                            opacity: fadeAnimation,
                            backgroundColor: primaryColor,
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
                    <TText style={styles.messageText}>
                        {displayedText}
                        {!isTypingComplete ? '|' : ''}
                    </TText>
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
        left: Dimensions.get('window').width * -0.8, // 5% from the left
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
        borderColor: 'rgba(255,255,255,0.18)',
        borderWidth: 1,
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
        borderWidth: 5,
        marginBottom: 4,
        overflow: 'hidden',
        borderColor: 'white',
        backgroundColor: 'orange',
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