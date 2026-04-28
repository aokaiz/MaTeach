module.exports = {
  apps: [{
    name: 'Mateach',
    script: 'node_modules/.bin/next',
    args: 'start -p 3000',
    cwd: '/var/www/MaTeach',
    instances: 1,
    autorestart: true,
    watch: false,
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      DB_HOST: 'localhost',
      DB_PORT: 5432,
      DB_USER: 'hellouser',
      DB_PASSWORD: '436',
      DB_NAME: 'hellodb',
    }
  }]
}
