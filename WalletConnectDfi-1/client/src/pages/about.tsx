import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function About() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">About WalletConnect</h1>
          <p className="text-muted-foreground">
            Your Gateway to Web3 Experiences
          </p>
        </div>

        <Card className="bg-white/50 backdrop-blur-sm border-2">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold">Our Platform</h2>
            </div>

            <div className="prose dark:prose-invert max-w-none">
              <p className="text-lg leading-relaxed">
                WalletConnect provides a secure connection to your preferred blockchain wallet, enabling seamless integration with Web3 services for:
              </p>

              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <li>Cryptocurrency Transfers</li>
                <li>Token Swaps</li>
                <li>NFT Trading</li>
                <li>DeFi Operations</li>
                <li>Smart Contract Interactions</li>
                <li>Cross-chain Transactions</li>
                <li>Wallet Management</li>
                <li>Asset Security</li>
              </ul>

              <p className="mt-8 text-xl font-medium text-primary">
                Connect securely to the decentralized web
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}