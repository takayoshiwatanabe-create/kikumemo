import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useUserStore } from './user-store';
import { User, UserPreferences, SubscriptionInfo, UsageStats } from '@/types';

// Mock global fetch
global.fetch = vi.fn();

describe('useUserStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state before each test
    act(() => {
      useUserStore.setState({
        user: null,
        userPreferences: null,
        subscription: null,
        usageStats: { recordingsCount: 0, freeRecordingsLeft: 5 },
        isLoading: false,
        error: null,
      });
    });
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useUserStore());
    expect(result.current.user).toBe(null);
    expect(result.current.userPreferences).toBe(null);
    expect(result.current.subscription).toBe(null);
    expect(result.current.usageStats).toEqual({ recordingsCount: 0, freeRecordingsLeft: 5 });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  describe('fetchUserPreferences', () => {
    it('fetches user preferences successfully', async () => {
      const mockPreferences: UserPreferences = {
        language: 'ja',
        timezone: 'Asia/Tokyo',
        audioQuality: 'high',
        autoSave: true,
        exportFormat: 'pdf',
      };

      (global.fetch as vi.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPreferences),
      });

      const { result } = renderHook(() => useUserStore());

      await act(async () => {
        await result.current.fetchUserPreferences();
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/user/preferences');
      expect(result.current.userPreferences).toEqual(mockPreferences);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('sets error state if fetching preferences fails', async () => {
      (global.fetch as vi.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Failed to fetch' }),
      });

      const { result } = renderHook(() => useUserStore());

      await act(async () => {
        await result.current.fetchUserPreferences();
      });

      expect(result.current.userPreferences).toBe(null);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Failed to fetch');
    });
  });

  describe('updateUserPreferences', () => {
    it('updates user preferences successfully', async () => {
      const initialPreferences: UserPreferences = {
        language: 'en',
        timezone: 'America/New_York',
        audioQuality: 'standard',
        autoSave: true,
        exportFormat: 'markdown',
      };
      act(() => {
        useUserStore.setState({ userPreferences: initialPreferences });
      });

      const updatedFields = { language: 'fr', auto_save: false };
      const expectedUpdatedPreferences = {
        ...initialPreferences,
        language: 'fr',
        auto_save: false, // Note: The store expects `autoSave`, but API expects `auto_save`
      };

      (global.fetch as vi.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(expectedUpdatedPreferences),
      });

      const { result } = renderHook(() => useUserStore());

      await act(async () => {
        await result.current.updateUserPreferences(updatedFields);
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedFields),
      });
      // The store should update with the response from the API, which uses the DB schema names
      expect(result.current.userPreferences).toEqual({
        ...initialPreferences,
        language: 'fr',
        autoSave: false, // Store maps auto_save to autoSave
      });
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('sets error state if updating preferences fails', async () => {
      const initialPreferences: UserPreferences = {
        language: 'en',
        timezone: 'America/New_York',
        audioQuality: 'standard',
        autoSave: true,
        exportFormat: 'markdown',
      };
      act(() => {
        useUserStore.setState({ userPreferences: initialPreferences });
      });

      (global.fetch as vi.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Failed to update' }),
      });

      const { result } = renderHook(() => useUserStore());

      await act(async () => {
        await result.current.updateUserPreferences({ language: 'de' });
      });

      expect(result.current.userPreferences).toEqual(initialPreferences); // Should not change on error
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Failed to update');
    });
  });

  describe('updateProfile', () => {
    it('updates user profile successfully', async () => {
      const initialUser: User = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        avatar_url: null,
        subscription_plan: 'free',
        subscription_expires: null,
        created_at: new Date(),
        updated_at: new Date(),
      };
      act(() => {
        useUserStore.setState({ user: initialUser });
      });

      const updatedFields = { name: 'Updated Name', avatar_url: 'new-avatar.jpg' };
      const expectedUpdatedUser = { ...initialUser, ...updatedFields };

      (global.fetch as vi.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(expectedUpdatedUser),
      });

      const { result } = renderHook(() => useUserStore());

      await act(async () => {
        await result.current.updateProfile(updatedFields);
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedFields),
      });
      expect(result.current.user).toEqual(expectedUpdatedUser);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('sets error state if updating profile fails', async () => {
      const initialUser: User = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        avatar_url: null,
        subscription_plan: 'free',
        subscription_expires: null,
        created_at: new Date(),
        updated_at: new Date(),
      };
      act(() => {
        useUserStore.setState({ user: initialUser });
      });

      (global.fetch as vi.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Failed to update profile' }),
      });

      const { result } = renderHook(() => useUserStore());

      await act(async () => {
        await result.current.updateProfile({ name: 'Failed Update' });
      });

      expect(result.current.user).toEqual(initialUser); // Should not change on error
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Failed to update profile');
    });
  });

  describe('upgradeSubscription', () => {
    it('upgrades subscription successfully', async () => {
      const initialUser: User = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        avatar_url: null,
        subscription_plan: 'free',
        subscription_expires: null,
        created_at: new Date(),
        updated_at: new Date(),
      };
      act(() => {
        useUserStore.setState({ user: initialUser });
      });

      const newPlan = 'monthly';
      const mockSubscriptionInfo: SubscriptionInfo = {
        plan: newPlan,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
      };

      (global.fetch as vi.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSubscriptionInfo),
      });

      const { result } = renderHook(() => useUserStore());

      await act(async () => {
        await result.current.upgradeSubscription(newPlan);
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/user/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan: newPlan }),
      });
      expect(result.current.subscription).toEqual(mockSubscriptionInfo);
      expect(result.current.user?.subscription_plan).toBe(newPlan);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('sets error state if upgrading subscription fails', async () => {
      const initialUser: User = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        avatar_url: null,
        subscription_plan: 'free',
        subscription_expires: null,
        created_at: new Date(),
        updated_at: new Date(),
      };
      act(() => {
        useUserStore.setState({ user: initialUser });
      });

      (global.fetch as vi.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Payment failed' }),
      });

      const { result } = renderHook(() => useUserStore());

      await act(async () => {
        await result.current.upgradeSubscription('yearly');
      });

      expect(result.current.subscription).toBe(null); // Should not change on error
      expect(result.current.user?.subscription_plan).toBe('free'); // Should remain initial plan
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Payment failed');
    });
  });

  describe('clearError', () => {
    it('clears the error state', () => {
      act(() => {
        useUserStore.setState({ error: 'Some error' });
      });
      const { result } = renderHook(() => useUserStore());
      act(() => {
        result.current.clearError();
      });
      expect(result.current.error).toBe(null);
    });
  });
});
