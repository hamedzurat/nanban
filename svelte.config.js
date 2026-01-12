import adapter from '@sveltejs/adapter-static';

export default {
  kit: {
    adapter: adapter({
      // Cloudflare Pages SPA behavior serves /index.html for unknown paths,
      // so using index.html as the SPA entry works well on Pages.
      fallback: 'index.html',
    }),
  },
};
