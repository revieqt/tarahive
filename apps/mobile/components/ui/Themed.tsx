import React from "react";
import { View, Text, type ViewProps, type TextProps } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import MaterialIcons from "@expo/vector-icons/MaterialCommunityIcons";

/* ---------------- TYPES ---------------- */

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  color?: "primary" | "secondary" | "accent" | "background";
  shadow?: boolean;
  borderRadius?: number;
};

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: "default" | "title" | "subtitle" | "error" | "warning" | "success";
};

export type ThemedIconProps = {
  name: any;
  size: number;
  color?: string;
  style?: object;
};

/* ---------------- VIEW ---------------- */

export function TView({
  style,
  lightColor,
  darkColor,
  color,
  shadow,
  borderRadius,
  ...props
}: ThemedViewProps) {
  const colorKey =
    color === "primary"
      ? "primary"
      : color === "secondary"
      ? "secondary"
      : color === "accent"
      ? "accent"
      : "background";

  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    colorKey
  );

  const shadowStyle = shadow
    ? {
        shadowColor: "rgba(120,120,120,0.6)",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.18,
        shadowRadius: 24,
        elevation: 10,
      }
    : {};

  const roundnessStyle =
    typeof borderRadius === "number"
      ? { borderRadius }
      : {};

  return (
    <View
      style={[
        { backgroundColor },
        shadowStyle,
        roundnessStyle,
        style,
      ]}
      {...props}
    />
  );
}

/* ---------------- TEXT ---------------- */

export function TText({
  style,
  lightColor,
  darkColor,
  type = "default",
  ...props
}: ThemedTextProps) {
  const color = useThemeColor(
    { light: lightColor, dark: darkColor },
    "text"
  );
  const errorColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "error"
  );
  const warningColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "warning"
  );
  const successColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "success"
  );

  return (
    <Text
      style={[
        { color },
        type === "default" && {fontFamily: "Inter",fontSize: 13,fontWeight: "500",},
        type === "error" && {fontFamily: "Inter",fontSize: 13,fontWeight: "500", color: errorColor},
        type === "warning" && {fontFamily: "Inter",fontSize: 13,fontWeight: "500", color: warningColor},
        type === "success" && {fontFamily: "Inter",fontSize: 13,fontWeight: "500", color: successColor},
        type === "title" && {fontFamily: "Baloo",fontSize: 22,lineHeight: 38},
        type === "subtitle" && {fontFamily: "Baloo",fontSize: 16,},
        style,
      ]}
      {...props}
    />
  );
}

/* ---------------- ICON ---------------- */

export function TIcon({
  name,
  size,
  color,
  style,
}: ThemedIconProps) {
  const iconColor = useThemeColor(
    { light: undefined, dark: undefined },
    "icon"
  );

  return (
    <MaterialIcons
      name={name}
      size={size}
      color={color ?? iconColor}
      style={style}
    />
  );
}