import { BackButton } from '@/components/BackButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useLocalSearchParams } from 'expo-router';
import GradientBlobs from '@/components/GradientBlobs';
import { StyleSheet, ScrollView, View } from 'react-native';

export default function InfoView() {
  const { data } = useLocalSearchParams<{ data: string }>();
  const document = data ? JSON.parse(data) : null;

  if (!document) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ThemedText>Document not available.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }} color='primary'>
      <GradientBlobs/>
      <ScrollView style={{ flex: 1, padding: 16, zIndex: 1000 }}>
        <BackButton />
        
        <View style={styles.titleContainer}>
          <ThemedText type='title'>{document.title}</ThemedText>
          <ThemedText>Last updated on: {document.updatedOn}</ThemedText>
          <ThemedText>{document.description}</ThemedText>
        </View>

        {document.sections.map((section: any, index: number) => (
          <View key={index} style={{ marginBottom: 16 }}>
            <ThemedText type='subtitle'>{section.subtitle}</ThemedText>
            <ThemedText style={styles.sectionDescription}>{section.description}</ThemedText>
          </View>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    marginBottom: 20,
  },
  sectionDescription: {
    marginLeft: 10,
    opacity: 0.8,
  },
});
