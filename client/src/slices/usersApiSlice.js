import { apiSlice } from './apiSlice';
const USERS_URL = '/api/users';

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({ query: (data) => ({ url: `${USERS_URL}/login`, method: 'POST', body: data }) }),
    register: builder.mutation({ query: (data) => ({ url: `${USERS_URL}/register`, method: 'POST', body: data }) }),
    logout: builder.mutation({ query: () => ({ url: `${USERS_URL}/logout`, method: 'POST' }) }),
    getEnrolledCourses: builder.query({ query: () => ({ url: `${USERS_URL}/enrolled-courses` }), providesTags: ['EnrolledCourses'] }),
    getMySubmissions: builder.query({ query: () => ({ url: `${USERS_URL}/my-submissions` }), providesTags: ['MySubmissions'] }),
    forgotPassword: builder.mutation({ query: (data) => ({ url: `${USERS_URL}/forgot-password`, method: 'POST', body: data }) }),
    resetPassword: builder.mutation({ query: (data) => ({ url: `${USERS_URL}/reset-password/${data.token}`, method: 'PUT', body: { password: data.password } }) }),
    updateProfile: builder.mutation({ query: (data) => ({ url: `${USERS_URL}/profile`, method: 'PUT', body: data }) }),
    changePassword: builder.mutation({ query: (data) => ({ url: `${USERS_URL}/profile/change-password`, method: 'PUT', body: data }) }),
    deleteAccount: builder.mutation({ query: () => ({ url: `${USERS_URL}/profile`, method: 'DELETE' }) }),
    requestEmailChange: builder.mutation({ query: (data) => ({ url: `${USERS_URL}/profile/request-email-change`, method: 'PUT', body: data }) }),
    checkAuthStatus: builder.query({
      query: () => ({ url: `${USERS_URL}/check-auth` }),
    }),
  }),
});

export const {
  useLoginMutation, useRegisterMutation, useLogoutMutation,
  useGetEnrolledCoursesQuery, useGetMySubmissionsQuery,
  useForgotPasswordMutation, useResetPasswordMutation,
  useUpdateProfileMutation, useChangePasswordMutation, useDeleteAccountMutation,
  useRequestEmailChangeMutation, useCheckAuthStatusQuery,
} = usersApiSlice;