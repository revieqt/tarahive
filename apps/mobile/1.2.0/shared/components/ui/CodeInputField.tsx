import { useThemeColor } from '@/shared/hooks/useThemeColor';
import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardTypeOptions,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';

interface CodeInputFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  characters: number;
  type?: 'numeric' | 'alphanumeric';
  style?: ViewStyle;
  autoFocus?: boolean;
}

const CodeInputField: React.FC<CodeInputFieldProps> = ({
  value,
  onChangeText,
  characters,
  type = 'numeric',
  style,
  autoFocus = false,
}) => {
  const inputRef = useRef<TextInput>(null);

  const backgroundColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor(
    { light: '#aaa', dark: '#888' },
    'icon'
  );

  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [autoFocus]);

  const handleChange = (text: string) => {
    let formatted = text;

    if (type === 'numeric') {
      formatted = text.replace(/[^0-9]/g, '');
    } else {
      formatted = text.replace(/[^a-zA-Z0-9]/g, '');
    }

    formatted = formatted.slice(0, characters);

    onChangeText(formatted);
  };

  const keyboardType: KeyboardTypeOptions =
    type === 'numeric' ? 'number-pad' : 'default';

  return (
    <Pressable
      onPress={() => inputRef.current?.focus()}
      style={[styles.container, style]}
    >
      <View style={styles.boxContainer}>
        {Array.from({ length: characters }).map((_, index) => {
          const char = value[index] || '';
          const isActive = isFocused && value.length === index;

          return (
            <View
              key={index}
              style={[
                styles.box,
                {
                  backgroundColor,
                  borderColor: isActive ? '#ccc' : '#ccc4',
                },
              ]}
            >
              <TextInput
                editable={false}
                value={char}
                style={[
                  styles.character,
                  {
                    color: textColor,
                  },
                ]}
                placeholderTextColor={placeholderColor}
              />
            </View>
          );
        })}
      </View>

      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        keyboardType={keyboardType}
        autoCapitalize="characters"
        maxLength={characters}
        style={styles.hiddenInput}
        caretHidden
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },

  boxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },

  box: {
    flex: 1,
    height: 56,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  character: {
    fontSize: 20,
    fontFamily: 'Inter',
    textAlign: 'center',
    padding: 0,
    margin: 0,
  },

  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
});

export default CodeInputField;