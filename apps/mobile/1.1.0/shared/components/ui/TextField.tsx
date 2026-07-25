import { useThemeColor } from '@/shared/hooks/useThemeColor';
import React, { useState, useEffect, useRef } from 'react';
import {
  Animated,
  NativeSyntheticEvent,
  StyleSheet,
  TextInput,
  TextInputContentSizeChangeEventData,
  TextInputProps,
  View,
  Text,
} from 'react-native';

interface TextFieldProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  isFocused?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  style?: any;
  onSubmitEditing?: TextInputProps['onSubmitEditing'];
  multiline?: boolean;
  numberOfLines?: number;
  onContentSizeChange?: (e: NativeSyntheticEvent<TextInputContentSizeChangeEventData>) => void;
}

const TextField: React.FC<TextFieldProps> = ({
  placeholder,
  value,
  onChangeText,
  onFocus,
  onBlur,
  isFocused: isFocusedProp,
  keyboardType = 'default',
  autoCapitalize = 'none',
  style,
  onSubmitEditing,
  multiline,
  numberOfLines,
  onContentSizeChange,
}) => {
  const backgroundColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({ light: '#aaa', dark: '#888' }, 'icon');
  const floatedLabelColor = useThemeColor({ light: '#888', dark: '#999' }, 'icon');

  const [isFocused, setIsFocused] = useState(false);
  const focused = isFocusedProp !== undefined ? isFocusedProp : isFocused;

  // True when the label should be in the "floated" (top) position
  const isFloated = focused || value.length > 0;

  // Animated value: 0 = resting (centered), 1 = floated (top)
  const floatAnim = useRef(new Animated.Value(isFloated ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(floatAnim, {
      toValue: isFloated ? 1 : 0,
      duration: 180,
      useNativeDriver: false, // layout props require JS driver
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

  // Interpolated styles for the floating label
  const labelTop = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 8],
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
        style,
      ]}
    >
      {/* Animated floating label */}
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
        value={value}
        onChangeText={onChangeText}
        style={[
          styles.input,
          {
            color: textColor,
            // Push text down when label is floated so they don't overlap
            paddingTop: isFloated ? 12 : 0,
            paddingBottom: 0,
            textAlignVertical: 'center',
          },
        ]}
        placeholder=""          // hide native placeholder — we render our own
        placeholderTextColor="transparent"
        onFocus={handleFocus}
        onBlur={handleBlur}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        underlineColorAndroid="transparent"
        onSubmitEditing={onSubmitEditing}
        multiline={multiline}
        numberOfLines={numberOfLines}
        onContentSizeChange={onContentSizeChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 16,
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
});

export default TextField;