import { Router } from "express";
import { walletConnections, insertWalletConnectionSchema } from "@shared/schema";
import { log } from '../vite';
import { storage } from '../storage';

const router = Router();

// Create new wallet connection
router.post("/connect", async (req, res) => {
  try {
    log('Attempting to create new wallet connection');
    log('Request body:', JSON.stringify(req.body));

    const validatedData = insertWalletConnectionSchema.parse(req.body);
    
    // Use storage interface which has fallback to local storage
    const connection = await storage.createWalletConnection(validatedData);

    log('Successfully created wallet connection:', JSON.stringify(connection));
    res.status(201).json(connection);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to create wallet connection";
    log('Error creating wallet connection:', errorMessage);
    res.status(400).json({ error: errorMessage });
  }
});

export default router;
