// QRScan.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, Vibration } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import BackButton from '@/components/BackButton';
import { ThemedText } from '@/components/ThemedText';
import EmptyMessage from '@/components/EmptyMessage';
import { ThemedView } from '@/components/ThemedView';
import GradientBlobs from '@/components/GradientBlobs';
import Wave from '@/components/Wave';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function QRScan() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const accentColor = useThemeColor({}, 'accent');

  if (!permission) {
    return <View />;
  }
  if (!permission.granted) {
    return (
      <ThemedView style={styles.center}>
        <GradientBlobs/>
        <EmptyMessage title='You need Camera Access' description='Please grant camera permission to scan QR codes.'
          iconName='camera'
          buttonLabel='Grant Permission'
          buttonAction={requestPermission}
          isSolid
        />
      </ThemedView>
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
        <BackButton type='floating' color='white'/>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={handleScanned}
      />

      {/* Scan overlay */}
      <View style={styles.overlay}>
        <View style={styles.frame} />
        <ThemedText style={styles.text}>Align QR within frame</ThemedText>
        
      </View>

      <Wave style={{ position: 'absolute', bottom: 0, left: 0, right: 0, opacity: .7}} color={accentColor} height={70}/>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1},
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