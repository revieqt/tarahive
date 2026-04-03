import { BACKEND_URL } from '@/constants/Config';
const API_BASE_URL = `${BACKEND_URL}/api`;

export interface IAlert {
  _id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  target: 'everyone' | 'traveler' | 'admin';
  createdOn: Date;
  startsOn: Date;
  endsOn: Date;
  locations: string[];
}

export interface CreateAlertPayload {
  title: string;
  description?: string;
  severity: 'low' | 'medium' | 'high';
  target: 'everyone' | 'traveler' | 'admin';
  startsOn: Date | string;
  endsOn: Date | string;
  locations: string[];
}

export interface UpdateAlertPayload extends Partial<CreateAlertPayload> {}

export interface GetAlertsResponse {
  alerts: IAlert[];
  pagination: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
  };
}

/**
 * Get alerts for admin dashboard with pagination and filters
 */
export const getAlerts = async (
  accessToken: string,
  page: number = 1,
  searchKey?: string,
  target?: string,
  severity?: string,
  date?: Date | string
): Promise<GetAlertsResponse> => {
  try {
    console.log('🟡 getAlerts - page:', page, 'searchKey:', searchKey);

    const params = new URLSearchParams();
    params.append('page', page.toString());
    if (searchKey) params.append('searchKey', searchKey);
    if (target) params.append('target', target);
    if (severity) params.append('severity', severity);
    if (date) {
      const dateStr = date instanceof Date ? date.toISOString() : date;
      params.append('date', dateStr);
    }

    const response = await fetch(`${API_BASE_URL}/alerts?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch alerts: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Alerts fetched successfully:', data);
    return data.data;
  } catch (error) {
    console.error('❌ Error fetching alerts:', error);
    throw error;
  }
};

/**
 * Get number of alerts active today
 */
export const getNumberOfAlertsToday = async (accessToken: string): Promise<number> => {
  try {
    console.log('🟡 getNumberOfAlertsToday');

    const response = await fetch(`${API_BASE_URL}/alerts/count/today`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch alert count: ${response.statusText}`);
    }

    const count = await response.json();
    console.log('✅ Alert count fetched successfully:', count);
    return count;
  } catch (error) {
    console.error('❌ Error fetching alert count:', error);
    throw error;
  }
};

/**
 * Create a new alert
 */
export const createAlert = async (
  accessToken: string,
  payload: CreateAlertPayload
): Promise<IAlert> => {
  try {
    console.log('🟡 createAlert', payload);

    const response = await fetch(`${API_BASE_URL}/alerts/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to create alert: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Alert created successfully:', data);
    return data.data;
  } catch (error) {
    console.error('❌ Error creating alert:', error);
    throw error;
  }
};

/**
 * Update an alert
 */
export const updateAlert = async (
  accessToken: string,
  alertId: string,
  payload: UpdateAlertPayload
): Promise<IAlert> => {
  try {
    console.log('🟡 updateAlert - alertId:', alertId, 'payload:', payload);

    const response = await fetch(`${API_BASE_URL}/alerts/update/${alertId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to update alert: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Alert updated successfully:', data);
    return data.data;
  } catch (error) {
    console.error('❌ Error updating alert:', error);
    throw error;
  }
};

/**
 * Delete an alert
 */
export const deleteAlert = async (accessToken: string, alertId: string): Promise<void> => {
  try {
    console.log('🟡 deleteAlert - alertId:', alertId);

    const response = await fetch(`${API_BASE_URL}/alerts/delete/${alertId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to delete alert: ${response.statusText}`);
    }

    console.log('✅ Alert deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting alert:', error);
    throw error;
  }
};
