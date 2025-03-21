import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface SimpleEarthProps {
  size?: number;
  rotationSpeed?: number;
}

export function SimpleEarth({ 
  size = 400,
  rotationSpeed = 0.0005
}: SimpleEarthProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    camera.position.z = 2.5;
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);
    
    // Earth geometry with higher detail
    const earthGeometry = new THREE.SphereGeometry(1, 64, 64);

    // Create visually attractive Earth material
    const earthMaterial = new THREE.MeshPhongMaterial({
      color: 0x1a4d7c,        // Earth blue
      shininess: 25,
      specular: 0x555555,
      emissive: 0x112244,      // Blue glow
      emissiveIntensity: 0.15
    });
    
    // Create Earth mesh
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);
    
    // Create clouds layer
    const cloudGeometry = new THREE.SphereGeometry(1.02, 32, 32);
    const cloudMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.15,
      shininess: 5
    });
    
    const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
    scene.add(cloudMesh);
    
    // Create atmosphere glow
    const glowGeometry = new THREE.SphereGeometry(1.10, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x0077ff,
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide
    });
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glowMesh);
    
    // Add continent features with a custom shader material
    const continentGeometry = new THREE.SphereGeometry(1.001, 64, 64);
    
    // Random continent-like pattern to simulate Earth landmasses
    const continentMaterial = new THREE.MeshBasicMaterial({
      color: 0x227744,  // Green landmass
      transparent: true,
      opacity: 0.5,
      wireframe: false,
    });
    
    // Create landmass mesh
    const continentMesh = new THREE.Mesh(continentGeometry, continentMaterial);
    
    // Add random patterns to create continent-like features
    const vertexCount = continentGeometry.attributes.position.count;
    const continentOpacity = new Float32Array(vertexCount);
    
    for (let i = 0; i < vertexCount; i++) {
      // Create random opacity values to form continent-like patterns
      // 0 = ocean, 1 = landmass
      const value = Math.random();
      continentOpacity[i] = value > 0.7 ? 1.0 : 0.0;
    }
    
    // Add the new attribute to the geometry
    continentGeometry.setAttribute('opacity', new THREE.BufferAttribute(continentOpacity, 1));
    
    // Add the continents to the scene
    scene.add(continentMesh);
    
    // Animation loop
    const animate = () => {
      earth.rotation.y += rotationSpeed;
      continentMesh.rotation.y += rotationSpeed; // Rotate continents with Earth
      cloudMesh.rotation.y += rotationSpeed * 0.6;
      glowMesh.rotation.y += rotationSpeed * 0.1;
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
      
      // Dispose resources
      earthGeometry.dispose();
      cloudGeometry.dispose();
      glowGeometry.dispose();
      
      earthMaterial.dispose();
      cloudMaterial.dispose();
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