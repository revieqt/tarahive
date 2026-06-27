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
import { useThemeColor } from '@/shared/hooks/useThemeColor';

export interface StickyScrollViewProps {
  title?: string;
  subtitle?: string;
  headerAppearOn?: number;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  onBack?: () => void;
  children?: ReactNode;
}

const HEADER_HEIGHT = 56;
const STATUS_BAR_HEIGHT =
  Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;
const TOTAL_HEADER_HEIGHT = HEADER_HEIGHT + STATUS_BAR_HEIGHT;

export default function StickyScrollView({
  title,
  subtitle,
  headerAppearOn = 80,
  style,
  contentContainerStyle,
  children,
}: StickyScrollViewProps) {
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
  const primaryColor = useThemeColor({}, 'primary');

  const scrollToTop = useCallback(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  const FADE_WINDOW = 48;
  const headerOpacity = scrollY.interpolate({
    inputRange: [
      headerAppearOn - FADE_WINDOW,
      headerAppearOn - FADE_WINDOW * 0.5,
      headerAppearOn,
    ],
    outputRange: [0, 0.25, 1],
    extrapolate: 'clamp',
  });

  const headerTranslateY = scrollY.interpolate({
    inputRange: [headerAppearOn - FADE_WINDOW, headerAppearOn],
    outputRange: [-14, 0],
    extrapolate: 'clamp',
  });

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: true },
  );

  const hasHeaderContent = Boolean(title || subtitle);

  return (
    <TView style={[style, { flex: 1 }]}>
      <Animated.View
        style={[
          styles.header,
          {
            height: TOTAL_HEADER_HEIGHT,
            paddingTop: STATUS_BAR_HEIGHT,
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }],
            backgroundColor: primaryColor + '40',
          },
        ]}
        pointerEvents="box-none"
      >
        <BackButton style={styles.headerSides} />

        {hasHeaderContent && (
          <Pressable
            onPress={scrollToTop}
            style={styles.headerTextBlock}
            accessibilityLabel="Scroll to top"
            accessibilityRole="button"
          >
            {title && (
              <TText type="subtitle" numberOfLines={1}>
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 3,
    gap: 8,
  },
  headerTextBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  headerSubtitle: {
    fontSize: 11,
    opacity: 0.7,
  },
  headerSides: {
    width: 20,
  },
});