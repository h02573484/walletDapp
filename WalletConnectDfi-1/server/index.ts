import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";
import { backupService } from './backup-service';

// Add startup logging
log("Starting server initialization...");
log(`Using database URL: ${process.env.DATABASE_URL?.replace(/\/\/.*@/, '//<CREDENTIALS>@')}`);

try {
  const app = express();
  log("Express app created");

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Add detailed request logging middleware
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      log(logLine);
    });

    next();
  });

  app.set('trust proxy', 1); // trust first proxy for secure cookies

  // Set up session with a memory store for simplicity
  log("Configuring session middleware...");
  const MemoryStore = session.MemoryStore;
  
  // Use a simple memory store for session storage to avoid database connection issues
  app.use(
    session({
      store: new MemoryStore(),
      secret: process.env.SESSION_SECRET || 'your-secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        secure: process.env.NODE_ENV === 'production', // Only use secure cookies in production
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Required for cross-site cookies in production
        httpOnly: true
      },
      name: 'walletconnect.sid'
    })
  );

  // Debug session
  app.use((req, res, next) => {
    log(`Session Debug - Admin: ${req.session?.isAdmin ? 'true' : 'false'}`);
    next();
  });

  (async () => {
    try {
      log("Starting server...");
      log(`Environment: ${process.env.NODE_ENV || 'development'}`);

      const server = await registerRoutes(app);
      log("Routes registered successfully");

      // Enhanced error handling middleware
      app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";
        const stack = process.env.NODE_ENV === 'development' ? err.stack : undefined;

        log(`Error: ${message}\n${stack || ''}`);
        res.status(status).json({ message, stack });
      });

      if (process.env.NODE_ENV !== "production") {
        log("Setting up Vite development server...");
        await setupVite(app, server);
      } else {
        log("Setting up static file serving...");
        serveStatic(app);
      }

      const PORT = process.env.PORT || 5000;

      // Improved server start logic to prevent duplicate instances
      let currentServer: any = null;

      const startServer = async (port: number): Promise<void> => {
        // Close existing server if it exists
        if (currentServer) {
          await new Promise((resolve) => currentServer.close(resolve));
        }

        return new Promise((resolve, reject) => {
          currentServer = server.listen(port, "0.0.0.0", () => {
            log(`Server running on port ${port}`);
            resolve();
          });

          currentServer.once('error', (err: any) => {
            if (err.code === 'EADDRINUSE') {
              log(`Port ${port} is busy, trying port ${port + 1}`);
              startServer(port + 1).then(resolve).catch(reject);
            } else {
              log(`Error starting server: ${err.message}`);
              reject(err);
            }
          });
        });
      };

      await startServer(Number(PORT));
      log("Server started successfully");
      // Enable automatic backups every 30 minutes to ensure data persistence
      backupService.startAutomaticBackups(30 * 60 * 1000); // Start backups every 30 minutes
    } catch (error) {
      log(`Fatal error during server startup: ${error instanceof Error ? error.message : 'Unknown error'}`);
      log(error instanceof Error ? error.stack || '' : '');
      process.exit(1);
    }
  })();
} catch (error) {
  log(`Critical error during initialization: ${error instanceof Error ? error.message : 'Unknown error'}`);
  log(error instanceof Error ? error.stack || '' : '');
  process.exit(1);
}