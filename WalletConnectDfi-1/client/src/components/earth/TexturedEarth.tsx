import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface TexturedEarthProps {
  size?: number;
  rotationSpeed?: number;
  autoRotate?: boolean;
}

export function TexturedEarth({ 
  size = 400, 
  rotationSpeed = 0.0003, 
  autoRotate = true 
}: TexturedEarthProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Track loaded state for debugging
    let earthTextureLoaded = false;
    let cloudsTextureLoaded = false;
    let bumpTextureLoaded = false;
    let specularTextureLoaded = false;

    // Create scene
    const scene = new THREE.Scene();
    
    // Create camera with good viewing angle
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.z = 4;
    
    // Create renderer with antialias for smoother edges
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Add ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    // Add directional light to simulate sunlight
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);

    // Create Earth
    const earthGeometry = new THREE.SphereGeometry(1.5, 64, 64);
    
    // Create Earth material with texture maps
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: null,  // Color map
      bumpMap: null,  // Terrain height
      bumpScale: 0.05,
      specularMap: null,  // Shininess
      specular: new THREE.Color(0x333333),
      shininess: 15
    });
    
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    // Create clouds layer
    const cloudsGeometry = new THREE.SphereGeometry(1.53, 64, 64);
    const cloudsMaterial = new THREE.MeshPhongMaterial({
      map: null,
      transparent: true,
      opacity: 0.4
    });
    
    const clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
    scene.add(clouds);

    // Create atmosphere glow
    const atmosphereGeometry = new THREE.SphereGeometry(1.6, 64, 64);
    const atmosphereMaterial = new THREE.MeshPhongMaterial({
      color: new THREE.Color(0x93b8ff),
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.15
    });
    
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);

    // Create texture loader with logging
    const textureLoader = new THREE.TextureLoader();
    textureLoader.crossOrigin = 'anonymous';

    // Function to attempt loading multiple textures with fallbacks
    const loadTextureWithFallbacks = (urls: string[], onLoad: (texture: THREE.Texture) => void) => {
      const tryNextTexture = (index: number) => {
        if (index >= urls.length) {
          setError(`Failed to load texture after trying all options: ${urls.join(', ')}`);
          return;
        }

        console.log(`Loading Earth texture: ${urls[index]}`);
        
        textureLoader.load(
          urls[index],
          (texture) => {
            console.log(`Successfully loaded texture: ${urls[index]}`);
            texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
            onLoad(texture);
          },
          undefined,
          () => {
            console.log(`Failed to load texture: ${urls[index]}, trying next option`);
            tryNextTexture(index + 1);
          }
        );
      };

      tryNextTexture(0);
    };

    // Load Earth textures - using the NASA Earth texture for best realism
    loadTextureWithFallbacks(
      ['/earth/nasa_earth.jpg', '/earth/earth-nasa-fixed.jpg', '/earth/earth.jpg', '/earth-nasa.jpg'],
      (texture) => {
        earthTextureLoaded = true;
        earthMaterial.map = texture;
        earthMaterial.needsUpdate = true;
        checkLoading();
      }
    );

    // Load bump map for terrain relief
    loadTextureWithFallbacks(
      ['/earth/earthbump.jpg', '/textures/earth_bumpmap.jpg'],
      (texture) => {
        bumpTextureLoaded = true;
        earthMaterial.bumpMap = texture;
        earthMaterial.needsUpdate = true;
        checkLoading();
      }
    );

    // Load specular map for ocean shininess
    loadTextureWithFallbacks(
      ['/earth/earthspecular.jpg', '/textures/earth_specular.jpg'],
      (texture) => {
        specularTextureLoaded = true;
        earthMaterial.specularMap = texture;
        earthMaterial.needsUpdate = true;
        checkLoading();
      }
    );

    // Load clouds texture
    loadTextureWithFallbacks(
      ['/earth/earthclouds.jpg', '/textures/earth_clouds.jpg', '/clouds.jpg'],
      (texture) => {
        cloudsTextureLoaded = true;
        cloudsMaterial.map = texture;
        cloudsMaterial.needsUpdate = true;
        checkLoading();
      }
    );

    // Function to check if at least the essential textures are loaded
    const checkLoading = () => {
      // We only need the Earth color map as the minimum requirement
      if (earthTextureLoaded) {
        setIsLoading(false);
      }
    };

    // Set up camera controls
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
      const animationId = requestAnimationFrame(animate);
      
      // Manual rotation if autoRotate is disabled
      if (!autoRotate) {
        earth.rotation.y += rotationSpeed;
        clouds.rotation.y += rotationSpeed * 1.1; // Clouds move slightly faster
      }
      
      controls.update();
      renderer.render(scene, camera);
      
      return animationId;
    };

    // Start animation
    const animationId = animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      // Dispose geometries
      earthGeometry.dispose();
      cloudsGeometry.dispose();
      atmosphereGeometry.dispose();
      
      // Dispose materials
      earthMaterial.dispose();
      cloudsMaterial.dispose();
      atmosphereMaterial.dispose();
      
      renderer.dispose();
    };
  }, [size, rotationSpeed, autoRotate]);

  return (
    <div className="relative">
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
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
          <div className="text-white">Loading Earth...</div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
          <div className="text-red-500 text-center p-4 text-sm">
            {error}
          </div>
        </div>
      )}
    </div>
  );
}