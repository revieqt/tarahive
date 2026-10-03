
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { captureRef } from 'react-native-view-shot';
import * as Clipboard from 'expo-clipboard';
import * as MediaLibrary from 'expo-media-library';
import domtoimage from 'dom-to-image';
import { useThemeColor } from '@/hooks/shared/useThemeColor';

import { TIcon, TText, TView } from '@/components/ui/Themed';

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  path: string;
}

type ActionType = 'copy' | 'qr' | null;

export default function ShareModal({
  visible,
  onClose,
  path,
}: ShareModalProps) {
  const qrRef = useRef<View>(null);
  const secondaryColor = useThemeColor({}, 'secondary');
  const [activeAction, setActiveAction] = useState<ActionType>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) {
        clearTimeout(resetTimer.current);
      }
    };
  }, []);

  /**
   * Show Done state, then restore original state.
   *
   * Can be triggered repeatedly.
   */
  const showDone = (action: ActionType) => {
    if (resetTimer.current) {
      clearTimeout(resetTimer.current);
    }

    fadeAnim.stopAnimation();
    fadeAnim.setValue(0);

    setActiveAction(action);

    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),

      Animated.delay(1200),

      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setActiveAction(null);
      }
    });
  };

  /**
   * Copy link
   */
  const handleCopyLink = async () => {
    try {
      await Clipboard.setStringAsync(path);

      showDone('copy');
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  /**
   * Download QR
   *
   * Web:
   *   dom-to-image -> PNG data URL -> browser download
   *
   * Android/iOS:
   *   react-native-view-shot -> PNG -> MediaLibrary
   */
  const handleDownloadQR = async () => {
    try {
      if (!qrRef.current) {
        return;
      }

      if (Platform.OS === 'web') {
        await downloadQRWeb();

        showDone('qr');

        return;
      }

      await downloadQRNative();

      showDone('qr');
    } catch (error) {
      console.error('Failed to download QR:', error);
    }
  };

  /**
   * Web QR download.
   *
   * dom-to-image captures the actual DOM element generated
   * by React Native Web.
   */
  const downloadQRWeb = async () => {
    if (!qrRef.current) {
      throw new Error('QR container is not available.');
    }

    /**
     * React Native Web gives us the underlying HTMLElement.
     */
    const element = qrRef.current as unknown as HTMLElement;

    if (!element) {
      throw new Error('QR element is not available.');
    }

    const dataUrl = await domtoimage.toPng(element, {
      quality: 1,
      bgcolor: '#ffffff',
      width: element.offsetWidth,
      height: element.offsetHeight,
      style: {
        transform: 'none',
      },
    });

    /**
     * Browser download.
     */
    const link = document.createElement('a');

    link.href = dataUrl;
    link.download = 'tarahive-qr.png';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * Android / iOS QR download.
   */
  const downloadQRNative = async () => {
    if (!qrRef.current) {
      throw new Error('QR container is not available.');
    }

    const permission =
      await MediaLibrary.requestPermissionsAsync();

    if (!permission.granted) {
      return;
    }

    const uri = await captureRef(qrRef.current, {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
    });

    await MediaLibrary.saveToLibraryAsync(uri);
  };

  /**
   * Native / browser sharing.
   */
  const handleMoreOptions = async () => {
    try {
      await Share.share({
        message: path,
        url: path,
        title: 'Share TaraHive',
      });
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  /**
   * Action button content.
   */
  const renderActionContent = (
    action: ActionType,
    icon: string,
    label: string,
  ) => {
    const isDone = activeAction === action;

    const normalOpacity = isDone
      ? fadeAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0],
        })
      : 1;

    const doneOpacity = isDone ? fadeAnim : 0;

    return (
      <View style={styles.actionContent}>
        {/* Done */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.actionState,
            {
              opacity: doneOpacity,
              position: isDone ? 'relative' : 'absolute',
            },
          ]}
        >
          <TIcon name="check" size={25} />
          <TText>Done</TText>
        </Animated.View>

        {/* Original */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.actionState,
            {
              opacity: normalOpacity,
              position: isDone ? 'absolute' : 'relative',
            },
          ]}
        >
          <TIcon name={icon} size={25} />
          <TText>{label}</TText>
        </Animated.View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Close when pressing outside */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="Close share dialog"
        />

        <TView
          color="primary"
          style={styles.sheet}
        >
          {/* Handle */}
          <View style={styles.handle} />

          {/*
            QR CARD

            This View is intentionally kept simple because it is
            captured by dom-to-image on Web.
          */}
          <View
            ref={qrRef}
            collapsable={false}
            style={styles.qrContainer}
          >
            <QRCode
              value={path}
              size={208}
              logo={require('../../../assets/images/icon.png')}
              logoSize={44}
            />
          </View>

          {/* Copy / Download */}
          <View style={styles.bottomContentStyle}>
            <TouchableOpacity
              style={styles.buttons}
              onPress={handleCopyLink}
              activeOpacity={0.7}
            >
              {renderActionContent(
                'copy',
                'link',
                'Copy Link',
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buttons}
              onPress={handleDownloadQR}
              activeOpacity={0.7}
            >
              {renderActionContent(
                'qr',
                'qrcode',
                'Download QR',
              )}
            </TouchableOpacity>
          </View>

          {/* More sharing options */}
          <TouchableOpacity
            style={[styles.moreOptionsButton, { backgroundColor: secondaryColor }]}
            onPress={handleMoreOptions}
            activeOpacity={0.7}
          >
            <TIcon
              name="dots-horizontal"
              size={25}
            />

            <TText style={styles.moreOptionsText}>
              More Sharing Options
            </TText>
          </TouchableOpacity>
        </TView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },

  sheet: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: '3%',
    paddingTop: 12,
    paddingBottom: 20,
    alignItems: 'center',
  },

  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#999',
    opacity: 0.55,
  },

  /**
   * QR card that gets downloaded.
   */
  qrContainer: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 16,

    /**
     * Important for DOM capture.
     */
    overflow: 'hidden',

    /**
     * Prevent the browser from treating this as
     * a flexible layout during capture.
     */
    alignItems: 'center',
    justifyContent: 'center',
  },

  bottomContentStyle: {
    gap: 6,
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
  },

  buttons: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0004',
    paddingVertical: 10,
    borderRadius: 15,
    marginBottom: 8,
  },

  actionContent: {
    minHeight: 25,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionState: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  moreOptionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    paddingVertical: 10,
    justifyContent: 'center',
    borderRadius: 15,
  },

  moreOptionsText: {
    color: '#fff',
  },
});