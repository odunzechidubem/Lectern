import { apiSlice } from './apiSlice';

const ADMIN_URL = '/api/admin';

export const adminApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsersByRole: builder.query({
      query: (role) => ({ url: `${ADMIN_URL}/users`, params: { role } }),
      providesTags: (result, error, role) => [{ type: 'Users', id: role }],
    }),
    toggleUserStatus: builder.mutation({
      query: (userId) => ({
        url: `${ADMIN_URL}/users/${userId}/toggle-status`,
        method: 'PUT',
      }),
      invalidatesTags: (result) => [{ type: 'Users', id: result.role }],
    }),
    deleteUserById: builder.mutation({
      query: (userId) => ({
        url: `${ADMIN_URL}/users/${userId}`,
        method: 'DELETE',
      }),
      // After deleting a user, we might need to refetch multiple user lists.
      // Invalidating the parent 'Users' tag is a safe approach.
      invalidatesTags: ['Users'], 
    }),
    getSystemSettings: builder.query({
      query: () => `${ADMIN_URL}/settings`,
      providesTags: ['Settings'],
    }),
    updateSystemSettings: builder.mutation({
      query: (data) => ({
        url: `${ADMIN_URL}/settings`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Settings'],
    }),

    // --- NEW ENDPOINTS ---
    getAllCourses: builder.query({
      query: () => `${ADMIN_URL}/courses`,
      providesTags: ['AllCourses'],
    }),
    deleteCourseById: builder.mutation({
      query: (courseId) => ({
        url: `${ADMIN_URL}/courses/${courseId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AllCourses'],
    }),
  }),
});

export const {
  useGetUsersByRoleQuery,
  useToggleUserStatusMutation,
  useDeleteUserByIdMutation,
  useGetSystemSettingsQuery,
  useUpdateSystemSettingsMutation,
  useGetAllCoursesQuery,
  useDeleteCourseByIdMutation,
} = adminApiSlice;