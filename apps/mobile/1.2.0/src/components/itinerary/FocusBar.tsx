import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { TIcon, TText } from "@/components/ui/Themed";

interface FocusBarProps {
  primaryColor: string;
  onDone: () => void;
  onDelete: () => void;
}
export default function FocusBar({
  primaryColor,
  onDone,
  onDelete,
}: FocusBarProps) {
  return (
    <View style={[styles.container, { backgroundColor: primaryColor }]}>
      <TouchableOpacity style={styles.option} onPress={onDone}>
        <TIcon name="check" size={20} />
        <TText>Done</TText>
      </TouchableOpacity>
      <TouchableOpacity style={styles.option} onPress={onDelete}>
        <TIcon name="trash-can" size={20} />
        <TText>Delete Block</TText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 10,
    padding: 8,
    gap: 5,
    flexDirection: "row",
  },
  option: {
    flex: 1,
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
