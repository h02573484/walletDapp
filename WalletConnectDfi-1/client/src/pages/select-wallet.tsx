import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { WalletGrid } from "@/components/wallet/wallet-grid";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function SelectWallet() {
  const [, setLocation] = useLocation();
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleWalletSelect = async (wallet: string) => {
    setSelectedWallet(wallet);
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLocation(`/web3?wallet=${encodeURIComponent(wallet)}`);
  };

  return (
    <div className="min-h-screen bg-background py-12 dark relative overflow-hidden">
      {/* Blur background effect */}
      <div className="absolute inset-0 bg-primary/5 backdrop-blur-xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <main className="max-w-5xl mx-auto">
          <div className="space-y-8">
            <section className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Select Your Wallet
              </h1>
              <p className="text-muted-foreground text-lg">
                Choose your preferred wallet to continue
              </p>
            </section>

            <Card className="border-2 relative">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-6 text-foreground">Available Wallets</h2>
                {isLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2 text-lg text-muted-foreground">Connecting...</span>
                  </div>
                ) : (
                  <WalletGrid selectedWallet={selectedWallet} onSelect={handleWalletSelect} />
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}