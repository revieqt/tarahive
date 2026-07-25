import React from "react";
import {
    View,
    Modal,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import { TText } from "../ui/Themed";
import { router } from "expo-router";

interface ErrorOverlayModalProps {
    visible: boolean;
    title: string;
    description: string;
    buttonLabel?: string;
    buttonAction?: () => void;
}

export default function ErrorOverlayModal({
    visible,
    title,
    description,
    buttonLabel,
    buttonAction,
}: ErrorOverlayModalProps) {
    const [isVisible, setIsVisible] = React.useState(visible);

    React.useEffect(() => {
        setIsVisible(visible);
    }, [visible]);

    const handleClose = () => {
        setIsVisible(false);
        buttonAction ? buttonAction : router.back();
    };

    if (!isVisible) {
        return null;
    }

    return (
        <Modal visible={isVisible} transparent animationType="fade" onRequestClose={handleClose}>
            <View style={styles.overlay}>
                <View style={styles.content}>
                    <Image source={require('@/shared/assets/images/mascot-sad.png')} style={styles.image} />
                    <TText type='subtitle' style={styles.title}>{title}</TText>
                    <TText style={styles.description}>{description}</TText>
                    <TouchableOpacity style={styles.button} onPress={handleClose}>
                        <TText style={styles.buttonText}>{buttonLabel || "Go Back"}</TText>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'rgba(0,0,0,.8)'
    },
    content: {
        width: "100%",
        padding: '3%',
        alignItems: "center",
        marginTop: '-10%',
    },
    image: {
        width: '50%',
        aspectRatio: 1,
    },
    title:{
        color: '#fff'
    },
    description: {
        fontSize: 14,
        opacity: 0.7,
        textAlign: "center",
        marginTop: 10,
        marginBottom: 15,
        color: '#fff'
    },
    button: {
        backgroundColor: '#ccc4',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 10,
    },
    buttonText: {
        color: "white",
        fontWeight: "600",
    },
});