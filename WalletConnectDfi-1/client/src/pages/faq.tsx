
import React from "react";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { SimpleEarthBackground } from "@/components/earth/SimpleEarthBackground";

export default function FAQ() {
  return (
    <div className="relative min-h-screen">
      {/* Earth Background */}
      <SimpleEarthBackground imagePath="/earth/earth-nasa-fixed.jpg" opacity={0.3} />
      
      <div className="container py-12 relative z-10">
        <h1 className="text-3xl font-bold mb-8 text-center text-primary">Frequently Asked Questions</h1>
        
        <div className="max-w-3xl mx-auto backdrop-blur-sm bg-white/50 dark:bg-black/50 p-6 rounded-lg shadow-lg">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-primary">What is WalletConnect?</AccordionTrigger>
              <AccordionContent className="text-blue-600">
                WalletConnect is an open protocol for connecting decentralized applications to mobile wallets with QR code scanning or deep linking. 
                It allows you to securely interact with multiple blockchain networks through your preferred wallet application.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-primary">How do I connect my wallet?</AccordionTrigger>
              <AccordionContent className="text-blue-600">
                Select your wallet from our supported options, then follow the connection instructions for your specific wallet. 
                This usually involves scanning a QR code or approving a connection request in your wallet app.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-primary">Is WalletConnect secure?</AccordionTrigger>
              <AccordionContent className="text-blue-600">
                Yes, WalletConnect uses end-to-end encryption to secure all communications between your devices and applications.
                Your private keys never leave your device, and you maintain full control of your assets at all times.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-primary">Which wallets are supported?</AccordionTrigger>
              <AccordionContent className="text-blue-600">
                We support a wide range of popular wallets including MetaMask, Trust Wallet, Rainbow, Coinbase Wallet, and many others.
                Our list of supported wallets continues to grow as we partner with more wallet providers.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-5">
              <AccordionTrigger className="text-primary">What if I encounter issues?</AccordionTrigger>
              <AccordionContent className="text-blue-600">
                If you experience any problems, please visit our Support page or contact our customer service team.
                We're committed to providing prompt assistance to ensure you have a smooth experience.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
