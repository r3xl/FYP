import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const ThreeJSModelViewer = ({ modelUrl }) => {
  const mountRef = useRef(null);
  
  useEffect(() => {
    if (!modelUrl) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45, 
      mountRef.current.clientWidth / mountRef.current.clientHeight, 
      0.1, 
      1000
    );
    camera.position.set(5, 3, 7); // Better initial camera position

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Better shadow quality
    
    // Clear the container before adding new elements
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }
    
    mountRef.current.appendChild(renderer.domElement);
    
    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2;
    controls.minDistance = 2;
    controls.maxDistance = 15;
    controls.target.set(0, 0, 0);
    
    // Lighting - improved
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    
    // Improve shadow properties
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.bias = -0.001;
    
    scene.add(directionalLight);
    
    // Add a softer fill light from another angle
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);
    
    // Ground plane - made smaller and positioned better
    const groundGeometry = new THREE.PlaneGeometry(10, 10);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xdedede,
      roughness: 0.8,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.001; // Very slightly below origin to avoid z-fighting
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Load the 3D model
    const loader = new GLTFLoader();
    
    // Show loading state
    const loadingElem = document.createElement('div');
    loadingElem.className = 'model-loading';
    loadingElem.innerText = 'Loading 3D model...';
    loadingElem.style.position = 'absolute';
    loadingElem.style.top = '50%';
    loadingElem.style.left = '50%';
    loadingElem.style.transform = 'translate(-50%, -50%)';
    loadingElem.style.color = '#333';
    loadingElem.style.fontSize = '16px';
    loadingElem.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
    loadingElem.style.padding = '10px 15px';
    loadingElem.style.borderRadius = '4px';
    mountRef.current.appendChild(loadingElem);
    
    // Load the model
    loader.load(
      modelUrl,
      (gltf) => {
        // Remove loading message
        if (loadingElem.parentNode) {
          loadingElem.parentNode.removeChild(loadingElem);
        }
        
        const model = gltf.scene;
        
        // Auto-position and scale the model
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3()).length();
        const center = box.getCenter(new THREE.Vector3());
        
        // Reset position to center
        model.position.x = -center.x;
        model.position.y = -center.y;
        model.position.z = -center.z;
        
        // Adjust y position to sit on the floor
        const boundingBox = new THREE.Box3().setFromObject(model);
        const modelHeight = boundingBox.max.y - boundingBox.min.y;
        model.position.y = -boundingBox.min.y;
        
        // Scale model to fit but not too large
        const scale = Math.min(3 / size, 1); // Cap max scale
        model.scale.set(scale, scale, scale);
        
        // Set shadows
        model.traverse((object) => {
          if (object.isMesh) {
            object.castShadow = true;
            object.receiveShadow = true;
            
            // Improve material rendering for better visuals
            if (object.material) {
              object.material.needsUpdate = true;
              
              // Optional: enhance materials
              if (!object.material.envMap) {
                object.material.envMapIntensity = 1;
              }
            }
          }
        });
        
        scene.add(model);
        
        // Reset controls target to model center
        controls.target.set(0, modelHeight / 4, 0);
        controls.update();
      },
      (xhr) => {
        // Update loading progress
        const percentComplete = Math.round((xhr.loaded / xhr.total) * 100);
        if (loadingElem) {
          loadingElem.innerText = `Loading 3D model... ${percentComplete}%`;
        }
      },
      (error) => {
        console.error('Error loading 3D model:', error);
        if (loadingElem && loadingElem.parentNode) {
          loadingElem.innerText = 'Error loading 3D model';
        }
      }
    );
    
    // Handle window resize
    const handleResize = () => {
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      
      // Dispose resources
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      
      renderer.dispose();
    };
  }, [modelUrl]);
  
  return (
    <div 
      ref={mountRef} 
      style={{ 
        width: '100%', 
        height: '400px', // Increased height for better viewing
        position: 'relative',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)' // Optional: add shadow for better UI
      }}
    />
  );
};

export default ThreeJSModelViewer;