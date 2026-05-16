import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import ThemedIcons from './ThemedIcons';

type AlertButton = {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

type AlertProps = {
  visible: boolean;
  title?: string;
  message?: string;
  icon?: string;
  buttons?: AlertButton[];
  fadeAfter?: number; // milliseconds
  onClose: () => void;
};

export const CustomAlert: React.FC<AlertProps> = ({
  visible,
  title,
  message,
  icon = 'alert-circle-outline',
  buttons = [{ text: 'OK' }],
  fadeAfter,
  onClose,
}) => {
  const slideAnim = useRef(new Animated.Value(-100)).current; // slide from top
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isShowing, setIsShowing] = useState(false);
  const backgroundColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');

  useEffect(() => {
    if (visible) {
      setIsShowing(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss after fadeAfter ms
      if (fadeAfter && fadeAfter > 0) {
        timerRef.current = setTimeout(() => {
          handleClose();
        }, fadeAfter);
      }
    } else {
      handleClose();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [visible, fadeAfter]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsShowing(false);
      onClose();
    });
  };

  if (!isShowing) return null;

  return (
    <Animated.View
      style={[
        styles.alertContainer,
        {
          opacity: opacity,
          transform: [{ translateY: slideAnim }],
          backgroundColor
        },
      ]}
    >
        <View style={styles.contentContainer}>
            <ThemedIcons
            name={icon}
            size={28}
            color="#007AFF"
            style={{ marginRight: 10 }}
            />
            <View style={{ flex: 1 }}>
            {title ? <Text style={[styles.title,{color: textColor}]}>{title}</Text> : null}
            {message ? <Text style={[styles.message,{color: textColor}]}>{message}</Text> : null}
            </View>
        </View>

        <View style={styles.buttonContainer}>
            {buttons.map((btn, index) => (
            <TouchableOpacity
                key={index}
                style={[
                styles.button,
                btn.style === 'cancel'
                    ? styles.cancelButton
                    : btn.style === 'destructive'
                    ? styles.destructiveButton
                    : styles.defaultButton,
                ]}
                onPress={() => {
                if (timerRef.current) clearTimeout(timerRef.current);
                handleClose();
                btn.onPress?.();
                }}
            >
                <Text
                style={[
                    styles.buttonText,
                    btn.style === 'destructive'
                    ? { color: '#fff' }
                    : btn.style === 'cancel'
                    ? { color: '#555' }
                    : {},
                ]}
                >
                {btn.text}
                </Text>
            </TouchableOpacity>
            ))}
        </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  alertContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    alignSelf: 'center',
    zIndex: 1000,
    elevation: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    color: '#111',
    fontFamily: 'PoppinsBold',
  },
  message: {
    fontFamily: 'Poppins',
    fontSize: 12,
    marginTop: 2,
    opacity: 0.7,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  button: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  defaultButton: {
    backgroundColor: '#E6F0FF',
  },
  cancelButton: {
    backgroundColor: '#EEE',
  },
  destructiveButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    fontFamily: 'Poppins',
    fontSize: 13,
    color: '#007AFF',

  },
});
