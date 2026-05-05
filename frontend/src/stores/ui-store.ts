import {create} from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  notificationsOpen: boolean;
}

interface UIActions {
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setNotificationsOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState & UIActions>(set => ({
  sidebarOpen: false,
  notificationsOpen: false,

  toggleSidebar: () => set(state => ({sidebarOpen: !state.sidebarOpen})),
  setSidebarOpen: open => set({sidebarOpen: open}),
  setNotificationsOpen: open => set({notificationsOpen: open}),
}));
