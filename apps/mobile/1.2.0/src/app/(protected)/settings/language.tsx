import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { TIcon, TText, TView } from "@/components/ui/Themed";
import { LANGUAGES } from "@/constants/Languages";
import { useLanguage } from "@/context/LanguageContext";
import { useThemeColor } from "@/hooks/shared/useThemeColor";
import { showError } from "@/services/toast.service";
import Header from "@/components/common/Header";

export default function LanguageSettingsScreen() {
  const { currentLanguage, downloadedLanguages, setLanguage, loading, t } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage.code);
  const backgroundColor = useThemeColor({}, 'primary');
  const checkColor = useThemeColor({}, 'secondary');
  const english = LANGUAGES.find((language) => language.code === "en");
  const availableLanguages = LANGUAGES.filter(
    (language) =>
      language.code !== "en" &&
      !downloadedLanguages.some((downloaded) => downloaded.code === language.code),
  );

  useEffect(() => {
    setSelectedLanguage(currentLanguage.code);
  }, [currentLanguage.code]);

  const handleLanguageSelect = async (languageCode: string) => {
    setSelectedLanguage(languageCode);
    try {
      await setLanguage(languageCode);
    } catch (error) {
      setSelectedLanguage(currentLanguage.code);
      showError("Failed to change language", "Please try again.");
    }
  };

  function renderLanguage(language: (typeof LANGUAGES)[number]) {
    return (
      <TouchableOpacity
        key={language.code}
        style={[styles.languageItem, { backgroundColor }]}
        onPress={() => handleLanguageSelect(language.code)}
        disabled={loading}
      >
        <View style={styles.languageInfo}>
          <TText style={styles.flag}>{language.flag}</TText>
          <View>
            <TText>{language.name}</TText>
            <TText style={styles.nativeName}>{language.nativeName}</TText>
          </View>
        </View>
        {selectedLanguage === language.code && !loading && (
          <TIcon name="check" color={checkColor} size={20} />
        )}
        {selectedLanguage === language.code && loading && (
          <ActivityIndicator size="small" />
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TView style={styles.container}>
      <Header title={t("users.language.title")} subtitle={t("users.language.subtitle")} />

      <ScrollView style={styles.languageList}>
        {english && renderLanguage(english)}

        {downloadedLanguages.length > 0 && (
          <>
            <TText style={styles.sectionTitle}>Downloaded Languages</TText>
            {downloadedLanguages.map(renderLanguage)}
          </>
        )}

        {availableLanguages.length > 0 && (
          <>
            <TText style={styles.sectionTitle}>Download Languages</TText>
            {availableLanguages.map(renderLanguage)}
          </>
        )}
      </ScrollView>
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    opacity: 0.65,
    marginTop: 12,
    marginBottom: 8,
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