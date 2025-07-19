import { apiSlice } from './apiSlice';
const NOTIFICATIONS_URL = '/api/notifications';

export const notificationsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMyNotifications: builder.query({
      query: () => ({
        url: NOTIFICATIONS_URL,
      }),
      providesTags: ['Notifications'],
    }),
    markNotificationsAsRead: builder.mutation({
      query: () => ({
        url: `${NOTIFICATIONS_URL}/mark-read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notifications'],
    }),

    // --- NEW MUTATION ---
    markOneAsRead: builder.mutation({
      query: (notificationId) => ({
        url: `${NOTIFICATIONS_URL}/${notificationId}/mark-read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notifications'],
    }),
  }),
});

export const {
  useGetMyNotificationsQuery,
  useMarkNotificationsAsReadMutation,
  useMarkOneAsReadMutation, // <-- EXPORT
} = notificationsApiSlice;