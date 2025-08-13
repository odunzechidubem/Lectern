import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// In development, `import.meta.env.DEV` is true, so the baseUrl is a relative path.
// The Vite proxy will intercept this and forward it to http://localhost:5000.
// In production (on Netlify), `import.meta.env.PROD` is true, so the baseUrl
// becomes your live Render URL from the environment variable.
const baseUrl = import.meta.env.PROD ? import.meta.env.VITE_API_URL : '/api';

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