import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useThemeColor } from '@/shared/hooks/useThemeColor';
import { TIcon, TText } from '../ui/Themed';

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
        <TIcon
            name={iconName}
            size={30}
            color={color}
        />
      </>
      )}
      <TText style={{marginTop: 10, fontSize: 13, color: color}}>{title}</TText>
      <TText style={{opacity:.7, textAlign:'center', fontSize: 11, marginTop: 5, marginBottom: 10, color: color}}>{description}</TText>
      {buttonLabel && buttonAction && (
        <TouchableOpacity onPress={buttonAction} style={{
          backgroundColor: 'rgba(0,0,0, .1)', paddingVertical: 7, paddingHorizontal: 15, borderRadius: 20}}>
          <TText style={{color}}>{buttonLabel}</TText>
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