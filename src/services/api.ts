import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

// ===========================================
// API CONFIGURATION
// ===========================================

// Production API URL (Render)
const PRODUCTION_API_URL = 'https://stylio-be.onrender.com/api';

// Development API URL (local machine)
// Update MACHINE_IP to your computer's IP for local development
const MACHINE_IP = '192.168.1.8';
const DEVELOPMENT_API_URL = `http://${MACHINE_IP}:5000/api`;

// Toggle this to switch between production and development
const USE_PRODUCTION = true;

const API_URL = USE_PRODUCTION ? PRODUCTION_API_URL : DEVELOPMENT_API_URL;

console.log('📡 API URL:', API_URL);
console.log('🌐 Environment:', USE_PRODUCTION ? 'PRODUCTION' : 'DEVELOPMENT');

// Token keys for secure storage
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Create axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds for production (Render free tier can be slow on cold start)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management functions
export const tokenStorage = {
  async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  },

  async clearTokens(): Promise<void> {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  },
};

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await tokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await tokenStorage.getRefreshToken();

        if (refreshToken) {
          // Try to refresh the token
          const response = await axios.post(`${API_URL}/auth/refresh-token`, {
            refreshToken,
          });

          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data.tokens;

          // Save new tokens
          await tokenStorage.setTokens(newAccessToken, newRefreshToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens
        await tokenStorage.clearTokens();
        // Navigate to login (handled by auth store)
      }
    }

    return Promise.reject(error);
  }
);

// Export API URL for use in other parts of the app
export const getApiUrl = () => API_URL;
export const isProduction = () => USE_PRODUCTION;

export default api;
