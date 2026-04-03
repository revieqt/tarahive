import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';

type GradientBlobsProps = {
  color?: string;
};

const GradientBlobs: React.FC<GradientBlobsProps> = ({ color }) => {
  const secondaryColor = useThemeColor({}, 'accent');
  const gradientColor = color || secondaryColor;

  return (
    <View style={styles.container}>
      <Svg width="100%" height="100%">

        <Defs>
          {/* Top Right Gradient */}
          <RadialGradient
            id="gradTopRight"
            cx="50%"
            cy="50%"
            r="50%"
            gradientUnits="objectBoundingBox"
          >
            <Stop offset="0%" stopColor={gradientColor} stopOpacity="0.55" />
            <Stop offset="70%" stopColor={gradientColor} stopOpacity="0.22" />
            <Stop offset="100%" stopColor={gradientColor} stopOpacity="0" />
          </RadialGradient>

          {/* Bottom Left Gradient */}
          <RadialGradient
            id="gradBottomLeft"
            cx="50%"
            cy="50%"
            r="50%"
            gradientUnits="objectBoundingBox"
          >
            <Stop offset="0%" stopColor={gradientColor} stopOpacity="0.6" />
            <Stop offset="70%" stopColor={gradientColor} stopOpacity="0.25" />
            <Stop offset="100%" stopColor={gradientColor} stopOpacity="0" />
          </RadialGradient>

          {/* Bottom Center Gradient */}
          <RadialGradient
            id="gradBottomCenter"
            cx="50%"
            cy="50%"
            r="50%"
            gradientUnits="objectBoundingBox"
          >
            <Stop offset="0%" stopColor={gradientColor} stopOpacity="0.4" />
            <Stop offset="80%" stopColor={gradientColor} stopOpacity="0.15" />
            <Stop offset="100%" stopColor={gradientColor} stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* TOP RIGHT BLOB */}
        <Circle
          cx="85%"     // same placement
          cy="-5%"
          r="35%"
          fill="url(#gradTopRight)"
          opacity={.5}
        />

        {/* BOTTOM LEFT BLOB */}
        <Circle
          cx="-10%"
          cy="85%"
          r="45%"
          fill="url(#gradBottomLeft)"
          opacity={.5}
        />

        {/* BOTTOM CENTER BLOB */}
        <Circle
          cx="60%"
          cy="95%"
          r="25%"
          fill="url(#gradBottomCenter)"
          opacity={.3}
        />

      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default GradientBlobs;
