import React, {useState} from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { TText, TIcon } from '@/components/ui/Themed';
import { useLocation } from '@/context/LocationContext';
import { useThemeColor } from '@/hooks/shared/useThemeColor';
import { useLanguage } from '@/context/LanguageContext';
import HiveBg from '../common/HiveBg';
import { SUPPORT_FORM_URL, FEEDBACK_FORM_URL } from '@/constants/Config';
import WebViewModal from '../modals/WebViewModal';

export default function BetaTesterCard() {
  const { t } = useLanguage();
  const secondaryColor = useThemeColor({}, 'secondary');
  const accentColor = useThemeColor({}, 'accent');
  const [webView, setWebView] = useState<{ url: string; title: string; subtitle?: string  } | null>(null);
  const handleWebView = (url: string, title: string, subtitle?: string) => () => setWebView({ url, title, subtitle });

  return (
    <View style={[styles.container, {backgroundColor: secondaryColor + '20'}]}>
      <TText style={[styles.title, {color: accentColor}]}>You are a Beta Tester!</TText>
      <TText style={styles.subtitle}>Share your feedback, and help shape the future of travel planning.</TText>

      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.options}
          onPress={handleWebView(SUPPORT_FORM_URL, t('tabs.account.feedback_button'), t('tabs.account.help_title'))}
        >
          <TIcon name='ticket-confirmation' size={20} color={secondaryColor}/>
          <TText style={styles.optionsText}>Contact Support</TText>
        </TouchableOpacity>

        <View style={styles.optionsDivider}/>

        <TouchableOpacity style={styles.options}
          onPress={handleWebView(FEEDBACK_FORM_URL, t('tabs.account.feedback_button'), t('tabs.account.help_title'))}
        >
          <TIcon name='bug' size={20} color={secondaryColor}/>
          <TText style={styles.optionsText}>Report Bug</TText>
        </TouchableOpacity>

        <View style={styles.optionsDivider}/>

        <TouchableOpacity style={styles.options}
          onPress={handleWebView(FEEDBACK_FORM_URL, t('tabs.account.feedback_button'), t('tabs.account.help_title'))}
        >
          <TIcon name='chat-alert' size={20} color={secondaryColor}/>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ccc2',
    borderRadius: 15,
    gap: 4,
    marginVertical: 4
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
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
    marginTop: 8,
    paddingHorizontal: '7%'
  },
  options:{
    width: '20%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  optionsText:{
    fontSize: 10,
    textAlign: 'center'
  },
  optionsDivider:{
    width: 1,
    backgroundColor: "#ccc4",
    height: '50%'
  }
});