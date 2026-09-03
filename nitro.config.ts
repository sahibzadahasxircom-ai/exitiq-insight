// @ts-ignore - Nitro provides process.env at build time
export default {
  preset: 'vercel',
  routeRules: {
    '/widget.js': {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
      },
    },
  },
};
