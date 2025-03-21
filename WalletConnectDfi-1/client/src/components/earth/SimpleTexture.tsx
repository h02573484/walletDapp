import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface SimpleTextureProps {
  size?: number;
}

// Create a procedural texture as fallback
const createProceduralTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Ocean background
    ctx.fillStyle = '#1a4d7c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Create land masses
    ctx.fillStyle = '#2d6a4f';

    // Simplified continents
    ctx.beginPath();
    ctx.arc(512, 256, 200, 0, Math.PI * 2);
    ctx.fill();

    // Add some variation
    ctx.fillStyle = '#40916c';
    ctx.beginPath();
    ctx.arc(300, 256, 150, 0, Math.PI * 2);
    ctx.fill();
  }

  return new THREE.CanvasTexture(canvas);
};

export function SimpleTexture({ size = 400 }: SimpleTextureProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    renderer.setSize(size, size);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    const geometry = new THREE.SphereGeometry(1.5, 32, 32);
    const material = new THREE.MeshPhongMaterial({
      map: createProceduralTexture(),
      shininess: 10
    });

    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Create a loadingManager to better handle texture loading events
    const loadingManager = new THREE.LoadingManager();
    loadingManager.onError = (url) => {
      console.error(`Error loading texture from ${url}`);
    };
    
    const textureLoader = new THREE.TextureLoader(loadingManager);
    
    // Try loading with direct texture loading with absolute path
    const texturePath = '/earth-texture.jpg'; // This is the copy we just made
    
    // Create a function to try loading with absolute path
    // Fixed the TypeScript error
    try {
      // Create texture directly
      const texture = textureLoader.load(
        texturePath,
        (loadedTexture) => {
          console.log('Texture loaded successfully!');
          loadedTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
          material.map = loadedTexture;
          material.needsUpdate = true;
        },
        (progress) => {
          if (progress.total > 0) {
            console.log(`Loading: ${Math.round((progress.loaded / progress.total) * 100)}%`);
          }
        },
        (error) => {
          console.error('Error loading texture via TextureLoader:', error);
        }
      );
    } catch (e) {
      console.error('Exception during texture loading:', e);
    }
    
    // As a backup approach, manually fetch the image and create a texture
    fetch(texturePath)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.blob();
      })
      .then(blob => {
        const img = new Image();
        img.onload = () => {
          const texture = new THREE.Texture(img);
          texture.needsUpdate = true;
          console.log('Texture created from fetch blob');
          
          // Only apply if we haven't already applied a texture
          if (!material.map) {
            material.map = texture;
            material.needsUpdate = true;
          }
        };
        img.src = URL.createObjectURL(blob);
      })
      .catch(error => {
        console.error('Error fetching texture:', error);
      });

    const animate = () => {
      requestAnimationFrame(animate);
      sphere.rotation.y += 0.002;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
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