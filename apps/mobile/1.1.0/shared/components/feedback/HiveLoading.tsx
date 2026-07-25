import React, { use, useEffect, useRef } from "react";
import {
  View,
  Animated,
  Easing,
  ViewStyle,
} from "react-native";
import Svg, { Polygon } from "react-native-svg";
import { useThemeColor } from "@/shared/hooks/useThemeColor";

interface HiveLoadingProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);

const HEXAGON_POINTS = "50,5 93,27 93,73 50,95 7,73 7,27";

const Hexagon = ({
  opacity,
  x,
  y,
  size,
  color = useThemeColor({}, 'accent'),
}: {
  opacity: Animated.Value;
  x: number;
  y: number;
  size: number;
  color: string;
}) => {
  return (
    <Animated.View
      style={{
        position: "absolute",
        left: x,
        top: y,
        opacity,
        width: size,
        height: size,
      }}
    >
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <AnimatedPolygon points={HEXAGON_POINTS} fill={color} />
      </Svg>
    </Animated.View>
  );
};

const HiveLoading: React.FC<HiveLoadingProps> = ({
  size = 30,
  color = "#F4B400",
  style,
}) => {
  const opacityTop = useRef(new Animated.Value(0.25)).current;
  const opacityBottomRight = useRef(new Animated.Value(0.25)).current;
  const opacityBottomLeft = useRef(new Animated.Value(0.25)).current;

  useEffect(() => {
    const FADE_DURATION = 300;
    const HOLD_DURATION = 50;
    const STEP = FADE_DURATION * 2 + HOLD_DURATION;
    const TOTAL = STEP * 3;

    const createPulse = (animatedValue: Animated.Value, stepIndex: number) => {
      const initialDelay = stepIndex * STEP;
      const trailingDelay = TOTAL - initialDelay - (FADE_DURATION * 2 + HOLD_DURATION);

      return Animated.loop(
        Animated.sequence([
          ...(initialDelay > 0 ? [Animated.delay(initialDelay)] : []),
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: FADE_DURATION,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.delay(HOLD_DURATION),
          Animated.timing(animatedValue, {
            toValue: 0.25,
            duration: FADE_DURATION,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          ...(trailingDelay > 0 ? [Animated.delay(trailingDelay)] : []),
        ])
      );
    };

    const animation = Animated.parallel([
      createPulse(opacityTop, 0),
      createPulse(opacityBottomRight, 1),
      createPulse(opacityBottomLeft, 2),
    ]);

    animation.start();
    return () => animation.stop();
  }, []);

  const gap = size * 0.08;

  const verticalStep = size * 0.75 + gap;
  const hexW = size * 0.866;

  const containerWidth = hexW + size + gap;
  const containerHeight = size + verticalStep;

  const topX = (containerWidth - size) / 2;
  const topY = 0;

  const bottomY = verticalStep;

  const halfOffset = hexW / 2 + gap / 2;
  const bottomLeftX = topX - halfOffset;
  const bottomRightX = topX + halfOffset;

  return (
    <View
      style={[
        {
          width: containerWidth,
          height: containerHeight,
        },
        style,
      ]}
    >
      <Hexagon opacity={opacityTop} x={topX} y={topY} size={size} color={color} />

      <Hexagon opacity={opacityBottomRight} x={bottomRightX} y={bottomY} size={size} color={color} />

      <Hexagon opacity={opacityBottomLeft} x={bottomLeftX} y={bottomY} size={size} color={color} />
    </View>
  );
};

export default HiveLoading;