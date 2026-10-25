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
  OWNER = 'owner',
  EDIT = 'edit',
  VIEW = 'view',
}

export interface CreateItineraryRequest {
  title: string;
  type: string;
  startDate: Date;
  endDate: Date;
  content: unknown;
  themeColor: string;
}

export interface UpdateItineraryRequest {
  itineraryId: string;
  title?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  content?: unknown;
  privacy?: ItineraryPrivacy;
  themeColor?: string;
  allowSharing?: boolean;
  allowCopying?: boolean;
}

export type UpdateItineraryData = Omit<UpdateItineraryRequest, 'itineraryId' | 'startDate' | 'endDate'> & {
  startDate?: Date;
  endDate?: Date;
};

export interface UpdateItineraryStatusRequest {
  itineraryId: string;
  status: ItineraryStatus;
}

export interface ItineraryCollaboratorResult {
  collaboratorId: string;
  userId: string;
  profileImage: string;
  fname: string;
  lname: string;
  username: string;
  permissions: CollaboratorPermissions;
}

export interface CreateItineraryCollaboratorRequest {
  itineraryId: string;
  userId: string;
  permission: CollaboratorPermissions;
}

export interface UpdateItineraryCollaboratorRequest {
  collaboratorId: string;
  permission: CollaboratorPermissions;
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