import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleProp, View, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);

export interface RadialGaugeProps {
  /** Lowest value on the gauge. Defaults to 0. */
  minimum?: number;
  /** Highest value on the gauge. */
  maximum: number;
  /** Current value. Clamped between minimum and maximum. */
  value: number;
  /** Outer radius of the semi-circle in px. Defaults to 50. */
  radius?: number;
  /** Color of the filled portion. Defaults to orange. */
  activeColor?: string;
  /** Color of the unfilled track. */
  baseColor?: string;
  /** Thickness of the bar (stroke width) in px. */
  width?: number;
  /** Duration of the fill animation in ms. Defaults to 1000. */
  animationDuration?: number;
  /** Optional style for the wrapping View. */
  style?: StyleProp<ViewStyle>;
}

const DEFAULT_ACTIVE_COLOR = 'orange';
const DEFAULT_BASE_COLOR = '#E5E7EB';
const DEFAULT_RADIUS = 50;
const DEFAULT_DURATION = 1000;

const RadialGauge: React.FC<RadialGaugeProps> = ({
  minimum = 0,
  maximum,
  value,
  radius = DEFAULT_RADIUS,
  activeColor = DEFAULT_ACTIVE_COLOR,
  baseColor = DEFAULT_BASE_COLOR,
  width,
  animationDuration = DEFAULT_DURATION,
  style,
}) => {
  // Default thickness scales with the radius; never thicker than the radius itself.
  const strokeWidth = Math.min(width ?? Math.max(radius * 0.2, 4), radius);

  const { path, arcLength, targetProgress, size } = useMemo(() => {
    // `radius` is the OUTER radius, so the stroke is drawn on the centerline.
    const r = radius - strokeWidth / 2;
    const cx = radius;
    const cy = radius;

    const range = maximum - minimum;
    const ratio = range > 0 ? (value - minimum) / range : 0;
    const clamped = Math.min(Math.max(Number.isFinite(ratio) ? ratio : 0, 0), 1);

    return {
      // Left point -> right point, sweeping clockwise over the top.
      path: `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`,
      arcLength: Math.PI * r,
      targetProgress: clamped,
      // Extra strokeWidth / 2 below the baseline leaves room for the round caps.
      size: { width: radius * 2, height: radius + strokeWidth / 2 },
    };
  }, [minimum, maximum, value, radius, strokeWidth]);

  // Starts at 0, so the fill animates in on first display.
  // It also animates smoothly from the current position if `value` changes later.
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: targetProgress,
      duration: animationDuration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // SVG props can't use the native driver
    });
    animation.start();
    return () => animation.stop();
  }, [progress, targetProgress, animationDuration]);

  // One dash as long as the arc, followed by a gap twice that long. Shifting the
  // dash with the offset reveals the arc from the left; at progress 0 the whole
  // arc sits in the gap, so no stray round cap is drawn.
  const dashOffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [arcLength, 0],
  });

  return (
    <View style={[{ width: size.width, height: size.height }, style]}>
      <Svg width={size.width} height={size.height}>
        {/* Base track */}
        <Path
          d={path}
          stroke={baseColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
        />
        {/* Animated active fill */}
        <AnimatedPath
          d={path}
          stroke={activeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${arcLength} ${arcLength * 2}`}
          strokeDashoffset={dashOffset}
        />
      </Svg>
    </View>
  );
};

export default RadialGauge;