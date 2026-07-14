import React from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeColor } from "@/shared/hooks/useThemeColor";
import { TText, TIcon } from "../ui/Themed";
import Button from "../ui/Button";
import { router } from "expo-router";
import { useLanguage } from "@/shared/context/LanguageContext";

export default function ProCard() {
  const { t } = useLanguage();
  const secondaryColor = useThemeColor({}, 'secondary');
  const accentColor = useThemeColor({}, 'accent');
  
  return (
    <LinearGradient
      colors={[secondaryColor + '20', accentColor + '70']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <LinearGradient
        colors={['transparent','rgba(255,255,255,0.1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.glow}
      />

      <View style={styles.header}>
        <View style={styles.iconContainer}>
            <TIcon name="crown" color={secondaryColor} size={28} />
        </View>

        <View>
          <TText type='subtitle' style={{color: secondaryColor, marginLeft:-6}}> {t('tabs.account.pro_card_title')} </TText>
          <TText style={{ opacity: 0.7 }}>
            {t('tabs.account.pro_card_subtitle')}
          </TText>
        </View>
      </View>

      <TText style={{opacity: 0.7, fontSize: 11}}>
        {t('tabs.account.pro_card_description')}
      </TText>

      <Button type="primary" title={t('tabs.account.upgrade_button')} onPress={() => router.push('/pro')} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 15,
    padding: 10,
    overflow: "hidden",
    marginBottom: 8,
    gap: 16,
  },
  glow: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 999,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor:"rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  text: {
    color: "#FFFFFF",
  },
});