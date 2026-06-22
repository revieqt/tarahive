import React from 'react';
import {
  ViewStyle,
  View,
  StyleSheet,
} from 'react-native';
import { TText, TView } from '@/shared/components/ui/Themed';
import BackButton from './BackButton';
import HiveBg from './HiveBg';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColor } from '@/shared/hooks/useThemeColor';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  style?: ViewStyle | ViewStyle[];
  children?: React.ReactNode;
  type?: 'default' | 'major' | 'minor';
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, style, type = 'default' }) => {
  const secondaryColor = useThemeColor({}, 'secondary');
  const accentColor = useThemeColor({}, 'accent');

  if (type === 'major') {
    return (
      <LinearGradient style={[{  
        overflow: 'hidden',
        height: 130, 
        }, style]} 
        colors={[ accentColor,secondaryColor]}
      >
        
        <View style={styles.hiveContainer}>
          <HiveBg fade={false}/>
        </View>
        <BackButton color='white' style={{ position: 'absolute', top: 10, left: 10 }} />

        <View style={{marginHorizontal: '3%', marginTop: 55}}>
          {title && 
            <TText type="title"
              style={{ color: 'white'}}
            >
              {title}
            </TText>
          }
          {subtitle && 
            <TText
              style={{ color: 'white', opacity: 0.8, marginTop: -4 }}
            >
              {subtitle}
            </TText>
          }
        </View>
        
        <TView style={styles.bottom}/>
      </LinearGradient>
    );
  }

  if (type === 'minor') {
    return (
      <LinearGradient style={[{  
        overflow: 'hidden',
        height: 67, 
        }, style]} 
        colors={[ accentColor,secondaryColor]}
      >
        
        <View style={styles.hiveContainer}>
          <HiveBg fade={false}/>
        </View>
        <BackButton color='white' style={{ position: 'absolute', top: 5, left: 10 }} />

        <View style={{marginHorizontal: '3%', gap: 4, justifyContent: 'center', flex: 1, alignItems: 'center', marginTop: -16}}>
          {title && 
            <TText type="subtitle"
              style={{ color: 'white'}}
            >
              {title}
            </TText>
          }
          {subtitle && 
            <TText
              style={{ color: 'white', opacity: 0.8, marginTop: -4, fontSize: 11 }}
            >
              {subtitle}
            </TText>
          }
        </View>
        
        <TView style={styles.bottom}/>
      </LinearGradient>
    );
  }

  return (
    <View style={[{ marginBottom: 16 }, style]}>
      <BackButton />
      {title && <TText type="title">{title}</TText>}
      {subtitle && <TText>{subtitle}</TText>}
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bottom:{
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  hiveContainer: {
    ...StyleSheet.absoluteFillObject,
    marginRight: -20,
    marginTop: -40,
  }
});

export default Header;