import React, { useRef, useCallback, ReactNode } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  StatusBar,
} from 'react-native';
import BackButton from '../common/BackButton';
import { TText, TView } from './Themed';
import { useThemeColor } from '@/hooks/shared/useThemeColor';
import { LinearGradient } from 'expo-linear-gradient';

export interface StickyScrollViewProps {
  title?: string;
  subtitle?: string;
  headerAppearOn?: number;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  onBack?: () => void;
  children?: ReactNode;
  showBackButton?: boolean;
}

export interface StickyScrollViewHeaderProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  onTitlePress?: () => void;
  headerAppearOn?: number;
  scrollY?: Animated.Value;
}

const HEADER_HEIGHT = 56;
const STATUS_BAR_HEIGHT =
  Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;
const TOTAL_HEADER_HEIGHT = HEADER_HEIGHT + STATUS_BAR_HEIGHT;
const FADE_WINDOW = 48;

export function StickyScrollViewHeader({
  title,
  subtitle,
  showBackButton = true,
  onTitlePress,
  headerAppearOn = 80,
  scrollY,
}: StickyScrollViewHeaderProps) {
  const primaryColor = useThemeColor({}, 'primary');
  const hasHeaderContent = Boolean(title || subtitle);
  const headerOpacity = scrollY?.interpolate({
    inputRange: [
      headerAppearOn - FADE_WINDOW,
      headerAppearOn - FADE_WINDOW * 0.5,
      headerAppearOn,
    ],
    outputRange: [0, 0.25, 1],
    extrapolate: 'clamp',
  }) ?? 1;
  const headerTranslateY = scrollY?.interpolate({
    inputRange: [headerAppearOn - FADE_WINDOW, headerAppearOn],
    outputRange: [-14, 0],
    extrapolate: 'clamp',
  }) ?? 0;

  return (
    <Animated.View
      style={[
        styles.header,
        {
          height: TOTAL_HEADER_HEIGHT,
          paddingTop: STATUS_BAR_HEIGHT,
          opacity: headerOpacity,
          transform: [{ translateY: headerTranslateY }],
        },
      ]}
      pointerEvents="box-none"
    >
      <LinearGradient
        style={StyleSheet.absoluteFillObject}
        colors={[primaryColor, primaryColor, primaryColor, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        pointerEvents="none"
      />

      {showBackButton ? <BackButton style={styles.headerSides} /> : <View style={styles.headerSides} />}

      {hasHeaderContent && (
        <Pressable
          onPress={onTitlePress}
          style={styles.headerTextBlock}
          accessibilityLabel="Scroll to top"
          accessibilityRole="button"
        >
          {title && (
            <TText numberOfLines={1} style={styles.headerTitle}>
              {title}
            </TText>
          )}
          {subtitle && (
            <TText style={styles.headerSubtitle} numberOfLines={1}>
              {subtitle}
            </TText>
          )}
        </Pressable>
      )}

      <View style={styles.headerSides} />
    </Animated.View>
  );
}

export default function StickyScrollView({
  title,
  subtitle,
  headerAppearOn = 80,
  style,
  contentContainerStyle,
  children,
  showBackButton = true,
}: StickyScrollViewProps) {
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);

  const scrollToTop = useCallback(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: true },
  );

  return (
    <TView style={[style, { flex: 1 }]}>
      <StickyScrollViewHeader
        title={title}
        subtitle={subtitle}
        showBackButton={showBackButton}
        onTitlePress={scrollToTop}
        headerAppearOn={headerAppearOn}
        scrollY={scrollY}
      />

      <Animated.ScrollView
        ref={scrollRef as any}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={contentContainerStyle}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </Animated.ScrollView>
    </TView>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 8,
  },
  headerTextBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 11,
    opacity: 0.5,
  },
  headerSides: {
    width: 20,
  },
});