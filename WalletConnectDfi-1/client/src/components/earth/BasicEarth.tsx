import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface BasicEarthProps {
  size?: number;
  rotationSpeed?: number;
}

export function BasicEarth({ 
  size = 400,
  rotationSpeed = 0.0003
}: BasicEarthProps) {
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
    
    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);
    
    // Create Earth
    const earthGeometry = new THREE.SphereGeometry(1, 32, 32);
    
    // Blue material for a simple Earth representation
    const earthMaterial = new THREE.MeshPhongMaterial({
      color: 0x0077be,           // Blue color
      shininess: 25,
      specular: new THREE.Color(0x333333),
    });
    
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);
    
    // Add blue atmosphere glow
    const glowGeometry = new THREE.SphereGeometry(1.06, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x0077ff,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide
    });
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glowMesh);
    
    // Animation loop
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
      earthMaterial.dispose();
      glowGeometry.dispose();
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
          boxShadow: '0 0 30px rgba(0, 119, 255, 0.6)'
        }}
      />
    </div>
  );
}