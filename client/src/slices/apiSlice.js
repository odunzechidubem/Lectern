import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// In development, this will be an empty string to use the Vite proxy.
// In production (on Netlify), this will be your live Render URL.
const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_BACKEND_URL || '',
});

export const apiSlice = createApi({
  baseQuery,
  tagTypes: [
    'User', 'Users', 'Course', 'AllCourses', 'MyCourses', 'Assignment',
    'Submissions', 'Announcements', 'Notifications', 'Settings', 'FooterLink',
    'Article', 'Messages'
  ],
  endpoints: (builder) => ({}),
});