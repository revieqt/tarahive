export interface UpdateVisibilitySettingsPayload {
  visibility: {
    isProfilePublic: boolean;
    isPersonalInfoPublic: boolean;
    isTravelInfoPublic: boolean;
  };
}

export interface UpdateProfilePayload {
  username?: string;
  fname?: string;
  lname?: string;
  bio?: string;
  contactNumber?: string;
  interests?: string[];
}