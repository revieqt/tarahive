import React from 'react';
import { Modal, FlatList, TouchableOpacity, View, StyleSheet, ActivityIndicator } from 'react-native';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { ThemedIcons } from '../ThemedIcons';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useGetUserItineraries } from '@/hooks/useItinerary';
import { SafeAreaView } from 'react-native-safe-area-context';
import Wave from '../Wave';
import { formatDateToString } from '@/utils/formatDateToString';

interface Itinerary {
  _id: string;
  title: string;
  description?: string;
}

interface ItineraryPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectItinerary: (itinerary: Itinerary) => void;
  selectedItinerary?: Itinerary | null;
}

export default function ItineraryPickerModal({
  visible,
  onClose,
  onSelectItinerary,
  selectedItinerary,
}: ItineraryPickerModalProps) {
const backgroundColor = useThemeColor({}, 'background');
  const accentColor = useThemeColor({}, 'accent');
  const { data: itineraries, isLoading, error } = useGetUserItineraries();

  const itineraryList = itineraries || [];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ThemedView style={styles.modalContainer} color="primary">
          <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 }}>
            <TouchableOpacity onPress={onClose}>
              <ThemedIcons name="arrow-left" size={24} />
            </TouchableOpacity>
            <ThemedText type="title">Select Itinerary</ThemedText>
          </View>

          {isLoading ? (
            <View style={styles.centeredContainer}>
              <ActivityIndicator size="large" />
            </View>
          ) : error ? (
            <View style={styles.centeredContainer}>
              <ThemedText style={{ opacity: 0.5 }}>Error loading itineraries</ThemedText>
            </View>
          ) : itineraryList.length > 0 ? (
            <FlatList
              data={itineraryList}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.itineraryList}
              scrollEnabled={true}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.itineraryCard,
                    { backgroundColor: backgroundColor },
                    selectedItinerary?._id === item._id && styles.itineraryCardSelected,
                  ]}
                  onPress={() => {
                    onSelectItinerary(item);
                    onClose();
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <ThemedText type="subtitle">{item.title}</ThemedText>
                    
                    {item.description && (
                      <ThemedText style={{ fontSize: 12, opacity: 0.7}}>
                        {item.description}
                      </ThemedText>
                    )}
                    <ThemedText style={{opacity: 0.7, fontSize: 11, marginTop: 4}}>{formatDateToString(item.startDate)} - {formatDateToString(item.endDate)}</ThemedText>
                  </View>
                  {selectedItinerary?._id === item._id && (
                    <ThemedIcons name="check-circle" size={24} color={accentColor} />
                  )}
                </TouchableOpacity>
              )}
            />
          ) : (
            <View style={styles.centeredContainer}>
              <ThemedText style={{ opacity: 0.5 }}>No itineraries found</ThemedText>
            </View>
          )}

          <Wave
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, opacity: 0.7 }}
            color={accentColor}
            height={70}
          />
        </ThemedView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  itineraryList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  itineraryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  itineraryCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: 'rgba(0,122,255,0.1)',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
