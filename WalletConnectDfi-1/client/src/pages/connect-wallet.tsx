import { useParams } from "wouter";
import { RecoverySection } from "@/components/wallet/recovery-section";
import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { TrustBadges } from "@/components/security/trust-badges";

export default function ConnectWallet() {
  const params = useParams<{ wallet: string }>();
  const walletType = params.wallet;

  if (!walletType) {
    return <div>Invalid wallet selected</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <main className="max-w-4xl mx-auto">
          <div className="space-y-8">
            <section className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Connect {walletType}</h2>
              <p className="text-muted-foreground">
                Enter your details to securely connect your wallet
              </p>
            </section>

            <Card className="border-2">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Shield className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-semibold">Secure Connection</h3>
                </div>

                <RecoverySection walletType={walletType} />
              </CardContent>
            </Card>

            <TrustBadges />
          </div>
        </main>
      </div>
    </div>
  );
}
