import { create } from "zustand";
import { User, UserPreferences, SubscriptionInfo, UsageStats } from "@/types";

interface UserStore {
  user: User | null;
  userPreferences: UserPreferences | null;
  subscription: SubscriptionInfo | null;
  usageStats: UsageStats;
  isLoading: boolean;
  error: string | null;

  setUser: (user: User) => void;
  fetchUserPreferences: () => Promise<void>;
  updateUserPreferences: (data: Partial<UserPreferences>) => Promise<void>;
  setSubscription: (subscription: SubscriptionInfo) => void;
  setUsageStats: (stats: UsageStats) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  userPreferences: null,
  subscription: null,
  usageStats: {
    recordingsCount: 0,
    transcriptionMinutes: 0,
    aiSummariesCount: 0,
  },
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),

  fetchUserPreferences: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/user/preferences");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch user preferences");
      }
      const preferences: UserPreferences = await response.json();
      set({ userPreferences: preferences, isLoading: false });
    } catch (err: any) {
      console.error("Error fetching user preferences:", err);
      set({ error: err.message, isLoading: false });
    }
  },

  updateUserPreferences: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/user/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update user preferences");
      }
      const updatedPreferences: UserPreferences = await response.json();
      set({ userPreferences: updatedPreferences, isLoading: false });
    } catch (err: any) {
      console.error("Error updating user preferences:", err);
      set({ error: err.message, isLoading: false });
      throw err; // Re-throw to allow component to handle
    }
  },

  setSubscription: (subscription) => set({ subscription }),
  setUsageStats: (stats) => set({ usageStats: stats }),
  clearUser: () => set({ user: null, userPreferences: null, subscription: null, usageStats: { recordingsCount: 0, transcriptionMinutes: 0, aiSummariesCount: 0 } }),
}));

