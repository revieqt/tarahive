import { BACKEND_URL } from '@/Config';
import { useDeviceInfo } from '@/shared/hooks/useDeviceInfo';


const API_URL = `${BACKEND_URL}/v1/auth`;

// interface LoginResponse {
//   user: {
//     _id: string;
//     fname: string;
//     lname?: string;
//     username: string;
//     email: string;
//     bdate: string;
//     gender: string;
//     contactNumber?: string;
//     profileImage: string;
//     type: string;
//     status: string;
//     bio: string;
//     isFirstLogin: boolean;
//     likes: string[];
//     isProUser: boolean;
//     createdOn: string;
//     expPoints: number;
//     safetyState: {
//       isInAnEmergency: boolean;
//       emergencyType: string;
//       emergencyContact?: string;
//     };
//     visibilitySettings: {
//       isProfilePublic: boolean;
//       isPersonalInfoPublic: boolean;
//       isTravelInfoPublic: boolean;
//     };
//     securitySettings: {
//       is2FAEnabled: boolean;
//     };
//     taraBuddySettings: {
//       isTaraBuddyEnabled: boolean;
//       preferredGender?: string
//       preferredDistance?: number;
//       preferredAgeRange?: number[];
//       preferredZodiac?: string[];
//     };
//   };
//   accessToken: string;
//   refreshToken: string;
// }

// export const loginUser = async (identifier: string, password: string, device?: Partial<DeviceInfo>) => {
//   try {
//     const response = await fetch(`${API_URL}/login`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ 
//         identifier, 
//         password,
//         device: device ? {
//           deviceId: device.deviceId,
//           brand: device.brand,
//           model: device.model,
//           os: device.os,
//           osVersion: device.osVersion,
//           deviceType: device.deviceType,
//           appVersion: device.appVersion,
//         } : undefined
//       }),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.error || 'Login failed');
//     }

//     const data: LoginResponse = await response.json();
//     return data;
//   } catch (error: any) {
//     throw new Error(error.message || 'Login failed');
//   }
// };


// export const resetPassword = async (identifier: string, newPassword: string, device?: Partial<DeviceInfo>) => {
//   try {
//     // First check if identifier looks like an email
//     const isEmail = identifier.includes('@');
//     const payload = {
//       ...(isEmail ? { email: identifier } : { userId: identifier }),
//       newPassword,
//       device: device ? {
//         deviceId: device.deviceId,
//         brand: device.brand,
//         model: device.model,
//         os: device.os,
//         osVersion: device.osVersion,
//         deviceType: device.deviceType,
//         appVersion: device.appVersion,
//       } : undefined
//     };
    
//     const response = await fetch(`${API_URL}/reset-password`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(payload),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.error || 'Failed to reset password');
//     }

//     const data = await response.json();
//     return true;
//   } catch (error: any) {
//     throw new Error(error.message || 'Failed to reset password');
//   }
// };

// interface UpdatePasswordParams {
//   userId: string;
//   oldPassword: string;
//   newPassword: string;
//   confirmPassword: string;
//   accessToken: string;
//   device?: Partial<DeviceInfo>;
// }

// export const updatePassword = async ({
//   userId,
//   oldPassword,
//   newPassword,
//   confirmPassword,
//   accessToken,
//   device
//   }: UpdatePasswordParams) => {
//   try {
//     const response = await fetch(`${API_URL}/change-password`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${accessToken}`
//       },
//       body: JSON.stringify({
//         oldPassword,
//         newPassword,
//         confirmPassword,
//         device: device ? {
//           deviceId: device.deviceId,
//           brand: device.brand,
//           model: device.model,
//           os: device.os,
//           osVersion: device.osVersion,
//           deviceType: device.deviceType,
//           appVersion: device.appVersion,
//         } : undefined
//       }),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.error || 'Failed to update password');
//     }

//     const data = await response.json();
//     return true;
//   } catch (error: any) {
//     throw new Error(error.message || 'Failed to update password');
//   }
// };

// export const sendPasswordResetCode = async (email: string, device?: Partial<DeviceInfo>): Promise<VerificationResponse> => {
//   try {
//     const response = await fetch(`${API_URL}/send-password-reset-code`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ 
//         email,
//         device: device ? {
//           deviceId: device.deviceId,
//           brand: device.brand,
//           model: device.model,
//           os: device.os,
//           osVersion: device.osVersion,
//           deviceType: device.deviceType,
//           appVersion: device.appVersion,
//         } : undefined
//       }),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.error || 'Failed to send password reset code');
//     }

//     const data = await response.json();
//     return data as VerificationResponse;
//   } catch (error: any) {
//     throw new Error(error.message || 'Failed to send password reset code');
//   }
// };

// export const verifyPasswordResetCode = async (email: string, code: string, newPassword: string, device?: Partial<DeviceInfo>) => {
//   try {
//     const response = await fetch(`${API_URL}/verify-password-reset-code`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ 
//         email, 
//         code,
//         newPassword,
//         device: device ? {
//           deviceId: device.deviceId,
//           brand: device.brand,
//           model: device.model,
//           os: device.os,
//           osVersion: device.osVersion,
//           deviceType: device.deviceType,
//           appVersion: device.appVersion,
//         } : undefined
//       }),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.error || 'Password reset failed');
//     }

//     const data = await response.json();
//     return true;
//   } catch (error: any) {
//     throw new Error(error.message || 'Password reset failed');
//   }
// };