// /src/slices/notificationsApiSlice.js

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
        const socketUrl = import.meta.env.VITE_SOCKET_URL;
        if (!socketUrl) {
            console.error('[Socket] VITE_SOCKET_URL is not defined. Real-time notifications will not work in production.');
            return;
        }

        const socket = io(socketUrl, {
            withCredentials: true,
            // --- THIS IS THE CRITICAL FIX ---
            // Force the client to use only WebSocket transport, preventing fallback to long-polling.
            transports: ['websocket'],
        });

        socket.on('connect', () => {
          console.log('[Socket] WebSocket connection established for notifications.');
        });

        socket.on('connect_error', (error) => {
          console.error('[Socket] Notification connection error:', error.message);
        });

        try {
          await cacheDataLoaded;

          socket.on('new_notification_data', (notification) => {
            updateCachedData((draft) => {
              if (!draft.find(n => n._id === notification._id)) {
                draft.unshift(notification);
              }
            });
          });
        } catch {
            // If the cache subscription is removed before the initial data is loaded,
            // the cacheDataLoaded promise will be rejected.
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