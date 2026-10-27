import { ActivityIndicator, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { TText, TView } from '@/components/ui/Themed';
import BackButton from '@/components/common/BackButton';
import { BACKEND_URL } from '@/constants/Config';
import { useThemeColor } from '@/hooks/shared/useThemeColor';
import { useUpdateRoom } from '@/hooks/room/useUpdateRoom';
import ColorBar from '@/components/itinerary/ColorBar';
import TextField from '@/components/ui/TextField';
import DropDownField from '@/components/ui/DropDownField';
import Header from '@/components/common/Header';
import StickyScrollView from '@/components/ui/StickyScrollView';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '@/components/ui/Button';

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
    <TView style={{flex: 1}}>
      <StickyScrollView 
        contentContainerStyle={styles.content}
        title="Update Room"
        subtitle="Edit your room details"
      >
        <Header title="Update Room" subtitle="Edit your room details" />

        <TouchableOpacity
          style={[styles.imagePicker, { backgroundColor: themeColor }]}
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

        <View style={styles.colorBarContainer}>
          <ColorBar
            primaryColor={primaryColor}
            selectedColor={themeColor}
            onSelect={setThemeColor}
          />
        </View>

        <TextField
          placeholder="Name"
          value={name}
          onChangeText={setName}
          maxLength={255}
          accessibilityLabel="Room name"
        />

        <TextField
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={styles.descriptionField}
          accessibilityLabel="Room description"
        />

        <DropDownField
          placeholder="Privacy"
          value={privacy}
          onValueChange={(value) => {
            if (value === 'PRIVATE' || value === 'PUBLIC') setPrivacy(value);
          }}
          values={[
            { label: 'Private', value: 'PRIVATE' },
            { label: 'Public', value: 'PUBLIC' },
          ]}
        />
      </StickyScrollView>

      <LinearGradient
        colors={['transparent', primaryColor, primaryColor]}
        style={styles.buttonContainer}
      >
        <Button
          title="Save Changes"
          type='primary'
          loading={isPending}
          disabled={!hasChanges || isPending}
          onPress={save}
        />
      </LinearGradient>
    </TView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: '3%',
    paddingBottom: 100,
  },
  stateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
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
  descriptionField: {
    height: 110,
    borderRadius: 16,
  },
  colorBarContainer: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ccc4',
    borderRadius: 30,
    marginBottom: 8
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
  buttonContainer:{
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical:16,
    paddingHorizontal: '3%'
  }
});
