import React, { useState } from "react";
import { Pressable, StyleSheet, TextInput } from "react-native";
import { HeaderBlock as HeaderBlockData } from "@/types/itineraryTypes";
import { useThemeColor } from "@/hooks/shared/useThemeColor";
import { useLanguage } from "@/context/LanguageContext";

interface HeadingBlockProps {
  block: HeaderBlockData;
  onChange: (value: string) => void;
  onPress: () => void;
  onLongPress: () => void;
  onContentSizeChange?: (height: number) => void;
  editable?: boolean;
}

export default function HeadingBlock({
  block,
  onChange,
  onPress,
  onLongPress,
  onContentSizeChange,
  editable = true,
}: HeadingBlockProps) {
  const sizes = { header1: 22, header2: 18, header3: 15 };
  const [height, setHeight] = useState(30);
  const textColor = useThemeColor({}, "text");
  const { t } = useLanguage();

  return (
    <Pressable onPress={editable ? onPress : undefined} onLongPress={editable ? onLongPress : undefined} delayLongPress={350}>
      <TextInput
        value={block.value}
        onChangeText={onChange}
        editable={editable}
        onFocus={onPress}
        placeholder={
          block.type === "header1"
            ? t('itinerary.form.header_block') + " 1"
            : block.type === "header2"
            ? t('itinerary.form.header_block') + " 2"
            : t('itinerary.form.header_block') + " 3"
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
