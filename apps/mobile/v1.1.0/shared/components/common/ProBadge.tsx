import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

interface ProBadgeProps {
  isProUser: boolean;
  size?: number;
}

export default function ProBadge({ isProUser, size = 20 }: ProBadgeProps) {
  if (!isProUser) {
    return null;
  }

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image
        source={require('@/shared/assets/images/pro-badge.png')}
        style={{
          width: size,
          height: size,
          resizeMode: 'contain'
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center'
  }
});
