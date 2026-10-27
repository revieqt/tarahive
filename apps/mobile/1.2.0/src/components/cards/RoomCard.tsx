import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { TIcon, TText, TView } from '@/components/ui/Themed';
import { BACKEND_URL } from '@/constants/Config';
import { useThemeColor } from '@/hooks/shared/useThemeColor';
import type { UserRoom } from '@/types/roomTypes';

interface RoomCardProps extends UserRoom {
  name?: string;
  pressable?: boolean;
  onPress?: () => void;
  options?: ReactNode;
}

export default function RoomCard({
  id,
  name,
  description,
  privacy,
  roomImage,
  members,
  pressable = true,
  onPress,
  options,
}: RoomCardProps) {
  const primaryColor = useThemeColor({}, 'primary');
  const imageUri = roomImage
    ? /^[a-z][a-z0-9+.-]*:/i.test(roomImage)
      ? roomImage
      : `${BACKEND_URL}${roomImage}`
    : null;

  const content = (
    <View style={styles.content}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.image} contentFit="cover" />
      ) : (
        <TView style={styles.imagePlaceholder}>
          <TIcon name="account-group" size={24} />
        </TView>
      )}
      <View style={styles.info}>
        <TText numberOfLines={1} style={styles.title}>{name || description || 'Room'}</TText>
        {name && description ? (
          <TText numberOfLines={1} style={styles.description}>{description}</TText>
        ) : null}
        <TText style={styles.meta}>
          {privacy} · {members} {members === 1 ? 'member' : 'members'}
        </TText>
      </View>
    </View>
  );

  return (
    <View style={[styles.card, { backgroundColor: primaryColor }]}>
      {pressable ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={name ? `Open ${name}` : `Open room ${id}`}
          onPress={onPress}
          style={styles.pressable}
        >
          {content}
        </Pressable>
      ) : content}
      {options ? <View style={styles.options}>{options}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    overflow: 'hidden',
  },
  pressable: {
    flex: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
  },
  image: {
    width: 52,
    height: 52,
    borderRadius: 12,
  },
  imagePlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#8883',
  },
  info: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontWeight: '700',
  },
  description: {
    fontSize: 12,
    opacity: 0.8,
  },
  meta: {
    fontSize: 11,
    opacity: 0.7,
  },
  options: {
    paddingHorizontal: 10,
  },
});
