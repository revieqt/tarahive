import React, { useEffect, useRef, useState } from "react";
import {Animated,Easing,Modal,Pressable,StyleSheet,Text,View} from "react-native";
import { useThemeColor } from "@/shared/hooks/useThemeColor";
import { TIcon, TText } from "./Themed";
import { LinearGradient } from "expo-linear-gradient";

export type AlertType = "default" | "plain-text" | "secure-text" | "login-password";

export interface AlertButton {
  text?: string;
  onPress?: (value?: string) => void;
  style?: "default" | "cancel" | "destructive";
  isPreferred?: boolean;
}

export interface AlertOptions {
  cancelable?: boolean;
  onDismiss?: () => void;
  icon?: "info" | "warning" | "error" | "success" | "question";
}

export interface DialogState {
  visible: boolean;
  title: string;
  message?: string;
  buttons: AlertButton[];
  options?: AlertOptions;
}

export const INITIAL_STATE: DialogState = {
  visible:  false,
  title:    "",
  message:  undefined,
  buttons:  [],
  options:  undefined,
};

interface DialogProps {
  state: DialogState;
  onDismiss: () => void;
}

const ICONS: Record<string, { name: string; color: string }> = {
  info:     { name: "information-variant-circle",  color: "#3B82F6" },
  warning:  { name: "exclamation-thick",  color: "#F59E0B" },
  error:    { name: "exclamation-thick",   color: "#EF4444" },
  success:  { name: "check-circle",   color: "#10B981" },
  question: { name: "help-circle",   color: "#8B5CF6" },
};

export const Dialog: React.FC<DialogProps> = ({ state, onDismiss }) => {
  const { visible, title, message, buttons, options } = state;
  const primaryColor = useThemeColor({}, 'primary');

  const scaleAnim  = useRef(new Animated.Value(0.88)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      setShow(true);
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          damping: 18,
          stiffness: 300,
          mass: 0.8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.92,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start(() => setShow(false));
    }
  }, [visible]);

  const handleBackdropPress = () => {
    if (options?.cancelable !== false) {
      options?.onDismiss?.();
      onDismiss();
    }
  };

  const handleButtonPress = (btn: AlertButton) => {
    btn.onPress?.();
    onDismiss();
  };

  if (!show) return null;

  const icon = options?.icon ? ICONS[options.icon] : null;
  const isHorizontal = buttons.length <= 2;

  return (
    <Modal
      transparent
      visible={show}
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleBackdropPress}
    >
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleBackdropPress} />
      </Animated.View>

      <View style={styles.centeredView} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.card,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
              backgroundColor: primaryColor
            },
          ]}
        >
          {icon && (
            <>
              <LinearGradient
                colors={[icon.color + "30", "transparent"]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.gradient}
              />
              <TIcon name={icon.name} size={40} style={styles.iconBadge} color={icon.color} />
            </>
          )}

          <TText type='subtitle' style={styles.title}>{title}</TText>

          {!!message && <TText style={styles.message}>{message}</TText>}

          <View style={styles.divider} />

          <View style={[styles.buttonRow, !isHorizontal && styles.buttonColumn]}>
            {buttons.map((btn, index) => {
              const btnStyle = btn.style ?? "default";
              const isCancel = btnStyle === "cancel";
              const isDestructive = btnStyle === "destructive";
              const isLast = index === buttons.length - 1;

              return (
                <React.Fragment key={index}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.button,
                      isHorizontal && styles.buttonHorizontal,
                      !isHorizontal && styles.buttonVertical,
                      pressed && styles.buttonPressed,
                    ]}
                    onPress={() => handleButtonPress(btn)}
                    android_ripple={{ color: "rgba(0,0,0,0.06)" }}
                  >
                    <TText
                      style={[
                        styles.buttonText,
                        isCancel && styles.buttonTextCancel,
                        isDestructive && styles.buttonTextDestructive,
                      ]}
                    >
                      {btn.text ?? "OK"}
                    </TText>
                  </Pressable>

                  {!isLast && (
                    <View
                      style={
                        isHorizontal ? styles.separatorVertical : styles.separatorHorizontal
                      }
                    />
                  )}
                </React.Fragment>
              );
            })}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    zIndex: -1,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  card: {
    width: "100%",
    borderRadius: 15,
    overflow: "hidden",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 32,
    elevation: 24,
  },
  iconBadge: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    marginBottom: 16,
  },
  title: {
    textAlign: "center",
    lineHeight: 23,
    marginBottom: 4,
    paddingHorizontal: 20,
  },
  message: {
    textAlign: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    opacity: 0.5,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#ccc4",
  },
  buttonRow: {
    flexDirection: "row",
  },
  buttonColumn: {
    flexDirection: "column",
  },
  button: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonHorizontal: {
    flex: 1,
  },
  buttonVertical: {
    width: "100%",
  },
  buttonPressed: {
    backgroundColor: "#ccc4",
  },
  separatorVertical: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: "#ccc4",
  },
  separatorHorizontal: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#ccc4",
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#007AFF",
  },
  buttonTextCancel: {
    color: "#8E8E93",
  },
  buttonTextDestructive: {
    color: "#FF3B30",
  },
});