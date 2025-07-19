import { apiSlice } from './apiSlice';
const ASSIGNMENTS_URL = '/api/assignments';

export const assignmentsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createAssignment: builder.mutation({
      query: (data) => ({ url: ASSIGNMENTS_URL, method: 'POST', body: data }),
      invalidatesTags: (result, error, arg) => [{ type: 'Course', id: arg.courseId }],
    }),
    deleteAssignment: builder.mutation({
      query: (assignmentId) => ({ url: `${ASSIGNMENTS_URL}/${assignmentId}`, method: 'DELETE' }),
    }),
    getAssignmentDetails: builder.query({
      query: (assignmentId) => ({ url: `${ASSIGNMENTS_URL}/${assignmentId}` }),
      providesTags: (result, error, arg) => [{ type: 'Assignment', id: arg }],
    }),
    submitAssignment: builder.mutation({
      query: (data) => ({ url: `${ASSIGNMENTS_URL}/${data.assignmentId}/submit`, method: 'POST', body: data }),
      invalidatesTags: (result, error, arg) => [{ type: 'Assignment', id: arg.assignmentId }],
    }),
    
    // --- NEW QUERY ---
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
  useGetSubmissionsQuery, // <-- EXPORT
} = assignmentsApiSlice;