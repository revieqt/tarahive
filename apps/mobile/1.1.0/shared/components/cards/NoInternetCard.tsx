import React from "react";
import { StyleSheet } from "react-native";
import { TText, TIcon, TView } from "../ui/Themed";
import { useLanguage } from "@/shared/context/LanguageContext";

export default function NoInternetCard() {
  const { t } = useLanguage();

  return (
    <TView style={styles.container} color="primary" shadow>
      <TIcon name="wifi-off" size={30}/>
      <TText type='subtitle'>{t('common.no_internet.title')}</TText>
      <TText style={styles.subtitle}>{t('common.no_internet.subtitle')}</TText>
     </TView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 15,
    padding: 16,
    overflow: "hidden",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.7,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 11,
    opacity: 0.7,
  },
});