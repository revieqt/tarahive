import React, { useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { TIcon, TText } from './Themed';

export type SpeedDialAction = {
  key: string;
  label: string;
  icon: string;
  onPress: () => void;
  accessibilityLabel?: string;
  disabled?: boolean;
};

type SpeedDialProps = {
  actions: SpeedDialAction[];
  icon: string;
  closeIcon?: string;
  fabColor?: string;
  iconColor?: string;
  actionColor?: string;
  actionIconColor?: string;
  labelColor?: string;
  labelBackgroundColor?: string;
  size?: number;
  actionSize?: number;
  spacing?: number;
  style?: ViewStyle;
  onOpen?: () => void;
  onClose?: () => void;
};

export default function SpeedDial({
  actions,
  icon,
  closeIcon = 'chevron-down',
  fabColor = '#FF6B6B',
  iconColor = '#FFFFFF',
  actionColor = '#FFFFFF',
  actionIconColor = '#FF6B6B',
  size = 55,
  actionSize = 40,
  spacing = 8,
  style,
  onOpen,
  onClose,
}: SpeedDialProps) {
  const [isOpen, setIsOpen] = useState(false);

  const animations = useRef<Animated.Value[]>([]);

  if (animations.current.length !== actions.length) {
    animations.current = actions.map(
      (_, index) =>
        animations.current[index] ?? new Animated.Value(0),
    );
  }

  const toggle = () => {
    const nextOpen = !isOpen;

    setIsOpen(nextOpen);

    if (nextOpen) {
      onOpen?.();

      Animated.stagger(
        45,
        animations.current.map((animation) =>
          Animated.spring(animation, {
            toValue: 1,
            useNativeDriver: true,
            speed: 18,
            bounciness: 7,
          }),
        ),
      ).start();
    } else {
      onClose?.();

      Animated.stagger(
        35,
        [...animations.current].reverse().map((animation) =>
          Animated.timing(animation, {
            toValue: 0,
            duration: 120,
            useNativeDriver: true,
          }),
        ),
      ).start();
    }
  };

  const handleActionPress = (action: SpeedDialAction) => {
    if (action.disabled) return;

    toggle();
    action.onPress();
  };

  return (
    <View
      style={[styles.container, style]}
      pointerEvents="box-none"
    >
      {actions.map((action, index) => {
        const animation = animations.current[index];

        return (
          <Animated.View
            key={action.key}
            pointerEvents={isOpen ? 'auto' : 'none'}
            style={[
              styles.actionRow,
              {
                marginBottom: spacing,
                marginRight: (size - actionSize) / 2,
              },
              {
                opacity: animation,
                transform: [
                  {
                    translateY: animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [16, 0],
                    }),
                  },
                  {
                    scale: animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.65, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <View
              style={styles.label}
            >
              <TText numberOfLines={1}>
                {action.label}
              </TText>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                action.accessibilityLabel ?? action.label
              }
              accessibilityState={{
                disabled: !!action.disabled,
              }}
              disabled={action.disabled}
              onPress={() => handleActionPress(action)}
              style={({ pressed }) => [
                styles.actionButton,
                {
                  width: actionSize,
                  height: actionSize,
                  borderRadius: actionSize / 2,
                  backgroundColor: actionColor,
                },
                pressed && styles.pressed,
                action.disabled && styles.disabled,
              ]}
            >
              <TIcon
                name={action.icon}
                size={20}
                color={actionIconColor}
              />
            </Pressable>
          </Animated.View>
        );
      })}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          isOpen ? 'Close actions' : 'Open actions'
        }
        accessibilityState={{ expanded: isOpen }}
        onPress={toggle}
        style={({ pressed }) => [
          styles.fab,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: fabColor,
          },
          pressed && styles.pressed,
        ]}
      >
        <Animated.View
          style={{
            transform: [
              {
                rotate: isOpen && !closeIcon ? '45deg' : '0deg',
              },
            ],
          }}
        >
          <TIcon
            name={isOpen && closeIcon ? closeIcon : icon}
            size={25}
            color={iconColor}
          />
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
    alignSelf: 'flex-end',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  fab: {
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  label: {
    paddingVertical: 7,
    borderRadius: 8,
    elevation: 2,
  },
  pressed: {
    opacity: 0.75,
  },
  disabled: {
    opacity: 0.45,
  },
});