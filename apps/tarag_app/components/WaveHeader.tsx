import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { ThemedIcons } from '@/components/ThemedIcons';
import BackButton from './BackButton';
import Wave from './Wave';

interface WaveHeaderProps {
  color?: string;
  title?: string;
  subtitle?: string;
  iconName?: string;
  image?: React.ReactNode;
}

const WaveHeader: React.FC<WaveHeaderProps> = ({ color, title, subtitle, iconName, image }) => {
  const secondaryColor = useThemeColor({}, 'secondary');
  const backgroundColor = useThemeColor({}, 'background');
  return (
    <View style={[styles.container, {backgroundColor: color || secondaryColor}]}>
      <BackButton style={{padding: 16, zIndex: 1000}} color='#fff'/>
      <View style={styles.textContainer}>
        {title && <ThemedText type='subtitle' style={{color: '#fff'}}>{title}</ThemedText>}
        {subtitle && <ThemedText style={{opacity: .7, color: '#fff'}}>{subtitle}</ThemedText>}
      </View>
      {(iconName || image) && (
        <>
          <View style={styles.iconContainer}>
            {image ? image : (
              <ThemedIcons
                name={iconName}
                size={120}
                color="#fff"
              />
            )}
          </View>
          <LinearGradient
            colors={['#fff','#fff', 'transparent']}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 0 }}
            style={styles.circle}
          >

            <LinearGradient
              colors={['#fff','#fff', 'transparent']}
              start={{ x: 1, y: 0 }}
              end={{ x: 0, y: 0 }}
              style={styles.innerCirlce}
            />
          </LinearGradient>
        </>
      )}
      <Wave style={styles.wave} color={backgroundColor}/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 150,
    overflow: 'hidden'
  },
  textContainer: {
    paddingHorizontal: 16,
  },
  iconContainer: {
    position: 'absolute',
    top: 40,
    right: -10,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: .9,
    zIndex: 99,
  },
  circle: {
    position: 'absolute',
    top: 20,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 1000,
    overflow: 'hidden',
    opacity: .4,
    padding: 30,
  },
  innerCirlce:{
    flex: 1,
    borderRadius: 1000,
    overflow: 'hidden',
    opacity: .5,
    padding: 30,
  },
  wave: {
    position: 'absolute',
    bottom: 0,
    zIndex: 101,
  }
});

export default WaveHeader;