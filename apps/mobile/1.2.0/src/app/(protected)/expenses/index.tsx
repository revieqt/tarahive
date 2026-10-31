import { useRef, useState } from 'react';
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

const CARD_WIDTH = Dimensions.get('window').width - 40;
const WALLET_GAP = 10;
const SNAP_INTERVAL = CARD_WIDTH + WALLET_GAP;

export default function ExpensesScreen() {
  const { session } = useSession();
  const { roomId: roomIdParam } = useLocalSearchParams<{ roomId?: string | string[] }>();
  const roomId = Array.isArray(roomIdParam) ? roomIdParam[0] : roomIdParam;
  const { wallets, isLoading } = useGetWallets(roomId);
  const { deleteWallet, isPending: isDeleting } = useDeleteWallet();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const itemCount = wallets.length + 1;
  const selectedWallet = wallets[activeIndex];
  const { expenses, isLoading: isExpensesLoading } = useGetExpenses(selectedWallet?.id);

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
    <TView style={styles.container}>
      <StickyScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        headerAppearOn={60}
        title={roomId ? 'Room Budget' : 'My Budget'}
        subtitle={`@${session?.user?.username ?? ''}`}
      >
        <View style={styles.heading}>
          <BackButton />
          <TText type="title">Wallets</TText>
          <TouchableOpacity>
            <TIcon name="help-circle" size={20} />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator style={styles.loader} />
        ) : (
          <View>
            <ScrollView
              ref={scrollRef}
              horizontal
              pagingEnabled={false}
              showsHorizontalScrollIndicator={false}
              snapToInterval={SNAP_INTERVAL}
              decelerationRate="fast"
              onMomentumScrollEnd={onMomentumScrollEnd}
              contentContainerStyle={styles.walletList}
            >
              {wallets.map((wallet) => (
                <Wallet
                  key={wallet.id}
                  wallet={wallet}
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
                <TIcon name="plus-circle" size={42} />
                <TText style={styles.addWalletText}>Add a new wallet</TText>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.controls}>
              <TouchableOpacity
                onPress={() => moveTo(activeIndex - 1)}
                disabled={activeIndex === 0 || isDeleting}
                style={styles.arrow}
              >
                <TIcon name="chevron-left" size={28} />
              </TouchableOpacity>
              <TText style={styles.counter}>{activeIndex + 1} / {itemCount}</TText>
              <TouchableOpacity
                onPress={() => moveTo(activeIndex + 1)}
                disabled={activeIndex === itemCount - 1 || isDeleting}
                style={styles.arrow}
              >
                <TIcon name="chevron-right" size={28} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <TView color="primary" style={styles.contentPanel}>
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
          {isExpensesLoading ? <ActivityIndicator style={styles.expenseLoader} /> : expenses.length === 0 ? (
            <TText style={styles.emptyText}>Record expenses from this wallet to track your spending.</TText>
          ) : expenses.map((expense) => (
            <TouchableOpacity
              key={expense.id}
              style={styles.expenseRow}
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
  container: { flex: 1 },
  scroll: { flexGrow: 1 },
  content: { paddingBottom: 40 },
  heading: {
    marginHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  walletList: { paddingHorizontal: 20 },
  walletCard: { width: CARD_WIDTH, marginRight: WALLET_GAP },
  loader: { marginVertical: 100 },
  addWalletCard: {
    width: CARD_WIDTH,
    height: 200,
    marginRight: WALLET_GAP,
    marginTop: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#aaa8',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  addWalletText: { fontWeight: '600' },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    marginTop: 10,
  },
  arrow: { padding: 4 },
  counter: { opacity: 0.65 },
  contentPanel: {
    padding: '3%',
    minHeight: 180,
    borderWidth: 1,
    borderColor: '#ccc2',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 35,
  },
  emptyText: { marginTop: 10, opacity: 0.7 },
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
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc3',
  },
  expenseTitle: { fontWeight: '600' },
  expenseDate: { fontSize: 11, opacity: 0.6, marginTop: 4 },
  expenseAmount: { fontWeight: '700' },
});
