import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, FlatList} from "react-native";
import { TIcon, TText, TView } from "@/components/ui/Themed";
import { useLanguage } from "@/context/LanguageContext";
import { useThemeColor } from "@/hooks/shared/useThemeColor";
import Header from "@/components/common/Header";
import { useGetUserItineraries } from "@/hooks/itinerary/useGetUserItineraries";
import EmptyMessage from "@/components/common/EmptyMessage";
import ItineraryCardSkeleton from "@/components/feedback/CalendarCardSkeleton";
import StickyScrollView from "@/components/ui/StickyScrollView";
import ItineraryCard from "@/components/itinerary/ItineraryCard";

const ArchiveOptions = [
  { value: 'done', icon: 'check-circle', label: 'itinerary.main.completed' },
  { value: 'cancelled', icon: 'close-circle', label: 'itinerary.main.cancelled' },
];

export default function ItineraryArchivesScreen() {
  const { t } = useLanguage();
  const accentColor = useThemeColor({}, 'accent');
  const [selectedStatus, setSelectedStatus] = useState<'done' | 'cancelled'>('done');
  const { itineraries, isLoading, isError } = useGetUserItineraries(selectedStatus);

  return (
    <TView style={{ flex: 1 }}>
      <StickyScrollView 
        style={{flex: 1}}
        contentContainerStyle={{padding: '3%', flex: 1}}
        title="Itinerary"
        subtitle="Manage your travel plans"
      >
        <Header title="Itinerary Archives" subtitle={t('itinerary.main.subtitle')}/>
        <View style={styles.tabsContainer}>
          {ArchiveOptions.map((option, index) => (
            <TouchableOpacity
              style={[styles.tabs, selectedStatus === option.value && { borderBottomColor: accentColor, borderBottomWidth: 2 }]}
              onPress={() => setSelectedStatus(option.value as 'done' | 'cancelled')}
            >
              <TIcon name={option.icon} size={13} color={selectedStatus === option.value ? accentColor : 'gray'} />
              <TText style={{ color: selectedStatus === option.value ? accentColor : 'gray', fontSize: 11 }}>{t(option.label)}</TText>
            </TouchableOpacity>
          ))}
        </View>

        {isLoading ? (
          <>
            <ItineraryCardSkeleton />
            <ItineraryCardSkeleton />
          </>
        ) : isError || !itineraries || itineraries.length === 0 ? (
          <View style={styles.errorContainer}>
            <EmptyMessage
              title={isError ? 'Failed to load itineraries' : 'No itineraries yet'}
              description={isError ? 'Please try again later' : 'Nothing to see here!'}
              iconName='inbox'
            />
          </View>
        ) : (
          <FlatList
            data={itineraries}
            renderItem={({ item }) => (
              <ItineraryCard
                id={item.id}
                title={item.title}
                type={item.type}
                startDate={item.startDate}
                endDate={item.endDate}
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            scrollEnabled={false}
          />
        )}
      </StickyScrollView>
    </TView>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    marginTop: 50,
  },
  listContent: {
    gap: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc3',
  },
  tabs: {
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    height: 20,
    paddingBottom: 12,
    gap: 5,
  },
});