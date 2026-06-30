import React from "react";
import { View, StyleSheet } from "react-native";
import { useThemeColor } from "@/shared/hooks/useThemeColor";
import { TText, TIcon } from "../ui/Themed";
import { useLanguage } from "@/shared/context/LanguageContext";

export default function NoInternetCard() {
  const { t } = useLanguage();

  return (
    <View style={styles.container}>
      <TIcon name="wifi-off" size={30}/>
      <TText type='subtitle'>{t('common.no_internet.title')}</TText>
      <TText>{t('common.no_internet.subtitle')}</TText>
     </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 15,
    padding: 16,
    overflow: "hidden",
    gap: 8,
    borderWidth: 1,
    borderColor: '#ccc4',
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.7,
  },
});