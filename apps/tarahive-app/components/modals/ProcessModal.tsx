import React, { useState, useEffect } from 'react';
import {
  Modal,
  Animated,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { ThemedIcons } from '../ThemedIcons';
import { ThemedText } from '../ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useTheme } from '@/hooks/useTheme';
import { useColorScheme } from 'react-native';

interface ProcessModalProps {
  visible: boolean;
  status: 'processing' | 'success' | 'error';
  message?: string;
  onClose?: () => void;
}

export default function ProcessModal({ 
  visible, 
  status,
  message,
  onClose,
}: ProcessModalProps) {
  const [modalAnimation] = useState(new Animated.Value(0));
  const [slideAnimation] = useState(new Animated.Value(300));
  const [iconAnimation] = useState(new Animated.Value(0));
  const [rotationAnimation] = useState(new Animated.Value(0));
  const textColor = useThemeColor({}, 'text');
  const { theme: selectedTheme } = useTheme();
  const deviceColorScheme = useColorScheme();  

  // Get overlay color based on theme
  const getOverlayColor = () => {
    if (selectedTheme === 'light') {
      return 'rgba(244,244,244,.90)';
    } else if (selectedTheme === 'dark') {
      return 'rgba(2,13,25,.90)';
    } else if (selectedTheme === 'device') {
      if (deviceColorScheme === 'light') {
        return 'rgba(244,244,244,.90)';
      } else {
        return 'rgba(2,13,25,.90)';
      }
    }
    return 'rgba(0, 0, 0, 0.9)';
  };

  // Auto-close functionality - close 3 seconds after modal becomes visible
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  useEffect(() => {
    if (visible) {
      // Start modal animations
      Animated.parallel([
        Animated.timing(modalAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnimation, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(iconAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(rotationAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      // Reset animations when modal is hidden
      modalAnimation.setValue(0);
      slideAnimation.setValue(300);
      iconAnimation.setValue(0);
      rotationAnimation.setValue(0);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      statusBarTranslucent={true}
    >
        <Animated.View 
          style={[
            styles.modalOverlay,
            {
              backgroundColor: getOverlayColor(),
              opacity: modalAnimation,
            }
          ]}
        >
        <Animated.View 
          style={[
            styles.modalContent,
            {
              transform: [
                {
                  translateY: slideAnimation
                },
                {
                  scale: iconAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  })
                }
              ]
            }
          ]}
        >
          {/* Processing State */}
          {status === 'processing' && (
            <>
              <Animated.View
                style={{
                  transform: [{
                    rotate: rotationAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    })
                  }]
                }}
              >
                <ActivityIndicator size={80} color="#00CAFF" />
              </Animated.View>
              <ThemedText style={[styles.modalTitle, { color: textColor }]}>
                {message || 'Processing...'}
              </ThemedText>
            </>
          )}
          
          {/* Success State */}
          {status === 'success' && (
            <>
              <Animated.View
                style={{
                  transform: [{
                    rotate: rotationAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    })
                  }]
                }}
              >
                <ThemedIcons 
                  name='check-circle' 
                  size={80} 
                  color={'#4CAF50'} 
                />
              </Animated.View>
              <ThemedText style={[styles.modalTitle, { color: '#4CAF50' }]}>
                {message || 'Success!'}
              </ThemedText>
            </>
          )}
          
          {/* Error State */}
          {status === 'error' && (
            <>
              <Animated.View
                style={{
                  transform: [{
                    rotate: rotationAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    })
                  }]
                }}
              >
                <ThemedIcons 
                  name='close-circle' 
                  size={80} 
                  color={'#FF3B30'} 
                />
              </Animated.View>
              <ThemedText style={[styles.modalTitle, { color: '#FF3B30' }]}>
                {message || 'Error!'}
              </ThemedText>
            </>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 250,
    minHeight: 120,
  },
  modalTitle: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 17,
  },
});