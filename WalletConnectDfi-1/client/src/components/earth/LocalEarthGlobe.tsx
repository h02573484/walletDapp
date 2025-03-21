import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
// @ts-ignore - Import OrbitControls even if TypeScript can't find type definitions
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface LocalEarthGlobeProps {
  size?: number;
  rotationSpeed?: number;
  autoRotate?: boolean;
  displayAtmosphere?: boolean;
  displayClouds?: boolean;
}

export function LocalEarthGlobe({
  size = 300,
  rotationSpeed = 0.001,
  autoRotate = true,
  displayAtmosphere = true,
  displayClouds = true,
}: LocalEarthGlobeProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

    // Create scene
    const scene = new THREE.Scene();
    
    // Create camera with adjusted FOV for better spherical appearance
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 2000);
    camera.position.z = 6.5; // Position for better view and perception of depth
    
    // Create high-quality renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      precision: 'highp'
    });
    
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Better quality while maintaining performance
    mountRef.current.appendChild(renderer.domElement);
    
    // Create starfield background
    const createStarField = () => {
      const starGeometry = new THREE.BufferGeometry();
      const starCount = 2000;
      
      const positions = new Float32Array(starCount * 3);
      const sizes = new Float32Array(starCount);
      const colors = new Float32Array(starCount * 3);
      
      // Create stars at random positions in a sphere around the camera
      for (let i = 0; i < starCount; i++) {
        const i3 = i * 3;
        // Star positions in a sphere
        const radius = 800;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = radius * Math.cos(phi);
        
        // Varied star sizes
        sizes[i] = Math.random() * 2 + 0.5;
        
        // Star colors (white to slight blue)
        colors[i3] = 0.8 + Math.random() * 0.2; // R
        colors[i3 + 1] = 0.8 + Math.random() * 0.2; // G
        colors[i3 + 2] = 0.9 + Math.random() * 0.1; // B (more blue for stars)
      }
      
      starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
      starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      
      // Star material
      const starMaterial = new THREE.PointsMaterial({
        size: 2,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        blending: THREE.AdditiveBlending,
      });
      
      const starField = new THREE.Points(starGeometry, starMaterial);
      scene.add(starField);
      
      return starField;
    };
    
    // Add stars to the scene
    const starField = createStarField();
    
    // Enhanced lighting for realistic Earth
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35); // Subtle ambient light
    scene.add(ambientLight);
    
    // Main directional light simulating sunlight - positioned for dramatic lighting
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.4);
    directionalLight.position.set(5, 2, 5); // Position to enhance 3D appearance
    scene.add(directionalLight);
    
    // Subtle blue-tinted fill light from opposite direction
    const fillLight = new THREE.DirectionalLight(0x9999ff, 0.25);
    fillLight.position.set(-5, -2, -5); // Opposite the main light
    scene.add(fillLight);
    
    // Very subtle rim light to highlight Earth's curvature
    const rimLight = new THREE.DirectionalLight(0xaaccff, 0.15);
    rimLight.position.set(0, 5, -5);
    scene.add(rimLight);
    
    // Subtle point light to create a highlight on the Earth's surface
    const highlightLight = new THREE.PointLight(0xffffff, 0.2, 10);
    highlightLight.position.set(3, 2, 3);
    scene.add(highlightLight);
    
    // Earth sphere with higher polygon count for smoothness
    const earthGeometry = new THREE.SphereGeometry(2, 96, 96);
    
    // Create texture loader
    const textureLoader = new THREE.TextureLoader();
    textureLoader.crossOrigin = 'anonymous';
    
    console.log("Loading Earth texture...");
    
    // Create a simple initial material
    const initialMaterial = new THREE.MeshPhongMaterial({
      color: 0x2233ff,
      shininess: 10,
    });
    
    // Create Earth mesh with initial material
    const earthMesh = new THREE.Mesh(earthGeometry, initialMaterial);
    scene.add(earthMesh);
    
    // Cloud mesh will be added later if requested
    let cloudsMesh: THREE.Mesh | null = null;
    // Atmosphere mesh will be added later if requested
    let atmosphereMesh: THREE.Mesh | null = null;
    
    // Load the Earth texture - using specific file path to our new texture
    textureLoader.load(
      '/earth/earth-map.jpg',
      (texture) => {
        console.log("Earth texture loaded successfully!");
        
        // Create material with texture
        const earthMaterial = new THREE.MeshPhongMaterial({
          map: texture,
          bumpMap: null, // Will try to load bump map later
          bumpScale: 0.05,
          specularMap: null, // Will try to load specular map later
          specular: new THREE.Color(0x333333),
          shininess: 15,
        });
        
        // Update the Earth material
        earthMesh.material = earthMaterial;
        
        // Try to load bump map for additional surface detail
        textureLoader.load(
          '/earth/earthbump.jpg',
          (bumpTexture) => {
            console.log("Bump map loaded successfully!");
            (earthMesh.material as THREE.MeshPhongMaterial).bumpMap = bumpTexture;
          },
          undefined,
          (error) => {
            console.log("Bump map loading failed, continuing without it:", error);
          }
        );
        
        // Try to load specular map for better highlights
        textureLoader.load(
          '/earth/earthspecular.jpg',
          (specTexture) => {
            console.log("Specular map loaded successfully!");
            (earthMesh.material as THREE.MeshPhongMaterial).specularMap = specTexture;
          },
          undefined,
          (error) => {
            console.log("Specular map loading failed, continuing without it:", error);
          }
        );
      },
      undefined,
      (error) => {
        console.error("Error loading Earth texture:", error);
        
        // If main texture fails, try fallback
        textureLoader.load(
          '/earth/earth.jpg',
          (fallbackTexture) => {
            console.log("Fallback Earth texture loaded!");
            const fallbackMaterial = new THREE.MeshPhongMaterial({
              map: fallbackTexture,
              specular: new THREE.Color(0x333333),
              shininess: 15,
            });
            earthMesh.material = fallbackMaterial;
          },
          undefined,
          (fallbackError) => {
            console.error("Even fallback texture failed to load:", fallbackError);
          }
        );
      }
    );
    
    // Add atmosphere if requested
    if (displayAtmosphere) {
      // Create atmosphere
      const atmosphereGeometry = new THREE.SphereGeometry(2.15, 64, 64);
      const atmosphereMaterial = new THREE.MeshPhongMaterial({
        color: 0x8ab3ff,
        side: THREE.BackSide,
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending,
      });
      
      atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
      scene.add(atmosphereMesh);
      
      // Create inner glow
      const innerGlowGeometry = new THREE.SphereGeometry(2.05, 64, 64);
      const innerGlowMaterial = new THREE.MeshPhongMaterial({
        color: 0x8ab3ff,
        side: THREE.FrontSide,
        transparent: true,
        opacity: 0.1,
        blending: THREE.AdditiveBlending,
      });
      
      const innerGlowMesh = new THREE.Mesh(innerGlowGeometry, innerGlowMaterial);
      scene.add(innerGlowMesh);
    }
    
    // Add cloud layer if requested
    if (displayClouds) {
      console.log("Loading cloud texture...");
      
      // Cloud geometry slightly larger than Earth
      const cloudsGeometry = new THREE.SphereGeometry(2.05, 64, 64);
      
      // Load cloud texture from our downloaded file
      textureLoader.load(
        '/earth/earthclouds.jpg',
        (cloudsTexture) => {
          console.log("Cloud texture loaded successfully!");
          
          // Create cloud material with transparency
          const cloudsMaterial = new THREE.MeshPhongMaterial({
            map: cloudsTexture,
            transparent: true,
            opacity: 0.23,
            depthWrite: false,
            blending: THREE.NormalBlending,
          });
          
          // Create cloud mesh
          cloudsMesh = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
          // Offset rotation slightly for visual interest
          cloudsMesh.rotation.y = Math.PI / 4;
          scene.add(cloudsMesh);
        },
        undefined,
        (error) => {
          console.error("Error loading cloud texture:", error);
          
          // Create a simple white cloud layer as fallback
          const fallbackCloudsMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.15,
            depthWrite: false,
          });
          
          cloudsMesh = new THREE.Mesh(cloudsGeometry, fallbackCloudsMaterial);
          cloudsMesh.rotation.y = Math.PI / 4;
          scene.add(cloudsMesh);
        }
      );
    }
    
    // Set up controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.rotateSpeed = 0.25;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 0.4;
    
    // Animation function
    const animate = () => {
      const animationId = requestAnimationFrame(animate);
      
      // Rotate Earth
      earthMesh.rotation.y += rotationSpeed;
      
      // Rotate clouds at a different speed for realism
      if (cloudsMesh) {
        cloudsMesh.rotation.y += rotationSpeed * 0.7;
      }
      
      // Subtle starfield rotation for additional movement
      if (starField) {
        starField.rotation.y += rotationSpeed * 0.1;
      }
      
      controls.update();
      renderer.render(scene, camera);
    };
    
    // Start animation
    animate();
    setIsLoaded(true);
    
    // Cleanup function
    return () => {
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      // Dispose of geometry and materials
      earthGeometry.dispose();
      if (Array.isArray(earthMesh.material)) {
        earthMesh.material.forEach(material => material.dispose());
      } else {
        earthMesh.material.dispose();
      }
      
      if (cloudsMesh) {
        cloudsMesh.geometry.dispose();
        if (Array.isArray(cloudsMesh.material)) {
          cloudsMesh.material.forEach(material => material.dispose());
        } else {
          cloudsMesh.material.dispose();
        }
      }
      
      if (atmosphereMesh) {
        atmosphereMesh.geometry.dispose();
        if (Array.isArray(atmosphereMesh.material)) {
          atmosphereMesh.material.forEach(material => material.dispose());
        } else {
          atmosphereMesh.material.dispose();
        }
      }
      
      renderer.dispose();
    };
  }, [size, rotationSpeed, autoRotate, displayAtmosphere, displayClouds]);

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
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
}