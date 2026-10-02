import React, { useEffect, useState } from "react";
import {
	KeyboardAvoidingView,
	Modal,
	Platform,
	Pressable,
	StyleSheet,
	TouchableOpacity,
	View,
} from "react-native";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { TIcon, TText, TView } from "@/components/ui/Themed";
import { useLanguage } from "@/context/LanguageContext";
import { useThemeColor } from "@/hooks/shared/useThemeColor";

type CopyModalProps = {
	visible: boolean;
	onClose: () => void;
	itineraryId?: string;
	title: string;
    themeColor?: string;
};

export default function CopyModal({
	visible,
	onClose,
	itineraryId,
	title,
    themeColor,
}: CopyModalProps) {
	const [copyTitle, setCopyTitle] = useState(title);
	const textColor = useThemeColor({}, "text");
	const { t } = useLanguage();

	useEffect(() => {
		if (visible) setCopyTitle(title);
	}, [visible, title, itineraryId]);

	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
			onRequestClose={onClose}
		>
			<View style={styles.overlay}>
				<Pressable
					style={StyleSheet.absoluteFill}
					onPress={onClose}
					accessibilityLabel={t("common.common.close")}
				/>
				<KeyboardAvoidingView
					style={styles.keyboardAvoiding}
					behavior={Platform.OS === "ios" ? "padding" : "height"}
					pointerEvents="box-none"
				>
					<TView color="primary" style={styles.content}>
                        <TText style={{ fontSize: 16, fontWeight: 700}}>{t("itinerary.form.copy_title")} {title}</TText>

						<TextField
							placeholder={t("itinerary.form.title_placeholder")}
							value={copyTitle}
							onChangeText={setCopyTitle}
							autoCapitalize="sentences"
						/>
                        
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.button} onPress={onClose}>
                                <TText>{t("common.common.cancel")}</TText>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button, { backgroundColor: themeColor}]} >
                                <TText>{t("itinerary.form.copy_button")}</TText>
                            </TouchableOpacity>
                        </View>
						
					</TView>
				</KeyboardAvoidingView>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		justifyContent: "center",
		backgroundColor: "rgba(0, 0, 0, 0.45)",
	},
	keyboardAvoiding: {
		flex: 1,
		justifyContent: "center",
		paddingHorizontal: '3%',
	},
	content: {
		padding: 10,
        paddingTop: 16,
		borderRadius: 15,
		gap: 10,
	},
    buttonContainer: {
        flexDirection: "row",
        gap: 4,
        justifyContent: "flex-end",
    },
	button: {
		paddingVertical: 8,
		paddingHorizontal: 16,
		borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
	},
});
