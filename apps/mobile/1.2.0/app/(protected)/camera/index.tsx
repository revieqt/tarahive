import React, { useState } from 'react';
import { View, StyleSheet, Vibration } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import BackButton from '@/shared/components/common/BackButton';
import EmptyMessage from '@/shared/components/common/EmptyMessage';
import { TView, TText } from '@/shared/components/ui/Themed';

export default function QRScan() {
    const router = useRouter();
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);

    if (!permission) {
        return <View />;
    }
    if (!permission.granted) {
        return (
            <TView style={styles.center}>
                <EmptyMessage title='You need Camera Access' description='Please grant camera permission to scan QR codes.'
                    iconName='camera'
                    buttonLabel='Grant Permission'
                    buttonAction={requestPermission}
                    isSolid
                />
            </TView>
        );
    }

    const handleScanned = (barcode: any) => {
        if (scanned) return;
        setScanned(true);

        Vibration.vibrate(200);
        let data = barcode?.data || barcode?.value || '';
        if (data && data.includes('exp://tarag-v2.exp.app/')) {
            const url = data.replace('exp://tarag-v2.exp.app/', '/');
            router.push(url);
        } else {
            console.log('QR format not recognized');
        }
        setTimeout(() => setScanned(false), 3000);
    };

    return (
        <View style={styles.container}>
            <BackButton type='floating' color='white' />
            <CameraView
                style={StyleSheet.absoluteFillObject}
                facing="back"
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                onBarcodeScanned={handleScanned}
            />

            <View style={styles.overlay}>
                <View style={styles.frame} />
                <TText style={styles.text}>Align QR within frame</TText>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    frame: {
        width: 250,
        height: 250,
        borderWidth: 3,
        borderColor: 'white',
        borderRadius: 12,
    },
    text: {
        color: 'white',
        marginTop: 16,
        fontSize: 16,
    },
});