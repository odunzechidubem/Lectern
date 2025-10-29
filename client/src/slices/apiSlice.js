// /client/src/slices/apiSlice.js

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { clearCredentials, setCredentials } from './authSlice';

// Use an environment variable for the base URL.
const BASE_URL = import.meta.env.VITE_API_URL || '';

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: 'include',
});

// --- THIS IS THE DEFINITIVE FIX ---
// This is a "meta" endpoint that will automatically try to re-authenticate
// if an API call fails with a 401 Unauthorized error.
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result?.error?.status === 401) {
    // If we get a 401, it means our token is likely expired or invalid.
    // We can try to hit a 'refresh' endpoint or, in this case, just log the user out.
    api.dispatch(clearCredentials());
    // Optionally, you could add a toast notification here.
  }
  return result;
};


export const apiSlice = createApi({
  baseQuery: baseQueryWithReauth, // Use the new base query with re-auth logic
  tagTypes: [
    'User', 'Users', 'Course', 'AllCourses', 'MyCourses', 'Assignment',
    'Submissions', 'Announcements', 'Notifications', 'Settings', 'FooterLink',
    'Article', 'Messages',
  ],
  endpoints: (builder) => ({}),
});