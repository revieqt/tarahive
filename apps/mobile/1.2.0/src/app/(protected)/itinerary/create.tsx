import React, { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateItinerary } from "@/hooks/itinerary/useCreateItinerary";
import ItineraryForm from "@/components/itinerary/Form";
import { CreateItineraryForm } from "@/types/itineraryTypes";

export default function CreateRoomScreen() {
  const queryClient = useQueryClient();
  const { itineraryData } = useLocalSearchParams<{ itineraryData?: string | string[] }>();
  const [repeatInitialValues] = useState(() =>
    queryClient.getQueryData<CreateItineraryForm>(["itinerary-repeat-draft"])
  );
  const aiInitialValues = useMemo<CreateItineraryForm | undefined>(() => {
    if (!itineraryData) return undefined;

    try {
      const rawValue = Array.isArray(itineraryData) ? itineraryData[0] : itineraryData;
      const payload = JSON.parse(rawValue ?? '{}');
      const draft = payload?.itinerary ?? payload?.data?.itinerary ?? payload?.data ?? payload;
      if (!draft || typeof draft !== 'object') return undefined;

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
        generalPermissions: { allowSharing: true, allowCopying: true },
      };
    } catch {
      return undefined;
    }
  }, [itineraryData]);
  const { create, isPending } = useCreateItinerary();

  useEffect(() => {
    queryClient.removeQueries({ queryKey: ["itinerary-repeat-draft"], exact: true });
  }, [queryClient]);

  return <ItineraryForm initialValues={aiInitialValues ?? repeatInitialValues} onSubmit={create} isSubmitting={isPending} viewType="owner" createMode/>;
}
