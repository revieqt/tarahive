import { BACKEND_URL } from '@/constants/Config';

export interface LoginResponse {
  user: {
    _id: string;
    fname: string;
    lname?: string;
    username: string;
    email: string;
    type: string;
    contactNumber?: string;
    bdate: string;
    gender: string;
    profileImages?: string[];
    bio?: string;
    status: string;
    createdOn: string;
    updatedOn: string;
  };
  accessToken: string;
  refreshToken: string;
}

export const loginUser = async (
  identifier: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier,
        password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Login failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred during login');
  }
};

export const logout = async (): Promise<void> => {
  // Clear tokens from localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
};

export const getStoredToken = (): string | null => {
  return localStorage.getItem('token');
};

export const setAuthTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem('token', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

export const sendEmailVerificationCode = async (
  email: string
): Promise<{ code: string; id: string }> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/send-verification`, {
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
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while sending verification code');
  }
};

export const resetPassword = async (
  email: string,
  newPassword: string
): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        newPassword,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to reset password');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while resetting password');
  }
};

export const updatePassword = async (data: {
  userId: string;
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
  accessToken: string;
}): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.accessToken}`,
      },
      body: JSON.stringify({
        userId: data.userId,
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update password');
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while updating password');
  }
};
