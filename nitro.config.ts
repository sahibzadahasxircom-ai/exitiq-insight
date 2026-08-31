export default {
  preset: 'node-server',
  port: process.env.PORT || 8080,
  routeRules: {
    '/widget.js': {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
      },
    },
  },
};
