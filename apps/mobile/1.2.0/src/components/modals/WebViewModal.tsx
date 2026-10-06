import React from 'react';
import { Modal, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TIcon, TText, TView } from '@/components/ui/Themed';
import { useThemeColor } from '@/hooks/shared/useThemeColor';

interface WebViewModalProps {
  visible: boolean;
  url: string;
  title?: string;
  subtitle?: string;
  onClose: () => void;
}

export default function WebViewModal({
  visible,
  url,
  title,
  subtitle,
  onClose,
}: WebViewModalProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const webView =
    Platform.OS === 'web'
      ? React.createElement('iframe', {
          src: url,
          title: title ?? subtitle ?? 'Web form',
          style: {
            display: 'block',
            width: '100%',
            height: '100%',
            border: 0,
          },
        })
      : React.createElement(require('react-native-webview').WebView, {
          source: { uri: url },
          style: styles.webView,
        });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.content}>
          {webView}
        </View>
        <TView color="primary" style={styles.header}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={onClose}
            style={styles.closeButton}
          >
            <TIcon name="chevron-left" size={25} />
          </TouchableOpacity>
          <View style={styles.headerTextBlock}>
            {title && <TText numberOfLines={1} style={styles.title}>{title}</TText>}
            {subtitle && <TText numberOfLines={1} style={styles.subtitle}>{subtitle}</TText>}
          </View>
          <View style={styles.headerSide} />
        </TView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    elevation: 10,
    minHeight: 56,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTextBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
  },
  title: {
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 11,
    opacity: 0.5,
  },
  closeButton: {
    width: 41,
    padding: 8,
    alignItems: 'center',
  },
  headerSide: {
    width: 41,
  },
  content: {
    flex: 1,
    paddingTop: 56,
  },
  webView: {
    flex: 1,
  },
});
