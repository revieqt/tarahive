import React, { useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { TIcon, TText, TView } from "@/shared/components/ui/Themed";
import { LANGUAGES } from "@/shared/constants/Languages";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useThemeColor } from "@/shared/hooks/useThemeColor";
import { showError } from "@/shared/services/toast.service";
import HiveBg from "@/shared/components/common/HiveBg";
import Header from "@/shared/components/common/Header";

export default function VisibilitySettingsScreen() {
  const { currentLanguage, setLanguage, isLoading } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage.code);
  const backgroundColor = useThemeColor({}, 'primary');
  const checkColor = useThemeColor({}, 'secondary');

  const handleLanguageSelect = async (languageCode: string) => {
    setSelectedLanguage(languageCode);
    try {
      await setLanguage(languageCode);
    } catch (error) {
      setSelectedLanguage(currentLanguage.code);
      showError("Failed to change language", "Please try again.");
    }
  };

  return (
    <TView style={styles.container}>
      <HiveBg />
      <Header title="Visibility" subtitle="Manage your visibility settings." />

      <ScrollView style={styles.languageList}>
        {LANGUAGES.map((language) => (
          <TouchableOpacity
            key={language.code}
            style={[
              styles.languageItem,
              { backgroundColor },
            ]}
            onPress={() => handleLanguageSelect(language.code)}
            disabled={isLoading}
          >
            <View style={styles.languageInfo}>
              <TText style={styles.flag}>{language.flag}</TText>
              <View>
                <TText>{language.name}</TText>
                <TText style={styles.nativeName}>{language.nativeName}</TText>
              </View>
            </View>
            {selectedLanguage === language.code && !isLoading && (
              <TIcon name="check" color={checkColor} size={20}/>
            )}
            {selectedLanguage === language.code && isLoading && (
              <ActivityIndicator size="small" />
            )}
          </TouchableOpacity>
        ))}
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