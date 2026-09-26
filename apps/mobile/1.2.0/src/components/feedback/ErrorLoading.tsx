import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { TIcon, TText, TView } from "@/components/ui/Themed";
import { useThemeColor } from "@/hooks/shared/useThemeColor";

interface ErrorLoadingProps {
  onRetry: () => void;
  onBack: () => void;
  title?: string;
  message?: string;
}

export default function ErrorLoading({
  onRetry,
  onBack,
  title = "Unable to load",
  message = "Something went wrong while fetching this information. Try again or go back.",
}: ErrorLoadingProps) {
  const accentColor = useThemeColor({}, "accent");

  return (
    <TView style={styles.container}>
      <TIcon name="alert-circle-outline" size={72} color={accentColor} />
      <TText type="title" style={styles.title}>{title}</TText>
      <TText style={styles.message}>{message}</TText>
      <View style={styles.actions}>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={onRetry}
          style={[styles.button, { backgroundColor: accentColor }]}
        >
          <TIcon name="refresh" size={18} color="#fff" />
          <TText style={styles.buttonText}>Retry</TText>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={onBack}
          style={[styles.button, styles.secondaryButton]}
        >
          <TIcon name="chevron-left" size={18} color="#fff" />
          <TText style={styles.buttonText}>Go Back</TText>
        </TouchableOpacity>
      </View>
    </TView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 14,
  },
  title: {
    textAlign: "center",
  },
  message: {
    maxWidth: 320,
    textAlign: "center",
    opacity: 0.75,
  },
  actions: {
    width: "100%",
    maxWidth: 320,
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 8,
  },
  button: {
    minHeight: 44,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  secondaryButton: {
    backgroundColor: "#777",
  },
  buttonText: {
    color: "#fff",
  },
});