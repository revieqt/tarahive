import React, { useState, useRef } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { TText, TIcon, TView } from '@/shared/components/ui/Themed';
import SOSButton from "@/shared/components/common/SOSButton";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeColor } from "@/shared/hooks/useThemeColor";
import { useSession } from "@/features/auth/context/SessionContext";
import BackButton from "@/shared/components/common/BackButton";
import HiveBg from "@/shared/components/common/HiveBg";
import { router } from "expo-router";

export default function SOSSection() {
  const secondaryColor = useThemeColor({}, 'secondary');
  const accentColor = useThemeColor({}, 'accent');
  const { session, updateSession } = useSession();
  // const { handleEnableSOS, handleDisableSOS, isLoading } = useSafety();
  // const deviceInfo = useDeviceInfo();

  const [isSOSActive, setIsSOSActive] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);

  const gradientColors = isSOSActive
    ? (['#D53E0F', secondaryColor] as const)
    : ([accentColor, secondaryColor] as const);

  const handleLongPressStart = () => {
    setIsLongPressing(true);
    longPressTimer.current = setTimeout(() => {
      if (isSOSActive) {
        // Disable safety mode
        // handleDisableSafetyMode();
      } else {
        // Show form to enable safety mode
        router.push('/sos/form');
      }
      setIsLongPressing(false);
    }, 2000);
  };

  const handleLongPressEnd = () => {
    setIsLongPressing(false);
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  return (
    <TView style={{ flex: 1 }}>
      <BackButton type='floating' color='#fff' />
      <LinearGradient colors={gradientColors} style={styles.background}>
        <HiveBg flipHorizontal fade={false} />
        <HiveBg fade={false} />
      </LinearGradient>

      <View style={styles.container}>
        <View style={styles.titleContainer}>
          {isSOSActive ? (
            <>
              <TText type='title' style={{ color: '#fff' }}>SOS in Progress!</TText>
              <TText type='subtitle' style={{ color: '#fff' }}>SOS: On</TText>
            </>
          ) : (
            <>
              <TText type='title' style={{ color: '#fff' }}>All Clear!</TText>
              <TText type='subtitle' style={{ color: '#fff' }}>SOS: Off</TText>
            </>
          )}
        </View>

        <SOSButton
          state={isSOSActive ? 'active' : 'notActive'}
          onPressIn={handleLongPressStart}
          onPressOut={handleLongPressEnd}
          disabled={false}
        />

        <View style={styles.titleContainer}>
          <TText type='subtitle'>☝️</TText>
          {isLongPressing ? (
            <TText style={{ color: '#fff' }}>Hold for {isSOSActive ? 'deactivation' : 'activation'}...</TText>
          ) : isSOSActive ? (
            <TText style={{ color: '#fff' }}>Long-press to End SOS</TText>
          ) : (
            <TText style={{ color: '#fff' }}>Long-press to Activate SOS</TText>
          )}
        </View>
      </View>

      <TView style={styles.messageContainer}>
        <TText type="subtitle">What is SOS?</TText>
        <TText>
          SOS Type Here
        </TText>
        <View style={styles.messageButtons}>

          <TouchableOpacity style={[styles.openSettings, { backgroundColor: accentColor }]} onPress={() => router.push('/sos/settings')}>
            <TText style={{ color: '#fff' }}>Settings</TText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.openSettings}>
            <TText style={{ opacity: 0.5 }}>How SOS Works</TText>
          </TouchableOpacity>
        </View>
      </TView>
    </TView>

  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
  },
  messageContainer: {
    padding: 13,
    marginHorizontal: '3%',
    borderRadius: 12,
    marginBottom: 16,
    gap: 5,
  },
  openSettings: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#ccc7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  titleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
  },
  messageButtons: {
    flexDirection: 'row',
    gap: 5,
    marginTop: 5,
  },
});