import { Pool } from 'pg'

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     Number(process.env.DB_PORT) || 5432,
  user:     process.env.DB_USER     || 'hellouser',
  password: process.env.DB_PASSWORD || 'hellopass',
  database: process.env.DB_NAME     || 'hellodb',
})

export default pool
