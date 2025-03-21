import { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore - Import OrbitControls even if TypeScript can't find type definitions
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface SimpleEarthGlobeProps {
  size?: number;
  rotationSpeed?: number;
  autoRotate?: boolean;
}

export function SimpleEarthGlobe({
  size = 300,
  rotationSpeed = 0.001,
  autoRotate = true,
}: SimpleEarthGlobeProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Create scene
    const scene = new THREE.Scene();
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 2000);
    camera.position.z = 6;
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    // Add directional light (sun)
    const sunLight = new THREE.DirectionalLight(0xffffff, 1);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);
    
    // Earth geometry
    const earthGeometry = new THREE.SphereGeometry(2, 64, 64);
    
    // Create texture loader
    const textureLoader = new THREE.TextureLoader();
    
    // Initial basic material
    const basicMaterial = new THREE.MeshPhongMaterial({
      color: 0x2233ff,
      shininess: 10,
    });
    
    // Create Earth with initial material
    const earthMesh = new THREE.Mesh(earthGeometry, basicMaterial);
    scene.add(earthMesh);
    
    // Use the direct URL for the Earth texture
    const earthTextureUrl = 'https://guessthelocation.net/wp-content/uploads/2022/10/world-in-geographic-projection-true-colour-satellite-image-99151124-58b9cc3e5f9b58af5ca7578d-scaled.jpg';
    
    console.log("Loading Earth texture from URL:", earthTextureUrl);
    
    // Load the texture
    textureLoader.load(
      earthTextureUrl,
      (texture) => {
        console.log("Earth texture loaded successfully!");
        
        // Create material with the loaded texture
        const earthMaterial = new THREE.MeshPhongMaterial({
          map: texture,
          specular: new THREE.Color(0x333333),
          shininess: 10,
        });
        
        // Update the Earth material
        earthMesh.material = earthMaterial;
      },
      undefined,
      (error) => {
        console.error("Error loading Earth texture:", error);
      }
    );
    
    // Set up controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.rotateSpeed = 0.25;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 0.5;
    
    // Animation function
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Manual rotation in addition to OrbitControls
      earthMesh.rotation.y += rotationSpeed;
      
      controls.update();
      renderer.render(scene, camera);
    };
    
    // Start animation
    animate();
    
    // Cleanup function
    return () => {
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      // Dispose resources
      earthGeometry.dispose();
      if (Array.isArray(earthMesh.material)) {
        earthMesh.material.forEach(material => material.dispose());
      } else {
        earthMesh.material.dispose();
      }
      renderer.dispose();
    };
  }, [size, rotationSpeed, autoRotate]);

  return (
    <div 
      ref={mountRef} 
      style={{ 
        width: size, 
        height: size, 
        margin: '0 auto',
        borderRadius: '50%',
        overflow: 'hidden'
      }}
    />
  );
}