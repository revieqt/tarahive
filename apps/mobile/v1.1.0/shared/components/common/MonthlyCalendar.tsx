import React, { useMemo } from 'react';
import { View, StyleSheet, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import { TIcon, TText, TView } from '../ui/Themed';
import { useThemeColor } from '@/shared/hooks/useThemeColor';
import { router } from 'expo-router';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type DayCell = {
  key: string;
  date: number | null; // null represents a blank leading/trailing cell
  isToday: boolean;
};

/**
 * MonthlyCalendar
 * Displays a grid for the current calendar month and highlights today's date.
 */
const MonthlyCalendar: React.FC = () => {
  const today = useMemo(() => new Date(), []);
  const backgroundColor = useThemeColor({}, 'background');
  const secondaryColor = useThemeColor({}, 'accent');
  const { monthLabel, todayLabel, days } = useMemo(() => {
    const year = today.getFullYear();
    const month = today.getMonth(); // 0-indexed
    const todayDate = today.getDate();

    const firstDayOfMonth = new Date(year, month, 1);
    const startWeekday = firstDayOfMonth.getDay(); // 0 (Sun) - 6 (Sat)
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: DayCell[] = [];

    // Leading blank cells so the 1st lands on the correct weekday column
    for (let i = 0; i < startWeekday; i++) {
      cells.push({ key: `blank-start-${i}`, date: null, isToday: false });
    }

    // Actual day cells
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({
        key: `day-${d}`,
        date: d,
        isToday: d === todayDate,
      });
    }

    // Trailing blank cells to complete the last week row
    while (cells.length % 7 !== 0) {
      cells.push({ key: `blank-end-${cells.length}`, date: null, isToday: false });
    }

    const monthLabel = firstDayOfMonth.toLocaleDateString(undefined, {
      month: 'long',
      year: 'numeric',
    });

    const todayLabel = today.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });

    return { monthLabel, todayLabel, days: cells };
  }, [today]);

  const renderCell = ({ item }: { item: DayCell }) => {
    if (item.date === null) {
      return <View style={[styles.cell, styles.emptyCell]} />;
    }
    return (
      <View style={[styles.cell, item.isToday && styles.todayCell]}>
        <TText style={[styles.day, item.isToday && styles.todayText]}>
          {item.date}
        </TText>
      </View>
    );
  };

  return (
    <TView style={styles.container} color='primary' shadow>
      <View style={[styles.header, {backgroundColor: secondaryColor + '20'}]}>
        <View style={{marginLeft: 3, marginVertical: 3}}>
          <TText style={{fontSize: 12}}>{monthLabel}</TText>
          <TText style={{fontSize: 10, opacity: .5}}>{todayLabel}</TText>
        </View>
        
        <TouchableOpacity onPress={() => router.push('/itinerary/create')} style={[styles.newItineraryButton, {backgroundColor}]}>
          <TIcon name='plus' size={12}/>
          <TText style={{fontSize: 10}}>New Itinerary</TText>
        </TouchableOpacity>
      </View>

      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((label) => (
          <View key={label} style={[styles.weekdayCell, {backgroundColor: backgroundColor}]}>
            <TText style={{fontSize: 10}}>{label}</TText>
          </View>
        ))}
      </View>

      <FlatList
        data={days}
        renderItem={renderCell}
        keyExtractor={(item) => item.key}
        numColumns={7}
        scrollEnabled={false}
        contentContainerStyle={{marginHorizontal: '2%'}}
      />
      
    </TView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: '3%',
    borderRadius: 12,
    overflow: 'hidden'
  },
  header:{
    padding: '2%',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  newItineraryButton:{
    flexDirection: 'row',
    padding: 5,
    borderRadius: 10,
    alignItems: 'center'
  },
  weekdayRow: {
    flexDirection: 'row',
    gap: 4,
    marginHorizontal: '3%',
    marginTop: 5
  },
  weekdayCell: {
    flex: 7,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    borderRadius: 5,
  },
  cell: {
    flex: 7,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  emptyCell: {
    // Blank filler cell, no visible content
  },
  day:{
    fontWeight: 400,
    opacity: .7,
    fontSize: 12
  },
  todayCell: {
    backgroundColor: '#F59E0B',
    borderRadius: 100,
  },
  todayText: {
    color: '#ffffff',
    fontWeight: '700',
    opacity: 1
  },
});

export default MonthlyCalendar;