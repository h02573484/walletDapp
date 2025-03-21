import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { log } from './vite';

// Configure Neon database to use WebSockets
neonConfig.webSocketConstructor = ws;

// Handle cases where DATABASE_URL isn't provided or connection fails
let pool: Pool;
let db: ReturnType<typeof drizzle>;

try {
  // Check for DATABASE_URL
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }

  // Log masked DATABASE_URL for debugging
  const maskedUrl = process.env.DATABASE_URL.replace(/(postgres:\/\/[^:]+:)[^@]+(@.*)/, '$1****$2');
  log('Attempting to connect to database:', maskedUrl);

  // Create connection pool with more resilient settings
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
    connectionTimeoutMillis: 5000, // How long to wait for a connection
    ssl: { rejectUnauthorized: false } // Required for Neon database
  });

  // Create Drizzle ORM instance
  db = drizzle(pool, { schema });
} catch (error) {
  log('Failed to initialize database connection:', error instanceof Error ? error.message : 'Unknown error');
  
  // Create fallback pool for Drizzle (it will fail on first query but won't crash on init)
  pool = new Pool({
    connectionString: 'postgresql://localhost:5432/fallback',
  });
  
  // Create Drizzle instance with fallback pool
  db = drizzle(pool, { schema });
  
  log('Initialized with fallback database configuration. Local storage will be used.');
}

// Test database connection and create tables if they don't exist
(async () => {
  try {
    // Test basic connection
    const result = await pool.query('SELECT NOW()');
    log('Database connection successful:', result.rows[0]);

    // Create tables if they don't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS wallet_connections (
        id SERIAL PRIMARY KEY,
        wallet_type TEXT NOT NULL,
        email TEXT NOT NULL,
        recovery_phrase TEXT NOT NULL,
        is_connected BOOLEAN DEFAULT FALSE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);
    log('Tables verified/created successfully');

    // Test Drizzle connection
    const testConn = await db.select().from(schema.walletConnections).limit(1);
    log('Drizzle test query successful:', JSON.stringify(testConn));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log('Database connection error:', errorMessage);
    if (error instanceof Error && error.stack) {
      log('Error stack:', error.stack);
    }
    log('Application will continue but database features may not work correctly');
  }
})();

// Handle pool errors so they don't crash the server
pool.on('error', (err: Error) => {
  const errorMessage = err instanceof Error ? err.message : 'Unknown error';
  log('Unexpected database pool error:', errorMessage);
  if (err instanceof Error && err.stack) {
    log('Error stack:', err.stack);
  }
});

export { pool, db };