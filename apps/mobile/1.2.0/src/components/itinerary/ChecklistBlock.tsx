import React, { useState } from "react";
import { Pressable, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { TIcon } from "@/components/ui/Themed";
import { ChecklistBlock as ChecklistBlockData } from "./types";
import { useThemeColor } from "@/hooks/shared/useThemeColor";

interface ChecklistBlockProps {
  block: ChecklistBlockData;
  onChange: (changes: Partial<ChecklistBlockData>) => void;
  onPress: () => void;
  onLongPress: () => void;
  onContentSizeChange?: (height: number) => void;
}

export default function ChecklistBlock({
  block,
  onChange,
  onPress,
  onLongPress,
  onContentSizeChange,
}: ChecklistBlockProps) {
  const [height, setHeight] = useState(30);
  const textColor = useThemeColor({}, "text");
  return (
    <Pressable style={styles.row} onPress={onPress} onLongPress={onLongPress} delayLongPress={350}>
      <TouchableOpacity
        onPress={() => onChange({ checked: !block.checked })}
        style={styles.check}
      >
        <TIcon
          name={block.checked ? "checkbox-marked" : "checkbox-blank-outline"}
          size={22}
        />
      </TouchableOpacity>
      <TextInput
        value={block.value}
        onChangeText={(value) => onChange({ value })}
        placeholder="Checklist item"
        placeholderTextColor="#999"
        style={[styles.input, { height, color: textColor }, block.checked && styles.completed]}
        onFocus={onPress}
        multiline
        textAlignVertical="top"
        onContentSizeChange={(event) => {
          const nextHeight = Math.max(30, event.nativeEvent.contentSize.height);
          setHeight(nextHeight);
          onContentSizeChange?.(nextHeight);
        }}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start", minHeight: 38 },
  check: { padding: 5 },
  input: {
    flex: 1,
    paddingVertical: 5,
    fontFamily: "Inter",
    fontSize: 14,
  },
  completed: { textDecorationLine: "line-through", opacity: 0.55 },
});
