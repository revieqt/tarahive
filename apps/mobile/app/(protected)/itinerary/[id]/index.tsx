import React from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { TIcon, TText, TView } from "@/shared/components/ui/Themed";
import { useThemeColor } from "@/shared/hooks/useThemeColor";
import HiveBg from "@/shared/components/common/HiveBg";
import Header from "@/shared/components/common/Header";
import BackButton from "@/shared/components/common/BackButton";
import { router, useLocalSearchParams } from "expo-router";
import { useGetItinerary } from "@/features/itinerary/hooks/useGetItinerary";
import { showError } from "@/shared/services/toast.service";

export default function ItineraryDetailScreen() {
  const textColor = useThemeColor({}, 'text');
  const secondaryColor = useThemeColor({}, 'secondary');
  const { id } = useLocalSearchParams<{ id: string }>();
  const { itinerary, isLoading, isError, error } = useGetItinerary(id || null);

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

  if (!id) {
    return (
      <TView style={styles.container}>
        <HiveBg />
        <Header title='Itinerary' />
        <View style={styles.centerContent}>
          <TText>Invalid itinerary ID</TText>
        </View>
      </TView>
    );
  }

  return (
    <TView style={styles.container}>
      <HiveBg />
      <Header title='Itinerary Details' />

      {isLoading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={secondaryColor} />
        </View>
      ) : isError || !itinerary ? (
        <View style={styles.centerContent}>
          <TIcon name="alert-circle" size={48} color={secondaryColor} />
          <TText style={styles.errorText}>Failed to load itinerary</TText>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: secondaryColor }]}
            onPress={() => router.back()}
          >
            <TText style={styles.retryButtonText}>Go Back</TText>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.detailsCard}>
            {/* Header Section */}
            <View style={styles.headerSection}>
              <View style={styles.titleRow}>
                <TText style={styles.title}>{itinerary.title}</TText>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(itinerary.status) },
                  ]}
                >
                  <TText style={styles.statusText}>{itinerary.status}</TText>
                </View>
              </View>

              <TText style={styles.type}>{itinerary.type}</TText>
            </View>

            {/* Description */}
            {itinerary.description && (
              <View style={styles.section}>
                <TText style={styles.sectionTitle}>Description</TText>
                <TText style={styles.description}>{itinerary.description}</TText>
              </View>
            )}

            {/* Dates */}
            <View style={styles.section}>
              <TText style={styles.sectionTitle}>Travel Dates</TText>

              <View style={styles.dateRow}>
                <View style={styles.dateBox}>
                  <TText style={styles.dateLabel}>Start Date</TText>
                  <TText style={styles.dateValue}>
                    {new Date(itinerary.startDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </TText>
                </View>

                <View style={styles.dateBox}>
                  <TText style={styles.dateLabel}>End Date</TText>
                  <TText style={styles.dateValue}>
                    {new Date(itinerary.endDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </TText>
                </View>
              </View>
            </View>

            {/* Duration */}
            <View style={styles.section}>
              <TText style={styles.sectionTitle}>Duration</TText>
              <TText style={styles.duration}>
                {Math.ceil(
                  (new Date(itinerary.endDate).getTime() -
                    new Date(itinerary.startDate).getTime()) /
                    (1000 * 60 * 60 * 24)
                )}{' '}
                days
              </TText>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: secondaryColor }]}
              onPress={() => router.push(`/itinerary/${id}/edit`)}
            >
              <TIcon name="edit-2" size={20} color="#FFF" />
              <TText style={styles.buttonText}>Edit</TText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#F44336' }]}
              onPress={() => router.push(`/itinerary/${id}/delete`)}
            >
              <TIcon name="trash-2" size={20} color="#FFF" />
              <TText style={styles.buttonText}>Delete</TText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </TView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  scrollContent: {
    paddingVertical: 8,
    paddingBottom: 32,
    gap: 16,
  },
  detailsCard: {
    borderRadius: 16,
    padding: 16,
    gap: 20,
  },
  headerSection: {
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  type: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.7,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 16,
  },
  dateBox: {
    flex: 1,
    gap: 8,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.6,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  duration: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
});
