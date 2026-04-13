import { useState } from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { googleLogin } from '@/services/googleAuthService';
import { useDeviceInfo } from '@/hooks/useDeviceInfo';
import { useSession } from '@/context/SessionContext';

GoogleSignin.configure({
  webClientId: process.env.GOOGLE_WEB_CLIENT_ID,
});

/**
 * Hook for Google Sign-In
 * Handles device info, session update, and token management
 */
export const useGoogleAuth = () => {
  const deviceInfo = useDeviceInfo();
  const { updateSession } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!deviceInfo.isLoaded) {
        throw new Error('Device info not yet loaded');
      }

      // Get Google ID token
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();

      if (!tokens.idToken) {
        throw new Error('Failed to get Google ID token');
      }

      // Login with backend
      const result = await googleLogin(tokens.idToken, deviceInfo);

      // Transform user data for storage
      const userData = {
        id: result.user._id,
        fname: result.user.fname,
        lname: result.user.lname,
        username: result.user.username,
        email: result.user.email,
        bdate: new Date(result.user.bdate),
        gender: result.user.gender,
        contactNumber: result.user.contactNumber,
        profileImage: result.user.profileImage,
        likes: result.user.likes || [],
        isProUser: result.user.isProUser,
        bio: result.user.bio || '',
        status: result.user.status,
        type: result.user.type,
        expPoints: result.user.expPoints,
        createdOn: new Date(result.user.createdOn),
        isFirstLogin: result.user.isFirstLogin,
        safetyState: result.user.safetyState,
        visibilitySettings: result.user.visibilitySettings,
        securitySettings: result.user.securitySettings,
        taraBuddySettings: result.user.taraBuddySettings,
      };

      await updateSession({
        user: userData,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });

      return result;
    } catch (err: any) {
      const errorMsg = err.message || 'Google Sign-in failed';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { signInWithGoogle, loading, error };
};
