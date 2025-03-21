import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface StylizedEarthProps {
  size?: number;
  rotationSpeed?: number;
}

export function StylizedEarth({ 
  size = 400,
  rotationSpeed = 0.01 // Medium rotation speed
}: StylizedEarthProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Create a scene with black background
    const scene = new THREE.Scene();
    
    // Create texture loader
    const textureLoader = new THREE.TextureLoader();
    
    // Set background color as fallback
    scene.background = new THREE.Color(0x000000);
    
    // Load starfield background with retry (ensuring we use all available options)
    const bgOptions = [
      '/starfield.jpg', 
      '/stars-background.jpg', 
      '/stars-bg.jpg',
      '/stars-bg.png',
      '/space-bg.jpg'
    ];
    let bgIndex = 0;
    
    function tryLoadBackground() {
      if (bgIndex >= bgOptions.length) {
        console.warn('Could not load any background textures');
        return;
      }
      
      const bgPath = bgOptions[bgIndex];
      textureLoader.load(
        bgPath, 
        (texture) => {
          console.log(`Background texture loaded successfully from ${bgPath}`);
          scene.background = texture;
        },
        undefined,
        (err) => {
          console.warn(`Failed to load background from ${bgPath}, trying next...`);
          bgIndex++;
          tryLoadBackground();
        }
      );
    }
    
    tryLoadBackground();
    
    // Setup camera
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    camera.position.z = 3;
    
    // Setup renderer with high quality settings
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    
    // Add ambient lighting for overall illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    // Add directional light to simulate sunlight
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Create Earth geometry with high resolution for smooth appearance
    const earthGeometry = new THREE.SphereGeometry(1.3, 64, 64);
    
    // Create Earth material first
    const earthMaterial = new THREE.MeshPhongMaterial({
      specular: new THREE.Color(0x333333),
      shininess: 25,
      bumpScale: 0.05,
    });
    
    // Define texture paths with multiple backup options
    // Using full paths to make sure textures are found
    const textureOptions = [
      '/earth/earth-nasa-fixed.jpg',
      '/earth-nasa.jpg',
      '/earth-texture.jpg'
    ];
    
    const bumpMapOptions = [
      '/earth/earthbump.jpg', 
      '/textures/earth_bumpmap.jpg'
    ];
    
    const specularMapOptions = [
      '/earth/earthspecular.jpg',
      '/textures/earth_specular.jpg'
    ];
    
    const cloudOptions = [
      '/clouds.jpg',
      '/cloud-texture.jpg',
      '/earth/earthclouds.jpg'
    ];
    
    // Function to load texture with fallbacks
    function loadTextureWithFallbacks(
      options: string[], 
      onSuccess: (texture: THREE.Texture) => void, 
      textureType: string = "texture"
    ) {
      let currentIndex = 0;
      
      function tryNextTexture() {
        if (currentIndex >= options.length) {
          console.error(`Failed to load any ${textureType} after trying all options`);
          return;
        }
        
        const path = options[currentIndex];
        console.log(`Attempting to load ${textureType} from ${path}`);
        
        textureLoader.load(
          path,
          (texture) => {
            console.log(`Successfully loaded ${textureType} from ${path}`);
            if (texture) {
              texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
              onSuccess(texture);
            }
          },
          undefined,
          (err) => {
            console.log(`Failed to load ${textureType} from ${path}, trying next option`);
            currentIndex++;
            tryNextTexture();
          }
        );
      }
      
      tryNextTexture();
    }
    
    // Load main Earth texture
    loadTextureWithFallbacks(
      textureOptions, 
      (texture) => {
        earthMaterial.map = texture;
        earthMaterial.needsUpdate = true;
      },
      "Earth texture"
    );
    
    // Load bump map
    loadTextureWithFallbacks(
      bumpMapOptions,
      (texture) => {
        earthMaterial.bumpMap = texture;
        earthMaterial.needsUpdate = true;
      },
      "Earth bump map"
    );
    
    // Load specular map
    loadTextureWithFallbacks(
      specularMapOptions,
      (texture) => {
        earthMaterial.specularMap = texture;
        earthMaterial.needsUpdate = true;
      },
      "Earth specular map"
    );
    
    // Create Earth mesh
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);
    
    // Add clouds with reliable loading
    const cloudGeometry = new THREE.SphereGeometry(1.32, 64, 64);
    const cloudMaterial = new THREE.MeshPhongMaterial({
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });
    
    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    scene.add(clouds);
    
    // Load cloud texture with fallbacks
    loadTextureWithFallbacks(
      cloudOptions,
      (texture) => {
        cloudMaterial.map = texture;
        cloudMaterial.needsUpdate = true;
      },
      "cloud texture"
    );
    
    // Add atmospheric glow
    const glowGeometry = new THREE.SphereGeometry(1.4, 64, 64);
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
      clouds.rotation.y += rotationSpeed * 1.1; // Clouds rotate slightly faster
      renderer.render(scene, camera);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation
    animate();
    
    // Cleanup on unmount
    return () => {
      // Cancel animation frame
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      // Remove the canvas from the DOM
      if (mountRef.current && mountRef.current.firstChild) {
        mountRef.current.removeChild(mountRef.current.firstChild);
      }
      
      // Dispose of Three.js resources
      earthGeometry.dispose();
      cloudGeometry.dispose();
      glowGeometry.dispose();
      
      // Dispose of materials and their textures
      if (earthMaterial) {
        if (earthMaterial.map) earthMaterial.map.dispose();
        if (earthMaterial.bumpMap) earthMaterial.bumpMap.dispose();
        if (earthMaterial.specularMap) earthMaterial.specularMap.dispose();
        earthMaterial.dispose();
      }
      
      if (cloudMaterial) {
        if (cloudMaterial.map) cloudMaterial.map.dispose();
        cloudMaterial.dispose();
      }
      
      if (glowMaterial) {
        glowMaterial.dispose();
      }
      
      // Scene background may be a texture, dispose if so
      if (scene.background instanceof THREE.Texture) {
        scene.background.dispose();
      }
      
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