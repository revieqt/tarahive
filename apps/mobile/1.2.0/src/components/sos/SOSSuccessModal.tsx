import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { TIcon, TText } from '../ui/Themed';

type IconName = React.ComponentProps<typeof TIcon>['name'];

export type SOSSuccessType = 'activation' | 'deactivation';

export interface SOSSuccessModalProps {
  /** Whether the overlay is shown. The animation restarts every time this becomes true. */
  visible: boolean;
  /** `activation` shows a red circle, `deactivation` shows a green one. */
  type: SOSSuccessType;
  /** Called once after the overlay's timed display and slide-up close animation. */
  onFinish: () => void;
  /** Seconds from the moment the overlay appears until `onFinish` runs. Default: 5. */
  durationSeconds?: number;
  title: string;
  subtitle?: string;
  iconName?: IconName;
}

const CIRCLE_COLORS: Record<SOSSuccessType, string> = {
  activation: '#E5252A',
  deactivation: '#14804A',
};

const ICON_CIRCLE = 112;

const SOSSuccessModal: React.FC<SOSSuccessModalProps> = ({
  visible,
  type,
  onFinish,
  durationSeconds = 5,
  title,
  subtitle,
  iconName = 'check',
}) => {
  const { width, height } = useWindowDimensions();
  // Diameter that fully covers the screen from its center (diagonal + safety margin
  // for the status/navigation bar areas that useWindowDimensions can leave out).
  const circleSize = Math.hypot(width, height) * 1.1;

  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  const [isMounted, setIsMounted] = useState(visible);
  const isClosing = useRef(false);
  const closeAnimation = useRef<Animated.CompositeAnimation | null>(null);
  const circleScale = useRef(new Animated.Value(0.001)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0.4)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;

  const closeModal = () => {
    if (isClosing.current) return;
    isClosing.current = true;

    const animation = Animated.timing(translateY, {
      toValue: -height,
      duration: 450,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    });
    closeAnimation.current = animation;
    animation.start(({ finished }) => {
      closeAnimation.current = null;
      if (!finished) return;
      setIsMounted(false);
      isClosing.current = false;
      onFinishRef.current();
    });
  };

  // Animation sequence:
  // 1. a circle grows rapidly from the center with a pop until it covers the screen
  // 2. the icon pops in, then the title and subtitle fade in
  useEffect(() => {
    if (!visible) return;

    closeAnimation.current?.stop();
    closeAnimation.current = null;
    setIsMounted(true);
    isClosing.current = false;
    translateY.setValue(0);
    circleScale.setValue(0.001);
    iconScale.setValue(0.4);
    iconOpacity.setValue(0);
    titleOpacity.setValue(0);
    subtitleOpacity.setValue(0);

    const intro = Animated.sequence([
      Animated.timing(circleScale, {
        toValue: 1,
        duration: 480,
        easing: Easing.out(Easing.back(1.4)),
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(iconOpacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(iconScale, {
          toValue: 1,
          friction: 4,
          tension: 90,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(120),
          Animated.timing(titleOpacity, {
            toValue: 1,
            duration: 280,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(240),
          Animated.timing(subtitleOpacity, {
            toValue: 1,
            duration: 280,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]);

    intro.start();

    return () => {
      intro.stop();
      closeAnimation.current?.stop();
    };
  }, [visible, circleScale, translateY, iconScale, iconOpacity, titleOpacity, subtitleOpacity]);

  useEffect(() => {
    if (!visible && isMounted) {
      closeModal();
    }
  }, [visible, isMounted, height, translateY]);

  // Run the callback after `durationSeconds`.
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(closeModal, durationSeconds * 1000);
    return () => clearTimeout(timer);
  }, [visible, durationSeconds, height, translateY]);

  if (!isMounted) return null;

  return (
    <Modal
      visible={isMounted}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => {
        /* block the Android back button while the overlay is showing */
      }}
    >
      <Animated.View
        style={[styles.root, { transform: [{ translateY }] }]}
        accessible
        accessibilityRole="alert"
        accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}
      >
        {/* Circle: grows from the center until it covers the whole screen */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.circle,
            {
              width: circleSize,
              height: circleSize,
              borderRadius: circleSize / 2,
              backgroundColor: CIRCLE_COLORS[type],
              transform: [{ scale: circleScale }],
            },
          ]}
        />

        {/* Icon, title and subtitle */}
        <View style={styles.content}>
          <Animated.View
            style={[
              styles.iconCircle,
              { opacity: iconOpacity, transform: [{ scale: iconScale }] },
            ]}
          >
            <TIcon name={iconName} size={56} color="#FFFFFF" />
          </Animated.View>

          <Animated.View style={{ opacity: titleOpacity }}>
            <TText type="title" style={styles.title}>
              {title}
            </TText>
          </Animated.View>

          {!!subtitle && (
            <Animated.View style={{ opacity: subtitleOpacity }}>
              <TText style={styles.subtitle}>{subtitle}</TText>
            </Animated.View>
          )}
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  // Absolute with no offsets: Yoga centers it inside the root
  circle: {
    position: 'absolute',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: ICON_CIRCLE,
    height: ICON_CIRCLE,
    borderRadius: ICON_CIRCLE / 2,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    maxWidth: 320,
  },
});

export default SOSSuccessModal;