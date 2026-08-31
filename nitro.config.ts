// @ts-ignore - Nitro provides process.env at build time
export default {
  preset: 'node-server',
  port: process.env.PORT || 8080,
  host: '0.0.0.0',
  routeRules: {
    '/widget.js': {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
      },
    },
  },
};
