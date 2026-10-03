import React, { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateItinerary } from "@/hooks/itinerary/useCreateItinerary";
import ItineraryForm from "@/components/itinerary/Form";
import { CreateItineraryForm } from "@/types/itineraryTypes";

export default function CreateRoomScreen() {
  const queryClient = useQueryClient();
  const [initialValues] = useState(() =>
    queryClient.getQueryData<CreateItineraryForm>(["itinerary-repeat-draft"])
  );
  const { create, isPending } = useCreateItinerary();

  useEffect(() => {
    queryClient.removeQueries({ queryKey: ["itinerary-repeat-draft"], exact: true });
  }, [queryClient]);

  return <ItineraryForm initialValues={initialValues} onSubmit={create} isSubmitting={isPending} viewType="owner" createMode/>;
}
