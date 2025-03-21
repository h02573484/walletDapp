import { useLocation } from "wouter";
import { TrustBadges } from "@/components/security/trust-badges";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { StaticEarthWithEffects } from "@/components/earth/StaticEarthWithEffects"; // Guaranteed to work Earth visualization
import { useIsMobile } from "@/hooks/use-mobile";

export default function Home() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();
  
  // Adjust globe size for better visibility
  const globeSize = isMobile ? 260 : 450;
  
  // Slower rotation for better visualization
  const rotationSpeed = 0.0003;

  const handleGetStarted = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLocation("/select-wallet");
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black space-background">
      {/* Deep space background with stars */}
      <div className="absolute inset-0 overflow-hidden" style={{ backgroundColor: '#000' }}>
        {/* Real starfield background image */}
        <div className="absolute inset-0 bg-cover bg-center" 
          style={{
            backgroundImage: 'url("/starfield.jpg")',
            opacity: 1,
          }}
        ></div>
        
        {/* Additional stars overlay for more depth and richness */}
        <div className="absolute inset-0 bg-[url('/stars-bg.png')] bg-repeat"
          style={{
            backgroundSize: '900px 900px',
            mixBlendMode: 'screen',
            opacity: 0.8
          }}
        ></div>
        
        {/* Deep space nebula glows to create cosmic depth */}
        <div className="absolute inset-0 opacity-40"
          style={{
            background: 'radial-gradient(circle at 75% 25%, rgba(41, 65, 120, 0.4), transparent 70%), radial-gradient(circle at 25% 75%, rgba(41, 99, 150, 0.3), transparent 65%), radial-gradient(circle at 55% 45%, rgba(80, 30, 120, 0.2), transparent 60%)',
          }}
        ></div>
        
        {/* Enhanced cosmic dust with rich color variation for a more realistic space look */}
        <div className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(ellipse at 40% 40%, rgba(70, 120, 190, 0.25), transparent 70%), radial-gradient(ellipse at 60% 60%, rgba(120, 40, 90, 0.2), transparent 75%), radial-gradient(ellipse at 30% 70%, rgba(40, 80, 130, 0.15), transparent 65%), radial-gradient(ellipse at 70% 30%, rgba(70, 30, 100, 0.1), transparent 70%)'
          }}
        ></div>
        
        {/* Subtle light bloom around stars */}
        <div className="absolute inset-0 opacity-15" 
          style={{
            boxShadow: 'inset 0 0 100px rgba(100, 150, 255, 0.15), inset 0 0 50px rgba(70, 100, 180, 0.1)',
            pointerEvents: 'none'
          }}
        ></div>
      </div>
      
      {/* Earth element - positioned to be more visible */}
      <div className="absolute w-full flex justify-center items-center" 
        style={{
          top: isMobile ? '25%' : '48%',
          transform: isMobile ? 'translateY(-25%)' : 'translateY(-50%)',
          zIndex: 1,
          opacity: 1
        }}
      >
        <div className="glowing-map-container">
          <StaticEarthWithEffects 
            size={globeSize}
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8 sm:py-16">
          <main className="max-w-4xl mx-auto">
            <div className="space-y-8 sm:space-y-16">
              <section className="text-center pt-8 sm:pt-12">
                {/* Logo */}
                <div className="flex justify-center mb-4 sm:mb-6">
                  <img 
                    src="/images/logo.png"
                    alt="Wallet Logo"
                    className="w-auto h-16 sm:h-20 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                  />
                </div>

                {/* Title */}
                <h1 className="text-4xl sm:text-5xl font-bold mb-4 sm:mb-6 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                  Wallet Connect
                </h1>

                <p className="text-xl sm:text-2xl text-white mb-8 sm:mb-12 max-w-2xl mx-auto drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] px-4">
                  Connect your wallet securely to access Web3 services
                </p>

                <Button
                  onClick={handleGetStarted}
                  className="w-full sm:w-auto gap-2 relative h-12 text-base font-medium shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-primary to-primary/90 px-6 sm:px-8"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="opacity-0">Get Started</span>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span className="ml-2">Processing...</span>
                      </div>
                    </>
                  ) : (
                    <>
                      Get Started
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </section>

              <TrustBadges />

              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}