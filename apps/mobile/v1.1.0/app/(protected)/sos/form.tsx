import React, { useState } from "react";
import { StyleSheet, ScrollView, TouchableOpacity, View } from "react-native";
import { TIcon, TText, TView } from "@/shared/components/ui/Themed";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useThemeColor } from "@/shared/hooks/useThemeColor";
import Header from "@/shared/components/common/Header";
import TextField from "@/shared/components/ui/TextField";
import Button from "@/shared/components/ui/Button";

export default function SOSFormScreen() {
    const { t } = useLanguage();
    const primaryColor = useThemeColor({}, "primary");
    const accentColor = useThemeColor({}, "accent");
    const [selectedEmergencyType, setSelectedEmergencyType] = useState<string | null>(null);
    const [message, setMessage] = useState<string>('');

    const emergencyTypes = [
        { id: 'medical', label: t("sos.emergency_types.medical"), icon: 'medical-bag' },
        { id: 'criminal', label: t("sos.emergency_types.criminal"), icon: 'shield-alert' },
        { id: 'fire', label: t("sos.emergency_types.fire"), icon: 'fire' },
        { id: 'natural', label: t("sos.emergency_types.natural"), icon: 'weather-hurricane' },
        { id: 'utility', label: t("sos.emergency_types.utility"), icon: 'flash-off' },
        { id: 'road', label: t("sos.emergency_types.road"), icon: 'car' },
        { id: 'domestic', label: t("sos.emergency_types.domestic"), icon: 'home-alert' },
        { id: 'animal', label: t("sos.emergency_types.animal"), icon: 'paw' },
        { id: 'other', label: t("sos.emergency_types.other"), icon: 'help-circle' },
    ];

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
                            {type.label}
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
                <TouchableOpacity>
                    <TText style={styles.settingsLink}>
                        {t("sos.form.settings_link")}
                    </TText>
                </TouchableOpacity>

                <Button
                    title={t("sos.form.activate_button")}
                    onPress={() => { }}
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
    },
});