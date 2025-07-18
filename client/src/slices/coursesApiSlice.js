import { apiSlice } from './apiSlice';
const COURSES_URL = '/api/courses';

export const coursesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCourses: builder.query({ query: () => COURSES_URL, providesTags: ['Course'] }),
    getMyCourses: builder.query({ query: () => `${COURSES_URL}/mycourses`, providesTags: ['MyCourses'] }),
    getCourseDetails: builder.query({ query: (id) => `${COURSES_URL}/${id}`, providesTags: (result, error, id) => [{ type: 'Course', id }] }),
    createCourse: builder.mutation({
      query: (data) => ({ url: COURSES_URL, method: 'POST', body: data }),
      invalidatesTags: ['MyCourses'],
    }),
    updateCourse: builder.mutation({
      query: (data) => ({ url: `${COURSES_URL}/${data.courseId}`, method: 'PUT', body: data }),
      invalidatesTags: (result, error, data) => [{ type: 'Course', id: data.courseId }, 'MyCourses'],
    }),
    deleteCourse: builder.mutation({
      query: (id) => ({ url: `${COURSES_URL}/${id}`, method: 'DELETE' }),
      invalidatesTags: ['MyCourses'],
    }),
    addLecture: builder.mutation({
      query: (data) => ({ url: `${COURSES_URL}/${data.courseId}/lectures`, method: 'POST', body: data }),
      invalidatesTags: (result, error, data) => [{ type: 'Course', id: data.courseId }, 'MyCourses'],
    }),
    deleteLecture: builder.mutation({
      query: ({ courseId, lectureId }) => ({ url: `${COURSES_URL}/${courseId}/lectures/${lectureId}`, method: 'DELETE' }),
      invalidatesTags: (result, error, { courseId }) => [{ type: 'Course', id: courseId }, 'MyCourses'],
    }),
    enrollInCourse: builder.mutation({
      query: (id) => ({ url: `${COURSES_URL}/${id}/enroll`, method: 'POST' }),
      invalidatesTags: (result, error, id) => [{ type: 'Course', id }],
    }),
  }),
});

export const {
  useGetCoursesQuery, useGetMyCoursesQuery, useGetCourseDetailsQuery,
  useCreateCourseMutation, useUpdateCourseMutation, useDeleteCourseMutation,
  useAddLectureMutation, useDeleteLectureMutation, useEnrollInCourseMutation,
} = coursesApiSlice;