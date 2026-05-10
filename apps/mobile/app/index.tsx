import { ThemedText, ThemedView } from "@/components/ui/Themed";
import { Link } from "expo-router";


export default function HomeScreen() {
  return (
    <ThemedView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ThemedText type="title">Hello</ThemedText>
      <ThemedText type="subtitle">Hello</ThemedText>
      <ThemedText>Hello Expo Router</ThemedText>
      <ThemedText type="error">Hello Expo Router</ThemedText>
      <ThemedText type="warning">Hello Expo Router</ThemedText>
      <ThemedText type="success">Hello Expo Router</ThemedText>
      <Link href="/asset">
        <ThemedText>Test not found!</ThemedText>
      </Link>
    </ThemedView>
  );
}