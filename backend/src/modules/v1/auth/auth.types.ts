export interface RegisterDto {
  fname: string;
  lname?: string;
  email: string;
  password: string;
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

export interface LoginDto {
  identifier: string;
  password: string;
  device: {
    deviceId: string;
    brand: string;
    model: string;
    os: string;
    type: string;
    appVersion?: string;
  };
}

export const usernameAdjectives: string[] = [
  "wandering",
  "drifting",
  "roaming",
  "nomadic",
  "restless",
  "faraway",
  "lost",
  "hidden",
  "endless",
  "untamed",
  "sunlit",
  "windy",
  "starlit",
  "distant",
  "coastal",
  "mountainous",
  "silent",
  "ancient",
  "wild",
  "free"
];