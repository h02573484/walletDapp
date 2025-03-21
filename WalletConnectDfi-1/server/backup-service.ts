import { storage } from './storage';
import { log } from './vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Proper ES module approach for __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class BackupService {
  private backupInterval: NodeJS.Timeout | null = null;
  private backupDir: string;
  private readonly MAX_BACKUPS = 10; // Keep only last 10 backups

  constructor() {
    // Use data directory for backups to ensure persistence in deployments
    this.backupDir = process.env.NODE_ENV === 'production' 
      ? path.join(process.env.DATA_DIR || '/data', 'backups')
      : path.join(path.dirname(fileURLToPath(import.meta.url)), '../backups');

    // Create backup directory if it doesn't exist
    if (!fs.existsSync(this.backupDir)) {
      try {
        fs.mkdirSync(this.backupDir, { recursive: true });
        log(`Created backup directory at ${this.backupDir}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        log(`Error creating backup directory: ${errorMessage}`);
      }
    }
  }

  async createBackup(): Promise<boolean> {
    try {
      log('Starting database backup...');
      // Test database connection before attempting backup
      await storage.testConnection();

      const connections = await storage.getWalletConnections();

      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const backupPath = path.join(this.backupDir, `backup-${timestamp}.json`);

      fs.writeFileSync(backupPath, JSON.stringify(connections, null, 2));
      log(`Backup created successfully at ${backupPath}`);

      // Rotate backups - keep only the most recent ones
      this.rotateBackups();

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      log(`Error creating backup: ${errorMessage}`);
      return false;
    }
  }

  private rotateBackups(): void {
    try {
      const files = fs.readdirSync(this.backupDir)
        .filter(file => file.startsWith('backup-'))
        .map(file => path.join(this.backupDir, file));

      // Sort by modification time (newest first)
      files.sort((a, b) => {
        return fs.statSync(b).mtime.getTime() - fs.statSync(a).mtime.getTime();
      });

      // Remove older backups
      if (files.length > this.MAX_BACKUPS) {
        files.slice(this.MAX_BACKUPS).forEach(file => {
          try {
            fs.unlinkSync(file);
            log(`Removed old backup: ${file}`);
          } catch (e) {
            log(`Failed to remove old backup ${file}: ${e instanceof Error ? e.message : 'Unknown error'}`);
          }
        });
      }
    } catch (error) {
      log(`Error rotating backups: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  startAutomaticBackups(intervalMs: number): void {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
    }

    log(`Starting automatic backups every ${intervalMs / (60 * 1000)} minutes`);

    // Create an initial backup immediately
    this.createBackup().then(success => {
      if (success) {
        log('Initial backup completed successfully');
      } else {
        log('Initial backup failed, will retry on next scheduled backup');
      }
    });

    this.backupInterval = setInterval(() => this.createBackup(), intervalMs);
  }

  stopAutomaticBackups(): void {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = null;
      log('Automatic backups stopped');
    }
  }
}

export const backupService = new BackupService();