import { TouchableOpacity } from "react-native";
import { TIcon, TText, TView } from "@/shared/components/ui/Themed";
import { StyleSheet, Animated, Modal } from "react-native";
import { useState } from "react";
import { useTheme, getThemeInfo } from "@/shared/context/ThemeContext";
import { useThemeColor } from "@/shared/hooks/useThemeColor";
import HiveBg from "@/shared/components/common/HiveBg";
import Header from "@/shared/components/common/Header";
import { useLanguage } from "@/shared/context/LanguageContext";

export default function LanguageSettingsScreen() {
  const { theme: selectedTheme, setTheme, THEME_TYPES } = useTheme();
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [transitioningTheme, setTransitioningTheme] = useState<string>('');
  const [modalAnimation] = useState(new Animated.Value(0));
  const [slideAnimation] = useState(new Animated.Value(300));
  const [iconAnimation] = useState(new Animated.Value(0));
  const [rotationAnimation] = useState(new Animated.Value(0));
  const primaryColor = useThemeColor({}, 'primary');
  const backgroundColor = useThemeColor({}, 'background');
  const accentColor = useThemeColor({}, 'accent');
  const themeInfo = getThemeInfo(transitioningTheme);
  const { t } = useLanguage();

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
              backgroundColor: backgroundColor + '99',
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
              <TIcon name={themeInfo.icon} size={80} />
            </Animated.View>
            <TText style={{ marginTop: 20 }}> {t('settings.theme.switch_prompt')} </TText>
            <TText type="title"> {themeInfo.name} </TText>
          </Animated.View>
        </Animated.View>
      </Modal>

      <TView style={styles.container}>
        <HiveBg />
        <Header title={t('settings.theme.title')} subtitle={t('settings.theme.subtitle')} />
        <TouchableOpacity 
            key="device" 
            style={[styles.themeOption, { backgroundColor: primaryColor }]}
            onPress={() => handleThemeSelect(THEME_TYPES.DEVICE)}
          >
            <TIcon  name='cellphone' size={20} />
            <TText style={styles.themeOptionText}> {t('settings.theme.device')} </TText>
            {selectedTheme === THEME_TYPES.DEVICE && (
              <TIcon name='check' size={20} color={accentColor} />
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            key="light" 
            style={[styles.themeOption, { backgroundColor: primaryColor }]}
            onPress={() => handleThemeSelect(THEME_TYPES.LIGHT)}
          >
            <TIcon name='white-balance-sunny' size={20} />
            <TText style={styles.themeOptionText}> {t('settings.theme.light')} </TText>
            {selectedTheme === THEME_TYPES.LIGHT && (
              <TIcon name='check' size={20} color={accentColor} />
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            key="dark" 
            style={[styles.themeOption, { backgroundColor: primaryColor }]}
            onPress={() => handleThemeSelect(THEME_TYPES.DARK)}
          >
            <TIcon name='moon-waning-crescent' size={20} />
            <TText style={styles.themeOptionText}> {t('settings.theme.dark')} </TText>
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