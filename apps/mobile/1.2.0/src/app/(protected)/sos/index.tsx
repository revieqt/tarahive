import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  GestureResponderEvent,
} from "react-native";
import { TIcon, TText, TView } from '@/components/ui/Themed';
import SOSButton, { SOS_HOLD_DURATION_MS } from "@/components/common/SOSButton";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeColor } from "@/hooks/shared/useThemeColor";
import { useSession } from "@/context/SessionContext";
import BackButton from "@/components/common/BackButton";
import { useSafety } from "@/hooks/sos/useSOS";
import SOSInfoCard from "@/components/cards/SOSInfoCard";
import { useLanguage } from "@/context/LanguageContext";
import HiveBg from "@/components/common/HiveBg";
import { useLocation } from "@/context/LocationContext";
import { EMERGENCY_TYPES } from "@/types/sosTypes";

const ACTIVATION_COUNTDOWN_SECONDS = 7;
const PICKER_RADIUS = 112;
const PICKER_TARGET_RADIUS = 44;
const PICKER_BUTTON_SIZE = 62;
const CANCEL_ZONE_HEIGHT = 90;
const PICKER_TYPES = EMERGENCY_TYPES.filter((type) => type.id !== 'other');

export default function SOSSection() {
  const secondaryColor = useThemeColor({}, 'secondary');
  const accentColor = useThemeColor({}, 'accent');
  const { session } = useSession();
  const user = session?.user;
  const { handleEnableSOS, handleDisableSOS, isLoading } = useSafety();
  const { t } = useLanguage();
  const { latitude, longitude } = useLocation();
  const { width, height } = useWindowDimensions();
  const isSOSActive = user?.safetyState?.isInAnEmergency ?? false;
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const pickerActive = useRef(false);
  const [isPickingEmergency, setIsPickingEmergency] = useState(false);
  const [selectedEmergencyType, setSelectedEmergencyType] = useState<string | null>(null);
  const [isOverCancelZone, setIsOverCancelZone] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const gradientColors = isSOSActive
    ? (['#D53E0F', secondaryColor] as const)
    : ([accentColor, secondaryColor] as const);

  useEffect(() => () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    if (countdownTimer.current) {
      clearInterval(countdownTimer.current);
    }
  }, []);

  const getPickerTargets = () => {
    const centerX = width / 2;
    const centerY = height / 2;

    return PICKER_TYPES.map((type, index) => {
      const angle = -Math.PI / 2 + (index * 2 * Math.PI) / PICKER_TYPES.length;
      return {
        ...type,
        x: centerX + Math.cos(angle) * PICKER_RADIUS,
        y: centerY + Math.sin(angle) * PICKER_RADIUS,
      };
    });
  };
  const pickerTargets = getPickerTargets();

  const getEmergencyTypeAtPoint = (x: number, y: number) => {
    if (y >= height - CANCEL_ZONE_HEIGHT) {
      return null;
    }

    const centerX = width / 2;
    const centerY = height / 2;
    if (Math.hypot(x - centerX, y - centerY) <= PICKER_TARGET_RADIUS) {
      return 'other';
    }

    return getPickerTargets().find(
      (target) => Math.hypot(x - target.x, y - target.y) <= PICKER_TARGET_RADIUS,
    )?.id ?? null;
  };

  const updateSelection = (event: GestureResponderEvent) => {
    const { pageX, pageY } = event.nativeEvent;
    setIsOverCancelZone(pageY >= height - CANCEL_ZONE_HEIGHT);
    setSelectedEmergencyType(getEmergencyTypeAtPoint(pageX, pageY));
  };

  const beginActivationCountdown = (emergencyType: string) => {
    setCountdown(ACTIVATION_COUNTDOWN_SECONDS);
    let secondsRemaining = ACTIVATION_COUNTDOWN_SECONDS;

    countdownTimer.current = setInterval(() => {
      secondsRemaining -= 1;
      if (secondsRemaining === 0) {
        if (countdownTimer.current) {
          clearInterval(countdownTimer.current);
          countdownTimer.current = null;
        }
        setCountdown(null);
        void handleEnableSOS(
          { emergencyType, latitude, longitude },
          { navigateBack: false },
        );
        return;
      }
      setCountdown(secondsRemaining);
    }, 1000);
  };

  const cancelActivationCountdown = () => {
    if (countdownTimer.current) {
      clearInterval(countdownTimer.current);
      countdownTimer.current = null;
    }
    setCountdown(null);
  };

  const handleLongPressStart = () => {
    longPressTimer.current = setTimeout(() => {
      if (isSOSActive) {
        void handleDisableSOS();
      } else {
        pickerActive.current = true;
        setIsPickingEmergency(true);
      }
    }, SOS_HOLD_DURATION_MS);
  };

  const handleLongPressEnd = (event: GestureResponderEvent) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (!pickerActive.current) {
      return;
    }

    pickerActive.current = false;
    setIsPickingEmergency(false);
    setIsOverCancelZone(false);
    const { pageX, pageY } = event.nativeEvent;
    const emergencyType = getEmergencyTypeAtPoint(pageX, pageY);
    setSelectedEmergencyType(null);
    if (emergencyType) {
      beginActivationCountdown(emergencyType);
    }
  };

  return (
    <TView style={{ flex: 1 }}>
      <BackButton type='floating' color='#fff' />
      <LinearGradient colors={gradientColors} style={styles.background}/>

      <View style={styles.container}>
        {/* <View style={styles.titleContainer}>
          {isSOSActive ? (
            <>
              <TText type='title' style={{ color: '#fff' }}>{t('sos.main.on_title')}</TText>
              <TText type='subtitle' style={{ color: '#fff' }}>{t('sos.main.on_subtitle')}</TText>
            </>
          ) : (
            <>
              <TText type='title' style={{ color: '#fff' }}>{t('sos.main.off_title')}</TText>
              <TText type='subtitle' style={{ color: '#fff' }}>{t('sos.main.off_subtitle')}</TText>
            </>
          )}
        </View> */}

        <SOSButton
          state={isSOSActive ? 'active' : 'notActive'}
          onPressIn={handleLongPressStart}
          onPressMove={updateSelection}
          onPressOut={handleLongPressEnd}
          disabled={isLoading || countdown !== null}
        />
      </View>

      {isPickingEmergency && (
        <View pointerEvents="none" style={styles.pickerOverlay}>
          <View style={styles.pickerScrim} />
          <TText style={styles.pickerInstruction}>
            {t('sos.main.picker_instruction')}
          </TText>
          {pickerTargets.map((type) => (
            <View
              key={type.id}
              style={[
                styles.pickerOption,
                {
                  left: type.x - 50,
                  top: type.y - PICKER_BUTTON_SIZE / 2,
                },
              ]}
            >
              <View
                style={[
                  styles.pickerCircle,
                  {
                    backgroundColor: type.color,
                    transform: [{ scale: selectedEmergencyType === type.id ? 1.12 : 1 }],
                  },
                ]}
              >
                <TIcon name={type.icon} size={28} color="#fff" />
              </View>
              {selectedEmergencyType === type.id && (
                <TText numberOfLines={1} style={styles.pickerLabel}>
                  {t(type.labelKey)}
                </TText>
              )}
            </View>
          ))}
          <View
            style={[styles.otherOption, selectedEmergencyType === 'other' && styles.selectedOtherOption]}
          >
            <TText style={styles.otherText}>{t('sos.emergency_types.other')}</TText>
          </View>
          {isOverCancelZone && (
            <LinearGradient
              pointerEvents="none"
              colors={['rgba(213, 62, 15, 0)', '#D53E0F']}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.cancelZoneGradient}
            />
          )}
          <View pointerEvents="none" style={styles.cancelZoneLabel}>
            <TText style={styles.cancelZoneText}>
              {t('sos.main.release_to_cancel')}
            </TText>
          </View>
        </View>
      )}

      {countdown !== null && (
        <TouchableOpacity
          accessibilityRole="button"
          style={styles.cancelCountdown}
          onPress={cancelActivationCountdown}
        >
          <TText style={styles.cancelCountdownText}>
            {t('sos.main.cancel_countdown', { seconds: countdown })}
          </TText>
        </TouchableOpacity>
      )}

      {/* <TView style={styles.messageContainer}>
        { isSOSActive ? 
            <SOSInfoCard userData={session?.user}/>
          : 
          <View style={styles.offNote}>
            <TText>{t('sos.main.email')}: {user?.safetyState.emergencyContact?.email}</TText>
            <TText>{t('sos.main.number')}: {user?.safetyState.emergencyContact?.phone || "N/A"}</TText>

            <View style={styles.messageButtons}>
              <TouchableOpacity style={[styles.openSettings, { backgroundColor: accentColor }]} onPress={() => router.push('/sos/settings')}>
                <TText style={{ color: '#fff' }}>Settings</TText>
              </TouchableOpacity>

              <TouchableOpacity style={styles.openSettings}>
                <TText style={{ opacity: 0.5 }}>How SOS Works</TText>
              </TouchableOpacity>
            </View>
          </View>
        }
      </TView> */}

      <HiveBg fade={false} flipHorizontal flipVertical blur/>
      <HiveBg fade={false} blur color={secondaryColor}/>
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
    marginHorizontal: '3%',
    borderRadius: 15,
    marginBottom: '3%',
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
  offNote:{
    padding: 10,
    gap: 5
  },
  pickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0009',
  },
  pickerInstruction: {
    position: 'absolute',
    top: '12%',
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  pickerOption: {
    position: 'absolute',
    width: 100,
    height: 88,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  pickerCircle: {
    width: PICKER_BUTTON_SIZE,
    height: PICKER_BUTTON_SIZE,
    borderRadius: PICKER_BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  otherOption: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 80,
    marginLeft: -40,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -10 }],
  },
  selectedOtherOption: {
    transform: [{ translateY: -10 }, { scale: 1.08 }],
  },
  otherText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  pickerLabel: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
  },
  cancelZoneGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: CANCEL_ZONE_HEIGHT * 1.5,
  },
  cancelZoneLabel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: CANCEL_ZONE_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelZoneText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textShadowColor: '#8B0000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cancelCountdown: {
    position: 'absolute',
    zIndex: 1200,
    bottom: 36,
    alignSelf: 'center',
    backgroundColor: '#D53E0F',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
  },
  cancelCountdownText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});