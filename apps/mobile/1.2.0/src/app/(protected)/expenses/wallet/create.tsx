import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Header from '@/components/common/Header';
import { TView } from '@/components/ui/Themed';
import WalletForm from '@/components/expenses/WalletForm';
import WalletSuccessModal from '@/components/expenses/WalletSuccessModal';
import { useCreateWallet } from '@/hooks/expenses/useCreateWallet';

export default function CreateWalletScreen() {
  const [successVisible, setSuccessVisible] = useState(false);
  const { roomId: roomIdParam } = useLocalSearchParams<{ roomId?: string | string[] }>();
  const roomScoped = Boolean(roomIdParam);
  const {
    name, setName, description, setDescription, amountLimit, setAmountLimit,
    color, setColor, roomId, setRoomId, create, isPending,
  } = useCreateWallet(() => setSuccessVisible(true));

  return (
    <TView style={styles.container}>
      <Header title="Create Wallet" />
      <WalletForm
        name={name}
        setName={setName}
        description={description}
        setDescription={setDescription}
        amountLimit={amountLimit}
        setAmountLimit={setAmountLimit}
        color={color}
        setColor={setColor}
        roomId={roomId}
        setRoomId={roomScoped ? undefined : setRoomId}
        submit={create}
        submitIcon="plus"
        isPending={isPending}
      />
      <WalletSuccessModal
        visible={successVisible}
        onFinish={() => router.back()}
        title="Wallet Created"
        subtitle={`${name} is ready to use`}
        walletColor={color}
      />
    </TView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: '3%' },
});