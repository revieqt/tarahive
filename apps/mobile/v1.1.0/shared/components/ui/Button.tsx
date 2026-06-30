import { useThemeColor } from '@/shared/hooks/useThemeColor';
import React from 'react';
import { ActivityIndicator, StyleSheet, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import { TText } from '@/shared/components/ui/Themed';
import { LinearGradient } from 'expo-linear-gradient';

interface ButtonProps {
  title: string;
  onPress: () => void;
  buttonStyle?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
  type?: 'outline' | 'primary';
  disabled?: boolean;
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  buttonStyle,
  textStyle,
  type = 'outline',
  disabled = false,
  loading = false,
}) => {
  const outlineBgColor = useThemeColor({}, 'primary');
  const primaryBg1Color = useThemeColor({}, 'secondary');
  const primaryBg2Color = useThemeColor({}, 'accent');

  const isPrimary = type === 'primary';

  const buttonContent = isPrimary ? (
    <TText style={[styles.primaryText, textStyle]}>
      {loading ? <ActivityIndicator size="small" color="#fff" /> : title}
    </TText>
  ) : (
    <TText style={[styles.outlineText, textStyle]}>
      {loading ? <ActivityIndicator size="small" color="#000" /> : title}
    </TText>
  );

  if (isPrimary) {
    return (
      <LinearGradient
        colors={[primaryBg1Color, primaryBg2Color]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.outlineButton, buttonStyle, disabled ? { opacity: 0.5 } : null]}
      >
        <TouchableOpacity
          onPress={disabled || loading ? undefined : onPress}
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          disabled={disabled || loading}
        >
          {buttonContent}
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <TouchableOpacity
      onPress={disabled || loading ? undefined : onPress}
      style={[
        styles.outlineButton,
        {
          backgroundColor: isPrimary ? primaryBg1Color : outlineBgColor,
        },
        buttonStyle,
        disabled ? { opacity: 0.5 } : null,
      ]}
      disabled={disabled || loading}
    >
      {isPrimary ? (
        <TText style={[styles.primaryText, textStyle]}>
          {loading ? <ActivityIndicator size="small" color="#fff" /> : title}
        </TText>
      ) : (
        <TText style={[styles.outlineText, textStyle]}>
          {loading ? <ActivityIndicator size="small" color="#000" /> : title}
        </TText>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  outlineButton: {
    paddingVertical: 10,
    paddingHorizontal: 17,
    borderWidth: 1,
    borderColor: '#ccc4',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    overflow: 'hidden',
    height: 45,
    zIndex: 100,
  },
  outlineText: {
    opacity: 0.7,
    fontSize: 13,
    textAlign: 'center',
    fontFamily: 'Inter',
    letterSpacing: 1,
  },
  primaryText: {
    color: '#fff',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: 800,
    fontFamily: 'Inter',
    letterSpacing: 1,
  },
});

export default Button;