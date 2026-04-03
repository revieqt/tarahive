import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
  View
} from 'react-native';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { Announcement } from '@/hooks/useAnnouncement';
import { BACKEND_URL } from '@/constants/Config';
import ThemedIcons from '../ThemedIcons';

interface AnnouncementModalProps {
  visible: boolean;
  announcement: Announcement | null;
  onClose: () => void;
}

export default function AnnouncementModal({
  visible,
  announcement,
  onClose,
}: AnnouncementModalProps) {
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImagePress = async () => {
    if (!announcement) return;
    if (announcement.isExternal) {
      await Linking.openURL(announcement.linkPath);
    } else {
      router.push(announcement.linkPath);
      onClose();
    }
  };
  if (!visible) return null;

  if (!announcement) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => onClose()}
    >
      <View style={styles.overlay}>
        <Pressable onPress={handleImagePress} style={styles.imageContainer}>
          <Pressable
            style={styles.closeButton}
            onPress={() => onClose()}
          >
            <ThemedIcons name="close" size={25} color='white' />
          </Pressable>
          {imageLoading && (
            <ActivityIndicator
              size="large"
            />
          )}

          <Image
            source={{ uri: `${BACKEND_URL}${announcement.image}` }}
            style={styles.image}
            onLoadStart={() => {
                setImageLoading(true);
                setImageError(false);
            }}
            onLoadEnd={() => setImageLoading(false)}
            onError={() => {
                setImageLoading(false);
                setImageError(true);
            }}
          />

          {imageError && (
            <ThemedView style={styles.errorContainer} color='primary' shadow>
              <ThemedText type='title'>
                {announcement.title}
              </ThemedText>

              {announcement.altDesc && (
                <ThemedText type='subtitle' style={{opacity: 0.7 }}>
                  {announcement.altDesc}
                </ThemedText>
              )}
              <ThemedText style={{opacity: 0.5 , textDecorationLine: 'underline'}}>
                Click here to learn more 
              </ThemedText>
            </ThemedView>
          )}
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 9999,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    zIndex: 10000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    zIndex: 10000,
    borderRadius: 15,
  },
  errorContainer:{
    width: '100%',
    height: '100%',
    borderRadius: 15,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    top: 70,
    padding: 8,
    zIndex: 100000,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 200,
  },
});
