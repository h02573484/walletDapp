import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface EarthBackgroundProps {
  opacity?: number;
  rotation?: boolean;
  rotationSpeed?: number;
  className?: string;
}

export function EarthBackground({
  opacity = 0.2,
  rotation = true,
  rotationSpeed = 0.0005,
  className = ''
}: EarthBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();
  const earthRef = useRef<THREE.Mesh>();
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const [loadError, setLoadError] = useState<string | null>(null);
  const [textureLoaded, setTextureLoaded] = useState(false);

  // Fallback to 2D image if 3D texture loading fails
  const useImageFallback = loadError && !textureLoaded;

  useEffect(() => {
    if (!containerRef.current) return;

    // Setup scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Setup camera
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // Transparent background
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create Earth geometry
    const geometry = new THREE.SphereGeometry(2, 64, 64);
    const textureLoader = new THREE.TextureLoader();

    const material = new THREE.MeshPhongMaterial({
      specular: new THREE.Color(0x333333),
      shininess: 15,
    });

    // Create Earth mesh
    const earth = new THREE.Mesh(geometry, material);
    scene.add(earth);
    earthRef.current = earth;

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Add directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    // Load Earth texture with fallback options - direct texture loading approach
    try {
      // Direct approach loading the texture
      textureLoader.loadAsync('/earth/earth-nasa-fixed.jpg')
        .then(texture => {
          console.log("Successfully loaded Earth texture from /earth/earth-nasa-fixed.jpg");
          if (material && earthRef.current) {
            material.map = texture;
            material.needsUpdate = true;
            setTextureLoaded(true);
          }
        })
        .catch(error => {
          console.warn("Failed to load main texture, trying alternate path", error);
          
          // Try alternate path
          return textureLoader.loadAsync('/earth/earth.jpg');
        })
        .then(texture => {
          if (!textureLoaded && texture) {
            console.log("Loaded fallback texture");
            if (material && earthRef.current) {
              material.map = texture;
              material.needsUpdate = true;
              setTextureLoaded(true);
            }
          }
        })
        .catch(error => {
          console.error("Failed to load any Earth textures", error);
          setLoadError("Failed to load Earth textures");
        });
    } catch (err) {
      console.error("Exception during texture loading", err);
      setLoadError("Exception loading textures");
    }

    // Handle window resize
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    // Animation loop
    const animate = () => {
      if (earthRef.current && rotation) {
        earthRef.current.rotation.y += rotationSpeed;
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      
      if (rendererRef.current && rendererRef.current.domElement && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      
      window.removeEventListener('resize', handleResize);
      
      // Dispose of materials
      if (earthRef.current && earthRef.current.material) {
        if (Array.isArray(earthRef.current.material)) {
          earthRef.current.material.forEach(m => m.dispose());
        } else {
          earthRef.current.material.dispose();
        }
      }
      
      // Dispose of geometries
      if (earthRef.current && earthRef.current.geometry) {
        earthRef.current.geometry.dispose();
      }
      
      // Dispose of renderer
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [opacity, rotation, rotationSpeed, textureLoaded]);

  // Render the 3D container or fallback image
  return useImageFallback ? (
    // 2D Image Fallback
    <div className={`fixed inset-0 z-0 overflow-hidden ${className}`} style={{ opacity }}>
      <img 
        src="/earth/earth-nasa-fixed.jpg" 
        alt="Earth Background" 
        className="w-full h-full object-cover" 
        onError={(e) => {
          e.currentTarget.src = "/earth/earth.jpg";
        }}
      />
    </div>
  ) : (
    // 3D Container
    <div 
      ref={containerRef} 
      className={`fixed inset-0 z-0 overflow-hidden ${className}`}
      style={{ opacity }}
    />
  );
}