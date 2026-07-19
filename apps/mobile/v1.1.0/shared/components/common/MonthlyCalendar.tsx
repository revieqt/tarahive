import React, { useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { TIcon, TText, TView } from '../ui/Themed';
import { useThemeColor } from '@/shared/hooks/useThemeColor';
import { router } from 'expo-router';
import { useLanguage } from '@/shared/context/LanguageContext';
import { useGetUserItineraries } from '@/features/itinerary/hooks/useGetUserItineraries';
import { Itinerary } from '@/features/itinerary/types/itineraryTypes';
import { formatDateToString } from '@/shared/utils/formatDateToString';
import CalendarCardSkeleton from '../feedback/CalendarCardSkeleton';

type DayCell = {
  key: string;
  date: number | null;
  isToday: boolean;
  dateString: string;
  hasItinerary: boolean;
};

const toLocalDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const parseLocalDateKey = (dateString: string) => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const itineraryOverlapsDay = (itinerary: Itinerary, dateString: string) => {
  const targetDate = parseLocalDateKey(dateString);
  const dayStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0, 0);
  const dayEnd = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);
  const startDate = new Date(itinerary.startDate);
  const endDate = new Date(itinerary.endDate);

  return startDate <= dayEnd && endDate >= dayStart;
};

/**
 * MonthlyCalendar
 * Displays a grid for the current calendar month and highlights today's date.
 */
