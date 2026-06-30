import React from "react";
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Share,
  StyleProp,
  ViewStyle,
  Pressable,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import * as Clipboard from "expo-clipboard";
import { TText, TIcon, TView } from "@/shared/components/ui/Themed";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeColor } from "@/shared/hooks/useThemeColor";

interface ShareModalProps {
  visible: boolean;
  path: string;
  onClose?: () => void;
}

export default function ShareModal({
  visible,
  path,
  onClose,
}: ShareModalProps) {
  const primaryColor = useThemeColor({}, 'primary');
  const accentColor = useThemeColor({}, 'accent');
  
  const [ copied, setCopied ] = React.useState(false);
  const link = 'exp://tarag-v2.exp.app/'+ path;

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
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.overlay} onPress={onClose}>
        <TView style={[styles.container, { backgroundColor: primaryColor }]}>
          {/* Gradient Accent */}
          <LinearGradient
            colors={[accentColor + '50', "transparent"]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.gradient}
          />

          {/* Content */}
          <View style={styles.content}>
            {/* QR Code */}
            <View style={styles.qrContainer}>
              <QRCode value={link} size={180} />
            </View>

            {/* Clickable Link */}
            <TouchableOpacity onPress={handleCopy} style={styles.linkButton} activeOpacity={0.7}>
              <TText style={{ textAlign: "center", fontSize: 13 }}>{link}</TText>
              <TText style={{ opacity: 0.5, fontSize: 11, marginTop: 4 }}>
                {copied ? "Copied!" : "Tap to copy"}
              </TText>
            </TouchableOpacity>

            {/* Share Button */}
            <TouchableOpacity
              style={[styles.shareButton, { backgroundColor: accentColor + '30' }]}
              onPress={handleNativeShare}
            >
              <TIcon name="share-variant" size={18} />
              <TText style={{ fontSize: 13 }}>Share to other platforms</TText>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Cancel Button */}
          <Pressable
            style={({ pressed }) => [
              styles.cancelButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={onClose}
          >
            <TText style={styles.cancelButtonText}>Cancel</TText>
          </Pressable>
        </TView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: '3%',
  },
  container: {
    width: "100%",
    borderRadius: 15,
    overflow: "hidden",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 32,
    elevation: 24,
    zIndex: 1,
  },
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    zIndex: -1,
  },
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