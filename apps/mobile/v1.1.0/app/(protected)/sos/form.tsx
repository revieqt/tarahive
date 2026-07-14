import React, { useState } from "react";
import { StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { TIcon, TText, TView } from "@/shared/components/ui/Themed";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useThemeColor } from "@/shared/hooks/useThemeColor";
import Header from "@/shared/components/common/Header";
import TextField from "@/shared/components/ui/TextField";
import Button from "@/shared/components/ui/Button";
import Switch from "@/shared/components/ui/Switch";

const emergencyTypes = [
    { id: 'medical', label: 'Medical Emergency', icon: 'medical-bag' },
    { id: 'criminal', label: 'Criminal Activity', icon: 'shield-alert' },
    { id: 'fire', label: 'Fire Emergency', icon: 'fire' },
    { id: 'natural', label: 'Natural Disasters', icon: 'weather-hurricane' },
    { id: 'utility', label: 'Utility Emergency', icon: 'flash-off' },
    { id: 'road', label: 'Road Emergency', icon: 'car' },
    { id: 'domestic', label: 'Domestic and Personal Safety', icon: 'home-alert' },
    { id: 'animal', label: 'Animal-Related Emergency', icon: 'paw' },
    { id: 'other', label: 'Other', icon: 'help-circle' },
];

export default function SOSFormScreen() {
    const { t } = useLanguage();
    const primaryColor = useThemeColor({}, "primary");
    const accentColor = useThemeColor({}, "accent");
    const [selectedEmergencyType, setSelectedEmergencyType] = useState<string | null>(null);
    const [message, setMessage] = useState<string>('');


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
                            selectedEmergencyType === type.id ? { backgroundColor: accentColor + '50' } : { backgroundColor: primaryColor  }
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
                placeholder="Describe your emergency situation... (Optional)"
                value={message}
                onChangeText={setMessage}
                multiline={true}
                numberOfLines={3}
                style={styles.messageInput}
            />

            <Switch
                value={true}
                onValueChange={() => {}}
                label="Share Location"
                description="dsads"
            />

            <Button
                title={'Activate SOS'}
                onPress={() => { }}
                disabled={false}
                type="primary"
                buttonStyle={styles.activateButton}
            />

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
    },
});