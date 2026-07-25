import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { TIcon, TText, TView } from "@/shared/components/ui/Themed";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useThemeColor } from "@/shared/hooks/useThemeColor";
import { showError } from "@/shared/services/toast.service";
import Header from "@/shared/components/common/Header";
import Switch from "@/shared/components/ui/Switch";
import { useSession } from "@/features/auth/context/SessionContext";
import Button from "@/shared/components/ui/Button";


export default function VisibilitySettingsScreen() {
  const { t } = useLanguage();
  const { session } = useSession();
  const [isPublic, setIsPublic] = useState(false);
  const [isPersonalInfoPublic, setIsPersonalInfoPublic] = useState(false);
  const [isTravelInfoPublic, setIsTravelInfoPublic] = useState(false);

  useEffect(() => {
    const visibility = session?.user?.settings.visibility;
    if (visibility) {
      setIsPublic(Boolean(visibility.isProfilePublic));
      setIsPersonalInfoPublic(Boolean(visibility.isPersonalInfoPublic));
      setIsTravelInfoPublic(Boolean(visibility.isTravelInfoPublic));
    }
  }, [session?.user?.settings?.visibility?.isProfilePublic, session?.user?.settings?.visibility?.isPersonalInfoPublic, session?.user?.settings?.visibility?.isTravelInfoPublic]);

  return (
    <TView style={styles.container}>
      <Header title={t("users.visibility.title")} subtitle={t("users.visibility.subtitle")} />

      <TView style={styles.switchContainer} color='primary'>
        <Switch
          value={ isPublic }
          onValueChange={() => setIsPublic(!isPublic)}
          label={isPublic ? t("users.visibility.on") : t("users.visibility.off")}
          description={t("users.visibility.public")}
        />
      </TView>
      
      <TView style={styles.switchContainer} color='primary'>
        <Switch
          value={ isPersonalInfoPublic }
          onValueChange={() => setIsPersonalInfoPublic(!isPersonalInfoPublic)}
          label={isPersonalInfoPublic ? t("users.visibility.on") : t("users.visibility.off")}
          description={t("users.visibility.personal")}
        />
      </TView>

      <TView style={styles.switchContainer} color='primary'>
        <Switch
          value={ isTravelInfoPublic }
          onValueChange={() => setIsTravelInfoPublic(!isTravelInfoPublic)}
          label={isTravelInfoPublic ? t("users.visibility.on") : t("users.visibility.off")}
          description={t("users.visibility.travel")}
        />
      </TView>

      <Button
        title={t("common.common.save")}
        type='primary'
        onPress={() => []}
        buttonStyle={styles.button}
      />
    </TView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: '3%',
  },
  switchContainer:{
    padding: 10,
    borderRadius: 15,
    marginBottom: 8
  },
  button:{
    position: 'absolute',
    bottom: 16,
    left: '3%',
    right: '3%'
  }
});