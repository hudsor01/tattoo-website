/**
 * API Client
 * 
 * Provides a simple interface for making API requests to the backend.
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Default API client instance
const apiClient: AxiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Configure axios to use JSON data by default
apiClient.defaults.headers.post['Content-Type'] = 'application/json';
apiClient.defaults.headers.put['Content-Type'] = 'application/json';
apiClient.defaults.headers.patch['Content-Type'] = 'application/json';

// Add request interceptor for auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // You can add auth token logic here if needed
      return config;
    } catch (error) {
      console.error('API client request interceptor error:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      console.error('Authentication error:', error);
      // You can redirect to login page or handle auth errors
    }
    
    // Handle other errors
    return Promise.reject(error);
  }
);

/**
 * Generic API request function
 */
async function request<T = any>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response: AxiosResponse<T> = await apiClient(config);
    return response.data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

/**
 * GET request
 */
async function get<T = any>(url: string, params?: any): Promise<T> {
  return request<T>({ method: 'get', url, params });
}

/**
 * POST request
 */
async function post<T = any>(url: string, data?: any): Promise<T> {
  return request<T>({ method: 'post', url, data });
}

/**
 * PUT request
 */
async function put<T = any>(url: string, data?: any): Promise<T> {
  return request<T>({ method: 'put', url, data });
}

/**
 * DELETE request
 */
async function del<T = any>(url: string, params?: any): Promise<T> {
  return request<T>({ method: 'delete', url, params });
}

// Export API client and methods
export const api = {
  client: apiClient,
  request,
  get,
  post,
  put,
  delete: del,
};

export default api;