import React from 'react';
import { ViewStyle, View } from 'react-native';
import { TText} from '@/components/ui/Themed';
import BackButton from './BackButton';

interface HeaderProps {
  title ?: string;
  subtitle ?: string;
  style?: ViewStyle | ViewStyle[];
}

const Header: React.FC<HeaderProps> = ({title,subtitle,style}) => {
  return (
    <View style={[{marginBottom: 16},style]}>
        <BackButton/>
        {title && <TText type='title'>{title}</TText>}
        {subtitle && <TText>{subtitle}</TText>}
    </View>
  );
};

export default Header;