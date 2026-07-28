export enum Provider {
  EMAIL = "email",
  GOOGLE = "google",
}

export enum UserStatus {
  ACTIVE = "active",
  SUSPENDED = "suspended",
  BANNED = "banned",
}

export enum UserType {
  TRAVELER = "traveler",
  TOUR_GUIDE = "tour_guide",
  TOUR_AGENCY = "tour_agency",
  ADMIN = "admin",
  SUPER_ADMIN = "super_admin",
}

export interface ProfileUpdatePayload {
  username?: string;
  fname?: string;
  lname?: string;
  bio?: string;
  contactNumber?: string;
  interests?: string[];
}