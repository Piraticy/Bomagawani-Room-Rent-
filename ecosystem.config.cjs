module.exports = {
  apps: [
    {
      name: 'bomagawani-app',
      script: 'src/server.js',
      cwd: '.',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        TRUST_PROXY: 1
      }
    }
  ]
};
