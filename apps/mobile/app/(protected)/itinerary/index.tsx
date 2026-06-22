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

      <TText style={styles.cardDescription} numberOfLines={1}>
        {item.description}
      </TText>
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <Header title='Itinerary' subtitle='Manage your travel plans' type="major" />
      <TView style={styles.container}>
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tabs, selectedStatus === 'active' && { borderBottomColor: secondaryColor, borderBottomWidth: 2 }]}
            onPress={() => setSelectedStatus('active')}
          >
            <TIcon name="cards-heart" size={15} color={selectedStatus === 'active' ? secondaryColor : 'gray'} />
            <TText style={{ color: selectedStatus === 'active' ? secondaryColor : 'gray' }}>Active</TText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabs, selectedStatus === 'done' && { borderBottomColor: secondaryColor, borderBottomWidth: 2 }]}
            onPress={() => setSelectedStatus('done')}
          >
            <TIcon name="check-circle" size={15} color={selectedStatus === 'done' ? secondaryColor : 'gray'} />
            <TText style={{ color: selectedStatus === 'done' ? secondaryColor : 'gray' }}>Completed</TText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabs, selectedStatus === 'cancelled' && { borderBottomColor: secondaryColor, borderBottomWidth: 2 }]}
            onPress={() => setSelectedStatus('cancelled')}
          >
            <TIcon name="close-circle" size={15} color={selectedStatus === 'cancelled' ? secondaryColor : 'gray'} />
            <TText style={{ color: selectedStatus === 'cancelled' ? secondaryColor : 'gray' }}>Cancelled</TText>
          </TouchableOpacity>
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
      <RoundButton
        iconName='plus'
        onPress={() => router.push('/itinerary/create')}
        style={styles.addButton}
      />
    </ScrollView>

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
  },
  dateText: {
    fontSize: 12,
    opacity: 0.7,
  },
  cardTabs: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
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