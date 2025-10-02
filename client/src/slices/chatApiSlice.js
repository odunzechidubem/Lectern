import { apiSlice } from './apiSlice';

const CHAT_URL = '/api/chat';

export const chatApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCourseMessages: builder.query({
      query: (courseId) => ({
        url: `${CHAT_URL}/${courseId}/messages`,
      }),
      providesTags: (result, error, arg) => [{ type: 'Messages', id: arg }],
    }),
  }),
});

export const { useGetCourseMessagesQuery } = chatApiSlice;