import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import Skeleton from "../ui/Skeleton";

interface WalletCardSkeletonProps {
  style?: ViewStyle;
}

export default function WalletCardSkeleton({ style }: WalletCardSkeletonProps) {
  return (
    <View style={[styles.container, style]}>
      <Skeleton style={styles.container}/>
      <Skeleton style={styles.strap}/>
      <Skeleton style={styles.strapButton}/>
      <Skeleton style={styles.amount}/>
      <Skeleton style={styles.walletName}/>
      <View style={styles.walletButtonsContainer}>
        <Skeleton style={styles.walletButtons}/>
        <Skeleton style={styles.walletButtons}/>
      </View>
     </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
    height: 200,
    width: '100%',
  },
  strap:{
    height: 50,
    position: 'absolute',
    width: 60,
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
    width: 25,
    height: 25,
    borderRadius: 50,
    position: 'absolute',
    right: 20,
    top: 88
  },
  walletButtonsContainer:{
    flexDirection: 'row',
    gap: 3,
    position: 'absolute',
    right: 25,
    top: 25
  },
  walletButtons:{
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff5',
    height: 25,
    width: 25,
    borderRadius: 20
  },
  amount:{
    position: 'absolute',
    bottom: 47,
    left: 10,
    height: 27,
    width: 100,
    borderRadius: 30
  },
  walletName:{
    position: 'absolute',
    bottom: 20,
    left: 10,
    height: 20,
    width: 120,
    borderRadius: 20,
  },
});