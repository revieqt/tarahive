import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedIcons } from '@/components/ThemedIcons';
import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

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

  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const focused = isFocusedProp !== undefined ? isFocusedProp : isFocused;

  const handleFocus = () => {
    setIsFocused(true);
    onFocus && onFocus();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur && onBlur();
  };

  return (
    <View
      style={[
        styles.inputWrapper,
        { backgroundColor },
        { borderColor: focused ? '#ccc' : '#ccc4', borderWidth: 1 },
      ]}
    >
      <TextInput
        secureTextEntry={!isPasswordVisible}
        style={[
          styles.input,
          { color: textColor, textAlignVertical: 'center', paddingTop: 0, paddingBottom: 0 },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={useThemeColor({ light: '#aaa', dark: '#888' }, 'icon')}
        onFocus={handleFocus}
        onBlur={handleBlur}
        underlineColorAndroid="transparent"
      />
      <TouchableOpacity
        style={styles.eyeButton}
        onPress={() => setPasswordVisible(!isPasswordVisible)}
      >
        <ThemedIcons
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
    marginBottom: 15,
    borderWidth: 1,
    position: 'relative',
    minHeight: 48,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 13,
    backgroundColor: 'transparent',
    fontFamily: 'Poppins',
  },
  eyeButton: {
    marginLeft: 10,
  },
});

export default PasswordField;