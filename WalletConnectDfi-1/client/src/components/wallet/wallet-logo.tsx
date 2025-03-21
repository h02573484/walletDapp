import { type IconType } from "react-icons";
import { motion } from "framer-motion";

interface WalletLogoProps {
  icon: IconType;
  size?: number;
  className?: string;
}

export function WalletLogo({ icon: Icon, size = 40, className = "" }: WalletLogoProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className={`relative ${className}`}
    >
      <div className="absolute inset-0 bg-primary/10 rounded-full blur-lg" />
      <Icon
        size={size}
        className="relative z-10 text-primary transition-colors hover:text-primary/80"
      />
    </motion.div>
  );
}
