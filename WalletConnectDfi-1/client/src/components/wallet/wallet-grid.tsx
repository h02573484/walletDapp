import { WalletLogo } from "./wallet-logo";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

// Import wallet images
import metamaskWallet from "../../../../attached_assets/metamask_wallet.png";
import coinbaseWallet from "../../../../attached_assets/coinbase_wallet.png";
import trustWallet from "../../../../attached_assets/trust_wallet.png";
import exodusWallet from "../../../../attached_assets/exodus_wallet.png";
import binanceWallet from "../../../../attached_assets/binance_wallet.png";
import atomicWallet from "../../../../attached_assets/atomic_wallet.png";
import bitgoWallet from "../../../../attached_assets/bitgo_wallet.png";
import zengoWallet from "../../../../attached_assets/zengo_wallet.png";
import inch1Wallet from "../../../../attached_assets/1inch_wallet.png";
import phantomWallet from "../../../../attached_assets/phantom_wallet.png";
import myetherwallet from "../../../../attached_assets/myetherwallet.png";
import safepalWallet from "../../../../attached_assets/safepal_wallet.png";

const WALLETS = [
  { id: "metamask", name: "MetaMask", logo: metamaskWallet },
  { id: "coinbase", name: "Coinbase Wallet", logo: coinbaseWallet },
  { id: "trust", name: "Trust Wallet", logo: trustWallet },
  { id: "exodus", name: "Exodus", logo: exodusWallet },
  { id: "binance", name: "Binance", logo: binanceWallet },
  { id: "atomic", name: "Atomic Wallet", logo: atomicWallet },
  { id: "bitgo", name: "BitGo", logo: bitgoWallet },
  { id: "zengo", name: "Zengo", logo: zengoWallet },
  { id: "1inch", name: "1inch", logo: inch1Wallet },
  { id: "phantom", name: "Phantom", logo: phantomWallet },
  { id: "myetherwallet", name: "MyEtherWallet", logo: myetherwallet },
  { id: "safepal", name: "SafePal", logo: safepalWallet }
];

interface WalletGridProps {
  selectedWallet: string | null;
  onSelect: (wallet: string) => void;
}

export function WalletGrid({ selectedWallet, onSelect }: WalletGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {WALLETS.map(({ id, name, logo }, index) => (
        <motion.div
          key={id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Button
            variant={selectedWallet === id ? "default" : "outline"}
            className="w-full h-32 flex-col gap-2 p-4 border-2 hover:border-primary transition-colors relative group overflow-hidden"
            onClick={() => onSelect(id)}
          >
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex flex-col items-center justify-center h-full">
              <img 
                src={logo} 
                alt={`${name} logo`}
                className="w-12 h-12 mb-2 object-contain"
              />
              <span className="text-sm text-center font-medium">{name}</span>
            </div>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}