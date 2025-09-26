// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// // This is the absolute URL of your LIVE backend server.
// const BASE_URL = 'https://lectern-usqo.onrender.com';

// const baseQuery = fetchBaseQuery({
//   baseUrl: BASE_URL,
//   credentials: 'include', // This is crucial for sending cookies cross-domain
// });

// export const apiSlice = createApi({
//   baseQuery,
//   tagTypes: [
//     'User', 'Users', 'Course', 'AllCourses', 'MyCourses', 'Assignment',
//     'Submissions', 'Announcements', 'Notifications', 'Settings', 'FooterLink',
//     'Article', 'Messages',
//   ],
//   endpoints: (builder) => ({}),
// });



// src/slices/apiSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Absolute URL of your LIVE backend
const BASE_URL = 'https://lectern-usqo.onrender.com';

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: 'include', // important for sending cookies cross-domain
  prepareHeaders: (headers) => {
    // Fallback: attach JWT token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const apiSlice = createApi({
  baseQuery,
  tagTypes: [
    'User', 'Users', 'Course', 'AllCourses', 'MyCourses', 'Assignment',
    'Submissions', 'Announcements', 'Notifications', 'Settings', 'FooterLink',
    'Article', 'Messages',
  ],
  endpoints: () => ({}),
});
