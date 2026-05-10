module.exports = {
  apps: [{
    name: 'Mat',
    script: 'node_modules/.bin/next',
    args: 'start -p 3001',
    cwd: '/var/www/mat',
    instances: 1,
    autorestart: true,
    watch: false,
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
    }
  }]
}
