// hooks/useItinerary.ts

export function useCreateItinerary() {
  return {
    mutateAsync: async (data: any) => ({ _id: 'temp-id' }),
    isPending: false,
    isSuccess: false,
    data: { _id: 'temp-id' },
  };
}