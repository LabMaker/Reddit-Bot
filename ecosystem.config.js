module.exports = {
  apps: [
    {
      name: 'RedditBot',
      script: 'lib/index.js',
      node_args: '-r dotenv/config',
      env: {
        API_URL: 'http://localhost:3000',
        API_TOKEN: 'TOKEN',
        API_DEBUG: 'false',
      },
    },
  ],
};
