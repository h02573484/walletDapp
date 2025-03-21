import { useState, useEffect, useRef } from 'react';

interface StaticEarthWithEffectsProps {
  size?: number;
}

export function StaticEarthWithEffects({ size = 450 }: StaticEarthWithEffectsProps) {
  const [rotation, setRotation] = useState(0);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(Date.now());
  const speedRef = useRef<number>(0.01); // degrees per millisecond
  
  // Animate rotation with requestAnimationFrame for smoother animation
  useEffect(() => {
    const animateRotation = () => {
      const now = Date.now();
      const deltaTime = now - lastTimeRef.current;
      lastTimeRef.current = now;
      
      // Update rotation based on elapsed time for smooth movement
      setRotation(prev => (prev + speedRef.current * deltaTime) % 360);
      
      // Continue animation loop
      animationFrameRef.current = requestAnimationFrame(animateRotation);
    };
    
    // Start animation
    animationFrameRef.current = requestAnimationFrame(animateRotation);
    
    // Cleanup animation on unmount
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
  
  return (
    <div className="earth-container">
      <div
        style={{
          width: size,
          height: size,
          position: 'relative',
          margin: '0 auto',
          borderRadius: '50%',
          overflow: 'hidden',
          boxShadow: '0 0 40px rgba(0, 119, 255, 0.8)'
        }}
      >
        {/* Space background with stars for depth */}
        <div
          style={{
            position: 'absolute',
            top: -5,
            left: -5,
            width: 'calc(100% + 10px)',
            height: 'calc(100% + 10px)',
            borderRadius: '50%',
            background: 'radial-gradient(circle at center, #000510 0%, #000000 100%)',
            zIndex: 0
          }}
        />
        
        {/* Create small star points */}
        <div
          style={{
            position: 'absolute',
            top: -5,
            left: -5,
            width: 'calc(100% + 10px)',
            height: 'calc(100% + 10px)',
            borderRadius: '50%',
            background: 'radial-gradient(white, rgba(255,255,255,0) 2px) 0 0 / 20px 20px space',
            opacity: 0.3,
            zIndex: 0
          }}
        />
        
        {/* Shadow overlay for 3D effect */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15), rgba(0,0,0,0.6))',
            pointerEvents: 'none',
            zIndex: 3
          }}
        />
        
        {/* Static Earth image */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundImage: 'url("https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/The_Blue_Marble_%28remastered%29.jpg/1200px-The_Blue_Marble_%28remastered%29.jpg")',
            transform: `rotate(${rotation}deg)`,
            zIndex: 1
          }}
        />
        
        {/* Cloud layer with independent movement */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            backgroundSize: '200% 200%',
            backgroundPosition: 'center',
            backgroundImage: 'url("https://www.solarsystemscope.com/textures/download/8k_earth_clouds.jpg")',
            opacity: 0.35,
            transform: `rotate(${rotation * 0.7}deg)`,
            zIndex: 2
          }}
        />
        
        {/* Atmospheric glow outer */}
        <div
          style={{
            position: 'absolute',
            top: -20,
            left: -20,
            width: 'calc(100% + 40px)',
            height: 'calc(100% + 40px)',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,119,255,0) 60%, rgba(0,119,255,0.2) 100%)',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />
        
        {/* Atmospheric blue haze */}
        <div
          style={{
            position: 'absolute',
            top: -5,
            left: -5,
            width: 'calc(100% + 10px)',
            height: 'calc(100% + 10px)',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,119,255,0) 75%, rgba(0,119,255,0.4) 100%)',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />
      </div>
    </div>
  );
}