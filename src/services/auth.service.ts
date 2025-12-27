import api, { tokenStorage } from './api';
import { User, LoginCredentials, RegisterData, AuthResponse } from '../types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post('/auth/login', credentials);
    const { user, tokens } = response.data.data;
    
    await tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
    
    return { user, tokens };
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data);
    const { user, tokens } = response.data.data;
    
    await tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
    
    return { user, tokens };
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      await tokenStorage.clearTokens();
    }
  },

  async getMe(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data.data.user;
  },

  async verifyOtp(otp: string): Promise<void> {
    await api.post('/auth/verify-otp', { otp });
  },

  async resendOtp(): Promise<void> {
    await api.post('/auth/resend-otp');
  },

  async refreshToken(): Promise<void> {
    const refreshToken = await tokenStorage.getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token');
    
    const response = await api.post('/auth/refresh-token', { refreshToken });
    const { tokens } = response.data.data;
    
    await tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
  },
};

export default authService;

