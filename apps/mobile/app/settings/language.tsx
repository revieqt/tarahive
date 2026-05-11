import BackButton from "@/components/common/BackButton";
import { TText, TView } from "@/components/ui/Themed";
import { Link } from "expo-router";


export default function LanguageSettingsScreen() {
  return (
    <TView style={{flex: 1, padding: 16}}>
      <BackButton/>
      <TText type="title">Language</TText>
      <TText>Use the language you prefer for the app.</TText>
      
    </TView>
  );
}