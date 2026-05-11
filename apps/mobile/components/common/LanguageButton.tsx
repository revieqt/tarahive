import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { TIcon} from '@/components/ui/Themed';
import { router } from 'expo-router';

interface ButtonProps {
  style?: ViewStyle | ViewStyle[];
}

const LangButton: React.FC<ButtonProps> = ({style}) => {
  const bgColor = useThemeColor({}, 'primary');
  return (
    <TouchableOpacity
      onPress={() => router.push('/settings/language')}
      style={[
        styles.button,
        style,
        { backgroundColor: bgColor }
      ]}
    >
      <TIcon name="translate" size={20} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderRadius: 100,
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  }
});

export default LangButton;