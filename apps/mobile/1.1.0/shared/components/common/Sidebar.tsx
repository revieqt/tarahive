import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Image, Animated, Modal, Dimensions } from 'react-native';
import { TIcon, TView } from '@/shared/components/ui/Themed';
import { useSession } from '@/features/auth/context/SessionContext';
// import { useAlerts } from '@/context/AlertsContext';
// import ActiveRouteSidebarButton from './ActiveRouteSidebarButton';
// import SOSSidebarButton from './SOSSidebarButton';
import { router } from 'expo-router';
import TaraSuggestionButton from './TaraSuggestionButton';
import SOSSidebarButton from './SOSSidebarButton';

const SidebarAlerts: React.FC = () => {
    const [hideAlert, setHideAlert] = useState(false);
    const { session } = useSession();
    //   const { globalAlerts, localAlerts, getUnreadCount } = useAlerts();

    const containerOpacity = useRef(new Animated.Value(0)).current;
    const containerScale = useRef(new Animated.Value(0.8)).current;
    const contentSlide = useRef(new Animated.Value(-50)).current;
    const openContainerOpacity = useRef(new Animated.Value(0)).current;
    const openContainerScale = useRef(new Animated.Value(0.5)).current;
    const hideButtonScale = useRef(new Animated.Value(0)).current;
    const hideButtonOpacity = useRef(new Animated.Value(0)).current;

    // const allAlerts = globalAlerts.concat(localAlerts);
    // Handle animations when hideAlert state changes
    useEffect(() => {
        if (hideAlert) {
            // Animate container out and open container in
            Animated.parallel([
                Animated.timing(containerOpacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(containerScale, {
                    toValue: 0.8,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(contentSlide, {
                    toValue: -50,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(hideButtonScale, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(hideButtonOpacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(openContainerOpacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(openContainerScale, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            // Animate open container out and container in
            Animated.sequence([
                // First, hide the open container
                Animated.parallel([
                    Animated.timing(openContainerOpacity, {
                        toValue: 0,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                    Animated.timing(openContainerScale, {
                        toValue: 0.5,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                ]),
                // Then show the container and grow the hide button from the open container position
                Animated.parallel([
                    Animated.timing(containerOpacity, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(containerScale, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(contentSlide, {
                        toValue: 0,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                    // Hide button grows out from the open container position
                    Animated.timing(hideButtonScale, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                    Animated.timing(hideButtonOpacity, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                ]),
            ]).start();
        }
    }, [hideAlert]);

    // Initial animation when component mounts
    useEffect(() => {
        Animated.parallel([
            Animated.timing(containerOpacity, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(containerScale, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(contentSlide, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(hideButtonScale, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(hideButtonOpacity, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (<>

        <Animated.View
            style={[
                styles.openContainer,
                {
                    opacity: openContainerOpacity,
                    transform: [{ scale: openContainerScale }],
                }
            ]}
            pointerEvents={hideAlert ? 'auto' : 'none'}
        >
            <TView style={styles.openContainerInner} shadow color='primary'>
                {(session?.user?.safetyState?.isInAnEmergency) && <View style={styles.unreadBadge} />}
                <TouchableOpacity onPress={() => setHideAlert(false)}>
                    <TIcon name="apps" size={20} />
                </TouchableOpacity>
            </TView>
        </Animated.View>

        {/* Main Container (Visible State) */}
        <Animated.View
            style={[
                styles.container,
                {
                    opacity: containerOpacity,
                    transform: [{ scale: containerScale }],
                }
            ]}
            pointerEvents={hideAlert ? 'none' : 'auto'}
        >

            <Animated.View
                style={{
                    transform: [{ translateY: contentSlide }],
                }}
            >
                { session?.user?.safetyState?.isInAnEmergency && <SOSSidebarButton/> }
                <TaraSuggestionButton/>
            </Animated.View>

            <Animated.View
                style={{
                    transform: [
                        { translateY: contentSlide },
                        { scale: hideButtonScale }
                    ],
                    opacity: hideButtonOpacity,
                    alignSelf: 'center',
                }}
            >
                <TView style={styles.hideButton} shadow color='primary'>
                    <TouchableOpacity onPress={() => setHideAlert(true)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                        <TIcon name="chevron-down" size={25} />
                    </TouchableOpacity>
                </TView>
            </Animated.View>
        </Animated.View>
    </>

    );
};

const styles = StyleSheet.create({
    container: {
        pointerEvents: 'box-none',
        position: 'absolute',
        bottom: 5,
        right: 7,
        zIndex: 1000,
        width: 60,
        alignItems: 'flex-end',
        flexDirection: 'column-reverse',
        gap: 7,
    },
    openContainer: {
        position: 'absolute',
        bottom: 5,
        right: 8,
        zIndex: 1000,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30,
    },
    openContainerInner: {
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30,
    },
    alertButton: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'orange',
        borderWidth: 3,
        borderColor: 'white',
        overflow: 'hidden',
        paddingTop: 45,
        paddingLeft: 5,
    },
    hideButton: {
        width: '100%',
        padding: 4,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,.2)',
        opacity: .7,
    },
    unreadBadge: {
        position: 'absolute',
        top: 5,
        right: 5,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: 'red',
        borderWidth: 2,
        borderColor: 'white',
    },
    taraImage: {
        width: 50,
        height: 100,
        resizeMode: 'contain',
    },
});

export default SidebarAlerts;