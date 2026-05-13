import { TText, TView } from "@/components/ui/Themed";
import { Link } from "expo-router";


export default function MapsScreen() {
  return (
    <TView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <TText type="title">Maps</TText>
      <TText type="subtitle">Hello</TText>
      <TText>Hello Expo Router</TText>
      <TText type="error">Hello Expo Router</TText>
      <TText type="warning">Hello Expo Router</TText>
      <TText type="success">Hello Expo Router</TText>
      <Link href="/asset">
        <TText>Test not found!</TText>
      </Link>
    </TView>
  );
}