import { TouchableOpacity } from "react-native";
import { TIcon, TText, TView } from "@/components/ui/Themed";
import { StyleSheet, Animated, Modal } from "react-native";
import { useState } from "react";
import { useTheme } from "@/shared/context/ThemeContext";
import { useColorScheme, useThemeColor } from "@/shared/hooks/useThemeColor";
import HiveBg from "@/components/common/HiveBg";
import Header from "@/components/common/Header";

export default function LanguageSettingsScreen() {
  const { theme: selectedTheme, setTheme, THEME_TYPES } = useTheme();
  const deviceColorScheme = useColorScheme();
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [transitioningTheme, setTransitioningTheme] = useState<string>('');
  const [modalAnimation] = useState(new Animated.Value(0));
  const [slideAnimation] = useState(new Animated.Value(300));
  const [iconAnimation] = useState(new Animated.Value(0));
  const [rotationAnimation] = useState(new Animated.Value(0));
  const backgroundColor = useThemeColor({}, 'primary');
  const accentColor = useThemeColor({}, 'accent');
  
  const getThemeColors = (themeType: string) => {
    switch (themeType) {
      case THEME_TYPES.LIGHT:
        return {
          overlay: 'rgba(244,244,244,.95)',
          icon: '#FFB74D',
          contentBg: '#FFFFFF'
        };
      case THEME_TYPES.DARK:
        return {
          overlay: 'rgba(2,13,25,.95)',
          icon: '#C0C0C0',
          contentBg: '#001C30'
        };
      case THEME_TYPES.DEVICE:
        if (deviceColorScheme === 'light') {
          return {
            overlay: 'rgba(244,244,244,.95)',
            icon: '#FFB74D',
            contentBg: '#FFFFFF'
          };
        } else {
          return {
            overlay: 'rgba(2,13,25,.95)',
            icon: '#C0C0C0',
            contentBg: '#001C30'
          };
        }
      default:
        return {
          overlay: 'rgba(0, 0, 0, 0.9)',
          icon: '#007AFF',
          contentBg: '#1C1C1E'
        };
    }
  };

  const handleThemeSelect = async (themeType: string) => {
    try {
      setTransitioningTheme(themeType);
      setShowThemeModal(true);
      
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
        Animated.loop(
          Animated.timing(rotationAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          { iterations: 3 }
        )
      ]).start();

      await setTheme(themeType as any);

      setTimeout(() => {
        Animated.parallel([
          Animated.timing(modalAnimation, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnimation, {
            toValue: 300,
            duration: 300,
            useNativeDriver: true,
          })
        ]).start(() => {
          setShowThemeModal(false);
          setTransitioningTheme('');
          modalAnimation.setValue(0);
          slideAnimation.setValue(300);
          iconAnimation.setValue(0);
          rotationAnimation.setValue(0);
        });
      }, 2000);
    } catch (error) {
      console.error('Error saving theme:', error);
      setShowThemeModal(false);
    }
  };

  const getThemeInfo = (themeType: string) => {
    switch (themeType) {
      case THEME_TYPES.DEVICE:
        return { icon: 'cellphone', name: 'Device Theme' };
      case THEME_TYPES.LIGHT:
        return { icon: 'white-balance-sunny', name: 'Light Mode' };
      case THEME_TYPES.DARK:
        return { icon: 'moon-waning-crescent', name: 'Dark Mode' };
      default:
        return { icon: 'palette', name: 'Theme' };
    }
  };

  const themeInfo = getThemeInfo(transitioningTheme);
  const themeColors = getThemeColors(transitioningTheme);

  return(
    <>
      <Modal
        visible={showThemeModal}
        transparent={true}
        animationType="none"
        statusBarTranslucent={true}
      >
        <Animated.View 
          style={[
            styles.themeModalOverlay,
            {
              backgroundColor: themeColors.overlay,
              opacity: modalAnimation,
            }
          ]}
        >
          <Animated.View 
            style={[
              styles.themeModalContent,
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
              <TIcon 
                name={themeInfo.icon} 
                size={80} 
                color={themeColors.icon} 
              />
            </Animated.View>
            <TText style={{ marginTop: 20 }}>
              Switching to
            </TText>
            <TText type="title">
              {themeInfo.name}
            </TText>
          </Animated.View>
        </Animated.View>
      </Modal>

      <TView style={styles.container}>
        <HiveBg />
        <Header title="App Theme" subtitle="Use the theme you prefer for the app." />
        <TouchableOpacity 
            key="device" 
            style={[styles.themeOption, { backgroundColor }]}
            onPress={() => handleThemeSelect(THEME_TYPES.DEVICE)}
          >
            <TIcon  name='cellphone' size={20} />
            <TText style={styles.themeOptionText}>Device Theme</TText>
            {selectedTheme === THEME_TYPES.DEVICE && (
              <TIcon name='check' size={20} color={accentColor} />
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            key="light" 
            style={[styles.themeOption, { backgroundColor }]}
            onPress={() => handleThemeSelect(THEME_TYPES.LIGHT)}
          >
            <TIcon name='white-balance-sunny' size={20} />
            <TText style={styles.themeOptionText}>Light Mode</TText>
            {selectedTheme === THEME_TYPES.LIGHT && (
              <TIcon name='check' size={20} color={accentColor} />
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            key="dark" 
            style={[styles.themeOption, { backgroundColor }]}
            onPress={() => handleThemeSelect(THEME_TYPES.DARK)}
          >
            <TIcon name='moon-waning-crescent' size={20} />
            <TText style={styles.themeOptionText}>Dark Mode</TText>
            {selectedTheme === THEME_TYPES.DARK && (
              <TIcon name='check' size={20} color={accentColor} />
            )}
          </TouchableOpacity>
      </TView>
    </>
  )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    themeOption: {
      flexDirection: 'row',
      gap: 15,
      alignItems: 'center',
      padding: 15,
      borderRadius: 15,
      marginBottom: 8,
    },
    themeModalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    themeModalContent: {
      padding: 40,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 250,
    },
    themeOptionText: {
      flex: 1,
    }
  });