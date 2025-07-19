import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({ baseUrl: '' });

export const apiSlice = createApi({
  baseQuery,
  // --- ADD 'Assignment' and 'Submissions' to the list ---
  tagTypes: ['User', 'Course', 'MyCourses', 'Assignment', 'Submissions'],
  endpoints: (builder) => ({}),
});