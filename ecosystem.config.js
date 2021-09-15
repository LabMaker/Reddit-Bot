module.exports = {
  apps: [
    {
      name: 'RedditBot',
      script: 'lib/index.js',
      node_args: '-r dotenv/config',
    },
  ],
};
