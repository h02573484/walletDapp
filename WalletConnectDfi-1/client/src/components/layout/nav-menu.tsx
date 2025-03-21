import React from "react";
import { useLocation, setLocation } from "wouter";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

interface NavLink {
  title: string;
  href: string;
}

const mainNavLinks: NavLink[] = [
  { title: "Home", href: "/" },
  { title: "About", href: "/about" },
  { title: "FAQ", href: "/faq" },
  { title: "Support", href: "/support" },
];

export function NavMenu() {
  const [location, setLocation] = useLocation();

  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        {mainNavLinks.map((link) => (
          <NavigationMenuItem key={link.title}>
            <NavigationMenuLink
              className={cn(
                navigationMenuTriggerStyle(),
                "cursor-pointer text-blue-600 hover:text-blue-800",
                location === link.href && "bg-accent/50"
              )}
              onClick={() => setLocation(link.href)}
            >
              {link.title}
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}