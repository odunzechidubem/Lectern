import { apiSlice } from './apiSlice';
const ANNOUNCEMENTS_URL = '/api/announcements';

export const announcementsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAnnouncementsForCourse: builder.query({
      query: (courseId) => ({
        url: `${ANNOUNCEMENTS_URL}/course/${courseId}`,
      }),
      providesTags: (result, error, arg) => [{ type: 'Announcements', id: arg }],
    }),
    createAnnouncement: builder.mutation({
      query: (data) => ({
        url: ANNOUNCEMENTS_URL,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Announcements', id: arg.courseId },
      ],
    }),
    deleteAnnouncement: builder.mutation({
      query: (announcementId) => ({
        url: `${ANNOUNCEMENTS_URL}/${announcementId}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetAnnouncementsForCourseQuery,
  useCreateAnnouncementMutation,
  useDeleteAnnouncementMutation,
} = announcementsApiSlice;