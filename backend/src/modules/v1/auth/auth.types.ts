export interface RegisterDto {
  fname: string;
  lname?: string;
  email: string;
  password: string;
  username: string;
  bdate: string;
  gender: string;
  device: {
    deviceId: string;
    brand: string;
    model: string;
    os: string;
    type: string;
    appVersion?: string;
  };
}