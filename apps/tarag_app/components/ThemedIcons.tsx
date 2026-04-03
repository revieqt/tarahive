import { useThemeColor } from '@/hooks/useThemeColor';
import { default as MaterialDesignIcons } from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';

type ThemedIconsProps = {
  name: any;
  color?: string;
  size: number;
  style?: object;
};

export const ThemedIcons: React.FC<ThemedIconsProps> = ({
  style,
  name,
  color,
  size,
}) => {
  const iconColor = useThemeColor(
    { light: undefined, dark: undefined },
    'icon'
  );

  return (
    <MaterialDesignIcons
      name={name}
      size={size}
      color={color ?? iconColor}
      style={style}
    />
  );
};

export default ThemedIcons;