const MonthlyCalendar: React.FC = () => {
  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState(() => toLocalDateKey(today));

  const { t, currentLanguage } = useLanguage();
  const backgroundColor = useThemeColor({}, 'background');
  const secondaryColor = useThemeColor({}, 'accent');

  const monthQuery = useGetUserItineraries('active', { currentMonth: true });

  const monthItineraries = monthQuery.itineraries ?? [];
  const activeDayItineraries = monthItineraries.filter((itinerary) => itineraryOverlapsDay(itinerary, selectedDate));

  const WEEKDAY_LABELS = [
    t('common.days_short.sun'),
    t('common.days_short.mon'),
    t('common.days_short.tue'),
    t('common.days_short.wed'),
    t('common.days_short.thu'),
    t('common.days_short.fri'),
    t('common.days_short.sat')
  ];

  const { monthLabel, todayLabel, selectedDateLabel, days } = useMemo(() => {
    const year = today.getFullYear();
    const month = today.getMonth();
    const todayDate = today.getDate();
    const firstDayOfMonth = new Date(year, month, 1);
    const startWeekday = firstDayOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: DayCell[] = [];

    for (let i = 0; i < startWeekday; i++) {
      cells.push({ key: `blank-start-${i}`, date: null, isToday: false, dateString: '', hasItinerary: false });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dateString = toLocalDateKey(date);

      cells.push({
        key: `day-${d}`,
        date: d,
        isToday: d === todayDate,
        dateString,
        hasItinerary: monthItineraries.some((itinerary) => itineraryOverlapsDay(itinerary, dateString)),
      });
    }

    while (cells.length % 7 !== 0) {
      cells.push({ key: `blank-end-${cells.length}`, date: null, isToday: false, dateString: '', hasItinerary: false });
    }

    const monthLabel = new Intl.DateTimeFormat(currentLanguage.code, {
      month: 'long',
      year: 'numeric',
    }).format(firstDayOfMonth);

    const todayLabel = new Intl.DateTimeFormat(currentLanguage.code, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }).format(today);

    const selectedDateLabel = new Intl.DateTimeFormat(currentLanguage.code, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }).format(parseLocalDateKey(selectedDate));

    return { monthLabel, todayLabel, selectedDateLabel, days: cells };
  }, [currentLanguage.code, monthItineraries, selectedDate, today]);

  const renderCell = ({ item }: { item: DayCell }) => {
    if (item.date === null) {
      return <View style={[styles.cell, styles.emptyCell]} />;
    }

    const isSelected = selectedDate === item.dateString;

    return (
      <TouchableOpacity
        onPress={() => setSelectedDate(item.dateString)}
        style={[styles.cell, isSelected && styles.selectedCell, item.isToday && styles.todayCell]}
      >
        <TText style={[styles.day, item.isToday && styles.todayText, isSelected && styles.selectedText, (isSelected && item.isToday) && styles.todayText]}>
          {item.date}
        </TText>
        {item.hasItinerary && <View style={[styles.dot, item.isToday && {backgroundColor: '#fff'}]} />}
      </TouchableOpacity>
    );
  };

  const renderDailyItinerary = ({ item }: { item: Itinerary }) => (
    <TouchableOpacity
      key={item.id}
      style={styles.dailyItineraryItem}
      onPress={() => router.push(`/itinerary/${item.id}`)}
    >
      <TText>{item.title}</TText>
      <TText style={styles.dailyItineraryDetails}>
        {formatDateToString(new Date(item.startDate), currentLanguage.code)} - {formatDateToString(new Date(item.endDate), currentLanguage.code)}
      </TText>
      <TText style={styles.dailyItineraryDetails}>{item.type}</TText>
    </TouchableOpacity>
  );

  return (
    <TView style={styles.container} color='primary' shadow>
      <View style={[styles.header, { backgroundColor: `${secondaryColor}20` }]}>
        <View style={{ marginLeft: 3, marginVertical: 3 }}>
          <TText>{monthLabel}</TText>
          <TText style={{ fontSize: 10, opacity: 0.5 }}>{todayLabel}</TText>
        </View>

        <TouchableOpacity onPress={() => router.push('/itinerary/new')} style={[styles.newItineraryButton, { backgroundColor }]}>
          <TIcon name='plus' size={12} />
          <TText style={{ fontSize: 10 }}>{t('tabs.home.calendar_new_itinerary')}</TText>
        </TouchableOpacity>
      </View>

      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((label) => (
          <View key={label} style={[styles.weekdayCell, { backgroundColor }]}>
            <TText style={{ fontSize: 10 }}>{label}</TText>
          </View>
        ))}
      </View>

      <FlatList
        data={days}
        renderItem={renderCell}
        keyExtractor={(item) => item.key}
        numColumns={7}
        scrollEnabled={false}
        contentContainerStyle={styles.cellsContainer}
      />

      <View style={styles.header}>
        <View style={{ marginLeft: 3, marginVertical: 3 }}>
          <TText>{selectedDateLabel}</TText>
          <TText style={{ fontSize: 10, opacity: 0.5 }}>{t('tabs.home.menu_itinerary')}</TText>
        </View>

        <TouchableOpacity onPress={() => router.push('/itinerary')} style={styles.viewAllButton}>
          <TText style={{ fontSize: 11 }}>{t('tabs.home.calendar_view_all')}</TText>
          <TIcon name='arrow-right' size={15} />
        </TouchableOpacity>
      </View>

      <View style={styles.dailyItineraryContainer}>
        {monthQuery.isLoading ? (
          <CalendarCardSkeleton/>
        ) : activeDayItineraries.length > 0 ? (
          <FlatList
            data={activeDayItineraries}
            renderItem={renderDailyItinerary}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        ) : (
          <TText style={styles.emptyStateText}>{t('tabs.home.calendar_no_itineraries')}</TText>
        )}
      </View>
    </TView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: '3%',
    borderRadius: 12,
    overflow: 'hidden'
  },
  header: {
    padding: '2%',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  newItineraryButton: {
    flexDirection: 'row',
    padding: 5,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc5'
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
  day: {
    fontWeight: 400,
    opacity: 0.7,
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
  selectedCell: {
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  selectedText: {
    color: '#F59E0B',
    fontWeight: '700',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#F59E0B',
    position: 'absolute',
    bottom: 4,
  },
  cellsContainer: {
    marginHorizontal: '3%',
    paddingBottom: 5
  },
  dailyItineraryContainer: {
    marginHorizontal: '2%',
    paddingBottom: 2,
    gap: 8,
  },
  dailyItineraryItem: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc4',
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
    padding: 10,
    gap: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  dailyItineraryDetails: {
    fontSize: 11,
    opacity: 0.5,
  },
  emptyStateText: {
    fontSize: 12,
    opacity: 0.5,
    paddingBottom: 8,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 0.7,
    gap: 5
  }
});

export default MonthlyCalendar;