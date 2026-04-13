import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import ThemedIcons from '@/components/ThemedIcons';
import { ThemedText } from './ThemedText';

interface EmptyMessageProps {
  title: string;
  description: string;
  loading?: boolean;
  iconName?: string;
  buttonLabel?: string;
  buttonAction?: () => void;
  isWhite?: boolean;
  isSolid?: boolean;
}

const EmptyMessage: React.FC<EmptyMessageProps> = ({
  title,
  description,
  loading = false,
  iconName,
  buttonLabel,
  buttonAction,
  isWhite = false,
  isSolid = false
}) => {
  const color = isWhite ? '#FFFFFF' : useThemeColor({}, 'text');
  

  return (
    <View style={[styles.container, {opacity: isSolid ? 1 : .5}]}>
      {loading ? (
        <ActivityIndicator size={40} color={color}/>
      ) : (
        <>
        <ThemedIcons
            name={iconName}
            size={30}
            color={color}
        />
      </>
      )}
      <ThemedText style={{marginTop: 10, fontSize: 13, color: color}}>{title}</ThemedText>
      <ThemedText style={{opacity:.7, textAlign:'center', fontSize: 11, marginBottom: 10, color: color}}>{description}</ThemedText>
      {buttonLabel && buttonAction && (
        <TouchableOpacity onPress={buttonAction} style={{
          backgroundColor: 'rgba(0,0,0, .1)', paddingVertical: 7, paddingHorizontal: 15, borderRadius: 20}}>
          <ThemedText style={{color}}>{buttonLabel}</ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container:{
    alignItems: 'center',
    justifyContent: 'center',
  }
});

export default EmptyMessage; 