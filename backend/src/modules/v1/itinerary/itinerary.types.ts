export enum ItineraryStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  DONE = 'done',
}

export enum ItineraryPrivacy {
  PRIVATE = 'private',
  COLLABORATORS = 'collaborators',
  PUBLIC = 'public',
}

export enum CollaboratorPermissions {
  EDIT = 'edit',
  VIEW = 'view',
}

export enum CollaboratorStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted'
}

// export interface CreateItineraryRequest {
//   title: string;
//   type: string;
//   startDate: Date;
//   endDate: Date;
//   content: string;
//   privacy: ItineraryPrivacy;
// }

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