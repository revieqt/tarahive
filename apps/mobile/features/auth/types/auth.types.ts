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