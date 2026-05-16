import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import ThemedIcons from './ThemedIcons';

interface RoundedButtonProps {
  iconName: string;
  onPress: () => void;
  style?: ViewStyle | ViewStyle[];
  type?: 'outline' | 'primary';
  disabled?: boolean;
  loading?: boolean;
}

const RoundedButton: React.FC<RoundedButtonProps> = ({
  iconName,
  onPress,
  style,
  type = 'primary',
  disabled = false,
  loading = false,
}) => {
  const outlineBgColor = useThemeColor({}, 'primary');
  const primaryBgColor = useThemeColor({}, 'secondary');

  const isPrimary = type === 'primary';

  return (
    <TouchableOpacity
      onPress={disabled || loading ? undefined : onPress}
      style={[
        styles.outlineButton,
        {
          backgroundColor: isPrimary ? primaryBgColor : outlineBgColor,
        },
        style,
        disabled ? { opacity: 0.5 } : null,
      ]}
      disabled={disabled || loading}
    >
      {isPrimary ? (
        loading ? <ActivityIndicator size="small" color="#fff" /> : 
        <ThemedIcons name={iconName} size={25} color="#fff" />
      ) : (
        loading ? <ActivityIndicator size="small" color="#000" /> : 
        <ThemedIcons name={iconName} size={25} color={primaryBgColor} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  outlineButton: {
    borderWidth: 1,
    borderColor: '#ccc4',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    overflow: 'hidden',
    height: 60,
    aspectRatio: 1,
    zIndex: 10,
  },
});

export default RoundedButton;