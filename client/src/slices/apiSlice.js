import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Corrected: Use an environment variable for the base URL.
// In development, this can be an empty string to use the Vite proxy.
// In production, it should be the full URL of your live backend.
const BASE_URL = import.meta.env.VITE_API_URL || '';

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
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