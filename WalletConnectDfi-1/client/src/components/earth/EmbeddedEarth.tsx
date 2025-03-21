import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface EmbeddedEarthProps {
  size?: number;
}

export function EmbeddedEarth({ size = 400 }: EmbeddedEarthProps) {
  const mountRef = useRef<HTMLDivElement>(null);

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
    mountRef.current.appendChild(renderer.domElement);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Create a temporary blue sphere while we load the texture
    const geometry = new THREE.SphereGeometry(1.5, 32, 32);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0x0066ff
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Add controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.rotateSpeed = 0.25;
    controls.enableZoom = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Create a completely new sphere with the earth texture
    setTimeout(() => {
      try {
        // Create a texture using Image object
        const img = new Image();
        img.onload = () => {
          const texture = new THREE.Texture(img);
          texture.needsUpdate = true;
          
          // Remove the temporary sphere
          scene.remove(sphere);
          
          // Create a new sphere with the loaded texture
          const earthMaterial = new THREE.MeshPhongMaterial({
            map: texture,
            shininess: 10
          });
          
          const earth = new THREE.Mesh(geometry, earthMaterial);
          scene.add(earth);
          
          console.log("Earth texture applied successfully");
        };
        
        // Set the image source to a direct URL
        img.src = '/earth/earth.jpg';
      } catch (e) {
        console.error("Error creating texture:", e);
      }
    }, 500);

    // Cleanup
    return () => {
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [size]);

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