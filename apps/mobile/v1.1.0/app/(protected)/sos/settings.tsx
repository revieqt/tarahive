import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { TView } from "@/shared/components/ui/Themed";
import { useLanguage } from "@/shared/context/LanguageContext";
import Header from "@/shared/components/common/Header";
import TextField from "@/shared/components/ui/TextField";
import Button from "@/shared/components/ui/Button";
import ContactNumberField from "@/shared/components/ui/ContactNumberField";
import Switch from "@/shared/components/ui/Switch";
import { useSession } from "@/features/auth/context/SessionContext";
import { useUpdateSafetySettings } from "@/features/sos/hooks/useSafetySettings";
import { router } from "expo-router";

export default function SOSSettingsScreen() {
    const { t } = useLanguage();
    const [message, setMessage] = useState<string>('');
    const [areaCode, setAreaCode] = useState('+63');
    const [contactNumber, setContactNumber] = useState('');
    const [isEmailEnabled, setIsEmailEnabled] = useState(false);
    const [isSmsEnabled, setIsSmsEnabled] = useState(false);
    const { session } = useSession();
    const { updateSafetySettings, isPending } = useUpdateSafetySettings();

    useEffect(() => {
        const delivery = session?.user?.safetyState?.delivery;
        if (delivery) {
            setIsEmailEnabled(Boolean(delivery.isEmailEnabled));
            setIsSmsEnabled(Boolean(delivery.isSMSEnabled));
        }

        const emergencyContact = session?.user?.safetyState?.emergencyContact;
        if (emergencyContact?.email) {
            setMessage(emergencyContact.email);
        }
        if (emergencyContact?.phone) {
            setContactNumber(emergencyContact.phone);
        }
    }, [session?.user?.safetyState?.delivery?.isEmailEnabled, session?.user?.safetyState?.delivery?.isSMSEnabled, session?.user?.safetyState?.emergencyContact?.email, session?.user?.safetyState?.emergencyContact?.phone]);

    const handleEnableSMS = () => {
        if (session?.user?.isProUser) {
            setIsSmsEnabled(!isSmsEnabled);
        }else{
            router.push('/pro');
        }
    }


    const handleSaveSettings = () => {
        const nextEmail = message.trim() || session?.user?.safetyState?.emergencyContact?.email;
        const nextPhone = contactNumber.trim()
            ? `${areaCode}${contactNumber}`
            : session?.user?.safetyState?.emergencyContact?.phone;

        updateSafetySettings({
            delivery: {
                isEmailEnabled,
                isSMSEnabled: isSmsEnabled,
            },
            emergencyContact: {
                email: nextEmail,
                phone: nextPhone,
            },
        });
    };

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
                title={isPending ? "Saving..." : t("sos.settings.save_button")}
                onPress={handleSaveSettings}
                disabled={isPending}
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