import { Router } from "express";
import { db } from "../db";
import { walletConnections } from "@shared/schema";
import { desc } from "drizzle-orm";
import { log } from '../vite';

const ADMIN_PASSWORD = "09163666961";

const router = Router();

// Admin login
router.post("/login", async (req, res) => {
  try {
    const { password } = req.body;
    log('Admin login attempt');
    log(`Received password length: ${password?.length}`);

    if (!password) {
      log('Admin login failed - no password provided');
      return res.status(400).json({ error: "Password is required" });
    }

    if (password === ADMIN_PASSWORD) {
      // Set session data
      req.session.isAdmin = true;

      // Save session explicitly and wait for it to complete
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) {
            log('Session save error:', err);
            reject(err);
          } else {
            resolve();
          }
        });
      });

      log('Admin login successful');
      log('Session state after login:', JSON.stringify({ isAdmin: req.session.isAdmin }));
      return res.json({ success: true });
    } else {
      log('Admin login failed - invalid password');
      return res.status(401).json({ error: "Invalid password" });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log('Admin login error:', errorMessage);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Middleware to check admin session
const requireAdmin = async (req: any, res: any, next: any) => {
  try {
    log('Session check - isAdmin:', req.session?.isAdmin);
    log('Full session state:', JSON.stringify(req.session));

    if (!req.session) {
      log('No session found');
      return res.status(401).json({ error: "No session found" });
    }

    if (!req.session.isAdmin) {
      log('Unauthorized access attempt to admin route');
      return res.status(401).json({ error: "Unauthorized" });
    }

    log('Admin session verified successfully');
    next();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log('Session validation error:', errorMessage);
    return res.status(500).json({ error: "Session validation failed" });
  }
};

// Protected route to get all connections
router.get("/connections", requireAdmin, async (req, res) => {
  try {
    log('Fetching wallet connections using storage interface');

    // Import the storage interface
    const { storage } = await import('../storage');
    
    // Use the storage interface which handles fallback automatically
    const connections = await storage.getWalletConnections();
    
    // Sort connections by createdAt
    const sortedConnections = [...connections].sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime(); // descending order
    });

    log(`Found ${connections.length} connections`);
    return res.json(sortedConnections);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log('Error fetching connections:', errorMessage);
    if (error instanceof Error && error.stack) {
      log('Error stack:', error.stack);
    }
    return res.status(500).json({ 
      error: "Failed to fetch connections",
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
});

// Check admin session status
router.get("/session", (req, res) => {
  try {
    const isAdmin = !!req.session?.isAdmin;
    log(`Session check - isAdmin: ${isAdmin}`);
    log('Full session state:', JSON.stringify(req.session));
    res.json({ isAdmin });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log('Session check error:', errorMessage);
    res.status(500).json({ error: "Failed to check session" });
  }
});

// Logout endpoint
router.post("/logout", (req, res) => {
  try {
    log('Admin logout request received');

    // Destroy the session
    req.session.destroy((err: any) => {
      if (err) {
        log('Error destroying session:', err);
        return res.status(500).json({ error: "Failed to logout" });
      }

      log('Session destroyed successfully');
      res.clearCookie('walletconnect.sid');
      return res.json({ success: true });
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log('Logout error:', errorMessage);
    return res.status(500).json({ error: "Internal server error during logout" });
  }
});

export default router;