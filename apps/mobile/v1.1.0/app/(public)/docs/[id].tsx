import { StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useThemeColor } from '@/shared/hooks/useThemeColor';
import React, { useState, useEffect } from 'react';
import StickyScrollView from '@/shared/components/ui/StickyScrollView';
import Header from '@/shared/components/common/Header';

export default function DocsScreen() {
  const { id, name } = useLocalSearchParams<{
    id: string;
    name?: string;
  }>();
  const [ section, setSection ] = useState('');
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const accentColor = useThemeColor({}, 'accent');

  return (
    <StickyScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ height: 2000, padding: '3%'}}
      headerAppearOn={200}
      title={name}
      subtitle={'Profile'}
    >
      

      { section ? <>
        <Header title={name}/>
      </> : <>
        <Header title={name}/>
      </>}

    </StickyScrollView>
  );
}

const styles = StyleSheet.create({
});