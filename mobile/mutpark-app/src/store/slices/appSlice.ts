import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppState {
  isInitialized: boolean;
  hasSeenOnboarding: boolean;
  isConnected: boolean;
  currentLanguage: 'ko' | 'tr' | 'en' | 'ar' | 'ru';
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    enabled: boolean;
    orderUpdates: boolean;
    promotions: boolean;
    community: boolean;
  };
}

const initialState: AppState = {
  isInitialized: false,
  hasSeenOnboarding: false,
  isConnected: true,
  currentLanguage: 'ko',
  theme: 'auto',
  notifications: {
    enabled: true,
    orderUpdates: true,
    promotions: true,
    community: false,
  },
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },
    setHasSeenOnboarding: (state, action: PayloadAction<boolean>) => {
      state.hasSeenOnboarding = action.payload;
    },
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    setLanguage: (state, action: PayloadAction<AppState['currentLanguage']>) => {
      state.currentLanguage = action.payload;
    },
    setTheme: (state, action: PayloadAction<AppState['theme']>) => {
      state.theme = action.payload;
    },
    updateNotificationSettings: (
      state,
      action: PayloadAction<Partial<AppState['notifications']>>
    ) => {
      state.notifications = { ...state.notifications, ...action.payload };
    },
  },
});

export const {
  setInitialized,
  setHasSeenOnboarding,
  setConnected,
  setLanguage,
  setTheme,
  updateNotificationSettings,
} = appSlice.actions;

export default appSlice.reducer;