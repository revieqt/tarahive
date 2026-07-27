export interface UpdateVisibilitySettingsPayload {
  visibility: {
    isProfilePublic: boolean;
    isPersonalInfoPublic: boolean;
    isTravelInfoPublic: boolean;
  };
}