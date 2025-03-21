import { motion } from "framer-motion";

interface Text3DProps {
  text: string;
  className?: string;
}

export function Text3D({ text, className = "" }: Text3DProps) {
  return (
    <div className="relative">
      {/* Enhanced glowing effect behind the text */}
      <div className="absolute inset-0 blur-2xl bg-gradient-to-r from-primary/30 to-primary/50 animate-pulse" />

      <motion.h1
        className={`text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent relative ${className}`}
        style={{
          textShadow: "4px 4px 8px rgba(0,0,0,0.3)",
          transform: "perspective(1000px)",
        }}
        animate={{
          scale: [1, 1.2, 1, 1.15, 1],
          rotateX: [0, 15, 0, -10, 0],
          rotateY: [0, -15, 0, 10, 0],
          z: [0, 50, 0, 30, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      >
        {text}
      </motion.h1>

      {/* Additional depth layer */}
      <div 
        className="absolute inset-0 blur-sm bg-gradient-to-r from-primary/20 to-primary/30" 
        style={{
          transform: "translateZ(-10px) scale(1.1)",
          filter: "blur(8px)",
        }}
      />
    </div>
  );
}