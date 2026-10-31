import { StyleSheet, View, ViewStyle, TouchableOpacity } from 'react-native';
import { TIcon, TText } from '@/components/ui/Themed';
import type { Wallet as WalletData } from '@/types/expensesTypes';

interface WalletProps{
  wallet?: WalletData;
  color?: string;
  amount?: number;
  amountLimit?: number;
  name?: string;
  description?: string;
  style?: ViewStyle;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function Wallet({
  wallet,
  color = 'green',
  amount,
  amountLimit,
  name = 'My Wallet',
  description,
  style,
  onEdit,
  onDelete,
}: WalletProps) {
  const walletColor = wallet?.color ?? color;
  const walletAmountLimit = wallet?.amountLimit ?? amountLimit;
  const walletName = wallet?.name ?? name;
  const walletDescription = wallet?.description ?? description;

  return (
    <View style={[styles.wallet, style, {backgroundColor: walletColor}]}>
      <View style={styles.content}>
        <View style={styles.amountContainer}>
            <TText style={styles.amount}> {amount !== undefined ? amount.toFixed(2) : '0.00'}</TText>
            <TText style={styles.amountLimit}> {walletAmountLimit !== undefined && walletAmountLimit > 0 ? `/ ${walletAmountLimit.toFixed(2)}` : '/ unlimited'}</TText>
        </View>

        <TText style={styles.walletName}>{walletName}</TText>
        {walletDescription && <TText style={styles.description} numberOfLines={2}>
          {walletDescription}
        </TText>}

        <View style={styles.walletButtonsContainer}>
            <TouchableOpacity style={styles.walletButtons} onPress={onEdit} disabled={!onEdit}>
                <TIcon name='pencil' size={15} color='#fff'/>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.walletButtons, {backgroundColor: '#DC143C90'}]} onPress={onDelete} disabled={!onDelete}>
                <TIcon name='delete' size={15} color='#fff'/>
            </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.strap, {backgroundColor: walletColor}]}>
        <View style={styles.strapButton}/>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wallet:{
    width: '100%',
    height: 200,
    borderRadius: 10,
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
    marginTop: 20,
  },
  content:{
    borderWidth: 1.5,
    flex: 1,
    borderColor: '#fff7',
    borderRadius: 10,
    borderStyle: 'dashed',
    borderLeftWidth: 0,
    marginVertical: 15,
    marginRight: 15,
    padding: 10,
    justifyContent: 'flex-end',
    alignItems: 'flex-start'
  },
  strap:{
    height: 50,
    backgroundColor: 'red',
    position: 'absolute',
    width: 60,
    borderWidth: 1,
    borderColor: '#fff5',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
    right: -5,
    top: 75,
    borderRadius: 5,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    paddingLeft: 10,
    justifyContent: 'center'
  },
  strapButton:{
    backgroundColor: '#D4AF37',
    width: 25,
    aspectRatio: 1,
    borderRadius: 50,
  },
  amount:{
    color: '#fff',
    fontWeight: 800,
    fontSize: 20,
    lineHeight: 17
  },
  amountLimit:{
    color: '#fff',
    fontWeight: 600
  },
  amountContainer:{
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    marginLeft: -3
  },
  walletName:{
    color: '#fff',
    opacity: 0.8,
    fontWeight: 600,
    marginTop: 10
  },
  description:{
    color: '#fff9',
    fontWeight: 400,
    marginTop: 5,
    fontSize: 11
  },
  walletButtonsContainer:{
    flexDirection: 'row',
    gap: 3,
    position: 'absolute',
    top: 10,
    right: 10
  },
  walletButtons:{
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#fff5',
    padding: 5,
    borderRadius: 20
  },
});
