import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, Animated, Share, Dimensions, TouchableOpacity } from "react-native";
import { TView, TText, TIcon } from "@/shared/components/ui/Themed";
import BackButton from "@/shared/components/common/BackButton";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeColor } from "@/shared/hooks/useThemeColor";
import HiveBg from "@/shared/components/common/HiveBg";
import { useLocalSearchParams, useRouter } from 'expo-router';
import Header from "@/shared/components/common/Header";
import * as Clipboard from "expo-clipboard";
import QRCode from "react-native-qrcode-svg";

export default function ShareScreen() {
    const { path } = useLocalSearchParams();
    const accentColor = useThemeColor({}, 'accent');

    const [copied, setCopied] = React.useState(false);
    const link = 'exp://tarag-v2.exp.app/' + path;

    const customMessage = `Hey! Join me using this link:\n${link}`;

    const handleCopy = async () => {
        await Clipboard.setStringAsync(link);
        setCopied(true);
    };

    const handleNativeShare = async () => {
        try {
            await Share.share({
                message: customMessage,
                url: link,
            });
        } catch (error) {
            console.log(error);
        }
    };
    return (
        <TView style={{ flex: 1 }}>
            <Header title="Share" type='minor' />
            <View style={styles.content}>
                <View style={styles.qrContainer}>
                    <QRCode value={link} size={Dimensions.get('window').width * 0.5} />
                </View>

                <TouchableOpacity onPress={handleCopy} style={styles.linkButton} activeOpacity={0.7}>
                    <TText style={{ textAlign: "center", fontSize: 13 }}>{link}</TText>
                    <TText style={{ opacity: 0.5, fontSize: 11, marginTop: 4 }}>
                        {copied ? "Copied!" : "Tap to copy"}
                    </TText>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.shareButton, { backgroundColor: accentColor + '30' }]}
                    onPress={handleNativeShare}
                >
                    <TIcon name="share-variant" size={18} />
                    <TText style={{ fontSize: 13 }}>Share to other platforms</TText>
                </TouchableOpacity>
            </View>


        </TView>
    );
}

const styles = StyleSheet.create({
    content: {
        alignItems: "center",
        paddingHorizontal: '3%',
        paddingTop: 24,
        paddingBottom: 10,
    },
    qrContainer: {
        marginBottom: 8,
        padding: 12,
        backgroundColor: "white",
        borderRadius: 12,
    },
    linkButton: {
        alignItems: "center",
        paddingVertical: 12,
    },
    shareButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 12,
        width: "100%",
        borderRadius: 10,
        marginTop: 8,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: "#ccc4",
    },
    cancelButton: {
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
    },
    buttonPressed: {
        backgroundColor: "#ccc4",
    },
    cancelButtonText: {
        fontSize: 15,
        fontWeight: "500",
        color: "#8E8E93",
    },
});