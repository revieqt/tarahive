import React, { useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
    Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAlerts, GlobalAlert, LocalAlert } from '@/context/AlertsContext';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import BackButton from '@/components/BackButton';
import { formatDateToString } from '@/utils/formatDateToString';
import WaveHeader from '@/components/WaveHeader';

const SEVERITY_COLORS: Record<string, string> = {
  low: '#4CAF50',
  medium: '#FF9800',
  high: '#FF6B6B',
  critical: '#8B0000',
};

const getSeverityValueStyle = (severity: string) => ({
  fontSize: 16,
  fontWeight: '600' as const,
  color: SEVERITY_COLORS[severity],
});

export default function AlertDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { globalAlerts, localAlerts, markGlobalAlertAsRead, markLocalAlertAsRead } = useAlerts();
  
  let alert: (GlobalAlert | LocalAlert) & { source: 'global' | 'local' } | null = null;

  const globalAlert = globalAlerts.find(a => a.id === id);
  if (globalAlert) {
    alert = { ...globalAlert, source: 'global' };
  }

  const localAlert = localAlerts.find(a => a.id === id);
  if (localAlert) {
    alert = { ...localAlert, source: 'local' };
  }

  // Mark as read when alert is loaded
  useEffect(() => {
    if (alert && !alert.isRead) {
      if (alert.source === 'global') {
        markGlobalAlertAsRead(alert.id);
      } else {
        markLocalAlertAsRead(alert.id);
      }
    }
  }, [alert?.id, alert?.isRead]);

  if (!alert) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <BackButton type="default" />
          <ThemedText type="title" style={styles.headerTitle}>
            Alert Details
          </ThemedText>
          <View style={styles.placeholder} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ThemedText style={{ opacity: 0.6 }}>Alert not found</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
      >
        <WaveHeader title={alert.title} subtitle='near your area' color={SEVERITY_COLORS[alert.severity]}
        image={<Image source={require('@/assets/images/tara-worried.png')} style={{ width: 120, height: 250, marginTop: -20 }} />}
        />
        {/* Alert Card */}
        <View style={styles.alertCard}>
          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <ThemedText type="title" style={styles.alertTitle}>
                {alert.title}
              </ThemedText>
              <View style={styles.metaContainer}>
                <View style={styles.metaItem}>
                  <ThemedText style={styles.metaLabel}>Severity</ThemedText>
                  <ThemedText style={getSeverityValueStyle(alert.severity)}>
                    {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                  </ThemedText>
                </View>
                <View style={styles.metaItem}>
                  <ThemedText style={styles.metaLabel}>Type</ThemedText>
                  <ThemedText style={styles.metaValue}>{alert.type}</ThemedText>
                </View>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <ThemedText style={styles.sectionLabel}>Details</ThemedText>
            <ThemedText style={styles.descriptionText}>{alert.description}</ThemedText>
          </View>

          {/* Metadata */}
          <View style={styles.metadataContainer}>
            <ThemedText style={styles.sectionLabel}>Information</ThemedText>

            <View style={styles.metaRow}>
              <ThemedText style={styles.metaLabel}>Created</ThemedText>
              <ThemedText style={styles.metaValue}>
                {formatDateToString(alert.createdAt)}
              </ThemedText>
            </View>

            {alert.source === 'global' && (alert as GlobalAlert).location && (
              <View style={styles.metaRow}>
                <ThemedText style={styles.metaLabel}>Location</ThemedText>
                <ThemedText style={styles.metaValue}>{(alert as GlobalAlert).location}</ThemedText>
              </View>
            )}

            {alert.source === 'global' && (alert as GlobalAlert).expiresAt && (
              <View style={styles.metaRow}>
                <ThemedText style={styles.metaLabel}>Expires</ThemedText>
                <ThemedText style={styles.metaValue}>
                  {formatDateToString((alert as GlobalAlert).expiresAt!)}
                </ThemedText>
              </View>
            )}

            <View style={styles.metaRow}>
              <ThemedText style={styles.metaLabel}>Source</ThemedText>
              <ThemedText style={styles.sourceValue}>
                {alert.source === 'global' ? 'Global' : 'Local'}
              </ThemedText>
            </View>
          </View>

          {/* Data Section (if present) */}
          {alert.data && Object.keys(alert.data).length > 0 && (
            <View style={styles.dataContainer}>
              <ThemedText style={styles.sectionLabel}>Additional Data</ThemedText>
              {Object.entries(alert.data).map(([key, value]) => (
                <View key={key} style={styles.dataRow}>
                  <ThemedText style={styles.dataKey}>{key}</ThemedText>
                  <ThemedText style={styles.dataValue}>
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </ThemedText>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 32,
  },
  alertCard: {
    padding: 16,
  },
  cardHeader: {
    gap: 8,
  },
  alertTitle: {
    marginBottom: 12,
  },
  metaContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  sourceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#00CAFF',
  },
  descriptionContainer: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 21,
    opacity: 0.8,
  },
  metadataContainer: {
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  dataContainer: {
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  dataRow: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
  },
  dataKey: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.6,
    marginBottom: 4,
  },
  dataValue: {
    fontSize: 13,
    fontWeight: '500',
  },
});
