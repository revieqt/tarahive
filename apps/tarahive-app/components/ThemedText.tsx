import { useThemeColor } from '@/hooks/useThemeColor';
import { Text, type TextProps } from 'react-native';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'subtitle' ;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? {
          fontFamily: 'Poppins',
          fontSize: 13,
          fontWeight: '500',
        } : undefined,
        type === 'title' ? {
          fontFamily: 'PoppinsBold',
          fontSize: 22,
          lineHeight: 38,
        }: undefined,
        type === 'subtitle' ? {
          fontFamily: 'PoppinsBold',
          fontSize: 16,
        } : undefined,
        style,
      ]}
      {...rest}
    />
  );
}