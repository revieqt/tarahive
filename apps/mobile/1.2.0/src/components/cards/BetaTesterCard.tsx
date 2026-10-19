import React, {useState} from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { TText, TIcon, TView } from '@/components/ui/Themed';
import { useLocation } from '@/context/LocationContext';
import { useCurrentWeather, type WeatherData } from '@/hooks/shared/useWeather';
import Skeleton from '@/components/ui/Skeleton';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColor } from '@/hooks/shared/useThemeColor';
import WeatherDisplay from '../common/WeatherDisplay';
import { useLanguage } from '@/context/LanguageContext';
import HiveBg from '../common/HiveBg';
import { SUPPORT_FORM_URL, FEEDBACK_FORM_URL } from '@/constants/Config';
import WebViewModal from '../modals/WebViewModal';


export default function BetaTesterCard() {
  const { t } = useLanguage();
  const locationData = useLocation();
  const secondaryColor = useThemeColor({}, 'secondary');
  const accentColor = useThemeColor({}, 'accent');
  const [webView, setWebView] = useState<{ url: string; title: string; subtitle?: string  } | null>(null);
  const handleWebView = (url: string, title: string, subtitle?: string) => () => setWebView({ url, title, subtitle });

  return (
    <TView style={styles.container} color='primary'>
      <HiveBg style={styles.hiveBg}/>
      <TText style={styles.title}>You are a Beta Tester!</TText>
      <TText style={styles.subtitle}>Share your feedback, and help shape the future of travel planning.</TText>

      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.options}
          onPress={handleWebView(SUPPORT_FORM_URL, t('tabs.account.feedback_button'), t('tabs.account.help_title'))}
        >
          <TIcon name='ticket-confirmation' size={20}/>
          <TText style={styles.optionsText}>Contact Support</TText>
        </TouchableOpacity>

        <View style={styles.optionsDivider}/>

        <TouchableOpacity style={styles.options}
          onPress={handleWebView(FEEDBACK_FORM_URL, t('tabs.account.feedback_button'), t('tabs.account.help_title'))}
        >
          <TIcon name='bug' size={20}/>
          <TText style={styles.optionsText}>Report a Bug</TText>
        </TouchableOpacity>

        <View style={styles.optionsDivider}/>

        <TouchableOpacity style={styles.options}
          onPress={handleWebView(FEEDBACK_FORM_URL, t('tabs.account.feedback_button'), t('tabs.account.help_title'))}
        >
          <TIcon name='chat-alert' size={20}/>
          <TText style={styles.optionsText}>Give Feedback</TText>
        </TouchableOpacity>
      </View>

      <WebViewModal
        visible={webView !== null}
        url={webView?.url ?? ''}
        title={webView?.title ?? ''}
        subtitle={webView?.subtitle ?? ''}
        onClose={() => setWebView(null)}
      />
    </TView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ccc2',
    borderRadius: 15,
    gap: 4,
  },
  hiveBg:{
    marginRight: '-15%'
  },
  title:{
    fontWeight: 700
  },
  subtitle:{
    fontSize: 11,
    opacity: .7
  },
  optionsContainer:{
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    marginTop: 4
  },
  options:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4
  },
  optionsText:{
    fontSize: 10
  },
  optionsDivider:{
    width: 1,
    backgroundColor: "#ccc4",
    height: '50%'
  }
});