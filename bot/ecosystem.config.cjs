module.exports = {
  apps: [
    {
      name: 'mega-market-bot',
      script: 'src/index.js',
      cwd: __dirname,
      interpreter: 'node',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '200M',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
