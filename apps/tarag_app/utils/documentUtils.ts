import { Alert } from 'react-native';
import { router } from 'expo-router';
import { DocumentData } from '@/hooks/useDocument';
import { BACKEND_URL } from "@/constants/Config";

export const fetchDocumentData = async (docName: any): Promise<DocumentData> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/public/${docName}.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${docName} document`);
    }
    const data: DocumentData = await response.json();
    return data;
  } catch (error) {
    console.error(`[fetchDocumentData] Error fetching ${docName}:`, error);
    throw error;
  }
};

export const openDocument = async (docName: any) => {
  try {
    const doc = await fetchDocumentData(docName);
    router.push({
      pathname: '/document-view',
      params: { data: JSON.stringify(doc) },
    });
  } catch (error) {
    Alert.alert('Error', `Failed to load ${docName}.`);
  }
};
