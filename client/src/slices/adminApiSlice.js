import { apiSlice } from './apiSlice';
const ADMIN_URL = '/api/admin';

export const adminApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsersByRole: builder.query({
      query: (role) => ({ url: `${ADMIN_URL}/users`, params: { role } }),
      providesTags: (result, error, role) => [{ type: 'Users', id: role }],
    }),
    toggleUserStatus: builder.mutation({
      query: (userId) => ({ url: `${ADMIN_URL}/users/${userId}/toggle-status`, method: 'PUT' }),
      invalidatesTags: (result) => [{ type: 'Users', id: result.role }],
    }),
    deleteUserById: builder.mutation({
      query: (userId) => ({ url: `${ADMIN_URL}/users/${userId}`, method: 'DELETE' }),
    }),
  }),
});

export const {
  useGetUsersByRoleQuery,
  useToggleUserStatusMutation,
  useDeleteUserByIdMutation,
} = adminApiSlice;