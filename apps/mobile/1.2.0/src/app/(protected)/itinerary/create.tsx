import React from "react";
import { useCreateItinerary } from "@/hooks/itinerary/useCreateItinerary";
import ItineraryForm from "@/components/itinerary/Form";

export default function CreateRoomScreen() {
  const { create, isPending } = useCreateItinerary();

  return <ItineraryForm onSubmit={create} isSubmitting={isPending} viewType="owner" createMode/>;
}
