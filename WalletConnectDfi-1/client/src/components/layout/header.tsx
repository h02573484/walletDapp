import { LoadingLink } from "@/components/navigation/loading-link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { NavMenu } from "./nav-menu";


export function Header() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <LoadingLink href="/" className="flex items-center gap-2">
            <img 
              src="/images/logo.png" 
              alt="Logo" 
              className="h-8 w-auto" 
            />
            <span className="text-xl font-semibold text-blue-600">WalletConnect</span>
          </LoadingLink>
          <NavMenu />
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-10 w-10 text-blue-600" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <nav className="flex flex-col gap-4 mt-8">
              <LoadingLink href="/" className="text-lg font-medium">Home</LoadingLink>
              <LoadingLink href="/about" className="text-lg font-medium">About</LoadingLink>
              <LoadingLink href="/faq" className="text-lg font-medium">FAQ</LoadingLink>
              <LoadingLink href="/contact" className="text-lg font-medium">Support</LoadingLink>
            </nav>
          </SheetContent>
        </Sheet>

      </div>
    </header>
  );
}