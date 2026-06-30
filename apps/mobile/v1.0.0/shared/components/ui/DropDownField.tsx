import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColor } from '@/shared/hooks/useThemeColor';
import { TIcon, TText } from './Themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '@/shared/context/LanguageContext';

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
  const accentColor = useThemeColor({}, 'accent');
  const placeholderColor = useThemeColor({ light: '#aaa', dark: '#888' }, 'icon');
  const floatedLabelColor = useThemeColor({ light: '#888', dark: '#999' }, 'icon');

  const { t } = useLanguage();
  const [focused, setFocused] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const flatRef = useRef<FlatList<any>>(null);
  const scrollOffsetRef = useRef(0);

  const options = values.map((v) =>
    typeof v === 'string' ? { label: v, value: v } : v
  );

  const itemHeight = 48;
  const selectedIndex = options.findIndex((o) => o.value === value);

  // Floating label animation
  const isFloated = focused || !!value;
  const floatAnim = useRef(new Animated.Value(isFloated ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(floatAnim, {
      toValue: isFloated ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [isFloated]);

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

  // Scroll to selected when opening
  useEffect(() => {
    if (modalVisible) {
      const timeout = setTimeout(() => {
        if (flatRef.current && selectedIndex >= 0) {
          flatRef.current.scrollToOffset({
            offset: selectedIndex * itemHeight,
            animated: false,
          });
          scrollOffsetRef.current = selectedIndex * itemHeight;
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

  const scrollBy = (direction: 'up' | 'down') => {
    const next =
      direction === 'up'
        ? Math.max(0, scrollOffsetRef.current - itemHeight)
        : scrollOffsetRef.current + itemHeight;
    flatRef.current?.scrollToOffset({ offset: next, animated: true });
    scrollOffsetRef.current = next;
  };

  const displayLabel =
    options.find((o) => o.value === value)?.label ?? '';

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
          {/* Floating label */}
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

          {/* Selected value */}
          <TText
            style={[
              styles.pickerText,
              {
                color: value ? textColor : 'transparent',
                paddingTop: isFloated ? 12 : 0,
              },
            ]}
          >
            {t(displayLabel)}
          </TText>
        </View>
      </TouchableWithoutFeedback>

      {/* Modal for List */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <SafeAreaView style={{ flex: 1 }} edges={['bottom']} pointerEvents="box-none">
          <TouchableWithoutFeedback onPress={closeModal}>
            <View style={styles.modalOverlay} />
          </TouchableWithoutFeedback>

          <View style={[styles.modalContainer, { backgroundColor }]}>
            {/* Up arrow */}
            <TouchableOpacity
              style={styles.arrowButton}
              onPress={() => scrollBy('up')}
              activeOpacity={0.7}
            >
              <TIcon name="chevron-up" size={20} color={textColor} />
            </TouchableOpacity>

            {/* Top gradient */}
            <LinearGradient
              colors={[backgroundColor, 'transparent']}
              style={[styles.gradient, { top: 36 }]}
              pointerEvents="none"
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
              onScroll={(e) => {
                scrollOffsetRef.current = e.nativeEvent.contentOffset.y;
              }}
              scrollEventThrottle={16}
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
                    <TText
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                        { color: textColor },
                      ]}
                    >
                      {t(item.label)}
                    </TText>
                  </Pressable>
                );
              }}
            />

            {/* Bottom gradient */}
            <LinearGradient
              colors={['transparent', backgroundColor]}
              style={[styles.gradient, { bottom: 36 }]}
              pointerEvents="none"
            />

            {/* Down arrow */}
            <TouchableOpacity
              style={styles.arrowButton}
              onPress={() => scrollBy('down')}
              activeOpacity={0.7}
            >
              <TIcon name="chevron-down" size={20} color={textColor} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
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
    marginBottom: 8,
    minHeight: 48,
    height: 48,
    position: 'relative',
  },
  floatingLabel: {
    position: 'absolute',
    left: 16,
    right: 16,
    fontFamily: 'Inter',
  },
  pickerText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Inter',
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
  arrowButton: {
    width: '100%',
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  optionItem: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  optionText: {
    fontSize: 13,
    fontFamily: 'Inter',
    opacity: 0.7,
  },
  optionTextSelected: {
    opacity: 1,
    fontFamily: 'Baloo',
    fontSize: 16,
  },
});

export default DropDownField;