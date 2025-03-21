import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface ReliableEarthProps {
  size?: number;
  rotationSpeed?: number;
}

export function ReliableEarth({ 
  size = 400,
  rotationSpeed = 0.002
}: ReliableEarthProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [textureLoaded, setTextureLoaded] = useState(false);
  const [textureError, setTextureError] = useState<string | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Setup scene
    const scene = new THREE.Scene();
    
    // Setup camera
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    camera.position.z = 3;
    
    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    
    // Add ambient lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    // Add directional light to simulate sunlight
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Create Earth geometry
    const earthGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    
    // Create initial blue material - this will be visible during loading
    const earthMaterial = new THREE.MeshPhongMaterial({
      color: 0x1a4d7c,  // Ocean blue
      shininess: 25
    });
    
    // Create Earth mesh
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);
    
    // Animation function
    const animate = () => {
      requestAnimationFrame(animate);
      earth.rotation.y += rotationSpeed;
      renderer.render(scene, camera);
    };
    
    // Start animation
    animate();

    // Try all available texture options until one works
    const loadTexture = () => {
      const texturePaths = [
        '/earth/earth.jpg',
        '/earth-texture.jpg',
        '/earth/earth-nasa-fixed.jpg',
        '/public/earth/earth.jpg',
        '/earth/envisat-mosaic.jpg'
      ];
      
      // Try loading each texture in sequence with a delay between attempts
      const tryTexture = (index = 0) => {
        if (index >= texturePaths.length) {
          console.warn('All texture loading attempts failed');
          setTextureError('Unable to load Earth texture');
          return;
        }
        
        const texturePath = texturePaths[index];
        console.log(`Attempting to load Earth texture from ${texturePath}`);
        
        // Create an image element for this texture attempt
        const img = new Image();
        
        img.onload = () => {
          console.log(`Successfully loaded texture from ${texturePath}`);
          
          // Create a texture from the loaded image
          const texture = new THREE.Texture(img);
          texture.needsUpdate = true;
          
          // Apply the texture to the Earth material
          earthMaterial.map = texture;
          earthMaterial.needsUpdate = true;
          
          setTextureLoaded(true);
          setTextureError(null);
        };
        
        img.onerror = () => {
          console.warn(`Failed to load texture from ${texturePath}, trying next option`);
          // Try the next texture after a short delay
          setTimeout(() => tryTexture(index + 1), 100);
        };
        
        // Set cross-origin to anonymous to avoid CORS issues
        img.crossOrigin = "anonymous";
        
        // Add cache-busting query parameter
        const cacheBuster = Date.now();
        img.src = `${texturePath}?t=${cacheBuster}`;
      };
      
      // Start the texture loading process
      tryTexture();
    };
    
    // Load the texture
    loadTexture();
    
    // Cleanup on unmount
    return () => {
      // Dispose Three.js resources
      earthGeometry.dispose();
      earthMaterial.dispose();
      renderer.dispose();
      
      // Remove the canvas from the DOM
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [size, rotationSpeed]);
  
  return (
    <div className="earth-container">
      <div
        ref={mountRef}
        style={{
          width: size,
          height: size,
          margin: '0 auto',
          borderRadius: '50%',
          overflow: 'hidden',
          position: 'relative'
        }}
      />
      {textureError && (
        <div 
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'rgba(255,255,255,0.8)',
            fontSize: '12px',
            textAlign: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
            padding: '4px 8px',
            borderRadius: '4px',
            display: 'none' // Hide error by default, but the code is here if needed
          }}
        >
          {textureError}
        </div>
      )}
    </div>
  );
}