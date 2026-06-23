import React, { useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, FlatList } from "react-native";
import { TIcon, TText, TView } from "@/shared/components/ui/Themed";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useThemeColor } from "@/shared/hooks/useThemeColor";
import Header from "@/shared/components/common/Header";
import RoundButton from "@/shared/components/ui/RoundButton";
import { router } from "expo-router";
import { useGetUserItineraries } from "@/features/itinerary/hooks/useGetUserItineraries";
import { Itinerary, getStatusColor } from "@/features/itinerary/types/itineraryTypes";
import { formatDateToString } from "@/shared/utils/formatDateToString";
import EmptyMessage from "@/shared/components/common/EmptyMessage";
import ItineraryCardSkeleton from "@/shared/components/feedback/ItineraryCardSkeleton";

const ItineraryOptions = [
  { value: 'active', icon: 'cards-heart', label: 'Active' },
  { value: 'done', icon: 'check-circle', label: 'Completed' },
  { value: 'cancelled', icon: 'close-circle', label: 'Cancelled' },
];

export default function ItineraryScreen() {
  const { t } = useLanguage();
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const [selectedStatus, setSelectedStatus] = useState<'active' | 'done' | 'cancelled'>('active');
  const { itineraries, isLoading, isError } = useGetUserItineraries(selectedStatus);

  const handleItineraryPress = (id: string) => {
    router.push(`/itinerary/${id}`);
  };

  const renderItineraryCard = ({ item }: { item: Itinerary }) => (
    <TouchableOpacity
      onPress={() => handleItineraryPress(item.id)}
      style={[styles.itineraryCard, { backgroundColor: primaryColor, borderColor: getStatusColor(item.status) }]}
    >
      <TText style={styles.cardTitle} numberOfLines={1}>{item.title}</TText>
      <TText style={styles.dateText}>
        {formatDateToString(new Date(item.startDate))} - {formatDateToString(new Date(item.endDate))}
      </TText>

      <View style={styles.cardTabs}>
        <View style={[styles.cardBubble, { backgroundColor: getStatusColor(item.status) }]}>
          <TText style={[styles.cardBubbleText, { color: '#FFF' }]}>{item.status[0].toUpperCase() + item.status.slice(1)}</TText>
        </View>
        <TView style={styles.cardBubble}>
          <TText style={[styles.cardBubbleText, { opacity: 0.7 }]}>{item.type}</TText>
        </TView>
      </View>
      {item.description && (
        <TText style={styles.cardDescription} numberOfLines={1}>
          {item.description}
        </TText>
      )}
    </TouchableOpacity>
  );

  return (
    <TView style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}> 

        <Header title='Itinerary' subtitle='Manage your travel plans' type="major" />

        <TView style={styles.container}>
          <View style={styles.tabsContainer}>
            {ItineraryOptions.map((option, index) => (
              <TouchableOpacity
                style={[styles.tabs, selectedStatus === option.value && { borderBottomColor: secondaryColor, borderBottomWidth: 2 }]}
                onPress={() => setSelectedStatus(option.value as 'active' | 'done' | 'cancelled')}
              >
                <TIcon name={option.icon} size={15} color={selectedStatus === option.value ? secondaryColor : 'gray'} />
                <TText style={{ color: selectedStatus === option.value ? secondaryColor : 'gray' }}>{option.label}</TText>
              </TouchableOpacity>
            ))}
          </View>

          {isLoading ? (
            <View style={styles.listContent}>
              <ItineraryCardSkeleton />
              <ItineraryCardSkeleton />
            </View>
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
              renderItem={renderItineraryCard}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              scrollEnabled={false}
            />
          )}
        </TView>
      </ScrollView>

      <RoundButton
        iconName='plus'
        onPress={() => router.push('/itinerary/create')}
        style={styles.addButton}
      />
    </TView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: '3%',
  },
  errorContainer: {
    marginTop: 50,
  },
  listContent: {
    gap: 8,
  },
  itineraryCard: {
    borderRadius: 10,
    padding: '4%',
    gap: 5,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  cardDescription: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
  },
  dateText: {
    fontSize: 12,
    opacity: 0.7,
  },
  cardTabs: {
    flexDirection: 'row',
    gap: 4,
  },
  cardBubble: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  cardBubbleText: {
    fontSize: 11,
    fontWeight: '600',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc4',
  },
  tabs: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    height: 50,
    paddingBottom: 8,
    gap: 4,
  },
  addButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
});