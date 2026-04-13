import React from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  Share,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import * as Clipboard from "expo-clipboard";
import ThemedIcons from "../ThemedIcons";
import { ThemedText } from "../ThemedText";
import GradientBlobs from "../GradientBlobs";
import { ThemedView } from "../ThemedView";

interface ShareModalProps {
  visible: boolean;
  link: string;
  onClose: () => void;
}

export default function ShareModal({
  visible,
  link,
  onClose,
}: ShareModalProps) {
  const customMessage = `Hey! Join me using this link:\n${link}`;

  const handleCopy = async () => {
    await Clipboard.setStringAsync(link);
    Alert.alert("Copied!", "Link copied to clipboard.");
  };

  // 🔵 Universal Share (recommended)
  const handleNativeShare = async () => {
    try {
      await Share.share({
        message: customMessage,
        url: link, // iOS mainly
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <ThemedView style={styles.container}>
            <GradientBlobs/>

          {/* QR Code */}
          <View style={styles.qrContainer}>
            <QRCode value={link} size={200} />
          </View>

          {/* Clickable Link */}
          <TouchableOpacity onPress={handleCopy} style={styles.copyLink} activeOpacity={0.7}>
            <ThemedText style={{textAlign: "center"}}>{link}</ThemedText>
            <ThemedText style={{opacity: 0.5, fontSize: 11}}>Tap to copy</ThemedText>
          </TouchableOpacity>

          

          <TouchableOpacity
              style={styles.shareOthers}
              onPress={handleNativeShare}
          >
            <ThemedText>Share to other platforms</ThemedText>
            <View style={styles.shareOthersIcon}>
              <ThemedIcons name="dots-horizontal" size={30}/>
            </View>
              
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <ThemedIcons name="close" size={30}/>
          </TouchableOpacity>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "85%",
    borderRadius: 16,
    padding: 20,
    paddingTop: 40,
    alignItems: "center",
    overflow: "hidden",
  },
  qrContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "white",
    borderRadius: 12,
  },
  copyLink: {
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    padding: 10,
    borderRadius: 8,
  },
  iconRow:{
    flexDirection: "row",
    gap: 10,
    marginVertical: 10,
  },
  icons:{
    width: 55,
    aspectRatio: 1,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 5,
  },
  shareOthers: {
    padding: 10,
    borderRadius: 100,
    backgroundColor: "#ccc7",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 20,
    gap: 20,
  },
  shareOthersIcon:{
    backgroundColor: "#ccc",
    height: 35,
    aspectRatio: 1,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  }
});