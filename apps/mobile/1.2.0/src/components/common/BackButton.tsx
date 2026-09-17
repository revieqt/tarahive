import { router } from 'expo-router';
import React from 'react';
import { StyleProp, TouchableOpacity, ViewStyle } from 'react-native';
import { TIcon } from '../ui/Themed';

interface BackButtonProps {
  style?: StyleProp<ViewStyle>;
  type?: 'default' | 'floating' | 'close' | 'close-floating';
  color?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ style, type = 'default', color }) => {
  const handlePress = () => {
    try {
      router.back();
    } catch {
      router.replace('/home');
    }
  };

  if (type === 'floating') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        style={[{ position: 'absolute', top: 16, left: 13, zIndex: 1000, padding: 8}, style]}
        activeOpacity={0.7}
      >
        <TIcon name="chevron-left" size={22} color={color}/>
      </TouchableOpacity>
    );
  }

  if (type === 'close') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        style={[{ padding: 8}, style]}
        activeOpacity={0.7}
      >
        <TIcon name="close" size={22} color={color}/>
      </TouchableOpacity>
    );
  }

  if (type === 'close-floating') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        style={[{ position: 'absolute', top: 16, right: 13, zIndex: 1000, padding: 8}, style]}
        activeOpacity={0.7}
      >
        <TIcon name="close" size={22} color={color}/>
      </TouchableOpacity>
    );
  }

  // default
  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[{ padding: 8,marginLeft: -8, backgroundColor: 'transparent' }, style]}
      activeOpacity={0.7}
    >
      <TIcon name="chevron-left" size={25} color={color} />
    </TouchableOpacity>
  );
};

export default BackButton;
