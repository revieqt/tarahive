import React, { useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, FlatList } from "react-native";
import { TIcon, TText, TView } from "@/shared/components/ui/Themed";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useThemeColor } from "@/shared/hooks/useThemeColor";
import { showError } from "@/shared/services/toast.service";
import HiveBg from "@/shared/components/common/HiveBg";
import Header from "@/shared/components/common/Header";
import RoundButton from "@/shared/components/ui/RoundButton";
import { router } from "expo-router";
import { useGetUserItineraries } from "@/features/itinerary/hooks/useGetUserItineraries";
import { Itinerary } from "@/features/itinerary/types/itinerary.types";

export default function ItineraryScreen() {
  const { t } = useLanguage();
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const { itineraries, isLoading, isError } = useGetUserItineraries();

  const handleItineraryPress = (id: string) => {
    router.push(`/itinerary/${id}`);
  };

  const renderItineraryCard = ({ item }: { item: Itinerary }) => (
    <TouchableOpacity
      onPress={() => handleItineraryPress(item.id)}
      style={[styles.itineraryCard, { borderColor: secondaryColor }]}
    >
      <View style={styles.cardHeader}>
        <TText style={styles.cardTitle} numberOfLines={1}>{item.title}</TText>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <TText style={styles.statusText}>{item.status}</TText>
        </View>
      </View>

      <TText style={styles.cardType}>{item.type}</TText>

      <TText style={styles.cardDescription} numberOfLines={2}>
        {item.description}
      </TText>

      <View style={styles.cardDates}>
        <TText style={styles.dateText}>
          {new Date(item.startDate).toLocaleDateString()}
        </TText>
        <TText style={styles.dateText}>-</TText>
        <TText style={styles.dateText}>
          {new Date(item.endDate).toLocaleDateString()}
        </TText>
      </View>
    </TouchableOpacity>
  );

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return '#4CAF50';
      case 'cancelled':
        return '#F44336';
      case 'done':
        return '#2196F3';
      default:
        return secondaryColor;
    }
  };

  return (
    <TView style={styles.container}>
      <Header title='Itinerary' subtitle='Manage your travel plans' type="minor"/>

      {isLoading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={secondaryColor} />
        </View>
      ) : isError || !itineraries || itineraries.length === 0 ? (
        <View style={styles.centerContent}>
          <TIcon name="inbox" size={48} color={secondaryColor} />
          <TText style={styles.emptyText}>
            {isError ? 'Failed to load itineraries' : 'No itineraries yet'}
          </TText>
          <TText style={styles.emptySubText}>
            {isError ? 'Please try again later' : 'Create one to get started'}
          </TText>
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
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 14,
    opacity: 0.6,
  },
  listContent: {
    paddingVertical: 8,
    gap: 12,
  },
  itineraryCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFF',
  },
  cardType: {
    fontSize: 13,
    opacity: 0.7,
  },
  cardDescription: {
    fontSize: 13,
    opacity: 0.6,
  },
  cardDates: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  dateText: {
    fontSize: 12,
    opacity: 0.7,
  },
  addButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
});