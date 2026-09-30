import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { TIcon, TText } from "@/components/ui/Themed";
import OptionsPopup from "@/components/ui/OptionsPopup";
import { useLanguage } from "@/context/LanguageContext";

interface ToolbarProps {
  primaryColor: string;
  onText: () => void;
  onHeading: (type: "header1" | "header2" | "header3") => void;
  onLocation: () => void;
  onChecklist: () => void;
  onDivider: () => void;
}

export default function Toolbar({
  primaryColor,
  onText,
  onHeading,
  onLocation,
  onChecklist,
  onDivider,
}: ToolbarProps) {
  const { t } = useLanguage();
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: primaryColor }]}
      contentContainerStyle={styles.content}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      <TouchableOpacity style={styles.option} onPress={onText}>
        <TIcon name="format-text-variant" size={20} />
      </TouchableOpacity>
      <OptionsPopup
        options={[
          {
            label: t('itinerary.form.header_block') + " 1",
            iconName: "format-text-variant-outline",
            onPress: () => onHeading("header1"),
          },
          {
            label: t('itinerary.form.header_block') + " 2",
            iconName: "format-text-variant-outline",
            onPress: () => onHeading("header2"),
          },
          {
            label: t('itinerary.form.header_block') + " 3",
            iconName: "format-text-variant-outline",
            onPress: () => onHeading("header3"),
          },
        ]}
        style={styles.option}
      >
        <TIcon name="format-text-variant-outline" size={20} />
      </OptionsPopup>
      <TouchableOpacity style={styles.option} onPress={onLocation}>
        <TIcon name="map-marker" size={20} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.option} onPress={onChecklist}>
        <TIcon name="checkbox-marked-outline" size={20} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.option} onPress={onDivider}>
        <TIcon name="format-horizontal-align-center" size={20} />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    borderRadius: 50 ,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  content: { padding: 8, gap: 5 },
  option: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
});
