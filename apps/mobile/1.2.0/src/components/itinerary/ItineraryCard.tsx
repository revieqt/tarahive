import React, { type ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { TText, TView } from "@/components/ui/Themed";
import { useLanguage } from "@/context/LanguageContext";
import { useThemeColor } from "@/hooks/shared/useThemeColor";
import { formatDateToString } from "@/utils/formatDateToString";

interface ItineraryCardProps {
  id: string;
  title: string;
  type: string;
  startDate: string | Date;
  endDate: string | Date;
  pressable?: boolean;
  options?: ReactNode;
}

export default function ItineraryCard({
  id,
  title,
  type,
  startDate,
  endDate,
  pressable = true,
  options,
}: ItineraryCardProps) {
  const { t, currentLanguage } = useLanguage();
  const primaryColor = useThemeColor({}, "primary");
  const accentColor = useThemeColor({}, "accent");

  const content = (
    <View style={styles.cardContent}>
      <TText style={styles.cardTitle} numberOfLines={1}>
        {title}
      </TText>
      <TText style={styles.dateText}>
        {formatDateToString(startDate, currentLanguage.code)} -{" "}
        {formatDateToString(endDate, currentLanguage.code)}
      </TText>

      <View style={styles.cardTabs}>
        <TView style={[styles.cardBubble, { backgroundColor: `${accentColor}80` }]}>
          <TText style={styles.cardBubbleText}>
            {t(`itinerary.type.${type}`)}
          </TText>
        </TView>
      </View>
    </View>
  );

  return (
    <View style={[styles.itineraryCard, { backgroundColor: primaryColor }]}>
      {pressable ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(`/itinerary/${id}`)}
          style={styles.contentPressable}
        >
          {content}
        </Pressable>
      ) : (
        content
      )}
      {options ? <View style={styles.options}>{options}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  itineraryCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 15,
    overflow: "hidden",
  },
  contentPressable: {
    flex: 1,
  },
  cardContent: {
    padding: "3%",
    gap: 3,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  dateText: {
    fontSize: 11,
    opacity: 0.7,
  },
  cardTabs: {
    flexDirection: "row",
    gap: 4,
  },
  cardBubble: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  cardBubbleText: {
    fontSize: 11,
    color: "#fff",
  },
  options: {
    paddingHorizontal: 10,
  },
});
