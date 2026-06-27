export enum ItineraryStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  DONE = 'done',
}

export enum ItineraryPrivacy {
  ONLY_ME = 'Only Me',
  PUBLIC = 'Public',
}

export enum PublicPermissions {
  EDIT = 'edit',
  VIEW = 'view',
}

export interface CreateItineraryRequest {
  title: string;
  type: string;
  startDate: Date;
  endDate: Date;
  content: string;
  privacy: ItineraryPrivacy;
}

// export interface UpdateItineraryRequest {
//   title?: string;
//   type?: string;
//   description?: string;
//   startDate?: Date;
//   endDate?: Date;
//   planDaily?: boolean;
//   locations?: Location[] | DailyItinerary[];
//   status?: ItineraryStatus;
// }