import { router, Stack } from 'expo-router';
import { StyleSheet, } from 'react-native';
import { TIcon, TText, TView } from '@/components/ui/Themed';
import HiveBg from '@/components/common/HiveBg';
import Button from '@/components/ui/Button';
import EmptyMessage from '@/components/common/EmptyMessage';
import TextField from '@/components/ui/TextField';
import DropDownField from '@/components/ui/DropDownField';

export default function EditRoomScreen() {

  return (
    <TView style={styles.container}>
      <TextField
        placeholder="Room Name"
        value=""
        onChangeText={(text) => {
          
        }}
      />

      <TextField
        placeholder="Room Description"
        value=""
        onChangeText={(text) => {
          
        }}
      />

      <DropDownField
        placeholder="Room Privacy"
        values={[
          { label: 'Public', value: 'public' },
          { label: 'Private', value: 'private' },
        ]}
        value=""
        onValueChange={(value) => {
          
        }}
      />
    </TView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: '3%',
  },
});
