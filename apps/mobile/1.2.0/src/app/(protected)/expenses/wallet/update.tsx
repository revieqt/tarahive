import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import Header from '@/components/common/Header';
import { TView } from '@/components/ui/Themed';
import WalletForm from '@/components/expenses/WalletForm';
import WalletSuccessModal from '@/components/expenses/WalletSuccessModal';
import { useUpdateWallet } from '@/hooks/expenses/useUpdateWallet';
import BackButton from '@/components/common/BackButton';


export default function UpdateWalletScreen() {
  const [successVisible, setSuccessVisible] = useState(false);
  const {
    isLoading, name, setName, description, setDescription, amountLimit, setAmountLimit,
    color, setColor, save, isPending,
  } = useUpdateWallet(() => setSuccessVisible(true));

  if (isLoading) {
    return <TView style={styles.loading}><ActivityIndicator /></TView>;
  }

  return (
    <TView style={{flex: 1}}>
      <BackButton type='floating'/>
      <WalletForm
        name={name}
        setName={setName}
        description={description}
        setDescription={setDescription}
        amountLimit={amountLimit}
        setAmountLimit={setAmountLimit}
        color={color}
        setColor={setColor}
        submit={save}
        submitIcon="check"
        isPending={isPending}
      />
      <WalletSuccessModal
        visible={successVisible}
        onFinish={() => router.back()}
        title="Wallet Updated"
        subtitle={`${name} is ready to use`}
        walletColor={color}
      />
    </TView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});