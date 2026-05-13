import { useEffect, useState } from 'react';
import NetInfo, { NetInfoSubscription } from '@react-native-community/netinfo';

/**
 * Custom hook that monitors internet connectivity in real-time.
 * @returns {boolean | null} - true if connected, false if not, null while checking
 */

export function useInternetConnection(): boolean | null {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe: NetInfoSubscription = NetInfo.addEventListener(state => {
      const connected = !!state.isConnected && !!state.isInternetReachable;
      setIsConnected(connected);
    });

    NetInfo.fetch().then(state => {
      const connected = !!state.isConnected && !!state.isInternetReachable;
      setIsConnected(connected);
    });

    return () => unsubscribe();
  }, []);

  return isConnected;
}
