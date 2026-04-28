module.exports = {
  apps: [{
    name: 'Mateach',
    script: 'node_modules/.bin/next',
    args: 'start -p 3001',
    cwd: '/var/www/MaTeach',
    instances: 1,
    autorestart: true,
    watch: false,
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
    }
  }]
}
