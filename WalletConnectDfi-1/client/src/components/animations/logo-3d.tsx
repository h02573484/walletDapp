import { motion } from "framer-motion";

export function Logo3D() {
  return (
    <div className="w-full py-12 flex justify-center items-center">
      <motion.div
        className="relative w-64 h-64 sm:w-96 sm:h-96"
        animate={{
          rotateY: 360,
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        {/* Enhanced blue glow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-primary/40 blur-[100px]" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/30 via-transparent to-primary/30 blur-[50px] animate-pulse" />

        {/* Logo with scaling animation */}
        <motion.img
          src="/images/logo.png"
          alt="WalletConnect Logo"
          className="w-full h-full object-contain relative z-10"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Additional lighting effects */}
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-transparent to-primary/30 mix-blend-overlay rounded-full" />
        <div className="absolute inset-0 bg-gradient-radial from-primary/20 to-transparent animate-pulse" />
      </motion.div>
    </div>
  );
}