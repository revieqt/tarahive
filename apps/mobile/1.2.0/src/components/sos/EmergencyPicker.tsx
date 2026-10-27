import React from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { TIcon, TText } from "@/components/ui/Themed";
import { useLanguage } from "@/context/LanguageContext";
import { EMERGENCY_TYPES } from "@/types/sosTypes";

const PICKER_RADIUS = 112;
const PICKER_TARGET_RADIUS = 44;
const PICKER_BUTTON_SIZE = 55;
export const EMERGENCY_PICKER_CANCEL_ZONE_HEIGHT = 90;
const PICKER_TYPES = EMERGENCY_TYPES.filter((type) => type.id !== "other");

type EmergencyPickerProps = {
  selectedEmergencyType: string | null;
  isOverCancelZone: boolean;
};

const getPickerTargets = (width: number, height: number) => {
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

export const getEmergencyTypeAtPoint = (
  x: number,
  y: number,
  width: number,
  height: number,
): string | null => {
  if (y >= height - EMERGENCY_PICKER_CANCEL_ZONE_HEIGHT) {
    return null;
  }

  const centerX = width / 2;
  const centerY = height / 2;
  if (Math.hypot(x - centerX, y - centerY) <= PICKER_TARGET_RADIUS) {
    return "other";
  }

  return getPickerTargets(width, height).find(
    (target) => Math.hypot(x - target.x, y - target.y) <= PICKER_TARGET_RADIUS,
  )?.id ?? null;
};

export default function EmergencyPicker({
  selectedEmergencyType,
  isOverCancelZone,
}: EmergencyPickerProps) {
  const { width, height } = useWindowDimensions();
  const { t } = useLanguage();

  return (
    <View pointerEvents="none" style={styles.pickerOverlay}>
      <View style={styles.pickerScrim} />
      <TText style={styles.pickerInstruction}>
        {t("sos.main.picker_instruction")}
      </TText>
      {getPickerTargets(width, height).map((type) => (
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
        style={[
          styles.otherOption,
          selectedEmergencyType === "other" && styles.selectedOtherOption,
        ]}
      >
        <TText style={styles.otherText}>{t("sos.emergency_types.other")}</TText>
      </View>
      {isOverCancelZone && (
        <LinearGradient
          pointerEvents="none"
          colors={["rgba(213, 62, 15, 0)", "#D53E0F"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.cancelZoneGradient}
        />
      )}
      <View pointerEvents="none" style={styles.cancelZoneLabel}>
        <TText style={styles.cancelZoneText}>
          {t("sos.main.release_to_cancel")}
        </TText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1100,
    alignItems: "center",
    justifyContent: "center",
  },
  pickerScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0009",
  },
  pickerInstruction: {
    position: "absolute",
    top: "12%",
    color: "#fff",
    textAlign: "center",
  },
  pickerOption: {
    position: "absolute",
    width: 100,
    height: 88,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  pickerCircle: {
    width: PICKER_BUTTON_SIZE,
    height: PICKER_BUTTON_SIZE,
    borderRadius: PICKER_BUTTON_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  otherOption: {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: 80,
    marginLeft: -40,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ translateY: -10 }],
  },
  selectedOtherOption: {
    transform: [{ translateY: -10 }, { scale: 1.08 }],
  },
  otherText: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
  },
  pickerLabel: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 4,
  },
  cancelZoneGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: EMERGENCY_PICKER_CANCEL_ZONE_HEIGHT * 1.5,
  },
  cancelZoneLabel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: EMERGENCY_PICKER_CANCEL_ZONE_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelZoneText: {
    color: "#fff",
    textShadowColor: "#8B0000",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
