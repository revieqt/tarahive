import { BACKEND_URL } from '@/Config';

const API_URL = `${BACKEND_URL}/v1/auth`;

export interface RegisterRequest {
  fname: string;
  lname?: string;
  bdate: string;
  gender: string;
  email: string;
  password: string;
  confirmPassword: string;
  isVerified?: boolean;
}

export interface VerificationResponse {
  code: string;
  id: string;
}

export const registerUser = async (userData: RegisterRequest) => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Registration failed');
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    throw new Error(error.message || 'Registration failed');
  }
};

export const sendEmailVerificationCode = async (email: string): Promise<VerificationResponse> => {
  try {
    const response = await fetch(`${API_URL}/send-email-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send verification code');
    }

    const data = await response.json();
    return data as VerificationResponse;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to send verification code');
  }
};

export const verifyEmail = async (email: string, code: string) => {
  try {
    const response = await fetch(`${API_URL}/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email, 
        code,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Email verification failed');
    }

    return true;
  } catch (error: any) {
    throw new Error(error.message || 'Email verification failed');
  }
};

