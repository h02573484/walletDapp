import type { Express } from "express";
import { createServer } from "http";
import adminRouter from "./routes/admin";
import walletRouter from "./routes/wallet";
import { log } from './vite';
import { storage } from "./storage";
import { insertWalletConnectionSchema } from "@shared/schema";
import { ZodError } from "zod";
import { backupService } from './backup-service';

export async function registerRoutes(app: Express) {
  log('Registering routes...');

  // Mount admin routes
  app.use('/api/admin', adminRouter);
  log('Admin routes registered');

  // Mount wallet routes
  app.use('/api/wallet', walletRouter);
  log('Wallet routes registered');

  app.post("/api/wallet/connect", async (req, res) => {
    try {
      log(`Received wallet connection request: ${JSON.stringify(req.body)}`);
      const data = insertWalletConnectionSchema.parse(req.body);
      
      // Enable endpoint and create connection
      const connection = await storage.createWalletConnection({
        ...data,
        status: 'pending'
      });
      
      log(`Wallet connection created: ${JSON.stringify(connection)}`);
      res.json({ success: true, connection });
    } catch (error) {
      if (error instanceof ZodError) {
        log(`Validation error: ${JSON.stringify(error.errors)}`);
        res.status(400).json({ error: JSON.stringify(error.errors, null, 2) });
      } else {
        log(`Error creating wallet connection: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.status(500).json({ error: "Failed to create wallet connection" });
      }
    }
  });

  app.get("/api/wallet/connections", async (_req, res) => {
    try {
      const connections = await storage.getWalletConnections();
      log(`Retrieved ${connections.length} wallet connections`);
      res.json(connections);
    } catch (error) {
      log(`Error fetching wallet connections: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({ error: "Failed to fetch wallet connections" });
    }
  });

  // Add health check endpoint for deployment monitoring
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  const httpServer = createServer(app);
  return httpServer;
}