import React, { useState } from "react";
import { StyleSheet, ScrollView, TouchableOpacity, View } from "react-native";
import { TIcon, TText, TView } from "@/shared/components/ui/Themed";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useThemeColor } from "@/shared/hooks/useThemeColor";
import Header from "@/shared/components/common/Header";
import TextField from "@/shared/components/ui/TextField";
import Button from "@/shared/components/ui/Button";
import { router } from 'expo-router';
import { useSafety } from "@/features/sos/hooks/useSOS";
import { EMERGENCY_TYPES } from '@/features/sos/types/emergencyTypes';
import { useLocation } from "@/shared/context/LocationContext";

export default function SOSFormScreen() {
    const { t } = useLanguage();
    const { latitude, longitude } = useLocation();
    const { handleEnableSOS } = useSafety();
    const primaryColor = useThemeColor({}, "primary");
    const accentColor = useThemeColor({}, "accent");
    const [selectedEmergencyType, setSelectedEmergencyType] = useState<string | null>(null);
    const [message, setMessage] = useState<string>('');

    // Use shared EMERGENCY_TYPES and translate labels at render time
    const emergencyTypes = EMERGENCY_TYPES;

    const handleEnableSafetyMode = async () => {
        if (!selectedEmergencyType) {
            return;
        }

        await handleEnableSOS({
            emergencyType: selectedEmergencyType,
            message: message || undefined,
            latitude,
            longitude,
        });

        setSelectedEmergencyType(null);
        setMessage('');
    };

    return (
        <TView style={styles.container}>
            <Header title={t("sos.form.title")} subtitle={t("sos.form.subtitle")} />

            <ScrollView
                horizontal
                contentContainerStyle={{ gap: 7 }}
                style={{ maxHeight: 95 }}
                showsHorizontalScrollIndicator={false}>
                {emergencyTypes.map((type) => (
                    <TouchableOpacity
                        key={type.id}
                        style={[
                            styles.emergencyTypeButton,
                            selectedEmergencyType === type.id ? { backgroundColor: accentColor + '50' } : { backgroundColor: primaryColor }
                        ]}
                        onPress={() => setSelectedEmergencyType(type.id)}
                    >
                        <TIcon
                            name={type.icon}
                            size={30}
                        />
                        <TText style={[{ textAlign: 'center', fontSize: 10 }]}> 
                            {t(type.labelKey)}
                        </TText>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <TextField
                placeholder={t("sos.form.message_placeholder")}
                value={message}
                onChangeText={setMessage}
                multiline={true}
                numberOfLines={3}
                style={styles.messageInput}
            />

            <View style={styles.activateButton}>
                <TouchableOpacity onPress={() => router.push('/sos/settings')}>
                    <TText style={styles.settingsLink}>
                        {t("sos.form.settings_link")}
                    </TText>
                </TouchableOpacity>

                <Button
                    title={t("sos.form.activate_button")}
                    onPress={handleEnableSafetyMode}
                    disabled={false}
                    type="primary"
                />
            </View>
        </TView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: '3%',
    },
    emergencyTypeButton: {
        alignItems: 'center',
        padding: 10,
        marginBottom: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc4',
        gap: 10,
        width: 100,
        height: 90,
    },
    messageInput: {
        minHeight: 80,
        marginTop: 7,
    },
    activateButton: {
        position: 'absolute',
        bottom: 20,
        left: '3%',
        right: '3%',
        gap: 10,
    },
    settingsLink: {
        opacity: 0.5,
        textDecorationLine: 'underline',
        marginTop: 10,
        textAlign: 'center',
        fontSize: 12
    },
});