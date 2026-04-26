module.exports = {
  apps: [{
    name: 'helloworld',
    script: 'node_modules/.bin/next',
    args: 'start -p 3000',
    cwd: '/var/www/helloworld',
    instances: 1,
    autorestart: true,
    watch: false,
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    }
  }]
}
