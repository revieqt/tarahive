import React, { useState } from "react";
import { TView } from '@/components/ui/Themed';
import { useThemeColor } from '@/hooks/shared/useThemeColor';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, TouchableOpacity, View, Image, TextInput } from 'react-native';
import { useInternetConnection } from '@/utils/checkInternetConnection';
import { useLanguage } from '@/context/LanguageContext';
import StickyScrollView from '@/components/ui/StickyScrollView';
import { useSession } from '@/context/SessionContext';
import BackButton from "@/components/common/BackButton";
import RoundButton from "@/components/ui/RoundButton";

export default function CreateJournalScreen() {
  const isConnected = useInternetConnection();
  const textColor = useThemeColor({}, 'text');
  const { t } = useLanguage();
  const { session } = useSession();
  const [title, setTitle] = useState('');
  const [toolbar, setToolbar] = useState('')

  return (
    <TView style={{flex: 1}}>
      <View style={styles.header}>
        <TextInput
          placeholder={t('itinerary.form.title_placeholder')}
          value={title}
          onChangeText={setTitle}
          style={[styles.titleInput, {color: textColor}]}
          placeholderTextColor="#ccc8"
        />

        <BackButton type="close" style={styles.closeButton}/>
      </View>

      <View style={styles.content}>

      </View>

      <View style={styles.footer}>
        <ScrollView horizontal style={{flex: 1}}>

        </ScrollView>
        <RoundButton
          iconName="check"
          onPress={() => []}
        />
      </View>
    </TView>
    
  );
}

const styles = StyleSheet.create({
  header:{
    paddingTop: 16,
    padding: '3%',
  },
  titleInput: {
    fontFamily: "PlusJakartaSans",
    fontSize: 20,
    fontWeight: "bold",
    height: 30,
    width: "92%",
  },
  closeButton:{
    position: 'absolute',
    top: 12,
    right: 2,
    padding: 5
  },
  content:{
    flex: 1,
    backgroundColor: 'red'
  },
  footer:{
    flexDirection: 'row',
    gap: 5,
    padding: '3%',
    paddingBottom: 16
  }
});