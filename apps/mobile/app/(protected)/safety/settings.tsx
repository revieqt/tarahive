import React, { useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { TIcon, TText, TView } from "@/shared/components/ui/Themed";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useThemeColor } from "@/shared/hooks/useThemeColor";
import { showError } from "@/shared/services/toast.service";
import HiveBg from "@/shared/components/common/HiveBg";
import Header from "@/shared/components/common/Header";

export default function SafetySettingsScreen() {
  const { t } = useLanguage();

  return (
    <TView style={styles.container}>
      <HiveBg />
      <Header title={t("settings.visibility.title")} subtitle={t("settings.visibility.subtitle")} />

    </TView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  languageList: {
    flex: 1,
  },
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 15,
  },
  languageInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  flag: {
    fontSize: 20,
    marginRight: 12,
  },
  nativeName: {
    fontSize: 12,
    opacity: 0.5,
  },
  checkmark: {
    fontSize: 20,
    color: "#FFC94D",
    fontWeight: "bold",
  },
});