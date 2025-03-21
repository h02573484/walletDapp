import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface NasaEarthProps {
  size?: number;
  rotationSpeed?: number;
}

export function NasaEarth({ 
  size = 400,
  rotationSpeed = 0.0003 // Slow rotation for realism
}: NasaEarthProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Create a scene with black background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    // Setup camera
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    camera.position.z = 2.5;
    
    // Setup renderer with high quality settings
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    
    // Add ambient lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    
    // Add directional light to simulate sunlight
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);
    
    // Create Earth geometry
    const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
    
    // Create Earth material with optimized lighting properties
    const earthMaterial = new THREE.MeshPhongMaterial({
      shininess: 15,                 // Lower shininess for a more matte look
      specular: new THREE.Color(0x333333), // Subtle specular highlights
      color: new THREE.Color(0xffffff),    // White base to preserve texture colors
    });
    
    // Create Earth mesh
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);
    
    // Start with a blue color as fallback
    earthMaterial.color = new THREE.Color(0x1a4d7c);
    
    // Direct texture loading using THREE.TextureLoader
    const textureLoader = new THREE.TextureLoader();
    
    // Set up texture URLs in order of preference
    const textureUrls = [
      'earth-nasa.jpg',
      'earth-texture.jpg',
      'earth/earth-nasa-fixed.jpg'
    ];
    
    // Try to load textures directly with THREE.js
    function tryLoadTexture(index = 0) {
      if (index >= textureUrls.length) {
        console.log("All texture loading attempts failed, using blue fallback");
        return;
      }
      
      const url = textureUrls[index];
      console.log(`Loading texture from ${url}`);
      
      textureLoader.load(
        url,
        (texture) => {
          console.log(`Successfully loaded texture from ${url}`);
          earthMaterial.map = texture;
          earthMaterial.needsUpdate = true;
        },
        undefined,
        (error) => {
          console.log(`Failed to load texture from ${url}, trying next (${error.message})`);
          tryLoadTexture(index + 1);
        }
      );
    }
    
    // Start loading textures
    tryLoadTexture();
    
    // Add simple atmosphere glow
    const glowGeometry = new THREE.SphereGeometry(1.06, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x0077ff,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide
    });
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glowMesh);
    
    // Animation function
    const animate = () => {
      earth.rotation.y += rotationSpeed;
      renderer.render(scene, camera);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation
    animate();
    
    // Cleanup on unmount
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      if (mountRef.current && mountRef.current.firstChild) {
        mountRef.current.removeChild(mountRef.current.firstChild);
      }
      
      // Dispose resources
      earthGeometry.dispose();
      glowGeometry.dispose();
      
      if (earthMaterial.map) earthMaterial.map.dispose();
      earthMaterial.dispose();
      glowMaterial.dispose();
      
      renderer.dispose();
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
          position: 'relative',
          boxShadow: '0 0 30px rgba(0, 119, 255, 0.6)' // Blue glow around Earth
        }}
      />
    </div>
  );
}