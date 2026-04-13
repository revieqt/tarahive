import React, { useEffect, useRef } from "react";
import { View,  StyleSheet, Animated, Easing } from "react-native";
import { ThemedText } from "./ThemedText";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// ----------------------------------------------------
// LEVEL DATA
// ----------------------------------------------------
const levelData = [
  { level: 1, max: 99, title: "Wanderer", icon: "walk" },
  { level: 2, max: 249, title: "Trail Seeker", icon: "map" },
  { level: 3, max: 499, title: "Path Explorer", icon: "compass" },
  { level: 4, max: 899, title: "Route Finder", icon: "map-marker" },
  { level: 5, max: 1399, title: "Wayfarer", icon: "hiking" },

  { level: 6, max: 2099, title: "Globetrotter", icon: "earth" },
  { level: 7, max: 2999, title: "Voyager", icon: "ship-wheel" },
  { level: 8, max: 4199, title: "Trailblazer", icon: "flag-variant" },
  { level: 9, max: 5799, title: "Pathfinder", icon: "compass-rose" },
  { level: 10, max: 7799, title: "Explorer Elite", icon: "star-circle" },

  { level: 11, max: 10199, title: "Expedition Master", icon: "mountain" },
  { level: 12, max: 13199, title: "Waypoint Guardian", icon: "shield-check" },
  { level: 13, max: 16999, title: "Horizon Hunter", icon: "weather-sunset" },
  { level: 14, max: 21599, title: "Odyssey Champion", icon: "laurel" },
  { level: 15, max: Infinity, title: "Grand Navigator", icon: "compass-outline" },
];

// ----------------------------------------------------
// GET LEVEL FROM EXP
// ----------------------------------------------------
const getLevelInfo = (exp: number) => {
  return levelData.find((lvl) => exp <= lvl.max) || levelData[levelData.length - 1];
};

// ----------------------------------------------------
// BADGE COLOR (BRONZE / SILVER / GOLD)
// ----------------------------------------------------
const getBadgeColor = (level: number) => {
  if (level <= 5) return "#957541"; // Bronze
  if (level <= 10) return "#C5C7BC"; // Silver
  return "#FFB22C"; // Gold
};

// ----------------------------------------------------
// BADGE COMPONENT (NO GLOW)
// ----------------------------------------------------
export const ExpBadge = ({ expPoints }: { expPoints: number }) => {
  const levelInfo = getLevelInfo(expPoints);
  const badgeColor = getBadgeColor(levelInfo.level);

  return (
    <View style={styles.badgeWrapper}>
      <MaterialCommunityIcons name="shield" size={60} color={badgeColor} />

      <View style={styles.innerIcon}>
        <MaterialCommunityIcons
          name={levelInfo.icon as any}
          size={28}
          color="#fff"
        />
      </View>
    </View>
  );
};

// ----------------------------------------------------
// PROGRESS BAR WITH SLIDE ANIMATION
// ----------------------------------------------------
export const ExpProgress = ({ expPoints }: { expPoints: number }) => {
  const levelInfo = getLevelInfo(expPoints);
  const badgeColor = getBadgeColor(levelInfo.level);

  const minExp = (() => {
    const idx = levelData.findIndex((l) => l.level === levelInfo.level);
    return idx === 0 ? 0 : levelData[idx - 1].max + 1;
  })();

  const maxExp = levelInfo.max === Infinity ? expPoints : levelInfo.max;

  const progressValue = (expPoints - minExp) / (maxExp - minExp);

  const animWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animWidth, {
      toValue: progressValue,
      duration: 900,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [progressValue]);

  const animatedWidth = animWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={{ width: "100%" }}>
      <View style={styles.progressBackground}>
        <Animated.View style={[styles.progressFill, { width: animatedWidth, backgroundColor: badgeColor }]} />
      </View>

      <View style={styles.progressLabels}>
        <ThemedText style={styles.progressText}>User's Points: {expPoints}</ThemedText>
        <ThemedText style={styles.progressText}>
          {maxExp === Infinity ? "MAX" : maxExp}
        </ThemedText>
      </View>
    </View>
  );
};

// ----------------------------------------------------
// LEVEL TITLE TEXT
// ----------------------------------------------------
export const ExpLevel = ({ expPoints }: { expPoints: number }) => {
  const levelInfo = getLevelInfo(expPoints);

  return (
    <ThemedText style={styles.levelText} type="subtitle">
      {levelInfo.title}
    </ThemedText>
  );
};

// ----------------------------------------------------
// STYLES
// ----------------------------------------------------
const styles = StyleSheet.create({
  badgeWrapper: {
    width: 70,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  innerIcon: {
    position: "absolute",
  },

  progressBackground: {
    height: 3,
    backgroundColor: "#ccc4",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 10,
  },
  progressLabels: {
    marginTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressText: {
    fontSize: 12,
    opacity: 0.7,
  },
  levelText: {
    marginTop: 6,
  },
});

export default {
  ExpBadge,
  ExpProgress,
  ExpLevel,
};
