import { StyleSheet, TextInput, View } from 'react-native';
import ColorBar from '@/components/itinerary/ColorBar';
import RoundButton from '@/components/ui/RoundButton';
import { TText } from '../ui/Themed';

interface WalletFormProps {
  name: string;
  setName: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  amountLimit: string;
  setAmountLimit: (value: string) => void;
  color: string;
  setColor: (value: string) => void;
  roomId?: string;
  setRoomId?: (value: string) => void;
  submit: () => void;
  submitIcon: 'check' | 'plus';
  isPending: boolean;
}

export default function WalletForm({
  name,
  setName,
  description,
  setDescription,
  amountLimit,
  setAmountLimit,
  color,
  setColor,
  roomId,
  setRoomId,
  submit,
  submitIcon,
  isPending,
}: WalletFormProps) {
  return (
    <View style={styles.form}>
      <View style={styles.colorBarContainer}>
        <ColorBar primaryColor='transparent' selectedColor={color} onSelect={setColor} style={{shadowColor: 'transparent'}}/>
      </View>
      <View style={[styles.wallet, {backgroundColor: color}]}>
        <View style={styles.stripe}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Wallet name"
            placeholderTextColor="#fff5"
            autoCapitalize="words"
            maxLength={100}
            style={styles.nameInput}
          />
          <TText style={styles.amountLimitLabel}>Wallet Amount Limit (0.00)</TText>
          <TextInput
            value={amountLimit}
            onChangeText={setAmountLimit}
            placeholder="unlimited"
            placeholderTextColor="#fff"
            keyboardType="numeric"
            style={styles.amountLimitInput}
          />
          
    
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Description (optional)"
            placeholderTextColor="#888"
            multiline
            numberOfLines={3}
            style={styles.descriptionInput}
          />
          
        </View>
        
      </View>
      
      <RoundButton iconName={submitIcon} onPress={submit} loading={isPending} style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { 
    flex: 1,
    paddingTop: 60
  },
  colorBarContainer: {
    borderRadius: 30,
    marginBottom: 8,
    paddingHorizontal: '3%',
  },
  wallet:{
    paddingHorizontal: '3%',
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
  },
  stripe:{
    borderWidth: 1.5,
    borderColor: '#fff5',
    borderRadius: 20,
    padding: 10,
    flex: 1,
    borderStyle: 'dashed',
  },
  nameInput: {
    color: '#fff',
    fontFamily: 'PlusJakartaSans',
    fontSize: 24,
    height: 45,
    fontWeight: 800,
    borderBottomWidth: 1,
    borderBottomColor: '#fff5',
  },
  descriptionInput: {
    backgroundColor: '#fff',
    borderRadius: 5,
    color: '#222',
    fontFamily: 'PlusJakartaSans',
    fontSize: 13,
    height: 100,
    padding: 8,
  },
  amountLimitInput: {
    color: '#fff',
    fontFamily: 'PlusJakartaSans',
    fontSize: 20,
    height: 35,
    fontWeight: 600,
    borderBottomWidth: 1,
    borderBottomColor: '#fff5',
    paddingBottom: 8,
    marginBottom: 10
  },
  amountLimitLabel: {
    color: '#fff',
    fontFamily: 'PlusJakartaSans',
    fontSize: 12,
    opacity: 0.7,
    marginTop: 10
  },
  button: { 
    position: 'absolute', 
    bottom: 16, 
    right: '3%',
    backgroundColor: '#fff5',
  },
});
