import { useState } from "react";
import { WalletGrid } from "./wallet-grid";
import { RecoverySection } from "./recovery-section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

export function ConnectSection() {
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [showRecovery, setShowRecovery] = useState(false);

  return (
    <Card className="border-2">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-semibold">Select Your Wallet</h3>
        </div>

        <WalletGrid
          selectedWallet={selectedWallet}
          onSelect={setSelectedWallet}
        />

        {selectedWallet && (
          <div className="mt-6">
            <Button
              className="w-full"
              variant="outline"
              onClick={() => setShowRecovery(true)}
            >
              Continue with {selectedWallet}
            </Button>
          </div>
        )}

        {showRecovery && selectedWallet && (
          <RecoverySection walletType={selectedWallet} />
        )}
      </CardContent>
    </Card>
  );
}
