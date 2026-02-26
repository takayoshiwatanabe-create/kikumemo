import { create } from 'zustand';

interface UIStore {
  currentLocale: string;
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  currentView: 'dashboard' | 'record' | 'sessions' | 'settings';
  
  setLocale: (locale: string) => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setCurrentView: (view: 'dashboard' | 'record' | 'sessions' | 'settings') => void;
}

export const useUIStore = create<UIStore>((set) => ({
  currentLocale: 'ja', // Default language from spec
  theme: 'system',
  sidebarOpen: false,
  currentView: 'dashboard',
  
  setLocale: (locale) => set({ currentLocale: locale }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setCurrentView: (view) => set({ currentView: view }),
}));
