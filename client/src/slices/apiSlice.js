// src/slices/apiSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({ baseUrl: 'http://localhost:5000' });

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ['User', 'Course'], // Defines types for caching
  endpoints: (builder) => ({}), // Endpoints will be injected from other files
});