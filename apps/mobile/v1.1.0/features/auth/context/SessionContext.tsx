import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState, useRef } from 'react';

const TOKEN_KEY = '@tarahive_session';

export type User = {
  id: string;
  fname: string;
  lname?: string;
  username: string;
  email: string;
  bdate: Date;
  gender: string;
  contactNumber?: string;
  profileImage?: string;
  isProUser: boolean;
  bio: string;
  status: string;
  type: string;
  provider: string;
  createdOn: Date;
  updatedOn?: Date;
  isFirstLogin: boolean;
  expPoints: number;
  interests: string[];
  safetyState: {
    isInAnEmergency: boolean;
    emergencyType?: string;
    emergencyNote?: string;
    emergencyContact?: {
      email?: string;
      phone?: string;
    };
    delivery?: {
      isEmailEnabled: boolean;
      isSMSEnabled: boolean;
      alertLang: string;
    };
    lastKnownLocation?: {
      locationName: string;
      latitude: number;
      longitude: number;
    };
  };
  settings: {
    visibility: {
      isProfilePublic: boolean;
      isPersonalInfoPublic: boolean;
      isTravelInfoPublic: boolean;
    };
    personalization: {
      pushNotifications: boolean;
      locationSharing: boolean;
    };
    security: {
      is2FAEnabled: boolean;
    };
    taraBuddy: {
      isTaraBuddyEnabled: boolean;
      preferredGender?: string;
      preferredDistance?: number;
      preferredAgeRange?: number[];
      preferredZodiac?: string[];
    };
  };
  device: Array<{
    deviceId: string;
    brand: string;
    model: string;
    os: string;
    type: string;
    appVersion?: string;
  }>;
};

// 🧠 SessionData
export type SessionData = {
  user?: User;
};

// 💡 Context shape
type SessionContextType = {
  session: SessionData | null;
  updateSession: (newData: Partial<SessionData>) => Promise<void>;
  clearSession: () => Promise<void>;
  loading: boolean;
};

// 🔗 Context init
const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(TOKEN_KEY);
        
        if (stored) {
          const parsed = JSON.parse(stored);

          if (parsed.user) {
            // Normalize _id to id
            if (parsed.user._id && !parsed.user.id) {
              parsed.user.id = parsed.user._id;
            }

            // Convert date strings to Date objects
            if (typeof parsed.user.bdate === 'string') {
              parsed.user.bdate = new Date(parsed.user.bdate);
            }
            if (typeof parsed.user.createdOn === 'string') {
              parsed.user.createdOn = new Date(parsed.user.createdOn);
            }
            if (parsed.user.lastKnownLocation?.updatedAt && typeof parsed.user.lastKnownLocation.updatedAt === 'string') {
              parsed.user.lastKnownLocation.updatedAt = new Date(parsed.user.lastKnownLocation.updatedAt);
            }
          }

          setSession(parsed);
        } else {
          setSession(null);
        }
      } catch (err) {
        console.error('Error loading session:', err);
        setSession(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updateSession = async (newData: Partial<SessionData>) => {
    try {
      console.log('📝 updateSession called with:', newData);
      
      // Normalize user data - map _id to id if needed
      if (newData.user && (newData.user as any)._id) {
        newData.user = {
          ...newData.user,
          id: (newData.user as any)._id
        };
      }

      // Convert date strings to Date objects
      if (newData.user) {
        if (typeof newData.user.bdate === 'string') {
          newData.user.bdate = new Date(newData.user.bdate);
        }
        if (typeof newData.user.createdOn === 'string') {
          newData.user.createdOn = new Date(newData.user.createdOn);
        }
      }

      // Deep merge function for nested objects
      const deepMerge = (target: any, source: any): any => {
        const result = { ...target };
        for (const key in source) {
          if (source.hasOwnProperty(key)) {
            if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
              result[key] = deepMerge(result[key] || {}, source[key]);
            } else {
              result[key] = source[key];
            }
          }
        }
        return result;
      };

      const updated = {
        ...session,
        ...newData,
        user: newData.user ? deepMerge(session?.user || {}, newData.user) : session?.user
      };
      
      console.log('🔄 Setting session state and saving to AsyncStorage...');
      setSession(updated);
      await AsyncStorage.setItem(TOKEN_KEY, JSON.stringify(updated));
      console.log('✅ Session updated and saved successfully');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('❌ Failed to update session:', errorMsg);
      throw err; // Re-throw so caller knows it failed
    }
  };

  const clearSession = async () => {
    try {
      setSession(null);
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (err) {
    }
  };

  return (
    <SessionContext.Provider value={{ 
      session, 
      updateSession, 
      clearSession, 
      loading, 
    }}>
      {children}
    </SessionContext.Provider>
  );
};

// 🎯 Hook
export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
