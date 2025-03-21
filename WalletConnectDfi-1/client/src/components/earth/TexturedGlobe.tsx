import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface TexturedGlobeProps {
  size?: number;
  rotationSpeed?: number;
}

export function TexturedGlobe({ 
  size = 400,
  rotationSpeed = 0.0005
}: TexturedGlobeProps) {
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
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);
    
    // Earth geometry
    const earthGeometry = new THREE.SphereGeometry(1, 64, 64);

    // Initial simple material 
    const earthMaterial = new THREE.MeshPhongMaterial({
      color: 0x2244aa,      // Blue base color
      shininess: 15,
      specular: 0x333333
    });
    
    // Create Earth mesh
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);
    
    // Create atmosphere glow
    const glowGeometry = new THREE.SphereGeometry(1.02, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x0077ff,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide
    });
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glowMesh);

    // Set up texture loader
    const textureLoader = new THREE.TextureLoader();
    
    // Try multiple paths to find the Earth texture
    const texturePaths = [
      '/earth/earth-nasa-fixed.jpg',
      'earth-nasa.jpg',
      '/earth-nasa.jpg',
      '/earth-texture.jpg',
      '/public/earth/earth-nasa-fixed.jpg'
    ];
    
    let textureLoaded = false;
    
    // Try each path until one works
    for (let i = 0; i < texturePaths.length; i++) {
      const path = texturePaths[i];
      console.log(`Trying to load Earth texture from: ${path}`);
      
      // Use immediate texture loading without callbacks (simplifies the code)
      try {
        const texture = textureLoader.load(path, 
          // Success callback
          (loadedTexture) => {
            console.log(`Successfully loaded Earth texture from ${path}`);
            earthMaterial.map = loadedTexture;
            earthMaterial.needsUpdate = true;
            textureLoaded = true;
            
            // Now try to load the bump map
            try {
              const bumpTexture = textureLoader.load(
                '/earth/earthbump.jpg',
                (loadedBump) => {
                  console.log('Successfully loaded bump map');
                  earthMaterial.bumpMap = loadedBump;
                  earthMaterial.bumpScale = 0.05;
                  earthMaterial.needsUpdate = true;
                }
              );
            } catch (e) {
              console.log('Failed to load bump map, continuing without it');
            }
          },
          // Progress callback - no need to implement
          undefined,
          // Error callback for this specific texture
          () => {
            console.log(`Failed to load texture from ${path}, will try next path if available`);
          }
        );
        
        // If we get here without an error, break the loop
        if (textureLoaded) break;
        
      } catch (err) {
        console.log(`Error attempting to load ${path}: ${err}`);
        // Continue to the next texture path
      }
    }
    
    // If no textures loaded, ensure we have our blue fallback
    if (!textureLoaded) {
      console.log('No textures loaded, using blue fallback');
      earthMaterial.color = new THREE.Color(0x2244aa);
    }
    
    // Animation loop
    const animate = () => {
      earth.rotation.y += rotationSpeed;
      glowMesh.rotation.y += rotationSpeed * 0.8;
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
      glowGeometry.dispose();
      
      if (earthMaterial.map) earthMaterial.map.dispose();
      if (earthMaterial.bumpMap) earthMaterial.bumpMap.dispose();
      if (earthMaterial.specularMap) earthMaterial.specularMap.dispose();
      
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
          boxShadow: '0 0 30px rgba(0, 119, 255, 0.6)'
        }}
      />
    </div>
  );
}