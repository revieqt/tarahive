import { useThemeColor } from '@/shared/hooks/useThemeColor';
import React, { useState, useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { DEFAULT_AREA_CODES } from '@/shared/constants/Input';
import { LinearGradient } from 'expo-linear-gradient';
import { TText, TIcon } from '@/shared/components/ui/Themed';

interface ContactNumberFieldProps {
  areaCode: string;
  onAreaCodeChange: (code: string) => void;
  areaCodes?: Array<string | { label: string; value: string }>;
  number: string;
  onNumberChange: (num: string) => void;
  placeholder?: string;
  style?: any;
  disabled?: boolean;
}

const ContactNumberField: React.FC<ContactNumberFieldProps> = ({
  areaCode,
  onAreaCodeChange,
  areaCodes = DEFAULT_AREA_CODES,
  number,
  onNumberChange,
  placeholder = 'Contact Number',
  style,
  disabled = false,
}) => {
  const backgroundColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({ light: '#aaa', dark: '#888' }, 'icon');
  const floatedLabelColor = useThemeColor({ light: '#888', dark: '#999' }, 'icon');

  const [isInputFocused, setIsInputFocused] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const isFocused = isInputFocused || modalVisible;

  // True when the floating label should be in the "floated" (top) position
  const isFloated = isInputFocused || number.length > 0;

  // Animated value: 0 = resting (centered), 1 = floated (top)
  const floatAnim = useRef(new Animated.Value(isFloated ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(floatAnim, {
      toValue: isFloated ? 1 : 0,
      duration: 180,
      useNativeDriver: false, // layout props require JS driver
    }).start();
  }, [isFloated]);

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

  const options = areaCodes.map((v) =>
    typeof v === 'string' ? { label: v, value: v } : v
  );

  const handleNumberChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 10);
    onNumberChange(digits);
  };

  const selectedLabel =
    options.find((opt) => opt.value === areaCode)?.label || areaCode;

  return (
    <>
      <View
        style={[
          styles.inputWrapper,
          { backgroundColor },
          { borderColor: isFocused ? '#ccc' : '#ccc4', borderWidth: 1 },
          style,
        ]}
      >
        {/* Animated floating label — spans the whole field, same placement as TextField */}
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

        {/* Area Code Selector — collapses away until the user has a value */}
        <Animated.View
          style={{
            width: floatAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 90],
            }),
            opacity: floatAnim,
            overflow: 'hidden',
          }}
          pointerEvents={isFloated ? 'auto' : 'none'}
        >
          <Pressable
            style={[
              styles.leftPart,
              { paddingTop: isFloated ? 12 : 0 },
            ]}
            onPress={() => !disabled && setModalVisible(true)}
          >
            <Text style={[styles.areaCodeText, { color: textColor }]}>
              {selectedLabel}
            </Text>
            <TIcon name="chevron-down" size={16} color={textColor} />
          </Pressable>
        </Animated.View>

        {/* Contact Number Input */}
        <View style={styles.rightPart}>
          <TextInput
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
            value={number}
            onChangeText={handleNumberChange}
            placeholder=""          // hide native placeholder — we render our own
            placeholderTextColor="transparent"
            keyboardType="number-pad"
            maxLength={10}
            editable={!disabled}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
          />
        </View>
      </View>

      {/* Modal Dropdown */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={[styles.modalContainer, { backgroundColor }]}>
            <LinearGradient
              colors={[backgroundColor,'transparent']}
              style={[styles.gradient, { top: 0 }]}
            />
            <FlatList
              data={options}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{paddingVertical: 20}}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    onAreaCodeChange(item.value);
                    setModalVisible(false);
                  }}
                >
                  <TText style={{textAlign: 'center'}}>{item.label}</TText>
                </TouchableOpacity>
              )}
            />
            <LinearGradient
              colors={['transparent', backgroundColor]}
              style={[styles.gradient, { bottom: 0 }]}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 7,
    paddingRight: 16,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1,
    position: 'relative',
    minHeight: 48,
    height: 48,
    backgroundColor: 'transparent',
  },
  leftPart: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    height: '100%',
    minWidth: 90,
  },
  rightPart: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    position: 'relative',
  },
  areaCodeText: {
    fontSize: 13,
    fontFamily: 'Inter',
  },
  floatingLabel: {
    position: 'absolute',
    left: 16,
    right: 16,
    fontFamily: 'Inter',
    zIndex: 1,
  },
  input: {
    flex: 1,
    fontSize: 13,
    backgroundColor: 'transparent',
    paddingLeft: 8,
    fontFamily: 'Inter',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    maxHeight: '30%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '20%',
    zIndex: 1,
    pointerEvents: 'none',
  },
  modalItem: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
});

export default ContactNumberField;