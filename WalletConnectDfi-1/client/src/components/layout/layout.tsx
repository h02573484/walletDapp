import { Header } from "./header";
import { Footer } from "./footer";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation } from "wouter";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const isHomePage = location === "/";
  
  return (
    <div className="min-h-screen flex flex-col bg-background dark relative overflow-hidden">
      {/* Only show background on non-home pages */}
      {!isHomePage && (
        <div 
          className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat pointer-events-none z-0"
          style={{
            backgroundImage: 'url(/background.png)',
            opacity: 0.6,
          }}
        />
      )}
      
      <div className={`relative z-10 flex flex-col min-h-screen ${!isHomePage ? 'backdrop-blur-xl bg-black/20' : ''} text-black`}>
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}