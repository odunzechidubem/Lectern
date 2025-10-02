import { apiSlice } from "./apiSlice";

const NOTIFICATIONS_URL = "/api/notifications";

export const notificationsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMyNotifications: builder.query({
      query: () => ({ url: NOTIFICATIONS_URL }),
      pollingInterval: 5000,
      providesTags: ["Notifications"],
    }),
    markNotificationsAsRead: builder.mutation({
      query: () => ({ url: `${NOTIFICATIONS_URL}/mark-read`, method: "PUT" }),
      invalidatesTags: ["Notifications"],
    }),
    markOneAsRead: builder.mutation({
      query: (notificationId) => ({
        url: `${NOTIFICATIONS_URL}/${notificationId}/mark-read`,
        method: "PUT",
      }),
      async onQueryStarted(notificationId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          apiSlice.util.updateQueryData(
            "getMyNotifications",
            undefined,
            (draft) => {
              return draft.filter((notif) => notif._id !== notificationId);
            }
          )
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
