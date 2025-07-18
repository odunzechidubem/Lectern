// src/slices/apiSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// The baseUrl is an empty string because the Vite proxy will handle
// prepending the 'http://localhost:5000' part.
const baseQuery = fetchBaseQuery({ baseUrl: '' });

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ['User', 'Course', 'MyCourses'],
  endpoints: (builder) => ({}),
});