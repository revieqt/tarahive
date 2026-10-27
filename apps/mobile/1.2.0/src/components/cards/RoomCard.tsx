import type { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { TIcon, TText, TView } from '@/components/ui/Themed';
import { BACKEND_URL } from '@/constants/Config';
import type { UserRoom } from '@/types/roomTypes';
import { router } from 'expo-router';

interface RoomCardProps extends UserRoom {
  pressable?: boolean;
  onPress?: () => void;
  options?: ReactNode;
  style?: ViewStyle;
}

export default function RoomCard({
  id,
  name,
  description,
  privacy,
  themeColor,
  roomImage,
  members,
  pressable = true,
  style
}: RoomCardProps) {
  const imageUri = roomImage
    ? /^[a-z][a-z0-9+.-]*:/i.test(roomImage)
      ? roomImage
      : `${BACKEND_URL}${roomImage}`
    : null;

  return (
    <TouchableOpacity 
      style={[styles.card, style]}
      disabled={!pressable}
      onPress={() => router.push(`/room/${id}`)}
    >
      <TView style={[styles.imageContainer, { backgroundColor: themeColor }]}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.imageContainer} contentFit="cover" />
        ) : <TIcon name="account-group" size={30} color='white'/>
        }
      </TView>

      <View style={styles.content}>
        <TText numberOfLines={1} style={styles.title}>{name || description || 'Room'}</TText>

        {name && description ? (
          <TText numberOfLines={1} style={styles.description}>{description}</TText>
        ) : null}

        <View style={styles.metaRow}>
          <TText style={styles.meta}>
            {privacy.charAt(0).toUpperCase() + privacy.slice(1).toLowerCase()} ·
          </TText>
          <TText style={styles.meta}>{members}</TText>
          <TIcon name="account" size={12} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    borderRadius: 15,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#8883',
  },
  content: {
    paddingVertical: 10,
    gap: 3
  },
  image: {
    width: 52,
    height: 52,
    borderRadius: 12,
  },
  title: {
    fontWeight: '700',
  },
  description: {
    fontSize: 11,
    opacity: 0.8,
  },
  meta: {
    fontSize: 11,
    opacity: 0.7,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  options: {
    paddingHorizontal: 10,
  },
});
