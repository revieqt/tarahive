import { router } from 'expo-router';
import React from 'react';
import {
    Image,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';

const NotificationsButton: React.FC = () => {

    return (
        <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/notification')}
        >
            <Image
                source={require('../../../assets/images/notifications-icon.png')}
                style={styles.icon}
                resizeMode="contain"
            />
        </TouchableOpacity>
    );
};

export default NotificationsButton;


const styles = StyleSheet.create({
    button: {
        width: 55,
        aspectRatio: 1,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
        shadowColor: 'rgba(120,120,120,0.6)',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.18,
        shadowRadius: 24,
        elevation: 10,
        backgroundColor: '#F17C5B',
        overflow: 'hidden'
    },
    icon: {
        width: '140%',
        height: '140%',
        marginTop: 10,
        marginLeft: 10
    },
});