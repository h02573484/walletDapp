import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function LoadingLink({ href, children, className }: LoadingLinkProps) {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate loading time
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsLoading(false);
    setLocation(href);
  };

  return (
    <div 
      onClick={handleClick}
      className={cn(
        "relative inline-flex items-center gap-2 cursor-pointer",
        isLoading && "cursor-wait opacity-70",
        className
      )}
    >
      {isLoading && (
        <Loader2 className="h-4 w-4 animate-spin" />
      )}
      {children}
    </div>
  );
}