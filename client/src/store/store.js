// src/store/store.js
import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from '../slices/apiSlice';   // RTK Query API slice
import authReducer from '../slices/authSlice';   // Authentication state
import themeReducer from '../slices/themeSlice'; // Dark/Light mode state

const store = configureStore({
  reducer: {
    // RTK Query API reducer (handles caching, requests, etc.)
    [apiSlice.reducerPath]: apiSlice.reducer,

    // Authentication state reducer
    auth: authReducer,

    // Theme (UI) state reducer
    theme: themeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    // Add RTK Query middleware for caching, polling, etc.
    getDefaultMiddleware().concat(apiSlice.middleware),

  // Enable Redux DevTools only in development mode (safer for production)
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;