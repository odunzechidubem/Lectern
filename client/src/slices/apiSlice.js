import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({ baseUrl: '' });

export const apiSlice = createApi({
  baseQuery,
  tagTypes: [
    'User', 'Users', 'Course', 'MyCourses', 'Assignment',
    'Submissions', 'Announcements', 'Notifications', 'Settings', // <-- ADD TAG
  ],
  endpoints: (builder) => ({}),
});