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
  interests?: string[];
  profileImage?: ProfileImageUpload;
}

export type EditableProfileFields = Pick<
  UpdateProfilePayload,
  'username' | 'fname' | 'lname' | 'bio' | 'interests'
>;

export interface ProfileImageUpload {
  uri: string;
  base64: string;
}

export interface SetupAccountPayload {
  fname: string;
  lname: string;
  bdate: string;
  gender: string;
  interests: string[];
}

export interface UserSearchResult {
  id: string;
  profileImage: string;
  fname: string;
  lname: string;
  username: string;
}