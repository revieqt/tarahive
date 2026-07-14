import React, { useState } from "react";
import { StyleSheet, ScrollView, TouchableOpacity, View } from "react-native";
import { TIcon, TText, TView } from "@/shared/components/ui/Themed";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useThemeColor } from "@/shared/hooks/useThemeColor";
import Header from "@/shared/components/common/Header";
import TextField from "@/shared/components/ui/TextField";
import Button from "@/shared/components/ui/Button";
import ContactNumberField from "@/shared/components/ui/ContactNumberField";
import Switch from "@/shared/components/ui/Switch";
import HiveBg from "@/shared/components/common/HiveBg";
import { useSession } from "@/features/auth/context/SessionContext";
import { router } from "expo-router";

export default function SOSSettingsScreen() {
    const { t } = useLanguage();
    const primaryColor = useThemeColor({}, "primary");
    const accentColor = useThemeColor({}, "accent");
    const [selectedEmergencyType, setSelectedEmergencyType] = useState<string | null>(null);
    const [message, setMessage] = useState<string>('');
    const [areaCode, setAreaCode] = useState('+63');
    const [contactNumber, setContactNumber] = useState('');
    const [isEmailEnabled, setIsEmailEnabled] = useState(false);
    const [isSmsEnabled, setIsSmsEnabled] = useState(false);
    const { session, updateSession } = useSession();

    const handleEnableSMS = () => {
        if (session?.user?.isProUser) {
            setIsSmsEnabled(!isSmsEnabled);
        }else{
            router.push('/pro');
        }
    }


    return (
        <TView style={styles.container}>
            <Header title={t("sos.settings.title")} subtitle={t("sos.settings.subtitle")} />

            <TView style={styles.emergencyAlertContainer} color="primary" shadow>
                <Switch
                    value={isEmailEnabled}
                    onValueChange={() => setIsEmailEnabled(!isEmailEnabled)}
                    label={isEmailEnabled ? t("sos.settings.email_label_enabled") : t("sos.settings.email_label_disabled")}
                    description={t("sos.settings.email_description")}
                />

                {isEmailEnabled && (
                    <TextField
                        placeholder={t("sos.settings.email_placeholder")}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={message}
                        onChangeText={setMessage}
                        style={{ marginBottom: 0 }}
                    />
                )}

            </TView>

            <TView style={styles.emergencyAlertContainer} color="primary" shadow>
                <Switch
                    value={isSmsEnabled}
                    onValueChange={handleEnableSMS}
                    label={isSmsEnabled ? t("sos.settings.sms_label_enabled") : t("sos.settings.sms_label_disabled")}
                    description={t("sos.settings.sms_description")}
                />

                {isSmsEnabled && (
                    <ContactNumberField
                        areaCode={areaCode}
                        onAreaCodeChange={setAreaCode}
                        number={contactNumber}
                        onNumberChange={setContactNumber}
                        placeholder={t("sos.settings.sms_placeholder")}
                        style={{ marginBottom: 0 }}
                    />
                )}

            </TView>

            <Button
                title={t("sos.settings.save_button")}
                onPress={() => { }}
                disabled={false}
                type="primary"
                buttonStyle={styles.saveButton}
            />
        </TView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: '3%',
    },
    saveButton: {
        position: 'absolute',
        bottom: 20,
        left: '3%',
        right: '3%',
    },
    emergencyAlertContainer: {
        marginBottom: 8,
        padding: 15,
        borderRadius: 12,
        gap: 10,
    },
});