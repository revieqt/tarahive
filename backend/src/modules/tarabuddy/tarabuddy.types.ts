export interface ITaraBuddySearchResult {
  userID: string;
  fname: string;
  lname: string;
  username?: string;
  isProUser: boolean;
  gender: string;
  bdate: Date;
  profileImage?: string;
  bio: string;
}

export interface IMatchResponse {
  success: boolean;
  match: boolean;
  message: string;
  matchedWith?: string;
}

export interface ILikeResponse {
  success: boolean;
  match: boolean;
  message: string;
  matchedWith?: string;
}
