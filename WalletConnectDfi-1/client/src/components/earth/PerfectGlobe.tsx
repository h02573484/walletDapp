import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
// @ts-ignore - Import OrbitControls even if TypeScript can't find type definitions
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface PerfectGlobeProps {
  size?: number;
  rotationSpeed?: number;
  autoRotate?: boolean;
  displayAtmosphere?: boolean;
  displayClouds?: boolean;
}

export function PerfectGlobe({
  size = 300,
  rotationSpeed = 0.001,
  autoRotate = true,
  displayAtmosphere = true,
  displayClouds = true,
}: PerfectGlobeProps) {
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
    
    // Perfect Earth sphere with higher polygon count for smoothness
    const earthGeometry = new THREE.SphereGeometry(2, 96, 96);
    
    // Create advanced Earth texture loader
    // Create texture loader with enhanced options
    const textureLoader = new THREE.TextureLoader();
    textureLoader.crossOrigin = 'anonymous';
    
    // Add more verbose logging
    console.log("Initializing texture loader...");
    
    // Create a more attractive and realistic fallback Earth material
    const fallbackMaterial = new THREE.MeshPhongMaterial({
      color: new THREE.Color(0x1a4d7c), // Rich deep ocean blue
      shininess: 25,
      specular: new THREE.Color(0x444444),
      emissive: new THREE.Color(0x111122), // Very subtle night glow
      emissiveIntensity: 0.05,
    });
    
    // Since we're having issues with textures, let's use a procedural approach
    const createProceduralEarthTexture = () => {
      // We'll create a procedural Earth texture using gradients
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Fill with ocean color
        ctx.fillStyle = '#1a4d7c';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Create some land masses with gradient coloring
        const landGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        landGradient.addColorStop(0, '#2d6a4f');
        landGradient.addColorStop(0.5, '#40916c');
        landGradient.addColorStop(1, '#52b788');
        
        // Draw some continents - simplified shapes
        ctx.fillStyle = landGradient;
        
        // Simplified Africa + Europe
        ctx.beginPath();
        ctx.moveTo(512, 180);
        ctx.lineTo(550, 150);
        ctx.lineTo(580, 120);
        ctx.lineTo(600, 180);
        ctx.lineTo(590, 280);
        ctx.lineTo(570, 330);
        ctx.lineTo(520, 320);
        ctx.lineTo(490, 280);
        ctx.lineTo(480, 220);
        ctx.fill();
        
        // Simplified Americas
        ctx.beginPath();
        ctx.moveTo(300, 100);
        ctx.lineTo(330, 150);
        ctx.lineTo(320, 250);
        ctx.lineTo(340, 300);
        ctx.lineTo(300, 350);
        ctx.lineTo(260, 300);
        ctx.lineTo(270, 200);
        ctx.lineTo(250, 150);
        ctx.fill();
        
        // Simplified Asia
        ctx.beginPath();
        ctx.moveTo(650, 150);
        ctx.lineTo(750, 170);
        ctx.lineTo(780, 220);
        ctx.lineTo(750, 270);
        ctx.lineTo(700, 290);
        ctx.lineTo(650, 270);
        ctx.lineTo(630, 230);
        ctx.fill();
        
        // Simplified Australia
        ctx.beginPath();
        ctx.moveTo(750, 320);
        ctx.lineTo(800, 330);
        ctx.lineTo(810, 350);
        ctx.lineTo(790, 370);
        ctx.lineTo(760, 360);
        ctx.lineTo(740, 340);
        ctx.fill();
        
        // Add some polar caps
        ctx.fillStyle = '#e6e6e6';
        ctx.beginPath();
        ctx.ellipse(512, 30, 400, 50, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.ellipse(512, 482, 400, 50, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Add some noise for texture
        for (let i = 0; i < 5000; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const size = Math.random() * 2 + 1;
          const opacity = Math.random() * 0.1;
          
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.fillRect(x, y, size, size);
        }
      }
      
      const texture = new THREE.CanvasTexture(canvas);
      return texture;
    };
    // Create procedural texture as our primary texture (since actual textures are failing)
    const proceduralTexture = createProceduralEarthTexture();
    console.log("Using procedural Earth texture");
    
    // Storage variables for meshes
    let earthMesh: THREE.Mesh;
    let cloudsMesh: THREE.Mesh | null = null;
    let atmosphereMesh: THREE.Mesh | null = null;
    let innerGlowMesh: THREE.Mesh | null = null;
    let controls: OrbitControls;
    let animationFrameId: number;
    
    // Enhanced animation function
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      // Rotate Earth
      if (earthMesh) {
        earthMesh.rotation.y += rotationSpeed;
      }
      
      // Rotate clouds at different speed for realism
      if (cloudsMesh) {
        cloudsMesh.rotation.y += rotationSpeed * 0.7;
      }
      
      // Subtle star field rotation
      if (starField) {
        starField.rotation.y += rotationSpeed * 0.1;
      }
      
      if (controls) {
        controls.update();
      }
      
      renderer.render(scene, camera);
    };
    
    // Function to set up atmosphere, clouds, controls, and start animation
    const setupEarthExtras = () => {
      // Add enhanced atmosphere with realistic glow if requested
      if (displayAtmosphere) {
        // Main atmosphere glow
        const atmosphereGeometry = new THREE.SphereGeometry(2.15, 64, 64);
        const atmosphereMaterial = new THREE.MeshPhongMaterial({
          color: new THREE.Color(0xadc1ff), // Blue-white atmosphere color
          side: THREE.BackSide,
          transparent: true,
          opacity: 0.18,
          blending: THREE.AdditiveBlending, // Enhanced glow
        });
        atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        scene.add(atmosphereMesh);
        
        // Subtle inner atmosphere glow
        const innerGlowGeometry = new THREE.SphereGeometry(2.05, 64, 64);
        const innerGlowMaterial = new THREE.MeshPhongMaterial({
          color: new THREE.Color(0x8ab3ff),
          side: THREE.FrontSide,
          transparent: true,
          opacity: 0.12,
          blending: THREE.AdditiveBlending,
        });
        innerGlowMesh = new THREE.Mesh(innerGlowGeometry, innerGlowMaterial);
        scene.add(innerGlowMesh);
      }
      
      // Create simple procedural clouds as fallback
      const createFallbackClouds = () => {
        console.log("Using simple clouds");
        const cloudsGeometry = new THREE.SphereGeometry(2.05, 64, 64);
        const cloudsMaterial = new THREE.MeshPhongMaterial({
          color: new THREE.Color(0xffffff),
          transparent: true,
          opacity: 0.15,
          depthWrite: false,
        });
        
        cloudsMesh = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
        cloudsMesh.rotation.y = Math.PI / 4;
        scene.add(cloudsMesh);
      };
      
      // Add realistic cloud layer if requested
      if (displayClouds) {
        console.log("Adding cloud layer with advanced loading");
        
        // Try multiple cloud texture paths with fallback mechanism
        const cloudTexturePaths = [
          '/clouds.jpg',               // Try root public folder first
          '/cloud-texture.jpg',        // Alternative in root
          '/earth/earthclouds.jpg',    // Then subdirectory
          '/textures/earth_clouds.jpg' // Last option in textures folder
        ];
        
        // Keep track of loading attempts
        let cloudTextureIndex = 0;
        
        const tryLoadCloudTexture = () => {
          if (cloudTextureIndex >= cloudTexturePaths.length) {
            console.log("All cloud texture loading attempts failed, using simple clouds");
            createFallbackClouds();
            return;
          }
          
          console.log(`Attempting to load cloud texture from ${cloudTexturePaths[cloudTextureIndex]}`);
          
          try {
            textureLoader.load(
              cloudTexturePaths[cloudTextureIndex],
              // Success callback
              function(cloudTexture) {
                console.log(`Successfully loaded cloud texture from ${cloudTexturePaths[cloudTextureIndex]}`);
                
                // Create realistic cloud layer with proper texture
                const cloudsGeometry = new THREE.SphereGeometry(2.05, 64, 64);
                const cloudsMaterial = new THREE.MeshPhongMaterial({
                  map: cloudTexture,
                  transparent: true,
                  opacity: 0.25, // Subtle cloud opacity
                  depthWrite: false, // Better blending
                  blending: THREE.NormalBlending,
                  emissive: new THREE.Color(0x333333),
                  emissiveIntensity: 0.025, // Very subtle self-illumination
                });
                
                cloudsMesh = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
                cloudsMesh.rotation.y = Math.PI / 4; // Initial offset
                scene.add(cloudsMesh);
              },
              // Progress callback
              undefined,
              // Error callback
              function(err) {
                console.log(`Failed to load cloud texture from ${cloudTexturePaths[cloudTextureIndex]}, trying next option`);
                cloudTextureIndex++;
                tryLoadCloudTexture(); // Try next texture in the list
              }
            );
          } catch (error) {
            console.error("Critical error in cloud texture loading:", error);
            cloudTextureIndex++;
            tryLoadCloudTexture(); // Try next texture in the list
          }
        };
        
        // Start the cloud texture loading process
        tryLoadCloudTexture();
      }
      
      // Set up controls
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.enableZoom = false;
      controls.enablePan = false;
      controls.rotateSpeed = 0.25;
      controls.autoRotate = autoRotate;
      controls.autoRotateSpeed = 0.4;
      
      // Start animation
      animate();
      
      // Signal loading complete
      setIsLoaded(true);
    };
    
    // No longer using texture paths array, using direct loading instead
    
    // Create Earth material that will be updated with the texture
    const earthMaterial = new THREE.MeshPhongMaterial({
      specular: new THREE.Color(0x555555),
      shininess: 18,
      reflectivity: 0.2,
      emissive: new THREE.Color(0x111111), // Very subtle night glow
      emissiveIntensity: 0.05,
    });
    
    // Load Earth texture using file loading with fallback
    const loadEarthTexture = () => {
      console.log("Setting Earth texture from file");
      
      // First set the procedural texture as fallback
      earthMaterial.map = proceduralTexture;
      
      // Try multiple texture paths with fallback mechanism
      const texturePaths = [
        '/envisat-mosaic.jpg',          // Try root public folder first
        '/earth/envisat-mosaic.jpg',    // Then subdirectory
        '/earth-nasa.jpg',              // Alternative texture in root
        '/earth/earth-nasa.jpg',        // Alternative in subdirectory
        '/earth/nasa_earth.jpg',        // Another alternative
        '/earth/earth.jpg'              // Final fallback
      ];
      
      // Keep track of loading attempts
      let textureIndex = 0;
      
      const tryLoadTexture = () => {
        if (textureIndex >= texturePaths.length) {
          console.log("All texture loading attempts failed, using procedural texture");
          return; // Keep the procedural texture we already set as fallback
        }
        
        console.log(`Attempting to load Earth texture from ${texturePaths[textureIndex]}`);
        
        try {
          textureLoader.load(
            texturePaths[textureIndex],
            // Success callback
            function(texture) {
              console.log(`Successfully loaded Earth texture from ${texturePaths[textureIndex]}`);
              earthMaterial.map = texture;
              earthMaterial.needsUpdate = true;
              
              // Now that we have the main texture, try loading bump and specular maps
              loadBumpAndSpecularMaps();
            },
            // Progress callback
            undefined,
            // Error callback
            function(err) {
              console.log(`Failed to load Earth texture from ${texturePaths[textureIndex]}, trying next option`);
              textureIndex++;
              tryLoadTexture(); // Try next texture in the list
            }
          );
        } catch (error) {
          console.error("Critical error in texture loading:", error);
          textureIndex++;
          tryLoadTexture(); // Try next texture in the list
        }
      };
      
      // Start the texture loading process
      tryLoadTexture();
      
      // Function to load bump and specular maps once main texture is loaded
      const loadBumpAndSpecularMaps = () => {
        // Try to load bump map
        try {
          textureLoader.load(
            '/earth/earthbump.jpg', 
            (bumpTexture) => {
              console.log("Successfully loaded bump map");
              earthMaterial.bumpMap = bumpTexture;
              earthMaterial.bumpScale = 0.05;
              earthMaterial.needsUpdate = true;
            },
            undefined,
            (err) => console.log("Could not load bump map, skipping")
          );
        } catch (error) {
          console.log("Error loading bump map:", error);
        }
        
        // Try to load specular map
        try {
          textureLoader.load(
            '/earth/earthspecular.jpg', 
            (specTexture) => {
              console.log("Successfully loaded specular map");
              earthMaterial.specularMap = specTexture;
              earthMaterial.needsUpdate = true;
            },
            undefined,
            (err) => console.log("Could not load specular map, skipping")
          );
        } catch (error) {
          console.log("Error loading specular map:", error);
        }
      };
    };
    
    // Start the texture loading process
    loadEarthTexture();
    
    // Create and add Earth to scene
    earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earthMesh);
    
    // Setup extras including atmosphere, clouds, and controls
    setupEarthExtras();
    
    // Comprehensive cleanup function
    return () => {
      // Cancel animation
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      
      // Dispose controls
      if (controls) {
        controls.dispose();
      }
      
      // Clean up star field
      if (starField) {
        scene.remove(starField);
        if (starField.geometry) starField.geometry.dispose();
        if (starField.material instanceof THREE.Material) {
          starField.material.dispose();
        }
      }
      
      // Clean up all meshes and materials
      if (earthMesh) {
        scene.remove(earthMesh);
        if (!Array.isArray(earthMesh.material)) {
          const material = earthMesh.material as THREE.MeshPhongMaterial;
          if (material.map) material.map.dispose();
          if (material.bumpMap) material.bumpMap.dispose();
          if (material.specularMap) material.specularMap.dispose();
          material.dispose();
        }
      }
      
      // Clean up cloud mesh
      if (cloudsMesh) {
        scene.remove(cloudsMesh);
        if (!Array.isArray(cloudsMesh.material)) {
          const material = cloudsMesh.material as THREE.MeshPhongMaterial;
          if (material.map) material.map.dispose();
          material.dispose();
        }
      }
      
      // Clean up atmosphere
      if (atmosphereMesh) {
        scene.remove(atmosphereMesh);
        if (!Array.isArray(atmosphereMesh.material)) {
          atmosphereMesh.material.dispose();
        }
      }
      
      // Clean up inner glow
      if (innerGlowMesh) {
        scene.remove(innerGlowMesh);
        if (!Array.isArray(innerGlowMesh.material)) {
          innerGlowMesh.material.dispose();
        }
      }
      
      // Dispose geometries
      earthGeometry.dispose();
      
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