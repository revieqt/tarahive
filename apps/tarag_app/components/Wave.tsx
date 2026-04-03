import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useThemeColor } from '@/hooks/useThemeColor';

interface WaveProps {
  color?: string;
  height?: number;
  amplitude?: number;
  style?: any;
}

const Wave: React.FC<WaveProps> = ({
  color = useThemeColor({}, 'primary'), // default indigo color
  height = 50,
  amplitude = 30,
  style,
}) => {
  const waveWidth = 1000; // width of SVG for smooth curve

  // Wave path (curved top, flat bottom)
  const d = `
    M0 ${amplitude} 
    Q ${waveWidth / 4} 0, ${waveWidth / 2} ${amplitude}
    T ${waveWidth} ${amplitude}
    L ${waveWidth} ${height}
    L 0 ${height}
    Z
  `;

  return (
    <View style={[styles.outerContainer, style]}>
      <View style={[styles.container, { height }]}>
        <Svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${waveWidth} ${height}`}
          preserveAspectRatio="none"
        >
          <Path d={d} fill={color} />
        </Svg>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
  },
  container: {
    width: '100%',
    overflow: 'hidden',
  },
});

export default Wave;
