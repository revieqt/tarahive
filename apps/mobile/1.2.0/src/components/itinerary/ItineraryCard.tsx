import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { TIcon, TText, TView } from "@/components/ui/Themed";
import OptionsPopup from "@/components/ui/OptionsPopup";
import { useLanguage } from "@/context/LanguageContext";
import { useSession } from "@/context/SessionContext";
import { useThemeColor } from "@/hooks/shared/useThemeColor";
import { Itinerary, getStatusColor } from "@/types/itineraryTypes";
import { formatDateToString } from "@/utils/formatDateToString";

interface ItineraryCardProps {
  itinerary: Itinerary;
}

export default function ItineraryCard({ itinerary }: ItineraryCardProps) {
  const { t, currentLanguage } = useLanguage();
  const { session } = useSession();
  const primaryColor = useThemeColor({}, "primary");
  const accentColor = useThemeColor({}, "accent");
  const isSharedWithUser = Boolean(
    session?.user?.id &&
      itinerary.user?.id &&
      session.user.id !== itinerary.user.id
  );

  return (
    <TouchableOpacity
      onPress={() => router.push(`/itinerary/${itinerary.id}`)}
      style={[
        styles.itineraryCard,
        {
          backgroundColor: primaryColor,
          borderColor: getStatusColor(itinerary.status),
        },
      ]}
    >
      <TText style={styles.cardTitle} numberOfLines={1}>
        {itinerary.title}
      </TText>
      <TText style={styles.dateText}>
        {formatDateToString(
          new Date(itinerary.startDate),
          currentLanguage.code
        )}{" "}
        -{" "}
        {formatDateToString(new Date(itinerary.endDate), currentLanguage.code)}
      </TText>

      <View style={styles.cardTabs}>
        <TView style={[styles.cardBubble, { backgroundColor: `${accentColor}80` }]}>
          <TText style={styles.cardBubbleText}>
            {t(`itinerary.type.${itinerary.type}`)}
          </TText>
        </TView>

        {isSharedWithUser && (
          <TView style={[styles.cardBubble, { backgroundColor: "#ccc" }]}>
            <TText style={styles.cardBubbleText}>Shared with you</TText>
          </TView>
        )}
      </View>

      <OptionsPopup
        options={[
          {
            label: t("itinerary.form.room_button"),
            iconName: "tooltip-account",
            onPress: () => router.push({ pathname: "/share" }),
          },
          {
            label: t("itinerary.form.complete_button"),
            iconName: "check-circle",
            onPress: () => router.push({ pathname: "/share" }),
          },
          {
            label: t("itinerary.form.cancel_button"),
            iconName: "close-circle",
            onPress: () => router.push({ pathname: "/share" }),
          },
          {
            label: t("itinerary.form.delete_button"),
            iconName: "trash-can",
            onPress: () => router.push({ pathname: "/share" }),
          },
        ]}
        style={styles.optionsButton}
      >
        <TIcon name="dots-vertical" size={20} />
      </OptionsPopup>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  itineraryCard: {
    borderRadius: 15,
    padding: "3%",
    gap: 3,
    overflow: "hidden",
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "700",
    flex: 1,
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
  optionsButton: {
    borderColor: "#ccc1",
    borderLeftWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    right: -10,
    bottom: -10,
    top: -78,
    width: 30,
  },
});
