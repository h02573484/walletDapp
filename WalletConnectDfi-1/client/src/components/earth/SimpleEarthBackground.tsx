import React from 'react';

interface SimpleEarthBackgroundProps {
  imagePath?: string;
  opacity?: number;
  className?: string;
}

export function SimpleEarthBackground({ 
  imagePath = '/earth/earth-nasa-fixed.jpg',
  opacity = 0.2,
  className = ''
}: SimpleEarthBackgroundProps) {
  // Use a simple div with background-image for reliability
  return (
    <div 
      className={`fixed inset-0 z-0 ${className}`}
      style={{
        backgroundImage: `url(${imagePath})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        opacity
      }}
      aria-hidden="true"
    />
  );
}