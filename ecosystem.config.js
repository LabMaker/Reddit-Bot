module.exports = {
  apps: [
    {
      name: 'RedditBot',
      script: 'lib/index.js',
      node_args: '-r dotenv/config',
      env: {
        //You Can add ENV Variables here or in .env
        API_URL: 'http://localhost:3000',
        API_TOKEN: 'TOKEN',
        API_DEBUG: 'false',
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
