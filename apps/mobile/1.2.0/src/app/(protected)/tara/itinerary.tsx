import React, { useMemo } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';
import ItineraryForm from '@/components/itinerary/Form';
import { TText, TView } from '@/components/ui/Themed';
import { useCreateItinerary } from '@/hooks/itinerary/useCreateItinerary';
import { CreateItineraryForm } from '@/types/itineraryTypes';

const parseDraftFromParam = (value?: string | string[]) => {
  if (!value) {
    return null;
  }

  try {
    const payload = typeof value === 'string' ? JSON.parse(value) : Array.isArray(value) ? JSON.parse(value[0] ?? '{}') : value;
    const draft = payload?.itinerary ?? payload?.data ?? payload;

    if (!draft || typeof draft !== 'object') {
      return null;
    }

    return draft as Record<string, any>;
  } catch {
    return null;
  }
};

export default function TaraItineraryDraftScreen() {
  const { itineraryData } = useLocalSearchParams<{ itineraryData?: string | string[] }>();
  const { create, isPending } = useCreateItinerary();

  const initialValues = useMemo<CreateItineraryForm | null>(() => {
    const draft = parseDraftFromParam(itineraryData);

    if (!draft) {
      return null;
    }

    const startDate = typeof draft.startDate === 'string' ? new Date(draft.startDate) : null;
    const endDate = typeof draft.endDate === 'string' ? new Date(draft.endDate) : null;

    return {
      title: typeof draft.title === 'string' ? draft.title : '',
      type: typeof draft.type === 'string' ? draft.type : 'trip',
      startDate: startDate && !Number.isNaN(startDate.getTime()) ? startDate : null,
      endDate: endDate && !Number.isNaN(endDate.getTime()) ? endDate : null,
      themeColor: typeof draft.themeColor === 'string' ? draft.themeColor : '#FF6B6B',
      content: Array.isArray(draft.content) ? draft.content : [],
      privacy: 'private',
      generalPermissions: {
        allowSharing: true,
        allowCopying: true,
      },
    };
  }, [itineraryData]);

  if (!initialValues) {
    return (
      <TView style={styles.emptyState}>
        <TText type='title'>No itinerary draft available</TText>
        <TText style={styles.helperText}>Ask Tara to create one and tap the itinerary card to continue.</TText>
      </TView>
    );
  }

  return (
    <ItineraryForm
      initialValues={initialValues}
      onSubmit={create}
      isSubmitting={isPending}
      viewType='owner'
      createMode
    />
  );
}

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  helperText: {
    marginTop: 8,
    opacity: 0.7,
    textAlign: 'center',
  },
});
