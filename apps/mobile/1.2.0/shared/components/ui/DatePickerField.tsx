import { useThemeColor } from '@/shared/hooks/useThemeColor';
import { useLanguage } from '@/shared/context/LanguageContext';
import { MONTH_OPTIONS } from '@/shared/constants/Input';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  FlatList,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { TIcon, TText } from './Themed';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

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

const DatePickerField: React.FC<DatePickerProps> = ({
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
  const placeholderColor = useThemeColor({ light: '#aaa', dark: '#888' }, 'icon');
  const floatedLabelColor = useThemeColor({ light: '#888', dark: '#999' }, 'icon');
  const { t } = useLanguage();

  const allMonths = useMemo(() => MONTH_OPTIONS.map((o) => t(o.label)), [t]);

  const [showPicker, setShowPicker] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const focused = isFocusedProp !== undefined ? isFocusedProp : isFocused;

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  // FlatList refs for arrow scrolling
  const monthRef = useRef<FlatList<any>>(null);
  const dayRef = useRef<FlatList<any>>(null);
  const yearRef = useRef<FlatList<any>>(null);
  const monthOffset = useRef(0);
  const dayOffset = useRef(0);
  const yearOffset = useRef(0);

  // Initialize from value
  useEffect(() => {
    if (value) {
      setSelectedDay(value.getDate());
      setSelectedMonth(value.getMonth());
      setSelectedYear(value.getFullYear());
    }
  }, [value]);

  // ── Date range helpers ──────────────────────────────────────────────────────

  const minYear = minimumDate ? minimumDate.getFullYear() : 1950;
  const maxYear = maximumDate ? maximumDate.getFullYear() : new Date().getFullYear() + 50;
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);

  // Months available for the selected year
  const months = useMemo(() => {
    if (selectedYear === null) return allMonths;
    return allMonths.filter((_, idx) => {
      if (minimumDate && selectedYear === minimumDate.getFullYear() && idx < minimumDate.getMonth()) return false;
      if (maximumDate && selectedYear === maximumDate.getFullYear() && idx > maximumDate.getMonth()) return false;
      return true;
    });
  }, [allMonths, selectedYear, minimumDate, maximumDate]);

  // Days available for the selected year + month
  const days = useMemo(() => {
    const yr = selectedYear ?? new Date().getFullYear();
    const mo = selectedMonth ?? 0;
    const total = new Date(yr, mo + 1, 0).getDate();
    return Array.from({ length: total }, (_, i) => i + 1).filter((d) => {
      if (minimumDate && yr === minimumDate.getFullYear() && mo === minimumDate.getMonth() && d < minimumDate.getDate()) return false;
      if (maximumDate && yr === maximumDate.getFullYear() && mo === maximumDate.getMonth() && d > maximumDate.getDate()) return false;
      return true;
    });
  }, [selectedYear, selectedMonth, minimumDate, maximumDate]);

  // Clamp selections when ranges shrink
  useEffect(() => {
    if (selectedMonth !== null && !months.includes(allMonths[selectedMonth])) {
      const firstValidIdx = allMonths.indexOf(months[0]);
      setSelectedMonth(firstValidIdx >= 0 ? firstValidIdx : null);
    }
  }, [months]);

  useEffect(() => {
    if (selectedDay !== null && !days.includes(selectedDay)) {
      setSelectedDay(days[0] ?? null);
    }
  }, [days]);

  // Fire onChange when all three are set
  useEffect(() => {
    if (selectedDay !== null && selectedMonth !== null && selectedYear !== null) {
      let date = new Date(selectedYear, selectedMonth, selectedDay);
      if (minimumDate && date < minimumDate) date = new Date(minimumDate);
      if (maximumDate && date > maximumDate) date = new Date(maximumDate);
      onChange(date);
    }
  }, [selectedDay, selectedMonth, selectedYear]);

  // ── Floating label animation ────────────────────────────────────────────────

  const isFloated = focused || !!value;
  const floatAnim = useRef(new Animated.Value(isFloated ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(floatAnim, {
      toValue: isFloated ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [isFloated]);

  const labelTop = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 8] });
  const labelFontSize = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [13, 9] });
  const labelColor = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [placeholderColor as string, floatedLabelColor as string],
  });

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleOpen = () => {
    if (selectedDay === null || selectedMonth === null || selectedYear === null) {
      const now = new Date();
      setSelectedDay(now.getDate());
      setSelectedMonth(now.getMonth());
      setSelectedYear(now.getFullYear());
    }
    setIsFocused(true);
    onFocus && onFocus();
    setShowPicker(true);
  };

  const handleClose = () => {
    setShowPicker(false);
    setIsFocused(false);
    onBlur && onBlur();
  };

  const scrollBy = (
    ref: React.RefObject<FlatList<any> | null>,
    offsetRef: React.MutableRefObject<number>,
    direction: 'up' | 'down'
  ) => {
    const next =
      direction === 'up'
        ? Math.max(0, offsetRef.current - ITEM_HEIGHT)
        : offsetRef.current + ITEM_HEIGHT;
    ref.current?.scrollToOffset({ offset: next, animated: true });
    offsetRef.current = next;
  };

  // ── Display ─────────────────────────────────────────────────────────────────

  const formattedDisplay =
    value && selectedDay !== null
      ? `${allMonths[value.getMonth()]} ${value.getDate()}, ${value.getFullYear()}`
      : '';

  // ── Spinner column ───────────────────────────────────────────────────────────

  const SpinnerColumn = ({
    data,
    selected,
    onSelect,
    listRef,
    offsetRef,
  }: {
    data: any[];
    selected: any;
    onSelect: (item: any) => void;
    listRef: React.RefObject<FlatList<any> | null>;
    offsetRef: React.MutableRefObject<number>;
  }) => (
    <View style={styles.spinnerColumn}>
      {/* Up arrow */}
      <TouchableOpacity
        style={styles.arrowButton}
        onPress={() => scrollBy(listRef, offsetRef, 'up')}
        activeOpacity={0.7}
      >
        <TIcon name="chevron-up" size={16} color={textColor} />
      </TouchableOpacity>

      {/* Gradient top */}
      <LinearGradient
        colors={[backgroundColor, 'transparent']}
        style={[styles.gradient, { top: 36 }]}
        pointerEvents="none"
      />

      <FlatList
        ref={listRef}
        data={data}
        keyExtractor={(item) => item.toString()}
        style={styles.picker}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 20 }}
        onScroll={(e) => { offsetRef.current = e.nativeEvent.contentOffset.y; }}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => onSelect(item)}>
            <View style={styles.item}>
              <TText
                style={[
                  styles.itemText,
                  { color: textColor },
                  item === selected && styles.selectedText,
                ]}
              >
                {item}
              </TText>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Gradient bottom */}
      <LinearGradient
        colors={['transparent', backgroundColor]}
        style={[styles.gradient, { bottom: 36 }]}
        pointerEvents="none"
      />

      {/* Down arrow */}
      <TouchableOpacity
        style={styles.arrowButton}
        onPress={() => scrollBy(listRef, offsetRef, 'down')}
        activeOpacity={0.7}
      >
        <TIcon name="chevron-down" size={16} color={textColor} />
      </TouchableOpacity>
    </View>
  );

  return (
    <TouchableOpacity
      style={[
        styles.inputWrapper,
        { backgroundColor },
        { borderColor: focused ? '#ccc' : '#ccc4', borderWidth: 1 },
        style,
      ]}
      onPress={handleOpen}
      activeOpacity={0.7}
    >
      {/* Floating label */}
      <Animated.Text
        style={[styles.floatingLabel, { top: labelTop, fontSize: labelFontSize, color: labelColor }]}
        numberOfLines={1}
        pointerEvents="none"
      >
        {placeholder}
      </Animated.Text>

      {/* Display value */}
      <TText
        style={[
          styles.displayText,
          { color: formattedDisplay ? textColor : 'transparent', paddingTop: isFloated ? 12 : 0 },
        ]}
      >
        {formattedDisplay || ' '}
      </TText>

      {/* Spinner Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={showPicker}
        onRequestClose={handleClose}
      >
        <SafeAreaView style={{ flex: 1 }} edges={['bottom']} pointerEvents="box-none">
          <TouchableWithoutFeedback onPress={handleClose}>
            <View style={styles.modalOverlay} />
          </TouchableWithoutFeedback>

          <View style={[styles.modalContainer, { backgroundColor }]}>
            <View style={styles.pickerContainer}>
              {/* Month */}
              <SpinnerColumn
                data={months}
                selected={selectedMonth !== null ? allMonths[selectedMonth] : null}
                onSelect={(m: string) => setSelectedMonth(allMonths.indexOf(m))}
                listRef={monthRef}
                offsetRef={monthOffset}
              />
              {/* Day */}
              <SpinnerColumn
                data={days}
                selected={selectedDay}
                onSelect={setSelectedDay}
                listRef={dayRef}
                offsetRef={dayOffset}
              />
              {/* Year */}
              <SpinnerColumn
                data={years}
                selected={selectedYear}
                onSelect={setSelectedYear}
                listRef={yearRef}
                offsetRef={yearOffset}
              />
            </View>
          </View>
        </SafeAreaView>
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
  displayText: {
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    maxHeight: '35%',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    height: 280,
  },
  spinnerColumn: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    overflow: 'hidden',
  },
  picker: {
    flex: 1,
    width: '100%',
  },
  arrowButton: {
    width: '100%',
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '20%',
    zIndex: 1,
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    opacity: 0.7,
    fontFamily: 'Inter',
    fontSize: 13,
  },
  selectedText: {
    fontWeight: 900,
    fontSize: 16,
    opacity: 1,
  },
});

export default DatePickerField;