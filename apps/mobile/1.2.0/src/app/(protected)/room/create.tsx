import { router, Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { TIcon, TText, TView } from '@/components/ui/Themed';
import Header from '@/components/common/Header';
import RoundButton from '@/components/ui/RoundButton';
import TextField from '@/components/ui/TextField';
import { useState } from 'react';
import { useThemeColor } from '@/hooks/shared/useThemeColor';
import { formatDateToString } from '@/utils/formatDateToString';
import { useLanguage } from '@/context/LanguageContext';
import ItineraryPickerModal from '@/components/modals/ItineraryPickerModal';
import { Itinerary } from '@/types/itineraryTypes';

const firstParam = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

export default function CreateRoomScreen() {
  const params = useLocalSearchParams<{
    id?: string | string[];
    title?: string | string[];
    startDate?: string | string[];
    endDate?: string | string[];
  }>();
  const secondaryColor = useThemeColor({}, 'secondary');
  const [roomName, setRoomName] = useState('');
  const [description, setDescription] = useState('');
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [itineraryId, setItineraryId] = useState(() => firstParam(params.id));
  const [itineraryTitle, setItineraryTitle] = useState(() => firstParam(params.title));
  const [itineraryStartDate, setItineraryStartDate] = useState(() => firstParam(params.startDate));
  const [itineraryEndDate, setItineraryEndDate] = useState(() => firstParam(params.endDate));
  const { currentLanguage } = useLanguage();

  const handleItinerarySelect = (itinerary: Itinerary) => {
    setItineraryId(itinerary.id);
    setItineraryTitle(itinerary.title);
    setItineraryStartDate(itinerary.startDate);
    setItineraryEndDate(itinerary.endDate);
  };

  return (
    <TView style={styles.container}>
      <Header title='Create Room' subtitle='Fill-out details'/>

      <TextField
        value={roomName}
        placeholder='Enter Room Name'
        onChangeText={setRoomName}
      />

      <TextField
        value={description}
        placeholder='Enter Room Description'
        onChangeText={setDescription}
      />

      <TouchableOpacity
        style={[styles.itineraryButton, itineraryId && { borderColor: secondaryColor, backgroundColor: secondaryColor + '22' }]}
        onPress={() => setIsPickerVisible(true)}
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
        onClose={() => setIsPickerVisible(false)}
        onSelect={handleItinerarySelect}
      />

      <RoundButton
        iconName='plus'
        onPress={() => router.push('/room/[id]')}
        type='primary'
        style={styles.button}
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
