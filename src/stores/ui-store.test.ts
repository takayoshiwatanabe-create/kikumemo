import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useUIStore } from './ui-store';

describe('useUIStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    act(() => {
      useUIStore.setState({
        currentLocale: 'en',
        theme: 'system',
        sidebarOpen: false,
        currentView: 'dashboard',
      });
    });
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useUIStore());
    expect(result.current.currentLocale).toBe('en');
    expect(result.current.theme).toBe('system');
    expect(result.current.sidebarOpen).toBe(false);
    expect(result.current.currentView).toBe('dashboard');
  });

  it('sets the locale correctly', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => {
      result.current.setLocale('ja');
    });
    expect(result.current.currentLocale).toBe('ja');
  });

  it('toggles the theme between light and dark', () => {
    const { result } = renderHook(() => useUIStore());

    // Initial theme is 'system', but toggleTheme logic assumes a starting point for simplicity
    // Let's manually set it to light first to test toggle logic
    act(() => {
      useUIStore.setState({ theme: 'light' });
    });
    expect(result.current.theme).toBe('light');

    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.theme).toBe('dark');

    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.theme).toBe('light');
  });

  it('toggles the sidebar open/closed', () => {
    const { result } = renderHook(() => useUIStore());
    expect(result.current.sidebarOpen).toBe(false);

    act(() => {
      result.current.toggleSidebar();
    });
    expect(result.current.sidebarOpen).toBe(true);

    act(() => {
      result.current.toggleSidebar();
    });
    expect(result.current.sidebarOpen).toBe(false);
  });

  it('sets the current view correctly', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => {
      result.current.setCurrentView('record');
    });
    expect(result.current.currentView).toBe('record');

    act(() => {
      result.current.setCurrentView('sessions');
    });
    expect(result.current.currentView).toBe('sessions');
  });
});
