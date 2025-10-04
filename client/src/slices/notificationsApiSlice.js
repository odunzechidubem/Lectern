import { apiSlice } from './apiSlice';
import { io } from 'socket.io-client';

export const notificationsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMyNotifications: builder.query({
      query: () => ({ url: '/api/notifications' }),
      providesTags: (result = []) => [
        ...result.map(({ _id }) => ({ type: 'Notifications', id: _id })),
        { type: 'Notifications', id: 'LIST' },
      ],

      async onCacheEntryAdded(
        arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        const socketUrl = import.meta.env.VITE_SOCKET_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000');
        const socket = io(socketUrl, {
            withCredentials: true,
            transports: ['websocket'] // Using websocket directly can be more reliable
        });

        try {
          await cacheDataLoaded;

          socket.on('new_notification_data', (notification) => {
            updateCachedData((draft) => {
              // Check if the notification already exists to prevent duplicates
              if (!draft.find(n => n._id === notification._id)) {
                draft.unshift(notification);
              }
            });
          });
        } catch {
          // no-op
        }
        
        await cacheEntryRemoved;
        socket.close();
      },
    }),

    markNotificationsAsRead: builder.mutation({
      query: () => ({ url: `/api/notifications/mark-read`, method: 'PUT' }),
      invalidatesTags: [{ type: 'Notifications', id: 'LIST' }],
    }),

    markOneAsRead: builder.mutation({
      query: (notificationId) => ({
        url: `/api/notifications/${notificationId}/mark-read`,
        method: 'PUT',
      }),
      async onQueryStarted(notificationId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          apiSlice.util.updateQueryData('getMyNotifications', undefined, (draft) => {
            return draft.filter((notif) => notif._id !== notificationId);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});

export const {
  useGetMyNotificationsQuery,
  useMarkNotificationsAsReadMutation,
  useMarkOneAsReadMutation,
} = notificationsApiSlice;