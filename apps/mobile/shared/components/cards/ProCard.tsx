import React from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeColor } from "@/shared/hooks/useThemeColor";
import { TText, TIcon } from "../ui/Themed";
import Button from "../ui/Button";
import { router } from "expo-router";

export default function ProCard() {
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
          <TText type='subtitle' style={{color: secondaryColor, marginLeft:-6}}> Be a Certified Traveller </TText>
          <TText style={{ opacity: 0.7 }}>
            Upgrade to Pro Now!
          </TText>
        </View>
      </View>

      <TText style={{opacity: 0.7}}>
        Unlock premium travel tools, AI-powered planning, faster
        syncing, and exclusive perks with Tarahive Pro.
      </TText>

      <Button type="primary" title="Upgrade Now" onPress={() => router.push('/pro')} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 15,
    padding: 16,
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