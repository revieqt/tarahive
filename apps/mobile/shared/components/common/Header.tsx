import React, { useRef, useState, useCallback } from 'react';
import {
  ViewStyle,
  View,
  ScrollView,
  ScrollViewProps,
  Animated,
  StyleSheet,
} from 'react-native';
import { TText } from '@/shared/components/ui/Themed';
import BackButton from './BackButton';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  style?: ViewStyle | ViewStyle[];
  children?: React.ReactNode;
  stickyAt?: number;
}

// ─── Standalone StickyHeader ────────────────────────────────────────────────
// Can be imported and used independently on any screen.

export const StickyHeader: React.FC<HeaderProps & { visible?: boolean }> = ({
  title,
  subtitle,
  style,
  visible = true,
}) => {
  const translateY = useRef(new Animated.Value(-80)).current;

  React.useEffect(() => {
    Animated.spring(translateY, {
      toValue: visible ? 0 : -80,
      useNativeDriver: true,
      bounciness: 0,
      speed: 20,
    }).start();
  }, [visible]);

  return (
    <Animated.View
      style={[
        styles.sticky,
        style,
        { transform: [{ translateY }] },
      ]}
    >
      <BackButton />
      {title && <TText type="title">{title}</TText>}
      {subtitle && <TText>{subtitle}</TText>}
    </Animated.View>
  );
};

// ─── Default Header ──────────────────────────────────────────────────────────
// Renders inline. When used with ScrollViewWithStickyHeader, its
// position triggers the StickyHeader automatically.

const Header: React.FC<HeaderProps> = ({ title, subtitle, style }) => {
  return (
    <View style={[{ marginBottom: 16 }, style]}>
      <BackButton />
      {title && <TText type="title">{title}</TText>}
      {subtitle && <TText>{subtitle}</TText>}
    </View>
  );
};

// ─── StickyScrollView ──────────────────────────────────────────────
// Drop-in ScrollView wrapper that wires scroll position to the sticky header.
// Usage:
//   <StickyScrollView headerProps={{ title: 'My Screen' }}>
//     {children}
//   </StickyScrollView>

interface WithStickyHeaderProps extends ScrollViewProps {
  headerProps: HeaderProps;
  stickyAt?: number;
  style?: ViewStyle;                  // styles the outer View container
  contentContainerStyle?: ViewStyle;  // passed straight to ScrollView
}

export const StickyScrollView: React.FC<WithStickyHeaderProps> = ({
  headerProps,
  stickyAt = 200,
  onScroll,
  style,
  contentContainerStyle,
  children,
  ...scrollProps
}) => {
  const [showSticky, setShowSticky] = useState(false);

  const handleScroll = useCallback(
    (e: Parameters<NonNullable<ScrollViewProps['onScroll']>>[0]) => {
      const y = e.nativeEvent.contentOffset.y;
      setShowSticky(y >= stickyAt);
      onScroll?.(e);
    },
    [stickyAt, onScroll],
  );

  return (
    <View style={[styles.container, style]}>
      <StickyHeader {...headerProps} visible={showSticky} />

      <ScrollView
        {...scrollProps}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        contentContainerStyle={contentContainerStyle}
      >
        <Header {...headerProps} />
        {children}
      </ScrollView>
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sticky: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 0,
    backgroundColor: 'white', // swap for your theme token
  },
});

export default Header;