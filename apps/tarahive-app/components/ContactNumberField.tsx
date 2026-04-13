import { useThemeColor } from '@/hooks/useThemeColor';
import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { DEFAULT_AREA_CODES } from '@/constants/Config';
import ThemedIcons from './ThemedIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from './ThemedText';

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
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const isFocused = isInputFocused || modalVisible;

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
        {/* Area Code Selector */}
        <Pressable
          style={styles.leftPart}
          onPress={() => !disabled && setModalVisible(true)}
        >
          <Text style={[styles.areaCodeText, { color: textColor }]}>
            {selectedLabel}
          </Text>
          <ThemedIcons name="chevron-down" size={16} color={textColor} />
        </Pressable>

        {/* Contact Number Input */}
        <TextInput
          style={[styles.input, { color: textColor }]}
          value={number}
          onChangeText={handleNumberChange}
          placeholder={placeholder}
          placeholderTextColor={useThemeColor(
            { light: '#aaa', dark: '#888' },
            'icon'
          )}
          keyboardType="number-pad"
          maxLength={10}
          editable={!disabled}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
        />
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
                  <ThemedText style={{textAlign: 'center'}}>{item.label}</ThemedText>
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
  areaCodeText: {
    fontSize: 13,
    fontFamily: 'Poppins',
  },
  input: {
    flex: 1,
    fontSize: 13,
    backgroundColor: 'transparent',
    paddingLeft: 8,
    fontFamily: 'Poppins',
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
