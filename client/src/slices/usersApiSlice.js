import { apiSlice } from './apiSlice';
const USERS_URL = '/api/users';

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({ url: `${USERS_URL}/login`, method: 'POST', body: data }),
    }),
    register: builder.mutation({
      query: (data) => ({ url: `${USERS_URL}/register`, method: 'POST', body: data }),
    }),
    logout: builder.mutation({
      query: () => ({ url: `${USERS_URL}/logout`, method: 'POST' }),
    }),
    getEnrolledCourses: builder.query({
      query: () => ({
        url: `${USERS_URL}/enrolled-courses`,
      }),
      providesTags: ['EnrolledCourses'],
    }),
    getMySubmissions: builder.query({
      query: () => ({
        url: `${USERS_URL}/my-submissions`,
      }),
      providesTags: ['MySubmissions'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetEnrolledCoursesQuery,
  useGetMySubmissionsQuery,
} = usersApiSlice;