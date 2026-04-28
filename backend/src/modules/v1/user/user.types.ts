export enum UserRole {
  TRAVELER = "traveler",
  TOUR_GUIDE = "tour_guide",
  TOUR_AGENCY = "tour_agency",
  ADMIN = "admin",
  SUPER_ADMIN = "super_admin",
}

export interface UserEmergencyState {
  isInEmergency: boolean;
  emergencyType: string;
  emergencyNote?: string;
  emergencyContact?: {
    email?: string;
    phone?: string;
  };
  lastKnownLocation?: {
    locationName: string;
    latitude: number;
    longitude: number;
  };
}

export interface UserSettings {
  personalization:{
    pushNotifications: boolean;
    locationSharing: boolean;
  };
  visibility: {
    isProfilePublic: boolean;
    isPersonalInfoPublic: boolean;
    isTravelInfoPublic: boolean;
  };
  security: {
    is2FAEnabled: boolean;
  },
  taraBuddy: {
    isTaraBuddyEnabled: boolean;
    preferredGender?: string;
    preferredDistance?: number;
    preferredAgeRange?: number[];
    preferredZodiac?: string[];
  };
}