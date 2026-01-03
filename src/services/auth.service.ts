import api, { tokenStorage } from './api';
import { User, LoginCredentials, RegisterData, AuthResponse } from '../types';

export interface RegisterResponse extends AuthResponse {
  requiresVerification: boolean;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post('/auth/login', credentials);
    const { user, tokens } = response.data.data;
    
    await tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
    
    return { user, tokens };
  },

  async register(data: RegisterData): Promise<RegisterResponse> {
    const response = await api.post('/auth/register', data);
    const { user, tokens, requiresVerification } = response.data.data;
    
    await tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
    
    return { user, tokens, requiresVerification: requiresVerification ?? true };
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

  // Forgot Password Flow
  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  },

  async verifyResetOtp(email: string, otp: string): Promise<string> {
    const response = await api.post('/auth/verify-reset-otp', { email, otp });
    return response.data.data.resetToken;
  },

  async resetPassword(resetToken: string, newPassword: string): Promise<void> {
    await api.post('/auth/reset-password', { resetToken, newPassword });
  },
};

export default authService;

