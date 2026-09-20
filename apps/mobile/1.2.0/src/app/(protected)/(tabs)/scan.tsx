import React, { useState } from 'react';
import { View, StyleSheet, Vibration, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import BackButton from '@/components/common/BackButton';
import EmptyMessage from '@/components/common/EmptyMessage';
import { TView, TText, TIcon } from '@/components/ui/Themed';
import { useThemeColor } from '@/hooks/shared/useThemeColor';

export default function ScanScreen() {
    const router = useRouter();
    const [permission, requestPermission] = useCameraPermissions();
    const [option, setOption] = useState<'search' | 'qr' | 'translate'>('qr');
    const [scanned, setScanned] = useState(false);
    const accentColor = useThemeColor({}, 'accent');

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
            <TView style={styles.options}>
                <TouchableOpacity 
                    style={[styles.tabs, option === 'search' && {backgroundColor: accentColor + '70', borderRadius: 20}]}
                    onPress={() => setOption('search')}
                >
                    <TIcon name='magnify' size={12} style={{ marginRight: 5 }} />
                    <TText style={styles.tabText}>Search</TText>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.tabs, option === 'qr' && {backgroundColor: accentColor + '70', borderRadius: 20}]}
                    onPress={() => setOption('qr')}
                >
                    <TIcon name='qrcode' size={12} style={{ marginRight: 5 }} />
                    <TText style={styles.tabText}>QR</TText>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.tabs, option === 'translate' && {backgroundColor: accentColor + '70', borderRadius: 20}]}
                    onPress={() => setOption('translate')}
                >
                    <TIcon name='translate' size={12} style={{ marginRight: 5 }} />
                    <TText style={styles.tabText}>Translate</TText>
                </TouchableOpacity>
            </TView>
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
    options:{
        position: 'absolute',
        top: 20,
        left: 16,
        right: 16,
        zIndex: 10,
        flexDirection: 'row',
        borderRadius: 20,
    },
    tabs:{
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
    },
    tabText:{
        fontSize: 12,
    },
});