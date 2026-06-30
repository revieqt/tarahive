import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { useLocalSearchParams } from "expo-router";
import { TView, TText } from "@/shared/components/ui/Themed";
import BackButton from "@/shared/components/common/BackButton";
import HiveLoading from "@/shared/components/feedback/HiveLoading";

export default function WebViewScreen() {
  const { url, title } = useLocalSearchParams<{
    url: string;
    title?: string;
  }>();

  const [loading, setLoading] = useState(true);

  return (
    <TView style={{flex: 1}}>
      <View style={styles.header}>
        <BackButton/>

        <TText numberOfLines={1}>{title ?? "Web View"}</TText>

        <View style={{ width: 24 }} />
      </View>

      {loading && (
        <TView style={styles.loadingContainer}>
          <HiveLoading/>
        </TView>
      )}
      <WebView
        source={{ uri: url }}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        startInLoadingState
      />
    </TView>
  );
}

const styles = StyleSheet.create({
  header: {
    zIndex: 10,
    height: 50,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});