import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Database connection pool configuration
 * Uses MySQL for data persistence
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'mysql-nodejs-render-aiven-lab-mysql-lab4-caturan.a.aivencloud.com',
  user: process.env.DB_USER || 'avnadmin',
  password: process.env.DB_PASSWORD || 'AVNS_Fvc1IPNg8zIOpLPQCeO',
  database: process.env.DB_NAME || 'defaultdb',
  port: parseInt(process.env.DB_PORT || '21297'),
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true
});

// Trace connection events for debugging
(pool as any).on('error', (err: any) => {
  console.error('Database pool error:', err);
});

/**
 * Database utility object
 * Provides simplified async methods for common database operations
 */
export const db = {
  /**
   * Executes an INSERT, UPDATE, or DELETE statement
   */
  async execute(sql: string, params: any[] = []) {
    const [result] = await pool.execute(sql, params);
    return result;
  },
  /**
   * Performs a SELECT query and returns an array of multiple records
   */
  async query(sql: string, params: any[] = []) {
    const [rows] = await pool.query(sql, params);
    return rows as any[];
  },
  /**
   * Performs a SELECT query and returns the first matching record or null
   */
  async queryOne(sql: string, params: any[] = []) {
    const rows = await this.query(sql, params);
    return rows.length > 0 ? rows[0] : null;
  },
  /**
   * Handles raw SQL execution, splitting multi-statement strings by semicolons
   * Primarily used for database migration and initial schema setup
   */
  async exec(sql: string) {
    const statements = sql.split(';').filter(s => s.trim());
    for (const statement of statements) {
      await pool.query(statement);
    }
  },
  /**
   * Wraps multiple operations in a single database transaction
   * Ensures Atomicity: all operations succeed together or none at all (rollback on failure)
   */
  async transaction(callback: () => Promise<void>) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    try {
      await callback();
      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      // Always return the connection to the pool regardless of success or failure
      connection.release();
    }
  }
};

export default db;
