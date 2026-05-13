import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { LANGUAGES, LanguageItem } from '../constants/Languages';

// Type definitions
export interface LanguageData {
  [key: string]: any;
}

export interface LanguageContextType {
  currentLanguage: LanguageItem;
  t: (key: string, defaultValue?: string) => string;
  setLanguage: (languageCode: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

// Create context with undefined default
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Storage keys
const LANGUAGE_PREFERENCE_KEY = '@tarahive_language_preference';

// Backend API configuration
const BACKEND_URL = 'http://192.168.68.104:5000';
const LOCALIZATION_ENDPOINT = '/v1/localization';

// File system paths
const LANGUAGE_FILES_DIR = `${FileSystem.cacheDirectory}locales/`;

// Default language
const DEFAULT_LANGUAGE_CODE = 'en';

// Import default language data (English)
import * as enCommon from '../../locales/en/common.json';
import * as enAuth from '../../locales/en/auth.json';

const DEFAULT_LANGUAGE_DATA: LanguageData = {
  ...enCommon,
  ...enAuth,
};

/**
 * Translate key using dot notation
 */
const translateKey = (data: LanguageData, key: string, defaultValue?: string): string => {
  const keys = key.split('.');
  let value: any = data;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return defaultValue || key;
    }
  }

  return typeof value === 'string' ? value : defaultValue || key;
};


/**
 * Fetch language data from the backend
 */
const fetchLanguageFromBackend = async (languageCode: string): Promise<any> => {
  try {
    const response = await fetch(`${BACKEND_URL}${LOCALIZATION_ENDPOINT}/${languageCode}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    // Backend returns { version, data { common, ... } }
    return result;
  } catch (error) {
    console.error(`Error fetching language ${languageCode} from backend:`, error);
    throw error;
  }
};

/**
 * Load language data from file system
 */
const loadLanguageFromFile = async (languageCode: string): Promise<any | null> => {
  try {
    const filePath = `${LANGUAGE_FILES_DIR}${languageCode}.json`;
    const fileInfo = await FileSystem.getInfoAsync(filePath);

    if (!fileInfo.exists) {
      return null;
    }

    const data = await FileSystem.readAsStringAsync(filePath);
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading language ${languageCode} from file:`, error);
    return null;
  }
};

/**
 * Save language data to file system
 */
const saveLanguageToFile = async (languageCode: string, data: any): Promise<void> => {
  try {
    // Ensure directory exists
    const dirInfo = await FileSystem.getInfoAsync(LANGUAGE_FILES_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(LANGUAGE_FILES_DIR, { intermediates: true });
    }

    const filePath = `${LANGUAGE_FILES_DIR}${languageCode}.json`;
    await FileSystem.writeAsStringAsync(filePath, JSON.stringify(data, null, 2));
    console.log(`Language ${languageCode} saved to file: ${filePath}`);
  } catch (error) {
    console.error(`Error saving language ${languageCode} to file:`, error);
    throw error;
  }
};

/**
 * Load language preference from storage
 */
const loadLanguagePreference = async (): Promise<string> => {
  try {
    const preference = await AsyncStorage.getItem(LANGUAGE_PREFERENCE_KEY);
    return preference || DEFAULT_LANGUAGE_CODE;
  } catch (error) {
    console.error('Error loading language preference:', error);
    return DEFAULT_LANGUAGE_CODE;
  }
};

/**
 * Save language preference to storage
 */
const saveLanguagePreference = async (languageCode: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(LANGUAGE_PREFERENCE_KEY, languageCode);
  } catch (error) {
    console.error('Error saving language preference:', error);
    throw error;
  }
};

/**
 * Get language by code from LANGUAGES array
 */
const getLanguageByCode = (code: string): LanguageItem | undefined => {
  return LANGUAGES.find((lang) => lang.code === code);
};

/**
 * Provider component
 */
export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageItem>(
    getLanguageByCode(DEFAULT_LANGUAGE_CODE) || LANGUAGES[0]
  );
  const [languageData, setLanguageData] = useState<LanguageData>(DEFAULT_LANGUAGE_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initialize language on app start
   */
  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load user's language preference
        const savedLanguageCode = await loadLanguagePreference();
        const language = getLanguageByCode(savedLanguageCode);

        if (!language) {
          throw new Error(`Language ${savedLanguageCode} not found`);
        }

        setCurrentLanguage(language);

        // Load language data from file first
        let data = await loadLanguageFromFile(savedLanguageCode);

        // If not in file, use default (English) or fetch from backend
        if (!data) {
          if (savedLanguageCode === DEFAULT_LANGUAGE_CODE) {
            data = DEFAULT_LANGUAGE_DATA;
          } else {
            try {
              const backendData = await fetchLanguageFromBackend(savedLanguageCode);
              data = backendData.data || backendData;
              // Save to file for future use
              await saveLanguageToFile(savedLanguageCode, data);
            } catch (err) {
              console.warn(
                `Failed to fetch language ${savedLanguageCode}, falling back to English`,
                err
              );
              // Fall back to English if backend fails
              data = DEFAULT_LANGUAGE_DATA;
              setCurrentLanguage(getLanguageByCode(DEFAULT_LANGUAGE_CODE) || LANGUAGES[0]);
            }
          }
        }

        setLanguageData(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('Error initializing language:', err);
        // Set default language and data as fallback
        setCurrentLanguage(getLanguageByCode(DEFAULT_LANGUAGE_CODE) || LANGUAGES[0]);
        setLanguageData(DEFAULT_LANGUAGE_DATA);
      } finally {
        setIsLoading(false);
      }
    };

    initializeLanguage();
  }, []);

  /**
   * Translate function with dot notation
   */
  const t = (key: string, defaultValue?: string): string => {
    return translateKey(languageData, key, defaultValue);
  };

  /**
   * Change language - check file first, then fetch from backend
   */
  const setLanguage = async (languageCode: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate language code
      const language = getLanguageByCode(languageCode);
      if (!language) {
        throw new Error(`Language ${languageCode} not found`);
      }

      // Try to load from file first
      let data = await loadLanguageFromFile(languageCode);

      // If not in file, fetch from backend
      if (!data) {
        if (languageCode === DEFAULT_LANGUAGE_CODE) {
          data = DEFAULT_LANGUAGE_DATA;
        } else {
          try {
            const backendData = await fetchLanguageFromBackend(languageCode);
            data = backendData.data || backendData;
            // Save to file for future use
            await saveLanguageToFile(languageCode, data);
          } catch (err) {
            throw new Error(`Failed to fetch language ${languageCode}: ${err}`);
          }
        }
      }

      // Update state
      setCurrentLanguage(language);
      setLanguageData(data);

      // Save preference
      await saveLanguagePreference(languageCode);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error changing language:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value: LanguageContextType = {
    currentLanguage,
    t,
    setLanguage,
    isLoading,
    error,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

/**
 * Custom hook to use the LanguageContext
 */
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);

  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }

  return context;
};
