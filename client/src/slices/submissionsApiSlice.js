import { apiSlice } from './apiSlice';
const SUBMISSIONS_URL = '/api/submissions';

export const submissionsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    gradeSubmission: builder.mutation({
      query: (data) => ({
        url: `${SUBMISSIONS_URL}/${data.submissionId}/grade`,
        method: 'PUT',
        body: data,
      }),
      // After grading, invalidate the tag for this assignment's submissions list
      invalidatesTags: (result, error, arg) => [
        { type: 'Submissions', id: arg.assignmentId },
      ],
    }),
  }),
});

export const { useGradeSubmissionMutation } = submissionsApiSlice;