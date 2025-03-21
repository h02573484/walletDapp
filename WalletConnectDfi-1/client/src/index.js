// client/src/components/ui/WalletButton.tsx

import React from "react";
import { connectWallet, disconnectWallet } from "@/WalletConnectDfi/index";

export function WalletButton() {
  return (
    <div>
      <button onClick={connectWallet} className="btn btn-connect">
        Connect Wallet
      </button>
      <button onClick={disconnectWallet} className="btn btn-disconnect">
        Disconnect Wallet
      </button>
    </div>
  );
}