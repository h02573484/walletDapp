import { walletConnections, type WalletConnection, type InsertWalletConnection } from "@shared/schema";
import { db } from './db';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import { log } from './vite';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const PostgresStore = pgSession(session);

// Define interface for file-based storage
interface FileRecord {
  connections: WalletConnection[];
  lastUpdated: string;
}

export interface IStorage {
  testConnection(): Promise<void>;
  createWalletConnection(connection: InsertWalletConnection): Promise<WalletConnection>;
  getWalletConnections(): Promise<WalletConnection[]>;
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  private databaseAvailable: boolean = true;
  private localConnections: WalletConnection[] = [];
  private dataPath: string;
  private localSessionData: Map<string, any> = new Map();

  constructor() {
    log('Initializing database storage...');

    // Set up local storage path for persistence
    const currentDir = path.dirname(fileURLToPath(import.meta.url));
    this.dataPath = process.env.NODE_ENV === 'production' 
      ? path.join(process.env.DATA_DIR || '/data', 'local-storage.json')
      : path.join(currentDir, '../data/local-storage.json');

    // Ensure the directory exists
    const dir = path.dirname(this.dataPath);
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
        log(`Created data directory at ${dir}`);
      } catch (err) {
        log(`Error creating data directory: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    // Load any existing connections from file
    this.loadLocalConnections();

    // Setup PostgreSQL session store with fallback
    try {
      const pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false
        },
        // Add connection pool configuration for reliability
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000
      });

      // Initialize the session table
      pool.query(`
        CREATE TABLE IF NOT EXISTS "session" (
          "sid" varchar NOT NULL COLLATE "default",
          "sess" json NOT NULL,
          "expire" timestamp(6) NOT NULL,
          CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
        ) WITH (OIDS=FALSE);
        CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
      `).then(() => {
        log('Session table created/verified successfully');
        this.databaseAvailable = true;
      }).catch(err => {
        log('Error creating session table:', err);
        this.databaseAvailable = false;
      });

      // Create a memory store as fallback
      const MemoryStore = session.MemoryStore;
      const memoryStore = new MemoryStore();

      // Initialize session store with PostgreSQL and fallback
      const pgStore = new PostgresStore({
        pool,
        tableName: 'session',
        errorLog: (error) => {
          log(`Session store error: ${error.message}`);
          this.databaseAvailable = false;
        }
      });

      // Create a wrapper around the PG session store with all required methods
      this.sessionStore = {
        ...pgStore,
        
        // Add required methods that might be missing
        on: function(event: string, callback: Function) {
          if (typeof callback === 'function' && event === 'connect') {
            callback();
          }
          return this;
        },
        
        // Ensure these methods exist
        get: function(sid: string, callback: Function) {
          if (typeof pgStore.get === 'function') {
            return pgStore.get(sid, callback);
          }
          // Fallback implementation
          return callback(null, null);
        },
        
        set: function(sid: string, session: any, callback: Function) {
          if (typeof pgStore.set === 'function') {
            return pgStore.set(sid, session, callback);
          }
          // Fallback implementation
          return callback();
        },
        
        destroy: function(sid: string, callback: Function) {
          if (typeof pgStore.destroy === 'function') {
            return pgStore.destroy(sid, callback);
          }
          // Fallback implementation
          return callback();
        },
        
        all: function(callback: Function) {
          if (typeof pgStore.all === 'function') {
            return pgStore.all(callback);
          }
          // Fallback implementation
          return callback(null, []);
        },
        
        clear: function(callback: Function) {
          if (typeof pgStore.clear === 'function') {
            return pgStore.clear(callback);
          }
          // Fallback implementation
          return callback();
        },
        
        length: function(callback: Function) {
          if (typeof pgStore.length === 'function') {
            return pgStore.length(callback);
          }
          // Fallback implementation
          return callback(null, 0);
        },
        
        touch: function(sid: string, session: any, callback: Function) {
          if (typeof pgStore.touch === 'function') {
            return pgStore.touch(sid, session, callback);
          }
          // Fallback implementation
          return callback();
        }
      };

      log('Session store initialized with database and memory fallback');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      log(`Failed to initialize PostgreSQL session store: ${errorMessage}`);
      log('Using memory session store as fallback');

      // Use memory store as fallback
      const MemoryStore = session.MemoryStore;
      const memoryStore = new MemoryStore();
      
      // Create a wrapper with all required methods to ensure consistency
      this.sessionStore = {
        ...memoryStore,
        on: function(event: string, callback: Function) {
          if (typeof callback === 'function' && event === 'connect') {
            callback();
          }
          return this;
        }
      };
      
      this.databaseAvailable = false;
    }

    // Test connection to see if database is actually available
    this.testConnection().catch(() => {
      this.databaseAvailable = false;
      log('Initial database connection test failed, will operate in fallback mode');
    });
  }

  private loadLocalConnections(): void {
    try {
      if (fs.existsSync(this.dataPath)) {
        const data = JSON.parse(fs.readFileSync(this.dataPath, 'utf8')) as FileRecord;
        this.localConnections = data.connections || [];
        log(`Loaded ${this.localConnections.length} wallet connections from local storage`);
      } else {
        log('No local storage file found, starting with empty connections');
        this.localConnections = [];
      }
    } catch (error) {
      log(`Error loading local connections: ${error instanceof Error ? error.message : 'Unknown error'}`);
      this.localConnections = [];
    }
  }

  private saveLocalConnections(): void {
    try {
      const data: FileRecord = {
        connections: this.localConnections,
        lastUpdated: new Date().toISOString()
      };
      fs.writeFileSync(this.dataPath, JSON.stringify(data, null, 2));
      log(`Saved ${this.localConnections.length} wallet connections to local storage`);
    } catch (error) {
      log(`Error saving local connections: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async testConnection(): Promise<void> {
    try {
      // Test the database connection by running a simple query
      const result = await db.select().from(walletConnections).limit(1);
      log('Database connection test successful');
      this.databaseAvailable = true;
      return Promise.resolve();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      log('Database connection test failed:', errorMessage);
      this.databaseAvailable = false;
      return Promise.reject(new Error('Failed to connect to database'));
    }
  }

  async createWalletConnection(connection: InsertWalletConnection): Promise<WalletConnection> {
    try {
      if (!this.databaseAvailable) {
        throw new Error('Database not available');
      }

      log(`Creating wallet connection for ${connection.email} with ${connection.walletType}`);

      const timestamp = new Date().toISOString();
      const [newConnection] = await db
        .insert(walletConnections)
        .values({
          ...connection,
          isConnected: false,
          createdAt: timestamp,
          updatedAt: timestamp
        })
        .returning();

      if (!newConnection) {
        throw new Error('Failed to create wallet connection - no data returned');
      }

      log(`Successfully created wallet connection with ID: ${newConnection.id}`);

      // Also update local storage as backup
      this.localConnections.push(newConnection);
      this.saveLocalConnections();

      return newConnection;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      log(`Error creating wallet connection in database: ${errorMessage}`);
      log('Falling back to local storage');

      // Create in local storage instead
      const newConnection: WalletConnection = {
        id: this.localConnections.length > 0 
          ? Math.max(...this.localConnections.map(c => c.id)) + 1 
          : 1,
        ...connection,
        isConnected: false,
        createdAt: new Date()
      };

      this.localConnections.push(newConnection);
      this.saveLocalConnections();

      log(`Created wallet connection in local storage with ID: ${newConnection.id}`);
      return newConnection;
    }
  }

  async getWalletConnections(): Promise<WalletConnection[]> {
    try {
      if (!this.databaseAvailable) {
        throw new Error('Database not available');
      }

      const connections = await db.select().from(walletConnections);
      log(`Retrieved ${connections.length} wallet connections from database`);

      // Update local cache
      this.localConnections = connections;
      this.saveLocalConnections();

      return connections;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      log(`Error retrieving wallet connections from database: ${errorMessage}`);
      log('Returning connections from local storage');
      return this.localConnections;
    }
  }
}

export const storage = new DatabaseStorage();