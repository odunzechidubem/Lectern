import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Use the Vite environment variable for the backend URL.
// In local development, this will be undefined, so it falls back to a relative path for the proxy.
// In production on Netlify, this will be your live Render URL.
const baseUrl = import.meta.env.VITE_API_URL || '/api';

const baseQuery = fetchBaseQuery({
  baseUrl: baseUrl,
  credentials: 'include',
});

export const apiSlice = createApi({
  baseQuery,
  tagTypes: [
    'User', 'Users', 'Course', 'AllCourses', 'MyCourses', 'Assignment',
    'Submissions', 'Announcements', 'Notifications', 'Settings', 'FooterLink',
    'Article', 'Messages',
  ],
  endpoints: (builder) => ({}),
});