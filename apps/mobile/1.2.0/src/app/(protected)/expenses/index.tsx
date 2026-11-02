import { useRef, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import {
  ActivityIndicator,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { TIcon, TText, TView } from '@/components/ui/Themed';
import StickyScrollView from '@/components/ui/StickyScrollView';
import BackButton from '@/components/common/BackButton';
import Wallet from '@/components/cards/WalletCard';
import { useSession } from '@/context/SessionContext';
import { useGetWallets } from '@/hooks/expenses/useGetWallets';
import { useDeleteWallet } from '@/hooks/expenses/useDeleteWallet';
import { useGetExpenses } from '@/hooks/expenses/useGetExpenses';
import { useLocalSearchParams } from 'expo-router';
import { Dialog } from '@/services/dialog.service';
import type { Wallet as WalletData } from '@/types/expensesTypes';
import { getExpensesByWallet } from '@/services/expensesService';
import { expensesByWalletQueryKey } from '@/hooks/expenses/useGetExpenses';
import Header from '@/components/common/Header';
import WalletCardSkeleton from '@/components/feedback/WalletCardSkeleton';
import HiveBg from '@/components/common/HiveBg';
import { useThemeColor } from '@/hooks/shared/useThemeColor';
import Wave from '@/components/ui/Wave';
import EmptyMessage from '@/components/common/EmptyMessage';

const CARD_WIDTH = Dimensions.get('window').width - 40;
const WALLET_GAP = 10;
const SNAP_INTERVAL = CARD_WIDTH + WALLET_GAP;

export default function ExpensesScreen() {
  const { session } = useSession();
  const primaryColor = useThemeColor({}, 'primary');
  const { roomId: roomIdParam } = useLocalSearchParams<{ roomId?: string | string[] }>();
  const roomId = Array.isArray(roomIdParam) ? roomIdParam[0] : roomIdParam;
  const { wallets, isLoading } = useGetWallets(roomId);
  const { deleteWallet, isPending: isDeleting } = useDeleteWallet();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const itemCount = wallets.length + 1;
  const selectedWallet = wallets[activeIndex];
  const { total, expenses, isLoading: isExpensesLoading } = useGetExpenses(selectedWallet?.id);
  const walletTotals = useQueries({
    queries: wallets.map((wallet) => ({
      queryKey: expensesByWalletQueryKey(wallet.id),
      queryFn: () => getExpensesByWallet(wallet.id),
      enabled: Boolean(wallet.id),
      staleTime: 60 * 1000,
    })),
  });

  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const snappedIndex = Math.round(event.nativeEvent.contentOffset.x / SNAP_INTERVAL);
    setActiveIndex(snappedIndex);
  };

  const moveTo = (index: number) => {
    const nextIndex = Math.max(0, Math.min(itemCount - 1, index));
    scrollRef.current?.scrollTo({ x: nextIndex * SNAP_INTERVAL, animated: true });
    setActiveIndex(nextIndex);
  };

  const confirmDelete = (wallet: WalletData) => {
    Dialog.confirm(
      'Delete wallet?',
      `Delete "${wallet.name}" and its expense history?`,
      {
        confirmText: 'Delete',
        destructive: true,
        onConfirm: () => deleteWallet(wallet.id),
      },
    );
  };

  return (
    <TView style={{flex: 1}}>
      <StickyScrollView
        style={{flexGrow: 1, backgroundColor: primaryColor}}
        headerAppearOn={60}
        title={roomId ? 'Room Budget' : 'My Budget'}
        subtitle={`@${session?.user?.username ?? ''}`}
      >
        <TView style={{backgroundColor: "#ccc", overflow: 'hidden'}}>
          <HiveBg style={{opacity: .4}} flipVertical color={selectedWallet?.color || '#0003'} fade={false}/>
          <View style={{ 
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: selectedWallet?.color ? selectedWallet.color + '90' : "#ccc8"
          }}>
            <Wave style={{position: 'absolute', bottom: 0}} height={110} amplitude={20} />
          </View>
          <View style={styles.heading}>
            <Header 
              title={roomId ? 'Room Budget' : 'My Budget'} 
              subtitle={`Manage your expenses`}
              textColor='#fff'
            />
          </View>

          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled={false}
            showsHorizontalScrollIndicator={false}
            snapToInterval={SNAP_INTERVAL}
            decelerationRate="fast"
            onMomentumScrollEnd={onMomentumScrollEnd}
            contentContainerStyle={{paddingHorizontal: 20}}
          >
            {
              isLoading ? (
                <WalletCardSkeleton style={styles.walletCard}/>
              ) : (
                <>
                {wallets.map((wallet, index) => (
                  <Wallet
                    key={wallet.id}
                    wallet={wallet}
                    amount={walletTotals[index]?.data?.total ?? 0}
                    style={styles.walletCard}
                    onEdit={() => router.push({
                      pathname: '/expenses/wallet/update',
                      params: {
                        id: wallet.id,
                        ...(roomId ? { roomId } : {}),
                      },
                    })}
                    onDelete={() => confirmDelete(wallet)}
                  />
                ))}
                <TouchableOpacity
                  style={styles.addWalletCard}
                  onPress={() => router.push({
                    pathname: '/expenses/wallet/create',
                    params: roomId ? { roomId } : undefined,
                  })}
                  accessibilityRole="button"
                >
                  <TIcon name="plus" size={30} style={styles.addWalletIcon} />
                  <TText style={{color: '#0007'}}>Add a new wallet</TText>
                </TouchableOpacity>
              </>
              )
            }
          </ScrollView>

          <View style={styles.controls}>
            <TouchableOpacity
              onPress={() => moveTo(activeIndex - 1)}
              disabled={activeIndex === 0 || isDeleting || isLoading}
              style={[styles.arrow, {left: 0}]}
            >
              <TIcon name="chevron-left" size={28} />
            </TouchableOpacity>
            <View style={styles.indicators} accessibilityLabel={`Wallet ${activeIndex + 1} of ${itemCount}`}>
              {Array.from({ length: itemCount }, (_, index) => (
                <View
                  key={index}
                  style={[styles.indicator, index === activeIndex && { backgroundColor: selectedWallet?.color || '#fff' }]}
                />
              ))}
            </View>
            <TouchableOpacity
              onPress={() => moveTo(activeIndex + 1)}
              disabled={activeIndex === itemCount - 1 || isDeleting || isLoading }
              style={[styles.arrow, {right: 0}]}
            >
              <TIcon name="chevron-right" size={28} />
            </TouchableOpacity>
          </View>
        </TView>

        <TView color="primary" style={{paddingHorizontal: '3%'}}>
          { selectedWallet && <>
            <TText type='title'>{selectedWallet?.name + " Expenses"}</TText>
            <TText>{selectedWallet?.description}</TText>

            
            <View style={styles.expenseHeading}>
              <TText type="subtitle">Expenses</TText>
              {selectedWallet && (
                <TouchableOpacity
                  onPress={() => router.push({
                    pathname: '/expenses/create',
                    params: {
                      walletId: selectedWallet.id,
                      ...(roomId ? { roomId } : {}),
                    },
                  })}
                >
                  <TIcon name="plus-circle" size={28} />
                </TouchableOpacity>
              )}
            </View>
            </>
          }
          
          {
            isExpensesLoading ? 
              <ActivityIndicator style={styles.expenseLoader} /> : 
              expenses.length === 0 ? (
                <EmptyMessage
                  title="No expenses yet"
                  description="No expenses yet. Add your first expense!"
                />
              ) : expenses.map((expense) => (
            <TouchableOpacity
              key={expense.id}
              style={[styles.expenseRow, { borderColor: selectedWallet?.color ? selectedWallet.color : '#ccc3' }]}
              onPress={() => router.push({
                pathname: '/expenses/[id]',
                params: {
                  id: expense.id,
                  ...(roomId ? { roomId } : {}),
                },
              })}
            >
              <View>
                <TText style={styles.expenseTitle}>{expense.title}</TText>
                <TText style={styles.expenseDate}>{new Date(expense.createdOn).toLocaleDateString()}</TText>
              </View>
              <TText style={styles.expenseAmount}>{expense.amount.toFixed(2)}</TText>
            </TouchableOpacity>
          ))}
        </TView>
      </StickyScrollView>
    </TView>
  );
}

const styles = StyleSheet.create({
  heading: {
    marginHorizontal: '3%',
    marginTop: '3%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  walletCard: {
    width: CARD_WIDTH,
    marginRight: WALLET_GAP,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  addWalletCard: {
    width: CARD_WIDTH,
    height: 200,
    marginRight: WALLET_GAP,
    borderRadius: 10,
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#aaa8',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    opacity: 0.9,
  },
  addWalletIcon: { 
    padding: 10,
    borderRadius: 50,
    backgroundColor: '#0001',
  },
  controls: {
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginHorizontal: 20,
  },
  arrow: {
    position: 'absolute',
    padding: 4,
  },
  indicators: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  indicator: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#aaa8',
  },
  expenseHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  expenseLoader: { marginVertical: 20 },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderLeftWidth: 3,
    borderRadius: 10,
  },
  expenseTitle: { fontWeight: '600' },
  expenseDate: { fontSize: 11, opacity: 0.6, marginTop: 4 },
  expenseAmount: { fontWeight: '700' },
});
