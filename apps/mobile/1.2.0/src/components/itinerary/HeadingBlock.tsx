import React, { useState } from "react";
import { Pressable, StyleSheet, TextInput } from "react-native";
import { HeaderBlock as HeaderBlockData } from "./types";
import { useThemeColor } from "@/hooks/shared/useThemeColor";

interface HeadingBlockProps {
  block: HeaderBlockData;
  onChange: (value: string) => void;
  onPress: () => void;
  onLongPress: () => void;
  onContentSizeChange?: (height: number) => void;
}

export default function HeadingBlock({
  block,
  onChange,
  onPress,
  onLongPress,
  onContentSizeChange,
}: HeadingBlockProps) {
  const sizes = { header1: 22, header2: 18, header3: 15 };
  const [height, setHeight] = useState(30);
  const textColor = useThemeColor({}, "text");
  return (
    <Pressable onPress={onPress} onLongPress={onLongPress} delayLongPress={350}>
      <TextInput
        value={block.value}
        onChangeText={onChange}
        onFocus={onPress}
        placeholder={
          block.type === "header1"
            ? "Header 1"
            : block.type === "header2"
            ? "Header 2"
            : "Header 3"
        }
        placeholderTextColor="#999"
        style={[styles.input, { fontSize: sizes[block.type], height, color: textColor }]}
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
  input: { padding: 0, fontFamily: "Inter", fontWeight: "800" },
});
