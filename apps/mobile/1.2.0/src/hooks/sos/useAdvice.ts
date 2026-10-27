import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/context/LanguageContext";
import { getSOSAdvice } from "@/services/sosService";

export const useAdvice = (
  emergencyType: string | null,
  enabled: boolean,
) => {
  const { currentLanguage } = useLanguage();
  const adviceQuery = useQuery({
    queryKey: ["sos-advice", emergencyType, currentLanguage.code],
    queryFn: async () => {
      if (!emergencyType) {
        throw new Error("An emergency type is required to load advice.");
      }

      const response = await getSOSAdvice(emergencyType, currentLanguage.code);
      if (typeof response.advice !== "string" || !response.advice) {
        throw new Error("Emergency advice was not included in the response.");
      }
      return response.advice;
    },
    enabled: enabled && !!emergencyType,
    staleTime: 5 * 60 * 1000,
  });

  return {
    advice: adviceQuery.data ?? null,
    isLoading: adviceQuery.isLoading || adviceQuery.isFetching,
    error: adviceQuery.error instanceof Error
      ? adviceQuery.error.message
      : adviceQuery.error
        ? "Unable to load emergency advice."
        : null,
    retryAdvice: () => void adviceQuery.refetch(),
  };
};