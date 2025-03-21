import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface SatelliteEarthProps {
  size?: number;
  rotationSpeed?: number;
}

export function SatelliteEarth({ 
  size = 400,
  rotationSpeed = 0.0005
}: SatelliteEarthProps) {
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);
    
    // Earth geometry with higher detail
    const earthGeometry = new THREE.SphereGeometry(1, 64, 64);

    // Create initial placeholder material (will be replaced with texture)
    const earthMaterial = new THREE.MeshPhongMaterial({
      color: 0x1a4d7c,        // Earth blue as fallback
      shininess: 15,
      specular: 0x333333
    });
    
    // Create Earth mesh
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);
    
    // Create texture loader - used for all textures
    const textureLoader = new THREE.TextureLoader();
    
    // Define the texture paths to try
    const texturePaths = [
      '/earth-texture-satellite.jpg',
      '/earth-texture.jpg',
      '/earth-nasa.jpg',
      '/textures/earth_daymap.jpg',
      '/earth/earth-nasa.jpg',
      '/earth/nasa_earth.jpg'
    ];
    
    // Track if texture was successfully loaded
    let textureLoaded = false;
    
    // Try loading bump map for terrain details
    textureLoader.load(
      '/textures/earth_bumpmap.jpg',
      (bumpTexture) => {
        earthMaterial.bumpMap = bumpTexture;
        earthMaterial.bumpScale = 0.05;
        earthMaterial.needsUpdate = true;
      }
    );
    
    // Try loading specular map for water reflections
    textureLoader.load(
      '/textures/earth_specular.jpg',
      (specularTexture) => {
        earthMaterial.specularMap = specularTexture;
        earthMaterial.specular = new THREE.Color(0x666666);
        earthMaterial.shininess = 25;
        earthMaterial.needsUpdate = true;
      }
    );
    
    // Function to try loading the next texture in the list
    const tryLoadTexture = (index: number) => {
      if (index >= texturePaths.length) {
        console.log('All texture loading attempts failed, using blue fallback');
        return;
      }
      
      textureLoader.load(
        texturePaths[index],
        (texture) => {
          if (!textureLoaded) {
            console.log(`Successfully loaded Earth texture from ${texturePaths[index]}`);
            earthMaterial.map = texture;
            earthMaterial.needsUpdate = true;
            textureLoaded = true;
          }
        },
        undefined,
        () => {
          console.log(`Failed to load Earth texture from ${texturePaths[index]}, trying next option`);
          tryLoadTexture(index + 1);
        }
      );
    };
    
    // Start the texture loading process
    tryLoadTexture(0);
    
    // Create atmosphere glow
    const glowGeometry = new THREE.SphereGeometry(1.08, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x0077ff,
      transparent: true,
      opacity: 0.10,
      side: THREE.BackSide
    });
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glowMesh);
    
    // Animation loop
    const animate = () => {
      earth.rotation.y += rotationSpeed;
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
      glowGeometry.dispose();
      
      if (earthMaterial.map) earthMaterial.map.dispose();
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