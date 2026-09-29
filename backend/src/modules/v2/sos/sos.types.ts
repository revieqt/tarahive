export interface EnableSOSRequest {
  accessToken: string;
  emergencyType: string;
  message?: string;
  userID: string;
  emergencyContact?: string;
  latitude: number;
  longitude: number;
}

export interface DisableSOSRequest {
  accessToken: string;
  userID: string;
}