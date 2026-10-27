import { ActivityIndicator, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { TText, TView } from '@/components/ui/Themed';
import BackButton from '@/components/common/BackButton';
import { BACKEND_URL } from '@/constants/Config';
import { useThemeColor } from '@/hooks/shared/useThemeColor';
import { useUpdateRoom } from '@/hooks/room/useUpdateRoom';

export default function UpdateRoomScreen() {
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const {
    room,
    isLoading,
    isError,
    refetch,
    name,
    setName,
    description,
    setDescription,
    privacy,
    setPrivacy,
    themeColor,
    setThemeColor,
    roomImageUri,
    chooseRoomImage,
    hasChanges,
    save,
    isPending,
  } = useUpdateRoom();

  if (isLoading) {
    return (
      <TView style={styles.stateContainer}>
        <ActivityIndicator />
      </TView>
    );
  }

  if (isError || !room) {
    return (
      <TView style={styles.stateContainer}>
        <TText>{isError ? 'Failed to load room' : 'Room not found'}</TText>
        {isError ? (
          <TouchableOpacity onPress={() => { void refetch(); }}>
            <TText style={styles.retry}>Retry</TText>
          </TouchableOpacity>
        ) : null}
      </TView>
    );
  }

  const savedImageUri = room.roomImage
    ? /^[a-z][a-z0-9+.-]*:/i.test(room.roomImage)
      ? room.roomImage
      : `${BACKEND_URL}${room.roomImage}`
    : undefined;
  const imageUri = roomImageUri ?? savedImageUri;

  return (
    <TView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <BackButton />
          <TText type="title">Edit room</TText>
        </View>

        <TouchableOpacity
          style={[styles.imagePicker, { backgroundColor: primaryColor }]}
          onPress={chooseRoomImage}
          accessibilityRole="button"
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <TText>Add room image</TText>
            </View>
          )}
          <TText style={styles.imageAction}>{imageUri ? 'Change image' : 'Choose image'}</TText>
        </TouchableOpacity>

        <TText style={styles.label}>Name</TText>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Room name"
          placeholderTextColor={`${textColor}80`}
          style={[styles.input, { color: textColor, borderColor: `${textColor}30` }]}
          maxLength={255}
          accessibilityLabel="Room name"
        />

        <TText style={styles.label}>Description</TText>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Describe this room"
          placeholderTextColor={`${textColor}80`}
          style={[styles.input, styles.descriptionInput, { color: textColor, borderColor: `${textColor}30` }]}
          multiline
          textAlignVertical="top"
          accessibilityLabel="Room description"
        />

        <TText style={styles.label}>Privacy</TText>
        <View style={styles.privacyOptions}>
          {(['PRIVATE', 'PUBLIC'] as const).map((value) => (
            <TouchableOpacity
              key={value}
              onPress={() => setPrivacy(value)}
              style={[
                styles.privacyOption,
                { borderColor: privacy === value ? primaryColor : `${textColor}30` },
                privacy === value && { backgroundColor: `${primaryColor}20` },
              ]}
              accessibilityRole="radio"
              accessibilityState={{ selected: privacy === value }}
            >
              <TText>{value === 'PRIVATE' ? 'Private' : 'Public'}</TText>
            </TouchableOpacity>
          ))}
        </View>

        <TText style={styles.label}>Theme color</TText>
        <TextInput
          value={themeColor}
          onChangeText={setThemeColor}
          placeholder="#FF6B6B"
          placeholderTextColor={`${textColor}80`}
          style={[styles.input, { color: textColor, borderColor: `${textColor}30` }]}
          autoCapitalize="characters"
          maxLength={7}
          accessibilityLabel="Theme color hex value"
        />

        <TouchableOpacity
          onPress={save}
          disabled={!hasChanges || isPending}
          style={[
            styles.saveButton,
            { backgroundColor: primaryColor },
            (!hasChanges || isPending) && styles.disabledButton,
          ]}
          accessibilityRole="button"
        >
          {isPending ? <ActivityIndicator color={textColor} /> : <TText>Save changes</TText>}
        </TouchableOpacity>
      </ScrollView>
    </TView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 18,
    paddingBottom: 36,
    gap: 10,
  },
  stateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 8,
  },
  imagePicker: {
    height: 190,
    borderRadius: 14,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  imageAction: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#0009',
    color: '#fff',
  },
  label: {
    marginTop: 6,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    minHeight: 46,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  descriptionInput: {
    minHeight: 110,
  },
  privacyOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  privacyOption: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 16,
  },
  saveButton: {
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  disabledButton: {
    opacity: 0.45,
  },
  retry: {
    textDecorationLine: 'underline',
  },
});
