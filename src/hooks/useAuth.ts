import { create } from 'zustand';
import { authService, tokenStorage, pushService } from '../services';
import { RegisterResponse } from '../services/auth.service';
import { User, LoginCredentials, RegisterData } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  pendingVerification: boolean; // User registered but email not verified
  error: string | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  setVerified: () => void;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  pendingVerification: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await authService.login(credentials);
      set({ user, isAuthenticated: true, pendingVerification: false, isLoading: false });
      // Save push token to server after successful login
      pushService.saveTokenToServer().catch(() => {});
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const result = await authService.register(data);
      // Set pending verification if email verification is required
      const needsVerification = result.requiresVerification === true;
      set({ 
        user: result.user, 
        isAuthenticated: !needsVerification, 
        pendingVerification: needsVerification,
        isLoading: false 
      });
      return result;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      // Remove push token from server before logout
      await pushService.removeTokenFromServer().catch(() => {});
      await authService.logout();
    } finally {
      set({ user: null, isAuthenticated: false, pendingVerification: false, isLoading: false });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const token = await tokenStorage.getAccessToken();
      if (!token) {
        set({ isAuthenticated: false, pendingVerification: false, isLoading: false });
        return;
      }

      const user = await authService.getMe();
      // Check if email is verified
      const isVerified = user.isEmailVerified !== false;
      set({ 
        user, 
        isAuthenticated: isVerified, 
        pendingVerification: !isVerified && !!user,
        isLoading: false 
      });
      // Save push token if user is authenticated
      if (isVerified) {
        pushService.saveTokenToServer().catch(() => {});
      }
    } catch (error) {
      await tokenStorage.clearTokens();
      set({ user: null, isAuthenticated: false, pendingVerification: false, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
  
  setVerified: () => set({ isAuthenticated: true, pendingVerification: false }),
}));

export default useAuth;

