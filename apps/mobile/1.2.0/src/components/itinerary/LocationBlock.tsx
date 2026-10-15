import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { TIcon, TText, TView } from "@/components/ui/Themed";
import { LocationBlockData } from "@/types/itineraryTypes";
import { useThemeColor } from "@/hooks/shared/useThemeColor";

interface LocationBlockProps {
  block: LocationBlockData;
  onPress: () => void;
  onMapPress?: () => void;
  onEditPress?: () => void;
  onLongPress: () => void;
  editable?: boolean;
  themeColor?: string;
}

export default function LocationBlock({
  block,
  onPress,
  onMapPress,
  onEditPress,
  onLongPress,
  editable = true,
  themeColor
}: LocationBlockProps) {
  return (
    <TView color="primary" style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={editable ? onPress : undefined}
        onLongPress={editable ? onLongPress : undefined}
        style={[styles.copy, {backgroundColor: themeColor + '20'}]}
      >
          <TText style={styles.name}>{block.locationName}</TText>
          <TText numberOfLines={1} style={styles.address}>
            {block.address?.neighborhood ? block.address.neighborhood + ', ' : null}
            {block.address?.district ? block.address.district + ', ' : null}
            {block.address?.city ? block.address.city + ' ' : null}
            {block.address?.postal_code ? block.address.postal_code + ', ' : block.address ? ', ' : null}
            {block.address?.region ? block.address.region + ', ' : null}
            {block.address?.country ? block.address.country : null}
          </TText>
      </TouchableOpacity>
      <View style={styles.actions}>
        {editable && (
          <TouchableOpacity
            onPress={onEditPress}
            style={styles.actionButton}
            accessibilityRole="button"
          >
            <TIcon name="pencil" size={15} />
            <TText style={styles.actionLabel}>Edit</TText>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={onMapPress}
          style={styles.actionButton}
          accessibilityRole="button"
        >
          <TIcon name="map-search" size={15} />
          <TText style={styles.actionLabel}>View Location</TText>
        </TouchableOpacity>
        
      </View>
    </TView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc2',
    overflow: 'hidden'
  },
  copy: { 
    flex: 1,
    padding: 8
  },
  name: { fontSize: 13, fontWeight: "600" },
  address: { fontSize: 11, opacity: 0.5 },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 2,
    padding: 4
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#9994",
    borderRadius: 20,
    opacity: .75
  },
  actionLabel: { fontSize: 11 },
});
