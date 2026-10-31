import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
// Swap this import for your own icon set if you don't use Expo
// (e.g. `react-native-vector-icons/Ionicons`). Only `Ionicons` and the
// `IconName` type below need to change.
import { Ionicons } from '@expo/vector-icons';
import { TIcon, TText } from '../ui/Themed';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export interface WalletSuccessModalProps {
  /** Whether the overlay is shown. The animation restarts every time this becomes true. */
  visible: boolean;
  /** Called once, `durationSeconds` after the overlay appears. */
  onFinish: () => void;
  /** Seconds from the moment the overlay appears until `onFinish` runs. Default: 3. */
  durationSeconds?: number;
  title: string;
  subtitle?: string;
  iconName?: IconName;
  /** Colour of the wallet body. */
  walletColor?: string;
}

// Wallet geometry
const WALLET_RADIUS = 36; // rounded top corners; pushed off-screen once the wallet has closed
// Strap geometry
const STRAP_WIDTH = 64;
const CLASP_SIZE = 40;
const ICON_CIRCLE = 112;

const WalletSuccessModal: React.FC<WalletSuccessModalProps> = ({
  visible,
  onFinish,
  durationSeconds = 5,
  title,
  subtitle,
  iconName = 'check',
  walletColor = '#14804A',
}) => {
  const { width, height } = useWindowDimensions();
  const strapHeight = Math.min(Math.max(height * 0.14, 80), 130);
  const strapGroupHeight = strapHeight;

  // Keep the latest values in refs so the effects below only restart when `visible` changes.
  const heightRef = useRef(height);
  heightRef.current = height;
  const strapGroupHeightRef = useRef(strapGroupHeight);
  strapGroupHeightRef.current = strapGroupHeight;
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  const walletY = useRef(new Animated.Value(height)).current;
  const strapY = useRef(new Animated.Value(-strapGroupHeight)).current;
  const claspScale = useRef(new Animated.Value(1)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0.4)).current;

  // Animation sequence:
  // 1. wallet rises from the bottom until it covers the whole screen
  // 2. icon, title and subtitle appear on the wallet
  // 3. strap drops from the top and the clasp snaps shut
  useEffect(() => {
    if (!visible) return;

    walletY.setValue(heightRef.current);
    strapY.setValue(-strapGroupHeightRef.current);
    claspScale.setValue(1);
    contentOpacity.setValue(0);
    iconScale.setValue(0.4);

    let cancelled = false;
    let pulse: Animated.CompositeAnimation | undefined;

    const intro = Animated.sequence([
      Animated.timing(walletY, {
        toValue: -WALLET_RADIUS,
        duration: 750,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.spring(iconScale, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(strapY, {
        toValue: 0,
        duration: 450,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]);

    intro.start(({ finished }) => {
      if (!finished || cancelled) return;
      pulse = Animated.sequence([
        Animated.timing(claspScale, {
          toValue: 1.35,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.spring(claspScale, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }),
      ]);
      pulse.start();
    });

    return () => {
      cancelled = true;
      intro.stop();
      pulse?.stop();
    };
  }, [visible, walletY, strapY, claspScale, contentOpacity, iconScale]);

  // Run the callback after `durationSeconds`.
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => onFinishRef.current(), durationSeconds * 1000);
    return () => clearTimeout(timer);
  }, [visible, durationSeconds]);

  if (!visible) return null;

  return (
    <Modal
      visible
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => {
        /* block the Android back button while the overlay is showing */
      }}
    >
      <View
        style={styles.root}
        accessible
        accessibilityRole="alert"
        accessibilityLabel={`${title}. ${subtitle}`}
      >
        {/* Wallet body: slides up from the bottom */}
        <Animated.View
          style={[
            styles.wallet,
            {
              height: height + WALLET_RADIUS,
              backgroundColor: walletColor,
              transform: [{ translateY: walletY }],
            },
          ]}
        >
          {/* Stitching */}
          <View pointerEvents="none" style={styles.walletStitch} />

          {/* Icon, title and subtitle */}
          <Animated.View style={[styles.content, { opacity: contentOpacity }]}>
            <Animated.View
              style={[styles.iconCircle, { transform: [{ scale: iconScale }] }]}
            >
              <TIcon name={iconName} size={56} color="#FFFFFF" />
            </Animated.View>
            <TText type='title' style={styles.title}>{title}</TText>
            <TText style={styles.subtitle}>{subtitle}</TText>
          </Animated.View>
        </Animated.View>

        {/* Strap: drops from the top, then the clasp snaps shut */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.strapGroup,
            {
              left: (width - STRAP_WIDTH) / 2,
              height: strapGroupHeight,
              transform: [{ translateY: strapY }],
            },
          ]}
        >
          <View
            style={[
              styles.strap,
              { height: strapHeight, backgroundColor: walletColor },
            ]}
          />
          <Animated.View
            style={[
              styles.clasp,
              {
                top: strapHeight - CLASP_SIZE - 15,
                transform: [{ scale: claspScale }],
              },
            ]}
          />
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
  },
  wallet: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: WALLET_RADIUS,
    borderTopRightRadius: WALLET_RADIUS,
    // Pushes the content down so it is centred in the visible part of the wallet
    paddingTop: WALLET_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },
  walletStitch: {
    position: 'absolute',
    top: WALLET_RADIUS + 14,
    left: 14,
    right: 14,
    bottom: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 24,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  content: {
    alignItems: 'center',
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
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    maxWidth: 320,
  },
  strapGroup: {
    position: 'absolute',
    top: 0,
    width: STRAP_WIDTH,
  },
  strap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  clasp: {
    position: 'absolute',
    left: (STRAP_WIDTH - CLASP_SIZE) / 2,
    width: CLASP_SIZE,
    height: CLASP_SIZE,
    borderRadius: CLASP_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(0,0,0,0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 10,
    backgroundColor: '#F5C451'
  },
});

export default WalletSuccessModal;