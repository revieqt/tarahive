import { StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useThemeColor } from '@/shared/hooks/useThemeColor';
import React, { useState, useEffect } from 'react';
import StickyScrollView from '@/shared/components/ui/StickyScrollView';
import Header from '@/shared/components/common/Header';
import { TIcon, TText } from '@/shared/components/ui/Themed';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '@/shared/context/LanguageContext';

export default function DocsScreen() {
  const { id, name } = useLocalSearchParams<{
    id: string;
    name?: string;
    section?: string;
  }>();
  const { t } = useLanguage();
  const [ section, setSection ] = useState('sads');
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const accentColor = useThemeColor({}, 'accent');

  return (
    <>
      <StickyScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ height: 2000, padding: '3%'}}
        headerAppearOn={200}
        title={name}
        subtitle={'Profile'}
      >
        

        { section ? <>
          <TText>sda</TText>
          
        </> : <>
          <Header title={name}/>
        </>}

      </StickyScrollView>

      { section && 
        <LinearGradient
          colors={['transparent', primaryColor]}
          style={styles.sectionButtonsContainer}
        >
          <TouchableOpacity
            style={[styles.sideButton, {backgroundColor: primaryColor}]}
          >
            <TIcon name="chevron-left" size={15}/>
            <TText style={{opacity: .7, fontSize: 11}}>{t('common.common.prev')}</TText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.mainButton, {backgroundColor: primaryColor}]}
            onPress={() => setSection('')}
          >
            <TText>Section Title</TText>
            <TText style={{opacity: .5, fontSize: 11}}>Go back to Menu</TText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sideButton, {backgroundColor: primaryColor}]}
          >
            <TText style={{opacity: .7, fontSize: 11}}>{t('common.common.next')}</TText>
            <TIcon name="chevron-right" size={15}/>
          </TouchableOpacity>
        </LinearGradient>
      }
    </>
    
  );
}

const styles = StyleSheet.create({
  sectionButtonsContainer:{
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '3%',
    zIndex: 100,
    flexDirection: 'row',
    gap: 5
  },
  sideButton:{
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 15,
    borderColor: '#ccc4',
    height: 47,
    width: 75,
    justifyContent: 'center',
    alignItems: 'center'
  },
  mainButton:{
    borderWidth: 1,
    borderRadius: 15,
    borderColor: '#ccc4',
    height: 47,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});