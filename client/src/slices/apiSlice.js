import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// This is the absolute URL of your LIVE backend server.
const BASE_URL = 'https://lectern-usqo.onrender.com';
// const BASE_URL = 'http://localhost:5000';

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: 'include', // This is crucial for sending cookies cross-domain
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