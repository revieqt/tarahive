import { useThemeColor } from '@/shared/hooks/useThemeColor';
import { TIcon } from '@/shared/components/ui/Themed';
import React, { useState, useEffect, useRef } from 'react';
import { Animated, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface PasswordFieldProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  isFocused?: boolean;
}

const PasswordField: React.FC<PasswordFieldProps> = ({
  placeholder,
  value,
  onChangeText,
  onFocus,
  onBlur,
  isFocused: isFocusedProp,
}) => {
  const backgroundColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const accentColor = useThemeColor({}, 'accent');
  const placeholderColor = useThemeColor({ light: '#aaa', dark: '#888' }, 'icon');
  const floatedLabelColor = useThemeColor({ light: '#888', dark: '#999' }, 'icon');

  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const focused = isFocusedProp !== undefined ? isFocusedProp : isFocused;

  const isFloated = focused || value.length > 0;

  const floatAnim = useRef(new Animated.Value(isFloated ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(floatAnim, {
      toValue: isFloated ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [isFloated]);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus && onFocus();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur && onBlur();
  };

  const labelTop = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [15, 8],
  });

  const labelFontSize = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [13, 9],
  });

  const labelColor = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [placeholderColor as string, floatedLabelColor as string],
  });

  return (
    <View
      style={[
        styles.inputWrapper,
        { backgroundColor },
        { borderColor: focused ? '#ccc' : '#ccc4', borderWidth: 1 },
      ]}
    >
      <Animated.Text
        style={[
          styles.floatingLabel,
          {
            top: labelTop,
            fontSize: labelFontSize,
            color: labelColor,
          },
        ]}
        numberOfLines={1}
        pointerEvents="none"
      >
        {placeholder}
      </Animated.Text>

      <TextInput
        secureTextEntry={!isPasswordVisible}
        style={[
          styles.input,
          {
            color: textColor,
            paddingTop: isFloated ? 12 : 0,
            paddingBottom: 0,
            textAlignVertical: 'center',
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder=""
        placeholderTextColor="transparent"
        onFocus={handleFocus}
        onBlur={handleBlur}
        underlineColorAndroid="transparent"
      />

      <TouchableOpacity
        style={styles.eyeButton}
        onPress={() => setPasswordVisible(!isPasswordVisible)}
      >
        <TIcon
          name='eye'
          size={18}
          color={isPasswordVisible ? accentColor : '#aaa'}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 0,
    borderRadius: 15,
    marginBottom: 8,
    borderWidth: 1,
    position: 'relative',
    minHeight: 48,
    height: 48,
  },
  floatingLabel: {
    position: 'absolute',
    left: 16,
    right: 16,
    fontFamily: 'Inter',
  },
  input: {
    flex: 1,
    fontSize: 13,
    backgroundColor: 'transparent',
    fontFamily: 'Inter',
  },
  eyeButton: {
    marginLeft: 10,
  },
});

export default PasswordField;