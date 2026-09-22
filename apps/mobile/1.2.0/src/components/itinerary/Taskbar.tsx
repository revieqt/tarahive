import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { TIcon, TText } from "@/components/ui/Themed";
import OptionsPopup from "@/components/ui/OptionsPopup";

interface TaskbarProps {
  primaryColor: string;
  onText: () => void;
  onHeading: (type: "header1" | "header2" | "header3") => void;
  onLocation: () => void;
  onChecklist: () => void;
  onDivider: () => void;
}

export default function Taskbar({
  primaryColor,
  onText,
  onHeading,
  onLocation,
  onChecklist,
  onDivider,
}: TaskbarProps) {
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: primaryColor }]}
      contentContainerStyle={styles.content}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      <TouchableOpacity style={styles.option} onPress={onText}>
        <TIcon name="format-text-variant" size={20} />
        <TText>Text</TText>
      </TouchableOpacity>
      <OptionsPopup
        options={[
          {
            label: "Header 1",
            iconName: "format-text-variant-outline",
            onPress: () => onHeading("header1"),
          },
          {
            label: "Header 2",
            iconName: "format-text-variant-outline",
            onPress: () => onHeading("header2"),
          },
          {
            label: "Header 3",
            iconName: "format-text-variant-outline",
            onPress: () => onHeading("header3"),
          },
        ]}
        style={styles.option}
      >
        <TIcon name="format-text-variant-outline" size={20} />
        <TText>Heading</TText>
      </OptionsPopup>
      <TouchableOpacity style={styles.option} onPress={onLocation}>
        <TIcon name="map-marker" size={20} />
        <TText>Location</TText>
      </TouchableOpacity>
      <TouchableOpacity style={styles.option} onPress={onChecklist}>
        <TIcon name="checkbox-marked-outline" size={20} />
        <TText>Checklist</TText>
      </TouchableOpacity>
      <TouchableOpacity style={styles.option} onPress={onDivider}>
        <TIcon name="format-horizontal-align-center" size={20} />
        <TText>Divider</TText>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, borderRadius: 10 },
  content: { padding: 8, gap: 5 },
  option: {
    padding: 5,
    borderWidth: 1,
    borderColor: "#ccc4",
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
});
