import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { TIcon, TText, TView } from "@/components/ui/Themed";
import { LocationBlockData } from "./types";

interface LocationBlockProps {
  block: LocationBlockData;
  onPress: () => void;
  onMapPress: () => void;
  onLongPress: () => void;
}

export default function LocationBlock({
  block,
  onPress,
  onMapPress,
  onLongPress,
}: LocationBlockProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <TView color="primary" style={styles.container}>
        <View style={styles.copy}>
          <TText style={styles.name}>{block.locationName}</TText>
          <TText numberOfLines={1} style={styles.address}>
            {Object.values(block.address).filter(Boolean).join(", ") ||
              "Selected location"}
          </TText>
        </View>
        <TouchableOpacity onPress={onMapPress} style={styles.mapButton}>
          <TIcon name="map-search" size={20} />
        </TouchableOpacity>
      </TView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: "#9994",
    padding: 8,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  copy: { flex: 1, paddingRight: 8 },
  name: { fontSize: 13, fontWeight: "600" },
  address: { fontSize: 11, opacity: 0.5 },
  mapButton: {
    borderLeftWidth: 1,
    borderColor: "#9994",
    padding: 5,
    paddingLeft: 8,
  },
});
