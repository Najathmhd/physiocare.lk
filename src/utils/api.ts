// API utility functions for making HTTP requests

const API_BASE = '/api';

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

// Generic API call function
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('physiocare_admin_token');
      if (token && token !== 'undefined' && token !== 'null') {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return { data };
  } catch (error: any) {
    return { error: error.message };
  }
}

// Appointment API calls
export const appointmentApi = {
  getAll: () => apiCall('/appointments'),
  getById: (id: string) => apiCall(`/appointments/${id}`),
  create: (data: any) => apiCall('/appointments', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiCall(`/appointments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiCall(`/appointments/${id}`, {
    method: 'DELETE',
  }),
};

// Patient API calls
export const patientApi = {
  getAll: () => apiCall('/patients'),
  getById: (id: string) => apiCall(`/patients/${id}`),
  create: (data: any) => apiCall('/patients', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiCall(`/patients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiCall(`/patients/${id}`, {
    method: 'DELETE',
  }),
};

// Service API calls
export const serviceApi = {
  getAll: () => apiCall('/services'),
  getById: (id: string) => apiCall(`/services/${id}`),
  create: (data: any) => apiCall('/services', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiCall(`/services/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiCall(`/services/${id}`, {
    method: 'DELETE',
  }),
};

// Staff API calls
export const staffApi = {
  getAll: () => apiCall('/staff'),
  getById: (id: string) => apiCall(`/staff/${id}`),
  create: (data: any) => apiCall('/staff', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiCall(`/staff/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiCall(`/staff/${id}`, {
    method: 'DELETE',
  }),
};

// Settings API calls
export const settingsApi = {
  get: () => apiCall('/settings'),
  update: (data: any) => apiCall('/settings', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// Auth API calls
export const authApi = {
  login: (credentials: { email: string; password: string }) => 
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
}; 