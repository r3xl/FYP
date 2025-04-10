import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

const ThreeJSModelViewer = ({ modelUrl }) => {
  const mountRef = useRef(null);
  
  useEffect(() => {
    if (!modelUrl) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeeeeee); // Lighter background for better contrast

    // Camera setup - improved for vehicles
    const camera = new THREE.PerspectiveCamera(
      35, // Lower FOV for less distortion
      mountRef.current.clientWidth / mountRef.current.clientHeight, 
      0.1, 
      1000
    );
    camera.position.set(10, 5, 10); // Better initial position for cars

    // Renderer setup with modern settings
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      powerPreference: "high-performance" 
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit for performance
    
    // Use modern encoding approach
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    
    // Shadow settings
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Clear the container before adding new elements
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }
    
    mountRef.current.appendChild(renderer.domElement);
    
    // Controls setup - optimized for vehicle viewing
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1; // Smoother damping
    controls.screenSpacePanning = true; // Better for examining car details
    controls.maxPolarAngle = Math.PI / 1.75; // Prevent going under the car too much
    controls.minDistance = 3;
    controls.maxDistance = 20;
    controls.autoRotate = false; // Enable for automatic rotation
    controls.autoRotateSpeed = 0.5;
    
    // Set control target to center
    controls.target.set(0, 0.5, 0); // Target slightly above ground for cars
    controls.update();
    
    // Lighting setup - optimized for vehicles
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    // Key light (main light)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1);
    keyLight.position.set(5, 10, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.1;
    keyLight.shadow.camera.far = 40;
    keyLight.shadow.bias = -0.0005;
    
    // Adjust shadow camera based on vehicle size
    keyLight.shadow.camera.left = -10;
    keyLight.shadow.camera.right = 10;
    keyLight.shadow.camera.top = 10;
    keyLight.shadow.camera.bottom = -10;
    scene.add(keyLight);
    
    // Fill light (front)
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-5, 3, 10);
    scene.add(fillLight);
    
    // Back light (rim light)
    const backLight = new THREE.DirectionalLight(0xffffff, 0.7);
    backLight.position.set(0, 5, -9);
    scene.add(backLight);
    
    // Ground plane to receive shadows
    const groundGeometry = new THREE.PlaneGeometry(30, 30);
    const groundMaterial = new THREE.ShadowMaterial({
      opacity: 0.3,
    });
    const groundPlane = new THREE.Mesh(groundGeometry, groundMaterial);
    groundPlane.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    groundPlane.position.y = -0.01; // Slightly below the model to avoid z-fighting
    groundPlane.receiveShadow = true;
    scene.add(groundPlane);
    
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
    
    // Function to frame the model in view
    const frameObject = (object) => {
      const box = new THREE.Box3().setFromObject(object);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      // For cars, we want to position with wheels on the "ground"
      const bottomPoint = box.min.y;
      
      // Reset model position so it's centered on XZ but sitting on Y=0
      object.position.x = -center.x;
      object.position.z = -center.z;
      object.position.y = -bottomPoint; // This places the bottom of the car at y=0
      
      // Update controls target to model center
      controls.target.set(0, size.y / 2, 0); // Target middle height of car
      controls.update();
      
      // Position camera to see whole car
      const maxDim = Math.max(size.x, size.z) * 1.5; // Focus on length/width for cars
      const fov = camera.fov * (Math.PI / 180);
      let cameraZ = Math.abs(maxDim / Math.sin(fov / 2) / 2);
      
      // Set camera position for a good 3/4 view of car
      camera.position.set(
        cameraZ * 0.8, // Slightly to the side
        size.y * 1.2,  // Above the car
        cameraZ * 0.8  // And in front
      );
      
      camera.lookAt(center);
      
      // Update controls after positioning
      controls.update();
    };
    
    // Determine which loader to use based on file extension
    const loadModel = () => {
      const fileExtension = modelUrl.split('.').pop().toLowerCase();
      
      // Remove loading message function
      const removeLoadingMessage = () => {
        if (loadingElem.parentNode) {
          loadingElem.parentNode.removeChild(loadingElem);
        }
      };
      
      // Error handling function
      const handleLoadError = (error) => {
        console.error('Error loading 3D model:', error);
        if (loadingElem && loadingElem.parentNode) {
          loadingElem.innerText = 'Error loading 3D model';
          
          // Add more details to the error message
          const errorDetails = document.createElement('p');
          errorDetails.innerText = `Details: ${error.message || 'Unknown error'}`;
          errorDetails.style.fontSize = '12px';
          errorDetails.style.marginTop = '5px';
          loadingElem.appendChild(errorDetails);
        }
      };
      
      // Progress function
      const handleProgress = (xhr) => {
        if (xhr.lengthComputable) {
          const percentComplete = Math.round((xhr.loaded / xhr.total) * 100);
          if (loadingElem) {
            loadingElem.innerText = `Loading 3D model... ${percentComplete}%`;
          }
        }
      };
      
      // Process the loaded model
      const processModel = (model) => {
        // Remove loading message
        removeLoadingMessage();
        
        // Improve materials for all meshes
        model.traverse((object) => {
          if (object.isMesh) {
            object.castShadow = true;
            object.receiveShadow = true;
            
            // Improve material rendering
            if (object.material) {
              // For car models, enhance materials
              if (object.material.map) {
                object.material.map.anisotropy = renderer.capabilities.getMaxAnisotropy();
              }
              
              // Make metallic parts look better
              if (object.material.name && object.material.name.toLowerCase().includes('metal')) {
                object.material.metalness = 0.8;
                object.material.roughness = 0.2;
              }
              
              // Improve glass materials
              if (object.material.name && 
                 (object.material.name.toLowerCase().includes('glass') || 
                  object.material.name.toLowerCase().includes('window'))) {
                object.material.transparent = true;
                object.material.opacity = 0.8;
                object.material.metalness = 0.9;
                object.material.roughness = 0;
              }
              
              object.material.needsUpdate = true;
            }
          }
        });
        
        // Add model to scene
        scene.add(model);
        
        // Get bounding box to check model size
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        
        // Scale model if it's too large or too small
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 20 || maxDim < 3) {
          const scale = 5 / maxDim;
          model.scale.set(scale, scale, scale);
        }
        
        // Position the model correctly
        frameObject(model);
        
        // Add a small delay for any post-processing
        setTimeout(() => {
          frameObject(model);
        }, 100);
      };

      // Choose loader based on file extension
      switch (fileExtension) {
        case 'glb':
        case 'gltf':
          const gltfLoader = new GLTFLoader();
          gltfLoader.load(
            modelUrl,
            (gltf) => processModel(gltf.scene),
            handleProgress,
            handleLoadError
          );
          break;
          
        case 'fbx':
          const fbxLoader = new FBXLoader();
          fbxLoader.load(
            modelUrl,
            (fbxModel) => processModel(fbxModel),
            handleProgress,
            handleLoadError
          );
          break;
          
        case 'obj':
          const objLoader = new OBJLoader();
          objLoader.load(
            modelUrl,
            (objModel) => processModel(objModel),
            handleProgress,
            handleLoadError
          );
          break;
          
        case 'stl':
          const stlLoader = new STLLoader();
          stlLoader.load(
            modelUrl,
            (geometry) => {
              // For STL we need to create a mesh since it only loads geometry
              const material = new THREE.MeshPhysicalMaterial({ 
                color: 0x555555,
                roughness: 0.4,
                metalness: 0.6,
                clearcoat: 0.2,
                clearcoatRoughness: 0.3
              });
              const mesh = new THREE.Mesh(geometry, material);
              processModel(mesh);
            },
            handleProgress,
            handleLoadError
          );
          break;
          
        default:
          console.warn(`File extension "${fileExtension}" not explicitly supported, trying GLTFLoader`);
          const defaultLoader = new GLTFLoader();
          defaultLoader.load(
            modelUrl,
            (gltf) => processModel(gltf.scene),
            handleProgress,
            handleLoadError
          );
          break;
      }
    };

    // Call the function to load the model
    loadModel();
    
    // Add environment lighting for reflections on car paint/glass
    new THREE.TextureLoader().load(
      'https://threejs.org/examples/textures/2294472375_24a3b8ef46_o.jpg', 
      function(texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;
      }
    );
    
    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current) return;
      
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
            object.material.forEach(material => {
              if (material.map) material.map.dispose();
              material.dispose();
            });
          } else {
            if (object.material.map) object.material.map.dispose();
            object.material.dispose();
          }
        }
      });
      
      // Dispose renderer
      if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement = null;
      }
      
      // Null out references
      if (controls) controls.dispose();
    };
  }, [modelUrl]);
  
  return (
    <div 
      ref={mountRef} 
      style={{ 
        width: '100%', 
        height: '400px',
        position: 'relative',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
      }}
    />
  );
};

export default ThreeJSModelViewer;