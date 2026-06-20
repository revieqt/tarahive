import React, { useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { TIcon, TText, TView } from "@/shared/components/ui/Themed";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useThemeColor } from "@/shared/hooks/useThemeColor";
import { showError } from "@/shared/services/toast.service";
import HiveBg from "@/shared/components/common/HiveBg";
import Header from "@/shared/components/common/Header";
import RoundButton from "@/shared/components/ui/RoundButton";
import { router } from "expo-router";

export default function ItineraryScreen() {
  const { t } = useLanguage();

  return (
    <TView style={styles.container}>
      <HiveBg />
      <Header title='Itinerary' subtitle='Manage your travel plans' />

      <RoundButton
        iconName='plus'
        onPress={() => router.push('/itinerary/create')}
        style={styles.addButton}
      />

    </TView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  addButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
});