import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { TIcon, TText, TView } from "@/components/ui/Themed";
import { LocationBlockData } from "@/types/itineraryTypes";

interface LocationBlockProps {
  block: LocationBlockData;
  onPress: () => void;
  onMapPress?: () => void;
  onLongPress: () => void;
  editable?: boolean;
}

export default function LocationBlock({
  block,
  onPress,
  onMapPress,
  onLongPress,
  editable = true,
}: LocationBlockProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={editable ? onPress : undefined}
      onLongPress={editable ? onLongPress : undefined}
    >
      <TView color="primary" style={styles.container}>
        <View style={styles.copy}>
          <TText style={styles.name}>{block.locationName}</TText>
          <TText numberOfLines={1} style={styles.address}>
            {block.address?.neighborhood ? block.address.neighborhood + ', ' : null}
            {block.address?.district ? block.address.district + ', ' : null}
            {block.address?.city ? block.address.city + ' ' : null}
            {block.address?.postal_code ? block.address.postal_code + ', ' : block.address ? ', ' : null}
            {block.address?.region ? block.address.region + ', ' : null}
            {block.address?.country ? block.address.country : null}
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
    padding: 8,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: '#ccc4'
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
