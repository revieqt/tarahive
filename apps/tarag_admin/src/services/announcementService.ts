import { BACKEND_URL } from '@/constants/Config';
const API_BASE_URL = `${BACKEND_URL}/api`;

export interface IAnnouncement {
  _id: string;
  title: string;
  image: string;
  altDesc: string;
  isExternal: boolean;
  linkPath: string;
  startsOn: Date;
  endsOn: Date;
  createdOn: Date;
  updatedOn: Date;
}

export interface CreateAnnouncementPayload {
  title: string;
  altDesc: string;
  isExternal: boolean;
  linkPath: string;
  startsOn: Date | string;
  endsOn: Date | string;
  image?: File;
}

export interface UpdateAnnouncementPayload extends Partial<CreateAnnouncementPayload> {}

export interface GetAnnouncementsResponse {
  announcements: IAnnouncement[];
  pagination: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalCount: number;
  };
}

/**
 * Get announcements for admin dashboard with pagination and filters
 */
export const getAnnouncements = async (
  accessToken: string,
  page: number = 1,
  searchKey?: string,
  startDate?: Date | string,
  endDate?: Date | string
): Promise<GetAnnouncementsResponse> => {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    if (searchKey) params.append('searchKey', searchKey);
    if (startDate) {
      const dateStr = startDate instanceof Date ? startDate.toISOString() : startDate;
      params.append('startDate', dateStr);
    }
    if (endDate) {
      const dateStr = endDate instanceof Date ? endDate.toISOString() : endDate;
      params.append('endDate', dateStr);
    }

    const response = await fetch(`${API_BASE_URL}/announcements?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch announcements: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      announcements: data.data || [],
      pagination: data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        pageSize: 10,
      }
    };
  } catch (error) {
    console.error('Error fetching announcements:', error);
    throw error;
  }
};

/**
 * Create a new announcement
 */
export const createAnnouncement = async (
  accessToken: string,
  payload: CreateAnnouncementPayload
): Promise<IAnnouncement> => {
  try {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('altDesc', payload.altDesc);
    formData.append('isExternal', String(payload.isExternal));
    formData.append('linkPath', payload.linkPath);
    formData.append('startsOn', payload.startsOn instanceof Date ? payload.startsOn.toISOString() : payload.startsOn);
    formData.append('endsOn', payload.endsOn instanceof Date ? payload.endsOn.toISOString() : payload.endsOn);
    if (payload.image) {
      formData.append('image', payload.image);
    }

    const response = await fetch(`${API_BASE_URL}/announcements/create`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to create announcement: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error creating announcement:', error);
    throw error;
  }
};

/**
 * Update an announcement
 */
export const updateAnnouncement = async (
  accessToken: string,
  announcementId: string,
  payload: UpdateAnnouncementPayload
): Promise<IAnnouncement> => {
  try {
    const formData = new FormData();
    if (payload.title !== undefined) formData.append('title', payload.title);
    if (payload.altDesc !== undefined) formData.append('altDesc', payload.altDesc);
    if (payload.isExternal !== undefined) formData.append('isExternal', String(payload.isExternal));
    if (payload.linkPath !== undefined) formData.append('linkPath', payload.linkPath);
    if (payload.startsOn !== undefined) {
      const dateStr = payload.startsOn instanceof Date ? payload.startsOn.toISOString() : payload.startsOn;
      formData.append('startsOn', dateStr);
    }
    if (payload.endsOn !== undefined) {
      const dateStr = payload.endsOn instanceof Date ? payload.endsOn.toISOString() : payload.endsOn;
      formData.append('endsOn', dateStr);
    }
    if (payload.image) {
      formData.append('image', payload.image);
    }

    const response = await fetch(`${API_BASE_URL}/announcements/update/${announcementId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to update announcement: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error updating announcement:', error);
    throw error;
  }
};

/**
 * Delete an announcement
 */
export const deleteAnnouncement = async (accessToken: string, announcementId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/announcements/delete/${announcementId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to delete announcement: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error deleting announcement:', error);
    throw error;
  }
};
