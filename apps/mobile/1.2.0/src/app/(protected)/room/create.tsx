import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { TIcon, TText, TView } from '@/components/ui/Themed';
import Header from '@/components/common/Header';
import RoundButton from '@/components/ui/RoundButton';
import TextField from '@/components/ui/TextField';
import { useThemeColor } from '@/hooks/shared/useThemeColor';
import { formatDateToString } from '@/utils/formatDateToString';
import { useLanguage } from '@/context/LanguageContext';
import ItineraryPickerModal from '@/components/modals/ItineraryPickerModal';
import { useCreateRoom } from '@/hooks/room/useCreateRoom';

export default function CreateRoomScreen() {
  const secondaryColor = useThemeColor({}, 'secondary');
  const { currentLanguage } = useLanguage();
  const {
    name,
    setName,
    isPickerVisible,
    openItineraryPicker,
    closeItineraryPicker,
    itineraryId,
    itineraryTitle,
    itineraryStartDate,
    itineraryEndDate,
    selectItinerary,
    create,
    isPending,
  } = useCreateRoom();

  return (
    <TView style={styles.container}>
      <Header title='Create Room'/>

      <TextField
        value={name}
        placeholder='Enter Room Name'
        onChangeText={setName}
      />

      <TouchableOpacity
        style={[styles.itineraryButton, itineraryId && { borderColor: secondaryColor, backgroundColor: secondaryColor + '22' }]}
        onPress={openItineraryPicker}
        accessibilityRole="button"
      >
        {
          itineraryId ? (
            <View style={{width: '100%', gap: 3}}>
              <TText style={styles.itineraryDetails}>Attached Itinerary</TText>
              <TText>{itineraryTitle}</TText>
              <TText style={styles.itineraryDetails}>
                {itineraryStartDate ? formatDateToString(itineraryStartDate, currentLanguage.code) : 'Date'} - {itineraryEndDate ? formatDateToString(itineraryEndDate, currentLanguage.code) : 'Date'}
              </TText>
            </View>
          ) : (<>
            <TIcon name='plus' size={20}/>
            <TText>Select Itinerary</TText>
            <TText style={styles.itineraryDetails}>Attach an itinerary to this room (optional)</TText>
          </>
          )
        }
      </TouchableOpacity>

      <ItineraryPickerModal
        visible={isPickerVisible}
        onClose={closeItineraryPicker}
        onSelect={selectItinerary}
      />

      <RoundButton
        iconName='plus'
        onPress={create}
        type='primary'
        style={styles.button}
        loading={isPending}
      />
    </TView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: '3%'
  },
  button: {
    position: 'absolute',
    bottom: '3%',
    right: 16,
  },
  itineraryButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc4',
    borderRadius: 15,
    backgroundColor: '#ccc1',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
  },
  itineraryDetails: {
    fontSize: 10,
    color: '#888',
  },
});
