import WalletConnect from "@walletconnect/client";
import { IWalletConnectOptions } from "@walletconnect/types";

class WalletConnector {
  private connector: WalletConnect | null = null;

  async connect(): Promise<boolean> {
    try {
      // Initialize WalletConnect
      const opts: IWalletConnectOptions = {
        bridge: "https://bridge.walletconnect.org",
        qrcodeModal: {
          open: (uri: string) => {
            console.log("QR Code Modal URI:", uri);
            // Implement QR code display logic here
          },
          close: () => {
            console.log("QR Code Modal closed");
          }
        }
      };

      this.connector = new WalletConnect(opts);

      // Subscribe to connection events
      this.connector.on("connect", (error, payload) => {
        if (error) {
          console.error("Connection error:", error);
          return;
        }
        console.log("Connected:", payload);
      });

      this.connector.on("disconnect", (error, payload) => {
        if (error) {
          console.error("Disconnect error:", error);
          return;
        }
        console.log("Disconnected:", payload);
      });

      if (!this.connector.connected) {
        await this.connector.createSession();
      }

      return true;
    } catch (error) {
      console.error("Failed to connect:", error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connector?.connected) {
      await this.connector.killSession();
    }
  }

  isConnected(): boolean {
    return this.connector?.connected || false;
  }

  getAccounts(): string[] {
    return this.connector?.accounts || [];
  }
}

export const walletConnector = new WalletConnector();
