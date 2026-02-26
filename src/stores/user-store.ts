import { create } from 'zustand';
import { User, UserPreferences, SubscriptionInfo, UsageStats } from '@/types';

interface UserStore {
  user: User | null;
  subscription: SubscriptionInfo | null;
  usageStats: UsageStats;
  userPreferences: UserPreferences | null;
  isLoading: boolean;
  error: string | null;
  
  setUser: (user: User) => void;
  clearUser: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  upgradeSubscription: (plan: string) => Promise<void>;
  fetchUserPreferences: () => Promise<void>;
  updateUserPreferences: (data: Partial<UserPreferences>) => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  subscription: null,
  usageStats: {
    recordingsCount: 0,
    transcriptionMinutes: 0,
    summaryGenerations: 0,
  },
  userPreferences: null,
  isLoading: false,
  error: null,
  
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null, subscription: null, userPreferences: null }),

  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      set((state) => ({
        user: state.user ? { ...state.user, ...data } : null,
        isLoading: false,
      }));
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  upgradeSubscription: async (plan) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      set((state) => ({
        subscription: { ...state.subscription, plan, expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }, // Mock 30-day expiry
        isLoading: false,
      }));
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  fetchUserPreferences: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/user/preferences');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch user preferences');
      }
      const preferences: UserPreferences = await response.json();
      set({ userPreferences: preferences, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  updateUserPreferences: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user preferences');
      }
      const updatedPreferences: UserPreferences = await response.json();
      set({ userPreferences: updatedPreferences, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },
}));
