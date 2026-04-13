import React, { useMemo } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAlerts } from '@/context/AlertsContext';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { formatDateToString } from '@/utils/formatDateToString';
import WaveHeader from '@/components/WaveHeader';

const SEVERITY_COLORS: Record<string, string> = {
  low: '#4CAF50',
  medium: '#FF9800',
  high: '#FF6B6B',
  critical: '#8B0000',
};

const getSeverityBadgeStyle = (severity: string) => ({
  fontSize: 12,
  fontWeight: '600' as const,
  color: SEVERITY_COLORS[severity],
});

export default function AlertsScreen() {
  const router = useRouter();
  const { globalAlerts, localAlerts, loading } = useAlerts();
  const primaryColor = useThemeColor({}, 'primary');

  // Combine and sort alerts by date (newest first)
  const allAlerts = useMemo(() => {
    const combined = [
      ...globalAlerts.map(alert => ({ ...alert, source: 'global' as const })),
      ...localAlerts.map(alert => ({ ...alert, source: 'local' as const })),
    ];
    return combined.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [globalAlerts, localAlerts]);

  const handleAlertPress = (alertId: string) => {
    router.push({
      pathname: '/alerts/[id]',
      params: { id: alertId },
    });
  };

  return (
    <ThemedView style={styles.container}>
      <WaveHeader title='Alerts' subtitle='near your area' color='orange'
      image={<Image source={require('@/assets/images/tara-worried.png')} style={{ width: 120, height: 250, marginTop: -20 }} />}/>

      <ScrollView showsVerticalScrollIndicator={false} style={{marginTop: 16 }}>
        {allAlerts.map(alert => (
          <TouchableOpacity
            key={alert.id}
            style={[
              styles.alertCard,
              {
                borderLeftColor: alert.isRead ? 'transparent' : 'orange',
                backgroundColor: primaryColor,
                // backgroundColor: alert.isRead ? 'transparent' : 'rgba(0, 202, 255, 0.05)',
              },
            ]}
            onPress={() => handleAlertPress(alert.id)}
            activeOpacity={0.7}
          >
            <View style={styles.alertHeader}>

                <ThemedText type="subtitle" numberOfLines={1}>
                    {alert.title}
                </ThemedText>
              <ThemedText style={getSeverityBadgeStyle(alert.severity)}>
                {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
              </ThemedText>
            </View>

            <ThemedText
              style={styles.alertDescription}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {alert.description}
            </ThemedText>
            <ThemedText style={styles.alertDate}>
                {formatDateToString(alert.createdAt)}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  alertCard: {
    borderLeftWidth: 4,
    padding: 16,
    gap: 8,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertDescription: {
    fontSize: 13,
    opacity: 0.7,
    lineHeight: 18,
  },
  alertDate: {
    fontSize: 11,
    opacity: 0.5,
  },
});
