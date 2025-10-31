// /client/src/slices/assignmentsApiSlice.js

import { apiSlice } from './apiSlice';

const ASSIGNMENTS_URL = '/api/assignments';

export const assignmentsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createAssignment: builder.mutation({
      query: (data) => ({ url: ASSIGNMENTS_URL, method: 'POST', body: data }),
      invalidatesTags: (result, error, arg) => [{ type: 'Course', id: arg.courseId }],
    }),
    
    // --- THIS IS THE FIX ---
    deleteAssignment: builder.mutation({
      // The query now takes an object with both IDs to build the URL.
      // This is necessary because both IDs are needed for the backend logic.
      query: ({ courseId, assignmentId }) => ({
        url: `${ASSIGNMENTS_URL}/${courseId}/${assignmentId}`, // This matches the new, more specific backend route
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Course', id: arg.courseId }],
    }),

    getAssignmentDetails: builder.query({
      query: (assignmentId) => ({ url: `${ASSIGNMENTS_URL}/${assignmentId}` }),
      providesTags: (result, error, arg) => [{ type: 'Assignment', id: arg }],
    }),

    submitAssignment: builder.mutation({
      query: (data) => ({ url: `${ASSIGNMENTS_URL}/${data.assignmentId}/submit`, method: 'POST', body: data }),
      invalidatesTags: (result, error, arg) => [{ type: 'Assignment', id: arg.assignmentId }],
    }),
    
    getSubmissions: builder.query({
      query: (assignmentId) => ({
        url: `${ASSIGNMENTS_URL}/${assignmentId}/submissions`,
      }),
      providesTags: (result, error, arg) => [{ type: 'Submissions', id: arg }],
    }),
  }),
});

export const {
  useCreateAssignmentMutation,
  useDeleteAssignmentMutation,
  useGetAssignmentDetailsQuery,
  useSubmitAssignmentMutation,
  useGetSubmissionsQuery,
} = assignmentsApiSlice;