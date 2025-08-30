import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test database connection
pool.connect()
  .then(client => {
    console.log('✅ Connected to PostgreSQL Database');
    console.log('📍 Database URL:', process.env.DATABASE_URL ? 'Connected via ENV' : 'No DATABASE_URL found');
    client.release();
  })
  .catch(error => {
    console.error('❌ PostgreSQL connection error:', error);
    process.exit(1);
  });
