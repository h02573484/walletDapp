import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface RealisticEarthProps {
  size?: number;
  rotationSpeed?: number;
}

export function RealisticEarth({ 
  size = 400,
  rotationSpeed = 0.0005
}: RealisticEarthProps) {
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
      color: 0x2233aa,  // Blue placeholder color
      shininess: 15,
      specular: 0x333333
    });
    
    // Create Earth mesh
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);
    
    // Texture loader
    const textureLoader = new THREE.TextureLoader();
    
    // Create a procedural Earth with satellite-like appearance
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const context = canvas.getContext('2d');
    
    if (context) {
      // Base ocean color - deep blue
      context.fillStyle = '#0c2e55';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      // Create noise pattern for ocean texture
      const createNoisePattern = (color: string, size: number, opacity: number) => {
        const count = Math.floor(canvas.width * canvas.height / size);
        context.fillStyle = color;
        context.globalAlpha = opacity;
        
        for (let i = 0; i < count; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const radius = Math.random() * size / 8 + size / 8;
          context.beginPath();
          context.arc(x, y, radius, 0, Math.PI * 2);
          context.fill();
        }
        
        context.globalAlpha = 1.0;
      };
      
      // Add ocean texture
      createNoisePattern('#0e3868', 100, 0.1);
      createNoisePattern('#072644', 200, 0.15);
      
      // Draw landmasses with realistic shapes
      const drawLandmass = (points: [number, number][], color: string) => {
        context.fillStyle = color;
        context.beginPath();
        context.moveTo(points[0][0], points[0][1]);
        
        for (let i = 1; i < points.length; i++) {
          context.lineTo(points[i][0], points[i][1]);
        }
        
        context.closePath();
        context.fill();
      };
      
      // North America - satellite resembling shape
      drawLandmass([
        [200, 120], [300, 100], [350, 150], [330, 220], 
        [380, 250], [350, 300], [260, 280], [220, 220], 
        [180, 180], [160, 150], [200, 120]
      ], '#2c5e1a');
      
      // South America
      drawLandmass([
        [280, 320], [330, 340], [350, 400], [330, 460], 
        [290, 490], [250, 460], [240, 400], [260, 350], 
        [280, 320]
      ], '#337722');
      
      // Europe and Africa combined
      drawLandmass([
        [450, 140], [550, 120], [600, 180], [580, 260], 
        [550, 320], [540, 400], [500, 450], [460, 440], 
        [430, 380], [450, 280], [440, 190], [450, 140]
      ], '#3d6a24');
      
      // Asia
      drawLandmass([
        [600, 140], [750, 150], [800, 200], [780, 260], 
        [820, 300], [800, 350], [700, 330], [650, 300], 
        [620, 260], [590, 220], [600, 140]
      ], '#355e1e');
      
      // Australia
      drawLandmass([
        [750, 380], [820, 400], [830, 450], [790, 470], 
        [740, 460], [720, 420], [750, 380]
      ], '#3e6826');
      
      // Add detailed texture to landmasses
      createNoisePattern('#243c12', 50, 0.3);
      createNoisePattern('#466830', 100, 0.2);
      
      // Add cloud-like patterns
      createNoisePattern('#ffffff', 300, 0.1);
      createNoisePattern('#ffffff', 200, 0.05);
      
      // Create a canvas texture and assign it to the material
      const earthTexture = new THREE.CanvasTexture(canvas);
      earthMaterial.map = earthTexture;
      earthMaterial.needsUpdate = true;
      
      // Now try loading the actual texture in background for better quality if available
      textureLoader.load(
        '/earth-nasa.jpg',
        (texture) => {
          console.log('Loaded high-quality Earth texture successfully');
          earthMaterial.map = texture;
          earthMaterial.needsUpdate = true;
        }
      );
    }
    
    // Create atmosphere glow
    const glowGeometry = new THREE.SphereGeometry(1.08, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x0077ff,
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide
    });
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glowMesh);
    
    // Optional cloud layer
    const cloudGeometry = new THREE.SphereGeometry(1.02, 32, 32);
    const cloudMaterial = new THREE.MeshPhongMaterial({
      map: null,
      transparent: true,
      opacity: 0.4
    });
    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    
    // Try to load cloud texture
    textureLoader.load(
      '/clouds.jpg',
      (texture) => {
        cloudMaterial.map = texture;
        cloudMaterial.needsUpdate = true;
        scene.add(clouds);
      }
    );
    
    // Animation loop
    const animate = () => {
      earth.rotation.y += rotationSpeed;
      if (clouds) clouds.rotation.y += rotationSpeed * 0.5;
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
      
      if (earthMaterial.map) earthMaterial.map.dispose();
      earthMaterial.dispose();
      
      if (cloudMaterial.map) cloudMaterial.map.dispose();
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