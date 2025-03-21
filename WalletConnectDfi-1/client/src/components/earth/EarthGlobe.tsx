import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Define props interface
interface EarthGlobeProps {
  size?: number;
  rotationSpeed?: number;
  autoRotate?: boolean;
  displayAtmosphere?: boolean;
  displayClouds?: boolean;
}

export function EarthGlobe({
  size = 800,
  rotationSpeed = 0.001,
  autoRotate = true,
  displayAtmosphere = true,
  displayClouds = true
}: EarthGlobeProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    if (!mountRef.current) return;
    
    // Set up scene, camera, and renderer
    const scene = new THREE.Scene();
    
    // Enhanced lighting for better texture visibility
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);
    
    // Main light source (sunlight simulation)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(5, 0, 5);
    scene.add(directionalLight);
    
    // Secondary fill light for better visibility
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
    directionalLight2.position.set(-5, 0, -5);
    scene.add(directionalLight2);
    
    // Additional light from bottom to improve overall visibility
    const bottomLight = new THREE.DirectionalLight(0xffffff, 0.2);
    bottomLight.position.set(0, -5, 0);
    scene.add(bottomLight);
    
    // Camera setup optimized for component use
    const aspectRatio = size / size;
    const camera = new THREE.PerspectiveCamera(45, aspectRatio, 0.1, 1000);
    camera.position.z = 4;
    
    // Renderer setup with alpha for transparency
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      logarithmicDepthBuffer: true
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Add to DOM
    mountRef.current.appendChild(renderer.domElement);
    
    // Create the Earth sphere
    const earthGeometry = new THREE.SphereGeometry(2, 64, 64);
    
    // Set cross-origin settings for texture loader
    THREE.TextureLoader.prototype.crossOrigin = 'anonymous';
    const textureLoader = new THREE.TextureLoader();
    
    // Create a more realistic fallback material with Earth-like coloring
    const fallbackMaterial = new THREE.MeshPhongMaterial({
      color: new THREE.Color(0x2233aa), // Deep blue for oceans
      shininess: 15,
      emissive: new THREE.Color(0x112244), // Slight glow
      emissiveIntensity: 0.1,
      specular: new THREE.Color(0x333333), // Low specularity for more realism
    });
    
    // Use Envisat mosaic image as Earth texture (from root public directory)
    const textureUrl = '/envisat-mosaic.jpg';  // ESA Envisat mosaic image at root level
    console.log("Attempting to load Envisat Earth texture from root:", textureUrl);
    
    // Reference to store the clouds mesh if created later
    let cloudsMesh: THREE.Mesh | null = null;
    let earthMesh: THREE.Mesh | null = null;
    
    // Animation loop and related variables
    let animationFrameId: number;
    let controls: OrbitControls;
    
    const setupAnimationLoop = (earth: THREE.Mesh) => {
      // The primary animate function
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        
        // Smooth rotation of earth
        earth.rotation.y += rotationSpeed;
        
        // Handle cloud rotation if clouds exist
        if (cloudsMesh) {
          cloudsMesh.rotation.y += rotationSpeed * 0.75;
        }
        
        controls.update();
        renderer.render(scene, camera);
      };
      
      // Start animation
      animate();
    };
    
    // Create Earth with enhanced material
    const earthMaterial = new THREE.MeshPhongMaterial({
      specular: new THREE.Color(0x333333),
      shininess: 5,
      color: new THREE.Color(0xffffff), // White base color to not affect texture
    });
    
    // Use a better texture loading approach with the Image API
    try {
      console.log("Starting alternative texture loading approach");
      
      // Create a new image element to verify the image loads properly
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      img.onload = function() {
        console.log("Envisat Earth texture loaded successfully via Image API");
        
        // Once image is confirmed loaded, create the texture
        const earthTexture = new THREE.Texture(img);
        earthTexture.needsUpdate = true;
        
        // Apply the texture to the material
        earthMaterial.map = earthTexture;
        earthMaterial.needsUpdate = true;
        
        // Continue with the rest of setup
        completeEarthSetup(earthMaterial);
      };
      
      img.onerror = function(err) {
        console.error("Error loading Envisat Earth texture with Image API:", err);
        
        // Fall back to using the fallback material
        console.log("Using fallback material for Earth");
        completeEarthSetup(fallbackMaterial);
      };
      
      // Start loading the image
      img.src = textureUrl;
      console.log("Started loading Envisat image from:", textureUrl);
      
    } catch (error) {
      console.error("Critical error in texture loading:", error);
      console.log("Using fallback material for Earth due to critical error");
      completeEarthSetup(fallbackMaterial);
    }
    
    // Function to complete earth setup after texture is resolved
    function completeEarthSetup(material: THREE.Material) {
      // Create Earth mesh with the provided material
      earthMesh = new THREE.Mesh(earthGeometry, material);
      scene.add(earthMesh);
      
      // Try to load bump map if available
      try {
        const bumpImg = new Image();
        bumpImg.crossOrigin = "anonymous";
        bumpImg.onload = function() {
          console.log("Bump map loaded successfully");
          const bumpTexture = new THREE.Texture(bumpImg);
          bumpTexture.needsUpdate = true;
          
          if (material instanceof THREE.MeshPhongMaterial) {
            material.bumpMap = bumpTexture;
            material.bumpScale = 0.05;
            material.needsUpdate = true;
          }
        };
        bumpImg.onerror = () => console.log("Bump map not available");
        bumpImg.src = '/earth/earthbump.jpg';
      } catch (e) {
        console.log("Error loading bump map");
      }
      
      // Create more subtle atmosphere if enabled (to make texture more visible)
      if (displayAtmosphere) {
        // Subtle white atmosphere for better visibility
        const atmosphereGeometry = new THREE.SphereGeometry(2.1, 64, 64);
        const atmosphereMaterial = new THREE.MeshPhongMaterial({
          color: new THREE.Color(0xffffff),
          side: THREE.BackSide,
          transparent: true,
          opacity: 0.1, // Very subtle
        });
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        scene.add(atmosphere);
      }
      
      // Create a simple cloud effect without relying on texture
      if (displayClouds) {
        // Create a subtle cloud layer with a light color
        const cloudsGeometry = new THREE.SphereGeometry(2.02, 64, 64);
        const cloudsMaterial = new THREE.MeshPhongMaterial({
          color: new THREE.Color(0xffffff),
          transparent: true,
          opacity: 0.1,
          emissive: new THREE.Color(0xffffff),
          emissiveIntensity: 0.1,
        });
        cloudsMesh = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
        
        // Add slight rotation offset to clouds
        cloudsMesh.rotation.y = Math.PI / 4;
        
        scene.add(cloudsMesh);
      }
      
      // Configure orbit controls
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.enableZoom = false; // Disable zoom for better UX
      controls.enablePan = false; // Disable panning
      controls.rotateSpeed = 0.3;
      controls.autoRotate = autoRotate;
      controls.autoRotateSpeed = 0.6;
      
      // Start animation with earth mesh
      setupAnimationLoop(earthMesh);
      
      // Signal loading complete
      setIsLoaded(true);
    }
    
    // Cleanup function
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      
      if (controls) {
        controls.dispose();
      }
      
      // Clean up all meshes
      if (earthMesh) scene.remove(earthMesh);
      if (cloudsMesh) scene.remove(cloudsMesh);
      
      // Clean up all other scene elements
      while (scene.children.length > 0) {
        const object = scene.children[0];
        scene.remove(object);
        
        // Dispose of materials and geometries
        if (object instanceof THREE.Mesh) {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      }
      
      // Clean up renderer
      if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
    
  }, [size, rotationSpeed, autoRotate, displayAtmosphere, displayClouds]);
  
  return (
    <div className="relative">
      <div 
        ref={mountRef} 
        style={{ 
          width: `${size}px`, 
          height: `${size}px`,
          opacity: isLoaded ? 1 : 0, 
          transition: 'opacity 0.5s ease-in'
        }} 
      />
      {!isLoaded && (
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ width: `${size}px`, height: `${size}px` }}
        >
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}