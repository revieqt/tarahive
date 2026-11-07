import React, {useState} from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { TText, TIcon, TView } from '@/components/ui/Themed';
import { useLocation } from '@/context/LocationContext';
import { useThemeColor } from '@/hooks/shared/useThemeColor';
import { useLanguage } from '@/context/LanguageContext';
import HiveBg from './HiveBg';
import { SUPPORT_FORM_URL, FEEDBACK_FORM_URL } from '@/constants/Config';
import WebViewModal from '../modals/WebViewModal';
import { router } from 'expo-router';
import ProfileImage from '../ui/ProfileImage';

interface NewPostProps {
  style?: ViewStyle;
}

export default function NewPost({ style }: NewPostProps) {
  const { t } = useLanguage();
  const primaryColor = useThemeColor({}, 'primary');
  const accentColor = useThemeColor({}, 'accent');
  const [webView, setWebView] = useState<{ url: string; title: string; subtitle?: string  } | null>(null);
  const handleWebView = (url: string, title: string, subtitle?: string) => () => setWebView({ url, title, subtitle });

  return (
    <TouchableOpacity 
      style={[styles.container, {backgroundColor: primaryColor}, style]}
      onPress={() => router.push('/post/create')}
    >
      <View style={styles.textField}>
        <TText>
          New Post
        </TText>
      </View>

      <View>
        <View>
          <TText>
            Post
          </TText>
        </View>
      </View>
    </TouchableOpacity>
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
  textField: {
    width: '100%',
    padding: 14,
    borderWidth: 1,
    borderColor: '#ccc2',
    borderRadius: 15,
    backgroundColor: '#ccc2',
  },
});