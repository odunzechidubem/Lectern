import { apiSlice } from './apiSlice';
const COURSES_URL = '/api/courses';

export const coursesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCourses: builder.query({
      query: (keyword = '') => ({
        url: COURSES_URL,
        params: { keyword },
      }),
      keepUnusedDataFor: 5,
      providesTags: ['Course'],
    }),
    getCourseDetails: builder.query({
      query: (courseId) => ({ url: `${COURSES_URL}/${courseId}` }),
      providesTags: (result, error, arg) => [{ type: 'Course', id: arg }],
      keepUnusedDataFor: 5,
    }),
    getMyCourses: builder.query({
      query: () => ({ url: `${COURSES_URL}/mycourses` }),
      keepUnusedDataFor: 5,
      providesTags: ['MyCourses'],
    }),
    createCourse: builder.mutation({
      query: (data) => ({
        url: COURSES_URL,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['MyCourses'],
    }),
    updateCourse: builder.mutation({
      query: (data) => ({
        url: `${COURSES_URL}/${data.courseId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Course', id: arg.courseId }],
    }),
    addLecture: builder.mutation({
      query: (data) => ({
        url: `${COURSES_URL}/${data.courseId}/lectures`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Course', id: arg.courseId }],
    }),
    enrollInCourse: builder.mutation({
      query: (courseId) => ({
        url: `${COURSES_URL}/${courseId}/enroll`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Course', id: arg }],
    }),
    deleteLecture: builder.mutation({
      query: (data) => ({
        url: `${COURSES_URL}/${data.courseId}/lectures/${data.lectureId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Course', id: arg.courseId }],
    }),
    deleteCourse: builder.mutation({
      query: (courseId) => ({
        url: `${COURSES_URL}/${courseId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MyCourses'],
    }),
  }),
});

export const {
  useGetCoursesQuery,
  useGetCourseDetailsQuery,
  useGetMyCoursesQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useAddLectureMutation,
  useEnrollInCourseMutation,
  useDeleteLectureMutation,
  useDeleteCourseMutation,
} = coursesApiSlice;