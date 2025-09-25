import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// Reducers
import appReducer from './slices/appSlice';
import authReducer from './slices/authSlice';
import productsReducer from './slices/productsSlice';
import cartReducer from './slices/cartSlice';
import communityReducer from './slices/communitySlice';
import bookmarksReducer from './slices/bookmarksSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
    auth: authReducer,
    products: productsReducer,
    cart: cartReducer,
    community: communityReducer,
    bookmarks: bookmarksReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;