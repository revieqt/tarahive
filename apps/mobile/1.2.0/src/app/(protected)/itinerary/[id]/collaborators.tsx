import { useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';
import { TText, TView } from '@/components/ui/Themed';
import HiveBg from '@/components/common/HiveBg';
import Header from '@/components/common/Header';

export default function ItineraryCollaboratorsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();

  return (
    <TView style={styles.container}>

      <Header title="Collaborators" subtitle="Manage Itinerary Collaborators" /> 
      <HiveBg />
      <TText style={styles.label}>Itinerary ID: {id}</TText>
    </TView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: '3%'
  },
  label: {
    marginTop: 12,
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
