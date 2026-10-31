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
import { router } from "expo-router";
import Button from "@/components/ui/Button";
import EmergencyResourcesModal from "@/components/sos/EmergencyResourcesModal";
import EmergencyPicker, {
  EMERGENCY_PICKER_CANCEL_ZONE_HEIGHT,
  getEmergencyTypeAtPoint,
} from "@/components/sos/EmergencyPicker";
import SOSSuccessModal, { SOSSuccessType } from "@/components/sos/SOSSuccessModal";

const ACTIVATION_COUNTDOWN_SECONDS = 7;

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
  const [isAdviceOpen, setIsAdviceOpen] = useState(false);
  const [adviceEmergencyType, setAdviceEmergencyType] = useState<string | null>(null);
  const [successType, setSuccessType] = useState<SOSSuccessType | null>(null);

  const gradientColors = isSOSActive
    ? (['#D53E0F', secondaryColor] as const)
    : ([accentColor, secondaryColor] as const);

  const showAdvice = (emergencyType: string) => {
    setAdviceEmergencyType(emergencyType);
    setIsAdviceOpen(true);
  };

  useEffect(() => () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    if (countdownTimer.current) {
      clearInterval(countdownTimer.current);
    }
  }, []);

  const activateSOS = async (emergencyType: string) => {
    const response = await handleEnableSOS(
      { emergencyType, latitude, longitude },
      { navigateBack: false },
    );
    if (response?.success) {
      setSuccessType('activation');
      showAdvice(emergencyType);
    }
  };

  const deactivateSOS = async () => {
    const response = await handleDisableSOS();
    if (response?.success) {
      setSuccessType('deactivation');
    }
  };

  const updateSelection = (event: GestureResponderEvent) => {
    const { pageX, pageY } = event.nativeEvent;
    setIsOverCancelZone(pageY >= height - EMERGENCY_PICKER_CANCEL_ZONE_HEIGHT);
    setSelectedEmergencyType(getEmergencyTypeAtPoint(pageX, pageY, width, height));
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
        void activateSOS(emergencyType);
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
        void deactivateSOS();
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
    const emergencyType = getEmergencyTypeAtPoint(pageX, pageY, width, height);
    setSelectedEmergencyType(null);
    if (emergencyType) {
      beginActivationCountdown(emergencyType);
    }
  };

  return (
    <TView style={{ flex: 1 }}>
      <LinearGradient colors={gradientColors} style={styles.background}/>
      <BackButton color="white" type='floating'/>

      <View style={styles.container}>
        <View style={styles.titleContainer}>
          {isSOSActive ? (
            <>
              <TText type='title' style={{ color: '#fff' }}>{t('sos.main.on_title')}</TText>
              <TText style={{ color: '#fff' }}>
                {t(EMERGENCY_TYPES.find(
                  (type) => type.id === user?.safetyState?.emergencyType,
                )?.labelKey ?? "sos.emergency_types.other")}
                </TText>
            </>
          ) : (
            <>
              <TText type='title' style={{ color: '#fff' }}>{t('sos.main.off_title')}</TText>
              <TText style={{ color: '#fff' }}>{t('sos.main.off_subtitle')}</TText>
            </>
          )}
        </View>

        <SOSButton
          state={isSOSActive ? 'active' : 'notActive'}
          onPressIn={handleLongPressStart}
          onPressMove={updateSelection}
          onPressOut={handleLongPressEnd}
          disabled={isLoading || countdown !== null}
        />

        <View style={styles.titleContainer}>
          {isSOSActive ? (
            <>
              <TText style={{ color: '#fff9', textAlign: 'center', marginBottom: 10 }}>{t('sos.main.on_note')}</TText>
              <View style={styles.messageButtons}>
                <TouchableOpacity
                  style={[styles.openSettings, { backgroundColor: accentColor }]}
                  onPress={() => showAdvice(user?.safetyState?.emergencyType || "other")}
                >
                  <TText style={{ color: '#fff' }}>{t('sos.main.on_button')}</TText>
                </TouchableOpacity>

                <TouchableOpacity style={styles.openSettings}>
                  <TIcon name='help-circle' size={16} color='white'/>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <TText style={{ color: '#fff9', textAlign: 'center', marginBottom: 10 }}>{t('sos.main.off_note')}</TText>
              <View style={styles.messageButtons}>
                <TouchableOpacity style={[styles.openSettings, { backgroundColor: accentColor}]} onPress={() => router.push('/sos/settings')}>
                  <TText style={{ color: '#fff' }}>{t('sos.main.off_button')}</TText>
                </TouchableOpacity>

                <TouchableOpacity style={styles.openSettings}>
                  <TIcon name='help-circle' size={16} color='white'/>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>

      {isPickingEmergency && (
        <EmergencyPicker
          selectedEmergencyType={selectedEmergencyType}
          isOverCancelZone={isOverCancelZone}
        />
      )}

      {countdown !== null &&
        <Button
          title={t('sos.main.cancel_countdown', { seconds: countdown })}
          buttonStyle={styles.cancelCountdown}
          textStyle={{color: 'red'}}
          onPress={cancelActivationCountdown}
        />
      }

      <EmergencyResourcesModal
        visible={isAdviceOpen}
        emergencyType={adviceEmergencyType}
        onClose={() => setIsAdviceOpen(false)}
      />

      <SOSSuccessModal
        visible={successType !== null}
        type={successType ?? 'activation'}
        onFinish={() => setSuccessType(null)}
        title={t(successType === 'deactivation'
          ? 'sos.success.deactivation_title'
          : 'sos.success.activation_title')}
        subtitle={t(successType === 'deactivation'
          ? 'sos.success.deactivation_subtitle'
          : 'sos.success.activation_subtitle')}
      />

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
  header:{
    position: 'absolute',
    top: 0,
    right: 0, 
    left: 0,
    zIndex: 1000,
    flexDirection: 'row'
  },
  headerTitle:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerButtons:{
    width: 40,
    justifyContent: 'center',
    alignItems: 'center'
  }, 
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
    zIndex: 20
  },
  bottomSheetContainer: {
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    position: 'absolute',
    bottom: 0,
    left: 2,
    right: 2,
    zIndex: 10
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
    paddingHorizontal: '3%'
  },
  messageButtons: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 5,
    padding: 5,
    backgroundColor: '#fff5',
    borderColor: "#fff6",
    borderWidth: 1,
    borderRadius: 20
  },
  cancelCountdown: {
    position: 'absolute',
    zIndex: 1200,
    bottom: 16,
    left: '3%',
    right: '3%',
    backgroundColor: '#fff5',
    borderColor: "#fff6"
  },
});