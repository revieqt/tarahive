import { useThemeColor } from '@/hooks/useThemeColor';
import React, { useState, useEffect } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { ThemedText } from './ThemedText';
import { LinearGradient } from 'expo-linear-gradient';
const ITEM_HEIGHT = 40;

interface DatePickerProps {
  placeholder: string;
  value: Date | null;
  onChange: (date: Date) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  isFocused?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
  style?: any;
}

const months = [
  'January', 'Febuary', 'March', 'April', 'May', 'June',
  'Julu', 'August', 'September', 'October', 'November', 'December'
];

const DatePicker: React.FC<DatePickerProps> = ({
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  isFocused: isFocusedProp,
  minimumDate,
  maximumDate,
  style,
}) => {
  const backgroundColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');

  const [showPicker, setShowPicker] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const focused = isFocusedProp !== undefined ? isFocusedProp : isFocused;

  // Local state for spinner values
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  // Initialize state from value prop when component mounts or value changes
  useEffect(() => {
    if (value) {
      setSelectedDay(value.getDate());
      setSelectedMonth(value.getMonth());
      setSelectedYear(value.getFullYear());
    }
  }, [value]);

  const minYear = minimumDate ? minimumDate.getFullYear() : 1950;
  const maxYear = maximumDate ? maximumDate.getFullYear() : new Date().getFullYear() + 50;
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);

  const daysInMonth = selectedMonth !== null && selectedYear !== null
    ? new Date(selectedYear, selectedMonth + 1, 0).getDate()
    : 31;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Handle auto-change on click
  useEffect(() => {
    if (selectedDay !== null && selectedMonth !== null && selectedYear !== null) {
      const selectedDate = new Date(selectedYear, selectedMonth, selectedDay);

      let finalDate = selectedDate;
      if (minimumDate && selectedDate < minimumDate) finalDate = minimumDate;
      if (maximumDate && selectedDate > maximumDate) finalDate = maximumDate;

      onChange(finalDate);
    }
  }, [selectedDay, selectedMonth, selectedYear]);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus && onFocus();

    // If user opens picker for the first time (no date yet), set current date
    if (selectedDay === null || selectedMonth === null || selectedYear === null) {
      const now = new Date();
      setSelectedDay(now.getDate());
      setSelectedMonth(now.getMonth());
      setSelectedYear(now.getFullYear());
    }

    setShowPicker(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur && onBlur();
  };

  const renderItem = (item: any, selected: any, setSelected: any) => (
    <TouchableOpacity onPress={() => setSelected(item.item)}>
      <View style={styles.item}>
        <ThemedText style={[styles.itemText, item.item === selected && styles.selectedText]}>
          {item.item}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );

  const formattedDisplay =
    value && selectedDay !== null
      ? `${months[value.getMonth()]} ${value.getDate()}, ${value.getFullYear()}`
      : '';

  const formattedValue =
    value && selectedDay !== null
      ? `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(
          value.getDate()
        ).padStart(2, '0')}`
      : '';

  return (
    <TouchableOpacity
      style={[
        styles.inputWrapper,
        { backgroundColor },
        { borderColor: focused ? '#ccc' : '#ccc4', borderWidth: 1 },
        style,
      ]}
      onPress={handleFocus}
      activeOpacity={0.7}
    >
      <TextInput
        value={formattedDisplay || ''}
        style={[
          styles.input,
          { color: textColor, textAlignVertical: 'center', paddingTop: 0, paddingBottom: 0 },
        ]}
        placeholder={placeholder}
        placeholderTextColor={useThemeColor({ light: '#aaa', dark: '#888' }, 'icon')}
        editable={false}
        onFocus={handleFocus}
        onBlur={handleBlur}
        pointerEvents="none"
      />

      {/* Spinner Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={showPicker}
        onRequestClose={() => setShowPicker(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowPicker(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContainer, { backgroundColor }]}>
                <LinearGradient
                  colors={[backgroundColor, 'transparent']}
                  style={[styles.gradient, { top: 0 }]}
                />
                <View style={styles.pickerContainer}>
                  {/* Month */}
                  <FlatList
                    data={months}
                    keyExtractor={(item) => item}
                    style={styles.picker}
                    snapToInterval={ITEM_HEIGHT}
                    decelerationRate="fast"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{paddingVertical: 20}}
                    renderItem={(item) =>
                      renderItem(item, months[selectedMonth ?? 0], (month: string) =>
                        setSelectedMonth(months.indexOf(month))
                      )
                    }
                  />
                  {/* Day */}
                  <FlatList
                    data={days}
                    keyExtractor={(item) => item.toString()}
                    style={styles.picker}
                    snapToInterval={ITEM_HEIGHT}
                    contentContainerStyle={{paddingVertical: 20}}
                    decelerationRate="fast"
                    showsVerticalScrollIndicator={false}
                    renderItem={(item) => renderItem(item, selectedDay, setSelectedDay)}
                  />

                  {/* Year */}
                  <FlatList
                    data={years}
                    keyExtractor={(item) => item.toString()}
                    style={styles.picker}
                    snapToInterval={ITEM_HEIGHT}
                    contentContainerStyle={{paddingVertical: 20}}
                    decelerationRate="fast"
                    showsVerticalScrollIndicator={false}
                    renderItem={(item) => renderItem(item, selectedYear, setSelectedYear)}
                  />
                </View>
                <LinearGradient
                  colors={['transparent',backgroundColor ]}
                  style={[styles.gradient, { bottom: 0 }]}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 16,
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
    height: 48,
    backgroundColor: 'transparent',
    fontFamily: 'Poppins',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '30%',
    overflow: 'hidden',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    overflow: 'hidden',
  },
  picker: {
    width: '30%',
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    opacity: 0.7,
  },
  selectedText: {
    fontFamily: 'PoppinsBold',
    opacity: 1,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '20%',
    zIndex: 1,
    pointerEvents: 'none',
  },
});

export default DatePicker;
