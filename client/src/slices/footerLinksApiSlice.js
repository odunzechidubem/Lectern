import { apiSlice } from './apiSlice';
const FOOTER_LINKS_URL = '/api/footer-links';

export const footerLinksApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFooterLinks: builder.query({
      query: () => ({ url: FOOTER_LINKS_URL }),
      providesTags: ['FooterLink'],
    }),
    createFooterLink: builder.mutation({
      query: (data) => ({
        url: FOOTER_LINKS_URL,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['FooterLink'],
    }),
    updateFooterLink: builder.mutation({
      query: (data) => ({
        url: `${FOOTER_LINKS_URL}/${data.linkId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['FooterLink'],
    }),
    deleteFooterLink: builder.mutation({
      query: (linkId) => ({
        url: `${FOOTER_LINKS_URL}/${linkId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['FooterLink'],
    }),
  }),
});

export const {
  useGetFooterLinksQuery,
  useCreateFooterLinkMutation,
  useUpdateFooterLinkMutation,
  useDeleteFooterLinkMutation,
} = footerLinksApiSlice;