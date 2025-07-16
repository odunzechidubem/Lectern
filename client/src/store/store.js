// src/store/store.js
import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from '../slices/apiSlice';
import authReducer from '../slices/authSlice'; // Import the default export

const store = configureStore({
  reducer: {
    // Add the apiSlice reducer to the store
    [apiSlice.reducerPath]: apiSlice.reducer,
    // Add the auth state reducer
    auth: authReducer,
  },
  // Adding the api middleware enables caching, invalidation, polling, etc.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: true,
});

export default store;