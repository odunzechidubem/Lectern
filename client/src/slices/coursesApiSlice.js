// src/slices/coursesApiSlice.js
import { apiSlice } from './apiSlice';
const COURSES_URL = '/api/courses';

export const coursesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCourses: builder.query({
      query: () => ({
        url: COURSES_URL,
      }),
      keepUnusedDataFor: 5,
    }),
    // --- ADD THIS NEW QUERY ---
    // Note: It takes a courseId as an argument
    getCourseDetails: builder.query({
      query: (courseId) => ({
        url: `${COURSES_URL}/${courseId}`,
      }),
      keepUnusedDataFor: 5,
    }),
  }),
});

// Export the new auto-generated hook
export const { useGetCoursesQuery, useGetCourseDetailsQuery } = coursesApiSlice;