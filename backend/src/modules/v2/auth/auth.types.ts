export enum AuthProvider {
  EMAIL = "email",
  GOOGLE = "google",
  APPLE = "apple",
  PHONE = "phone",
}

import { Request } from "express";

export interface AuthRequest extends Request {
  user?: {
    sub: string;
    tv: any;
    st: string;
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