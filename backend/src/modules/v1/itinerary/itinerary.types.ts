export enum ItineraryStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  DONE = 'done',
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
  isPrivate: boolean;
  publicPermissions: PublicPermissions;
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