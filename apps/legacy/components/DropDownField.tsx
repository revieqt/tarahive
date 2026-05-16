import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from './ThemedText';

interface DropDownFieldProps {
  placeholder?: string;
  value?: string;
  onValueChange: (value: string) => void;
  values?: Array<string | { label: string; value: string }>;
  style?: any;
  enabled?: boolean;
}

const DropDownField: React.FC<DropDownFieldProps> = ({
  placeholder = '',
  value = '',
  onValueChange,
  values = [],
  style,
  enabled = true,
}) => {
  const backgroundColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');

  const [focused, setFocused] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const flatRef = useRef<FlatList<any>>(null);

  // Normalize to { label, value } objects
  const options = values.map((v) =>
    typeof v === 'string' ? { label: v, value: v } : v
  );

  const itemHeight = 48;
  const selectedIndex = options.findIndex((o) => o.value === value);

  // Scroll to selected when opening
  useEffect(() => {
    if (modalVisible) {
      const timeout = setTimeout(() => {
        if (flatRef.current && selectedIndex >= 0) {
          flatRef.current.scrollToOffset({
            offset: selectedIndex * itemHeight,
            animated: false,
          });
        }
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [modalVisible, selectedIndex]);

  const openModal = () => {
    if (enabled) setModalVisible(true);
  };

  const closeModal = () => setModalVisible(false);

  const handleSelect = (val: string) => {
    onValueChange(val);
    closeModal();
  };

  const displayLabel =
    options.find((o) => o.value === value)?.label || placeholder;

  return (
    <>
      {/* Field Button */}
      <TouchableWithoutFeedback
        onPressIn={() => setFocused(true)}
        onPressOut={() => setFocused(false)}
        onPress={openModal}
      >
        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor,
              borderColor: focused ? '#ccc' : '#ccc4',
              borderWidth: 1,
            },
            style,
          ]}
        >
          <ThemedText
            style={[
              styles.pickerText,
              { color: value ? textColor : '#999' },
            ]}
          >
            {displayLabel}
          </ThemedText>
        </View>
      </TouchableWithoutFeedback>

      {/* Modal for List */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>

        <View style={[styles.modalContainer, { backgroundColor }]}>
          {/* Top gradient */}
          <LinearGradient
            colors={[backgroundColor, 'transparent']}
            style={[styles.gradient, { top: 0 }]}
          />

          {/* Scrollable Options */}
          <FlatList
            ref={flatRef}
            data={options}
            keyExtractor={(item) => item.value}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 20 }}
            getItemLayout={(_, index) => ({
              length: itemHeight,
              offset: itemHeight * index,
              index,
            })}
            renderItem={({ item }) => {
              const isSelected = item.value === value;
              return (
                <Pressable
                  onPress={() => handleSelect(item.value)}
                  style={({ pressed }) => [
                    styles.optionItem,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                      { color: textColor },
                    ]}
                  >
                    {item.label}
                  </ThemedText>
                </Pressable>
              );
            }}
          />

          {/* Bottom gradient */}
          <LinearGradient
            colors={['transparent', backgroundColor]}
            style={[styles.gradient, { bottom: 0 }]}
          />
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 15,
    marginBottom: 15,
    minHeight: 48,
    height: 48,
  },
  pickerText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Poppins',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
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
  optionItem: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  optionText: {
    fontSize: 13,
    fontFamily: 'Poppins',
    opacity: 0.7,
  },
  optionTextSelected: {
    opacity: 1,
    fontFamily: 'PoppinsBold',
  },
});

export default DropDownField;
