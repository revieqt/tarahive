import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { THEME_COLORS } from "@/types/itineraryTypes";
import { TIcon } from "../ui/Themed";

interface ColorBarProps {
  primaryColor: string;
  selectedColor: string;
  onSelect: (color: string) => void;
}

export default function ColorBar({
  primaryColor,
  selectedColor,
  onSelect,
}: ColorBarProps) {
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: primaryColor }]}
      contentContainerStyle={styles.content}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {THEME_COLORS.map((theme) => (
        <TouchableOpacity
          key={theme.value}
          style={styles.option}
          onPress={() => onSelect(theme.value)}
          accessibilityLabel={`Select ${theme.label}`}
        >
          <View
            style={[
              styles.swatch,
              { backgroundColor: theme.value },
              selectedColor === theme.value && styles.selectedSwatch,
            ]}
          />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  content: { padding: 8, gap: 5 },
  option: {
    padding: 5,
    borderRadius: 15,
    alignItems: "center",
  },
  swatch: { width: 24, height: 24, borderRadius: 12 },
  selectedSwatch: { borderWidth: 3, borderColor: "#ccc" },
});
