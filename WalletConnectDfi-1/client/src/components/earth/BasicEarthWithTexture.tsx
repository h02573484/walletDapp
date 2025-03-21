import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface BasicEarthWithTextureProps {
  size?: number;
  rotationSpeed?: number;
}

export function BasicEarthWithTexture({ 
  size = 400,
  rotationSpeed = 0.005
}: BasicEarthWithTextureProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene, camera and renderer setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    camera.position.z = 3;
    
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true // transparent background
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(1, 0, 1).normalize();
    scene.add(directionalLight);
    
    // Create Earth
    const earthGeometry = new THREE.SphereGeometry(1.3, 64, 64);
    
    // Basic material until texture loads
    const earthMaterial = new THREE.MeshPhongMaterial({
      color: 0x2233ff, // blue temporary color
      shininess: 15
    });
    
    // Create Earth mesh
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);
    
    // Load NASA Earth texture from direct path
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      '/earth/earth-nasa-fixed.jpg',
      (texture) => {
        console.log('Successfully loaded NASA Earth texture');
        // Apply anisotropic filtering for better quality
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        // Update the material with the loaded texture
        earthMaterial.map = texture;
        earthMaterial.color.set(0xffffff); // reset to white to show texture properly
        earthMaterial.needsUpdate = true;
      },
      (xhr) => {
        console.log(`${xhr.loaded / xhr.total * 100}% loaded`);
      },
      (error) => {
        console.error('Error loading NASA Earth texture:', error);
      }
    );
    
    // Animation
    const animate = () => {
      earth.rotation.y += rotationSpeed;
      renderer.render(scene, camera);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      if (mountRef.current && mountRef.current.firstChild) {
        mountRef.current.removeChild(mountRef.current.firstChild);
      }
      
      earthGeometry.dispose();
      if (earthMaterial.map) earthMaterial.map.dispose();
      earthMaterial.dispose();
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
          position: 'relative',
          borderRadius: '50%',
          overflow: 'hidden',
          boxShadow: '0 0 30px rgba(0, 119, 255, 0.6)'
        }}
      />
    </div>
  );
}