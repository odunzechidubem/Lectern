import { apiSlice } from './apiSlice';
const ARTICLES_URL = '/api/articles';

export const articlesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getArticles: builder.query({
      query: () => ({ url: ARTICLES_URL }),
      providesTags: ['Article'],
    }),
    createArticle: builder.mutation({
      query: (data) => ({
        url: ARTICLES_URL,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Article'],
    }),
    updateArticle: builder.mutation({
      query: (data) => ({
        url: `${ARTICLES_URL}/${data.articleId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Article'],
    }),
    deleteArticle: builder.mutation({
      query: (articleId) => ({
        url: `${ARTICLES_URL}/${articleId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Article'],
    }),
  }),
});

export const {
  useGetArticlesQuery,
  useCreateArticleMutation,
  useUpdateArticleMutation,
  useDeleteArticleMutation,
} = articlesApiSlice;