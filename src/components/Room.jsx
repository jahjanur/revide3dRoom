import React, { useRef, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF, useTexture, useVideoTexture, Text } from '@react-three/drei'
import * as THREE from 'three'

const Room = ({ onOpenFrame, onOpenPublishing, controlsRef, currentView, onNavigateToHome, modelQuality, onModelLoaded }) => {
  const [shouldTriggerHomeAnimation, setShouldTriggerHomeAnimation] = useState(false)
  const [showPublishingGuides, setShowPublishingGuides] = useState(false)
  const [publishingObjects, setPublishingObjects] = useState([])
  const gltf = useGLTF('/MukiErdhLunLol02.glb')
  const { gl, camera } = useThree()
  
  // Load frame textures
  const frame1Texture = useTexture('/sponsors/Frame11.jpg')
  const frame2Texture = useTexture('/sponsors/Frame22.jpg')
  const frame3Texture = useTexture('/sponsors/Frame33.jpg')
  const frame4Texture = useTexture('/sponsors/Frame44.jpg')
  const frame5Texture = useTexture('/sponsors/Frame55.JPG')
  
  // Load publishing textures
  const publishing1Texture = useTexture('/publications/immomedien/Publishing1_Material.png')
  const publishing2Texture = useTexture('/publications/panoptikum/Publishing2_Material.png')
  
  // Track if initial animation has played (using ref to persist across re-renders)
  const hasPlayedInitialAnimationRef = useRef(false)
  
  // Mobile detection
  const isMobile = window.innerWidth <= 768
  
  // Quality is now controlled from parent component
  
  // Navigation camera positions
  const cameraPositions = {
    home: [2.2, 1.8, 4.8],
    sponsorships: [0.5, 1.5, 1.2], // Different position for desktop - centered but close
    publishing: [0, 2.0, 1.2] // Much closer to publishing objects
  }
  
  // Mobile-optimized camera positions
  const mobileCameraPositions = {
    home: [1.8, 1.5, 3.5],
    sponsorships: [0.5, 1.2, 1.0], // More zoomed in and directly facing the frames
    publishing: [0, 1.8, 1.0] // Much closer to publishing objects
  }
  
  // Add error handling for GLB loading
  useEffect(() => {
    console.log('useGLTF result:', gltf)
    if (gltf && gltf.scene) {
            console.log('GLB scene loaded successfully')
      
      // Notify that model is loaded
      if (onModelLoaded) {
        onModelLoaded()
      }
      
      // Start dramatic zoom-in animation after loading screen ends (only once)
      if (controlsRef.current && !hasPlayedInitialAnimationRef.current) {
        // Wait for loading screen to disappear, then start animation
        setTimeout(() => {
          console.log('Starting initial zoom animation...')
          hasPlayedInitialAnimationRef.current = true
          
          // Set initial far position (high and far away)
          const initialPosition = new THREE.Vector3(0, 25, 30) // Much higher and farther
          const targetPosition = new THREE.Vector3(2.2, 1.8, 4.8) // Final position
          
          console.log('Initial position:', initialPosition)
          console.log('Target position:', targetPosition)
          
          // Set initial camera position
          camera.position.copy(initialPosition)
          controlsRef.current.target.set(0, 1, 0)
          controlsRef.current.update()
          
          console.log('Camera position set to:', camera.position)
          
          // Disable controls during animation
          controlsRef.current.enablePan = false
          controlsRef.current.enableZoom = false
          controlsRef.current.enableRotate = false
          
          // Dramatic zoom-in animation
          const duration = 3000 // 3 seconds
          const startTime = Date.now()
          
          const animateZoomIn = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)
            
            // Custom easing for dramatic effect
            const easeProgress = 1 - Math.pow(1 - progress, 4) // Strong easing
            
            // Interpolate camera position
            camera.position.lerpVectors(initialPosition, targetPosition, easeProgress)
            
            console.log('Animation progress:', progress, 'Camera position:', camera.position)
            
            // Update controls
            controlsRef.current.update()
            
            if (progress < 1) {
              requestAnimationFrame(animateZoomIn)
            } else {
              console.log('Animation complete')
              // Animation complete, re-enable controls
              controlsRef.current.enablePan = true
              controlsRef.current.enableZoom = true
              controlsRef.current.enableRotate = true
              controlsRef.current.update()
            }
          }
          
          // Start animation
          console.log('Starting animation now...')
          animateZoomIn()
        }, 800) // Wait for loading screen fade-out
      } else {
        console.log('Animation skipped - already played or controls not ready')
      }
    } else {
      console.log('GLB scene is null or undefined')
    }
  }, [gltf, camera, controlsRef])

  // Handle camera navigation based on currentView
  useEffect(() => {
    // Skip navigation if initial animation is still playing
    // Also skip navigation for home view to keep camera at TV position
    if (hasPlayedInitialAnimationRef.current && controlsRef.current && cameraPositions[currentView] && currentView !== 'home') {
      const positions = isMobile ? mobileCameraPositions : cameraPositions
      const targetPosition = positions[currentView]
      
      // Temporarily disable controls during animation
      const originalEnabled = {
        pan: controlsRef.current.enablePan,
        zoom: controlsRef.current.enableZoom,
        rotate: controlsRef.current.enableRotate
      }
      
      controlsRef.current.enablePan = false
      controlsRef.current.enableZoom = false
      controlsRef.current.enableRotate = false
      
      // Animate camera to new position
      const animateCamera = () => {
        const currentPos = camera.position
        const targetPos = new THREE.Vector3(...targetPosition)
        
        // Smooth interpolation
        currentPos.lerp(targetPos, 0.03)
        
                  // Update controls target based on view
          if (currentView === 'sponsorships') {
            // Check if it's mobile and adjust target accordingly
            const isMobile = window.innerWidth <= 768
            if (isMobile) {
              // For mobile, target the frames more directly
              controlsRef.current.target.lerp(new THREE.Vector3(0.5, 1.2, 0), 0.03)
            } else {
              // For desktop, target the frames
              controlsRef.current.target.lerp(new THREE.Vector3(0, 1.5, 0), 0.03)
            }
          } else if (currentView === 'publishing') {
            controlsRef.current.target.lerp(new THREE.Vector3(0, 1, 0), 0.03)
        } else {
          controlsRef.current.target.lerp(new THREE.Vector3(0, 1, 0), 0.03)
        }
        
        controlsRef.current.update()
        
        // Continue animation if not close enough
        if (currentPos.distanceTo(targetPos) > 0.1) {
          requestAnimationFrame(animateCamera)
        } else {
          // Re-enable controls after animation completes
          controlsRef.current.enablePan = originalEnabled.pan
          controlsRef.current.enableZoom = originalEnabled.zoom
          controlsRef.current.enableRotate = originalEnabled.rotate
          controlsRef.current.update()
        }
      }
      
      animateCamera()
    }
  }, [currentView, controlsRef, camera])
  
  // Handle home navigation with TV zoom effect (only when explicitly triggered)
  useEffect(() => {
    if (currentView === 'home' && shouldTriggerHomeAnimation && hasPlayedInitialAnimationRef.current) {
      // Only trigger TV zoom animation when home button is explicitly clicked
      animateToTVScreen()
      setShouldTriggerHomeAnimation(false) // Reset the flag
    }
  }, [currentView, shouldTriggerHomeAnimation])
  
  // Set flag when home button is clicked
  useEffect(() => {
    if (onNavigateToHome && currentView === 'home') {
      setShouldTriggerHomeAnimation(true)
    }
  }, [onNavigateToHome, currentView])
  
  // Prevent camera navigation when home view is active (to keep camera at TV position)
  useEffect(() => {
    if (currentView === 'home' && hasPlayedInitialAnimationRef.current) {
      // Disable automatic camera navigation for home view
      // This keeps the camera at the TV position after zoom animation
    }
  }, [currentView])

  // Handle publishing view with interactive guides
  useEffect(() => {
    if (currentView === 'publishing' && gltf && gltf.scene) {
      // Find publishing objects and show guides
      const publishingMeshes = []
      gltf.scene.traverse(o => {
        if (o.isMesh && o.userData && o.userData.type === 'publishing') {
          publishingMeshes.push(o)
        }
      })
      
      if (publishingMeshes.length > 0) {
        setPublishingObjects(publishingMeshes)
        setShowPublishingGuides(true)
        
        // Hide guides after 8 seconds
        setTimeout(() => {
          setShowPublishingGuides(false)
        }, 8000)
      }
    } else {
      setShowPublishingGuides(false)
    }
    }, [currentView, gltf])

  // Animate publishing guides
  useFrame((state) => {
    if (showPublishingGuides && publishingObjects.length > 0) {
      // Animate arrows floating up and down
      publishingObjects.forEach((obj, index) => {
        const guideGroup = state.scene.getObjectByName(`guide-${index}`)
        if (guideGroup) {
          // Floating animation - very subtle movement for tiny arrows
          guideGroup.position.y = obj.position.y + 0.2 + Math.sin(state.clock.elapsedTime * 2 + index) * 0.02
          
          // Rotation animation for arrows - slower for smaller arrows
          const arrow = guideGroup.children[0]
          if (arrow) {
            arrow.rotation.y = state.clock.elapsedTime * 0.2
          }
          
          // Pulsing animation for rings - very subtle scale change
          const ring = guideGroup.children[2]
          if (ring) {
            const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1
            ring.scale.setScalar(scale)
          }
        }
      })
    }
  })

  // Find and configure frame meshes + setup shadows and PBR
  useEffect(() => {
    if (gltf && gltf.scene) {
      console.log('GLB scene loaded successfully')
      
      // Setup shadows and PBR for all meshes - enhanced for modern HDR look
      gltf.scene.traverse(o => {
        if (o.isMesh) {
          // Debug: Log all mesh names to find carpet and bag
          console.log('Mesh found:', o.name)
          
          // Hide carpet and bag objects
          if (o.name.toLowerCase().includes('carpet') || 
              o.name.toLowerCase().includes('bag') ||
              o.name.toLowerCase().includes('rug') ||
              o.name.toLowerCase().includes('mat') ||
              o.name.toLowerCase().includes('taschen') ||
              o.name.toLowerCase().includes('tasche') ||
              o.name.toLowerCase().includes('backpack') ||
              o.name.toLowerCase().includes('rucksack') ||
              o.name.toLowerCase().includes('sack') ||
              o.name.toLowerCase().includes('pouch') ||
              o.name.toLowerCase().includes('handbag') ||
              o.name.toLowerCase().includes('purse') ||
              o.name.toLowerCase().includes('briefcase') ||
              o.name.toLowerCase().includes('luggage') ||
              o.name.toLowerCase().includes('suitcase') ||
              o.name.toLowerCase().includes('bag') ||
              o.name.toLowerCase().includes('bag_') ||
              o.name.toLowerCase().includes('_bag') ||
              o.name.toLowerCase().includes('bag01') ||
              o.name.toLowerCase().includes('bag02') ||
              o.name.toLowerCase().includes('bag1') ||
              o.name.toLowerCase().includes('bag2') ||
              o.name.toLowerCase().includes('bag3') ||
              o.name.toLowerCase().includes('bag4') ||
              o.name.toLowerCase().includes('bag5') ||
              // Also hide objects that are positioned like bags (on floor, away from walls)
              (o.position.y < 0.5 && Math.abs(o.position.x) > 1 && Math.abs(o.position.z) > 1 && 
               !o.name.toLowerCase().includes('frame') && 
               !o.name.toLowerCase().includes('publishing') && 
               !o.name.toLowerCase().includes('tv') && 
               !o.name.toLowerCase().includes('laptop') && 
               !o.name.toLowerCase().includes('chair') && 
               !o.name.toLowerCase().includes('table') && 
               !o.name.toLowerCase().includes('wall') && 
               !o.name.toLowerCase().includes('floor') && 
               !o.name.toLowerCase().includes('ceiling'))) {
            console.log('Hiding object:', o.name, 'at position:', o.position)
            o.visible = false
            return
          }
          
          // Ensure all meshes cast and receive shadows
          o.castShadow = true
          o.receiveShadow = true
          
          // Enhanced shadow settings for modern quality
          if (o.material) {
            o.material.shadowSide = THREE.FrontSide
            
            // Enhanced shadow bias for modern look
            o.material.shadowBias = -0.0001
            o.material.shadowNormalBias = 0.02
            
            // Model optimization based on quality setting
            if (modelQuality === 'low') {
              // Disable expensive features for low quality
              o.material.envMapIntensity = 0
              o.material.roughness = 0.8
              o.material.metalness = 0.1
              
              // Reduce texture quality
              if (o.material.map) {
                o.material.map.minFilter = THREE.LinearFilter
                o.material.map.magFilter = THREE.LinearFilter
                o.material.map.generateMipmaps = false
              }
            } else if (modelQuality === 'medium') {
              // Moderate quality settings
              o.material.envMapIntensity = 0.05
              o.material.roughness = 0.7
              o.material.metalness = 0.2
            }
            
            // Geometry optimization for low-end devices
            if (modelQuality === 'low' && o.geometry) {
              // Remove expensive attributes
              if (o.geometry.attributes.tangent) {
                o.geometry.deleteAttribute('tangent')
              }
              if (o.geometry.attributes.uv2) {
                o.geometry.deleteAttribute('uv2')
              }
            }
          }
          
                      // Ultra-realistic PBR material settings
            if (o.material) {
              // Environment map intensity for ultra-realism
              if (o.material.envMapIntensity !== undefined) {
                o.material.envMapIntensity = 0.12 // Enhanced for ultra-realism
              }
              
              // Ensure ultra-realistic roughness values
              if (o.material.roughness !== undefined) {
                if (o.material.roughness < 0.4) o.material.roughness = 0.82 // Ultra-realistic matte
                if (o.material.roughness > 0.6) o.material.roughness = 0.92 // High quality realistic matte
              }
              
              // Ensure ultra-realistic metalness values
              if (o.material.metalness !== undefined) {
                if (o.material.metalness > 0.3) o.material.metalness = 0.12 // Ultra-realistic metallic
              }
              
              // Enhanced material properties for realism
              if (o.material.ior !== undefined) {
                o.material.ior = 1.5 // Realistic index of refraction
              }
              
              // Better normal mapping for surface detail
              if (o.material.normalMap) {
                o.material.normalScale.set(1, 1)
              }
              
              // Enhanced clearcoat for realistic surfaces
              if (o.material.clearcoat !== undefined) {
                o.material.clearcoat = 0.1
                o.material.clearcoatRoughness = 0.1
              }
            
            // Set proper color space for all textures
            ;['map','emissiveMap','metalnessMap','roughnessMap','normalMap','aoMap'].forEach(k=>{
              if (o.material?.[k]?.isTexture) {
                o.material[k].colorSpace = THREE.SRGBColorSpace
              }
            })
            
            // Ensure materials are shadow-compatible and updated
            o.material.needsUpdate = true
            o.material.transparent = false // Ensure proper shadow casting
          }
        }
      })
      
      // Find frame meshes and make them interactive
      for (let i = 1; i <= 5; i++) {
        const frameMesh = gltf.scene.getObjectByName(`Frame${i}`)
        if (frameMesh) {
          console.log(`Found Frame${i}`)
          frameMesh.userData = { frameIndex: i - 1, type: 'frame' }
          
          // Make the mesh interactive
          frameMesh.userData.isInteractive = true
          
          // Store the frame mesh reference
          frameMesh.userData.mesh = frameMesh
          
          // Create clean material without color overlays
          const material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0xffffff), // White base color
            transparent: true,
            opacity: 0.95,
            metalness: 0.01,
            roughness: 0.98,
            emissive: new THREE.Color(0x000000), // No emissive color
            emissiveIntensity: 0
          })
          
          // Apply texture to Frame1
          if (i === 1) { // Frame1
            material.map = frame1Texture
            material.map.colorSpace = THREE.SRGBColorSpace
            material.map.rotation = Math.PI / 2 // Rotate 90 degrees
            material.map.center.set(0.5, 0.5) // Set rotation center
            material.color.setHex(0xffffff) // Remove green overlay - use white
            material.needsUpdate = true
          }
          // Apply texture to Frame2
          else if (i === 2) { // Frame2
            material.map = frame2Texture
            material.map.colorSpace = THREE.SRGBColorSpace
            material.map.rotation = Math.PI / 2 // Rotate 90 degrees
            material.map.center.set(0.5, 0.5) // Set rotation center
            material.color.setHex(0xffffff) // Remove green overlay - use white
            material.needsUpdate = true
          }
          // Apply texture to Frame3
          else if (i === 3) { // Frame3
            material.map = frame3Texture
            material.map.colorSpace = THREE.SRGBColorSpace
            material.map.rotation = Math.PI / 2 // Rotate 90 degrees
            material.map.center.set(0.5, 0.5) // Set rotation center
            material.map.repeat.set(0.8, 0.8) // Zoom out by scaling down
            material.color.setHex(0xffffff) // Remove green overlay - use white
            material.needsUpdate = true
          }
          // Apply texture to Frame4
          else if (i === 4) { // Frame4
            material.map = frame4Texture
            material.map.colorSpace = THREE.SRGBColorSpace
            material.map.rotation = Math.PI / 2 // Rotate 90 degrees
            material.map.center.set(0.5, 0.5) // Set rotation center
            material.color.setHex(0xffffff) // Remove green overlay - use white
            material.needsUpdate = true
          }
          // Apply texture to Frame5
          else if (i === 5) { // Frame5
            material.map = frame5Texture
            material.map.colorSpace = THREE.SRGBColorSpace
            material.map.rotation = Math.PI / 2 // Rotate 90 degrees
            material.map.center.set(0.5, 0.5) // Set rotation center
            material.color.setHex(0xffffff) // Remove green overlay - use white
            material.needsUpdate = true
          }
          frameMesh.material = material
          
          // Store original material properties for hover effects
          frameMesh.userData.originalMaterial = {
            emissiveIntensity: material.emissiveIntensity,
            scale: frameMesh.scale.clone(),
            opacity: material.opacity
          }
          
          // Ensure frame casts shadows
          frameMesh.castShadow = true
          frameMesh.receiveShadow = true
        }
      }
      
      // Find publishing meshes and make them interactive
      for (let i = 1; i <= 4; i++) {
        const publishingMesh = gltf.scene.getObjectByName(`Publishing${i}`)
        if (publishingMesh) {
          // Hide Publishing3 and Publishing4
          if (i === 3 || i === 4) {
            publishingMesh.visible = false
            continue
          }
          
          console.log(`Found Publishing${i}`)
          publishingMesh.userData = { publishingIndex: i - 1, type: 'publishing' }
          
          // Make the mesh interactive
          publishingMesh.userData.isInteractive = true
          
          // Store the publishing mesh reference
          publishingMesh.userData.mesh = publishingMesh
          
          let material
          
          // Apply texture to Publishing1 (Immomedien)
          if (i === 1) {
            // Rotate the texture by 270 degrees (-π/2 radians)
            publishing1Texture.rotation = -Math.PI / 2
            publishing1Texture.center.set(0.5, 0.5)
            
            material = new THREE.MeshStandardMaterial({
              map: publishing1Texture,
              transparent: true,
              opacity: 0.95,
              metalness: 0.01,
              roughness: 0.98,
              emissive: new THREE.Color().setHSL(4 / 7, 0.6, 0.15),
              emissiveIntensity: 0.18
            })
            publishingMesh.material = material
          }
          // Apply texture to Publishing2 (Panoptikum)
          else if (i === 2) {
            // Rotate the texture by 270 degrees (-π/2 radians)
            publishing2Texture.rotation = -Math.PI / 2
            publishing2Texture.center.set(0.5, 0.5)
            
            material = new THREE.MeshStandardMaterial({
              map: publishing2Texture,
              transparent: true,
              opacity: 0.95,
              metalness: 0.01,
              roughness: 0.98,
              emissive: new THREE.Color().setHSL(5 / 7, 0.6, 0.15),
              emissiveIntensity: 0.18
            })
            publishingMesh.material = material
          }
          
          // Store original material properties for hover effects
          publishingMesh.userData.originalMaterial = {
            emissiveIntensity: material.emissiveIntensity,
            scale: publishingMesh.scale.clone(),
            opacity: material.opacity
          }
          
          // Ensure publishing object casts shadows
          publishingMesh.castShadow = true
          publishingMesh.receiveShadow = true
        }
      }
      
      // Debug: List all mesh names to find screens
      console.log('=== Available mesh names in the new model ===')
      gltf.scene.traverse((object) => {
        if (object.isMesh) {
          console.log('Mesh found:', object.name)
        }
      })
      console.log('=== End mesh names ===')
      
      // Find TV screen and apply random color
      const tvScreen = gltf.scene.getObjectByName('Televizija')
      if (tvScreen) {
        console.log('Found TV screen, applying random color')
        
        // Generate a random color
        const randomColor = new THREE.Color().setHSL(Math.random(), 0.7, 0.5)
        
                  // Create ultra-realistic material with random color
          const tvMaterial = new THREE.MeshStandardMaterial({
            color: randomColor,
            emissive: randomColor.clone().multiplyScalar(0.4), // Enhanced glow
            emissiveIntensity: 0.25,
            metalness: 0.15,
            roughness: 0.75,
            clearcoat: 0.2,
            clearcoatRoughness: 0.1,
            ior: 1.6, // Realistic glass-like properties
            transmission: 0.1, // Slight transparency for screen effect
            thickness: 0.5
          })
        
        // Apply material to TV screen
        tvScreen.material = tvMaterial
        
        // Ensure TV screen casts and receives shadows
        tvScreen.castShadow = true
        tvScreen.receiveShadow = true
        
        console.log('TV screen random color applied successfully')
      } else {
        console.log('TV screen mesh not found - trying alternative names')
        
        // Try alternative TV screen names
        const alternativeNames = ['tvScreen', 'TVScreen', 'TV', 'Screen', 'tv', 'screen', 'monitor', 'display', 'Televizija']
        let foundTV = null
        
        for (const name of alternativeNames) {
          foundTV = gltf.scene.getObjectByName(name)
          if (foundTV) {
            console.log(`Found TV screen with name: ${name}`)
            break
          }
        }
        
        if (foundTV) {
          // Apply the random color to the found TV screen
          const randomColor = new THREE.Color().setHSL(Math.random(), 0.7, 0.5)
          
          const tvMaterial = new THREE.MeshStandardMaterial({
            color: randomColor,
            emissive: randomColor.clone().multiplyScalar(0.3),
            emissiveIntensity: 0.2,
            metalness: 0.1,
            roughness: 0.8
          })
          
          foundTV.material = tvMaterial
          foundTV.castShadow = true
          foundTV.receiveShadow = true
          
          console.log('Applied random color to TV screen')
        } else {
          console.log('No TV screen found with any common names')
        }
      }
      
      // Find laptop screen and apply random color
      const laptopScreen = gltf.scene.getObjectByName('laptopScreen')
      if (laptopScreen) {
        console.log('Found laptop screen, applying random color')
        
        // Generate a different random color for laptop
        const randomColor = new THREE.Color().setHSL(Math.random(), 0.6, 0.6)
        
        const laptopMaterial = new THREE.MeshStandardMaterial({
          color: randomColor,
          emissive: randomColor.clone().multiplyScalar(0.4),
          emissiveIntensity: 0.3,
          metalness: 0.05,
          roughness: 0.7
        })
        
        laptopScreen.material = laptopMaterial
        laptopScreen.castShadow = true
        laptopScreen.receiveShadow = true
        
        console.log('Laptop screen random color applied successfully')
      } else {
        console.log('Laptop screen not found - trying alternative names')
        
        // Try alternative laptop screen names
        const laptopNames = ['laptop', 'Laptop', 'computer', 'Computer', 'screen', 'Screen', 'display', 'Display']
        let foundLaptop = null
        
        for (const name of laptopNames) {
          foundLaptop = gltf.scene.getObjectByName(name)
          if (foundLaptop) {
            console.log(`Found laptop screen with name: ${name}`)
            break
          }
        }
        
        if (foundLaptop) {
          const randomColor = new THREE.Color().setHSL(Math.random(), 0.6, 0.6)
          
          const laptopMaterial = new THREE.MeshStandardMaterial({
            color: randomColor,
            emissive: randomColor.clone().multiplyScalar(0.5),
            emissiveIntensity: 0.35,
            metalness: 0.08,
            roughness: 0.65,
            clearcoat: 0.3,
            clearcoatRoughness: 0.05,
            ior: 1.7, // Realistic glass properties
            transmission: 0.15, // Enhanced transparency
            thickness: 0.3
          })
          
          foundLaptop.material = laptopMaterial
          foundLaptop.castShadow = true
          foundLaptop.receiveShadow = true
          
          console.log('Applied random color to laptop screen')
        } else {
          console.log('No laptop screen found with any common names')
        }
      }
      
          } else {
        console.log('GLB scene is loading...')
      }
      
      // Debug: Verify all meshes have shadows enabled
      if (gltf && gltf.scene) {
        let shadowCount = 0
        gltf.scene.traverse((object) => {
          if (object.isMesh) {
            if (object.castShadow && object.receiveShadow) {
              shadowCount++
            } else {
              console.log('Mesh without shadows:', object.name)
            }
          }
        })
        console.log(`✅ ${shadowCount} meshes have shadows enabled`)
      }
    }, [gltf])
  

  
  // Performance monitoring
  useEffect(() => {
    if (gltf && gltf.scene) {
      let totalVertices = 0
      let totalFaces = 0
      
      gltf.scene.traverse((object) => {
        if (object.isMesh && object.geometry) {
          totalVertices += object.geometry.attributes.position.count
          if (object.geometry.index) {
            totalFaces += object.geometry.index.count / 3
          }
        }
      })
      
      console.log(`Model stats - Vertices: ${totalVertices.toLocaleString()}, Faces: ${totalFaces.toLocaleString()}`)
      console.log(`Quality setting: ${modelQuality}`)
    }
  }, [gltf, modelQuality])
  
  // Camera animation function for frames
  const animateToFrame = (frameMesh) => {
    if (!frameMesh || !controlsRef.current) return
    
    // Get the frame's world position
    const framePosition = new THREE.Vector3()
    frameMesh.getWorldPosition(framePosition)
    
    // Calculate target camera position (slightly offset from frame)
    const offset = new THREE.Vector3(0, 0, 2) // 2 units away from frame
    const targetPosition = framePosition.clone().add(offset)
    
    // Store original camera position
    const originalPosition = camera.position.clone()
    const originalTarget = controlsRef.current.target.clone()
    
    // Animate camera to frame
    const duration = 1000 // 1 second
    const startTime = Date.now()
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Smooth easing
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      
      // Interpolate camera position
      camera.position.lerpVectors(originalPosition, targetPosition, easeProgress)
      
      // Interpolate controls target
      controlsRef.current.target.lerpVectors(originalTarget, framePosition, easeProgress)
      controlsRef.current.update()
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        // Animation complete, open modal after a short delay
        setTimeout(() => {
          const frameIndex = frameMesh.userData.frameIndex
          onOpenFrame(frameIndex)
        }, 500)
      }
    }
    
    animate()
  }
  
  // Camera animation function for publishing objects
  const animateToPublishing = (publishingMesh) => {
    if (!publishingMesh || !controlsRef.current) return
    
    // Get the publishing object's world position
    const publishingPosition = new THREE.Vector3()
    publishingMesh.getWorldPosition(publishingPosition)
    
    // Calculate target camera position (from above the publishing object)
    const offset = new THREE.Vector3(0, 2, 1) // 2 units above, 1 unit back from publishing object
    const targetPosition = publishingPosition.clone().add(offset)
    
    // Store original camera position
    const originalPosition = camera.position.clone()
    const originalTarget = controlsRef.current.target.clone()
    
    // Animate camera to publishing object
    const duration = 1000 // 1 second
    const startTime = Date.now()
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Smooth easing
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      
      // Interpolate camera position
      camera.position.lerpVectors(originalPosition, targetPosition, easeProgress)
      
      // Interpolate controls target
      controlsRef.current.target.lerpVectors(originalTarget, publishingPosition, easeProgress)
      controlsRef.current.update()
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        // Animation complete, open modal after a short delay
        setTimeout(() => {
          const publishingIndex = publishingMesh.userData.publishingIndex
          onOpenPublishing(publishingIndex)
        }, 500)
      }
    }
    
    animate()
  }
  
  // Camera animation function for TV screen zoom and redirect
  const animateToTVScreen = () => {
    if (!controlsRef.current) return
    
    // Find the TV screen mesh
    const tvScreen = gltf.scene.getObjectByName('Televizija')
    if (!tvScreen) {
      console.log('TV screen not found, redirecting directly')
      window.open('https://revide.at', '_blank')
      return
    }
    
    console.log('Found TV screen, starting zoom animation')
    
    // Get the TV screen's world position
    const tvPosition = new THREE.Vector3()
    tvScreen.getWorldPosition(tvPosition)
    
    // Calculate target camera position (directly in front of the TV screen)
    // Since TV is on the left wall, we need to position camera perpendicular to the wall
    const offset = new THREE.Vector3(2, 0, 0) // 2 units directly in front of TV screen (perpendicular to left wall)
    const targetPosition = tvPosition.clone().add(offset)
    
    // Store original camera position
    const originalPosition = camera.position.clone()
    const originalTarget = controlsRef.current.target.clone()
    
    // Disable controls during animation
    controlsRef.current.enablePan = false
    controlsRef.current.enableZoom = false
    controlsRef.current.enableRotate = false
    
    // Animate camera to TV screen
    const duration = 2000 // 2 seconds for dramatic effect
    const startTime = Date.now()
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Smooth easing with dramatic effect
      const easeProgress = 1 - Math.pow(1 - progress, 4)
      
      // Interpolate camera position
      camera.position.lerpVectors(originalPosition, targetPosition, easeProgress)
      
      // Interpolate controls target to TV screen
      controlsRef.current.target.lerpVectors(originalTarget, tvPosition, easeProgress)
      controlsRef.current.update()
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        // Animation complete, redirect to revide.at immediately
        console.log('TV zoom animation complete, redirecting to revide.at')
        window.open('https://revide.at', '_blank')
        
        // Re-enable controls
        controlsRef.current.enablePan = true
        controlsRef.current.enableZoom = true
        controlsRef.current.enableRotate = true
        controlsRef.current.update()
      }
    }
    
    animate()
  }
  
  // Event handlers are now handled directly on the primitive
  
  return (
    <>
      {/* GLB Model */}
      {gltf && gltf.scene && (
        <primitive 
          object={gltf.scene} 
          onPointerDown={(event) => {
            event.stopPropagation()
            const mesh = event.object
            
            // Check if the clicked object is an interactive frame
            if (mesh.userData && mesh.userData.isInteractive && mesh.userData.type === 'frame') {
              console.log(`Clicked on Frame${mesh.userData.frameIndex + 1}`)
              animateToFrame(mesh)
            }
            
            // Check if the clicked object is an interactive publishing object
            if (mesh.userData && mesh.userData.isInteractive && mesh.userData.type === 'publishing') {
              console.log(`Clicked on Publishing${mesh.userData.publishingIndex + 1}`)
              animateToPublishing(mesh)
            }
          }}
          onPointerOver={(event) => {
            event.stopPropagation()
            const mesh = event.object
            
            // Change cursor for interactive frames
            if (mesh.userData && mesh.userData.isInteractive) {
              document.body.style.cursor = 'pointer'
              
              // Hover effects
              if (mesh.material && mesh.userData.originalMaterial) {
                // Increase emissive intensity
                mesh.material.emissiveIntensity = mesh.userData.originalMaterial.emissiveIntensity * 2
                
                // No scale change for frames (same as publishing)
                // mesh.scale.setScalar(1.01)
                
                // Increase opacity slightly
                mesh.material.opacity = Math.min(mesh.userData.originalMaterial.opacity * 1.1, 1)
                
                mesh.material.needsUpdate = true
              }
            }
          }}
          onPointerOut={(event) => {
            event.stopPropagation()
            const mesh = event.object
            
            // Reset cursor
            document.body.style.cursor = 'auto'
            
            // Reset hover effects
            if (mesh.userData && mesh.userData.isInteractive && mesh.userData.originalMaterial) {
              // Restore original emissive intensity
              mesh.material.emissiveIntensity = mesh.userData.originalMaterial.emissiveIntensity
              
              // No scale to restore (same as publishing)
              // mesh.scale.copy(mesh.userData.originalMaterial.scale)
              
              // Restore original opacity
              mesh.material.opacity = mesh.userData.originalMaterial.opacity
              
              mesh.material.needsUpdate = true
            }
          }}
        />
              )}

        {/* Frame1 Text Label */}
        {gltf && gltf.scene && (() => {
          const frame1 = gltf.scene.getObjectByName('Frame1')
          if (frame1) {
            const textPosition = frame1.position.clone()
            textPosition.y -= 0.15 // Position text very close to the frame
            return (
              <Text
                position={textPosition}
                fontSize={0.03}
                color="#BCA375"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.005}
                outlineColor="#000000"
              >
                First Vienna
              </Text>
            )
          }
          return null
        })()}

        {/* Frame2 Text Label */}
        {gltf && gltf.scene && (() => {
          const frame2 = gltf.scene.getObjectByName('Frame2')
          if (frame2) {
            const textPosition = frame2.position.clone()
            textPosition.y -= 0.15 // Position text very close to the frame
            return (
              <Text
                position={textPosition}
                fontSize={0.03}
                color="#BCA375"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.005}
                outlineColor="#000000"
              >
                XCC
              </Text>
            )
          }
          return null
        })()}

        {/* Frame3 Text Label */}
        {gltf && gltf.scene && (() => {
          const frame3 = gltf.scene.getObjectByName('Frame3')
          if (frame3) {
            const textPosition = frame3.position.clone()
            textPosition.y -= 0.15 // Position text very close to the frame
            return (
              <Text
                position={textPosition}
                fontSize={0.03}
                color="#BCA375"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.005}
                outlineColor="#000000"
              >
                Asia Wien
              </Text>
            )
          }
          return null
        })()}

        {/* Frame4 Text Label */}
        {gltf && gltf.scene && (() => {
          const frame4 = gltf.scene.getObjectByName('Frame4')
          if (frame4) {
            const textPosition = frame4.position.clone()
            textPosition.y -= 0.15 // Position text very close to the frame
            return (
              <Text
                position={textPosition}
                fontSize={0.03}
                color="#BCA375"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.005}
                outlineColor="#000000"
              >
                RV Bauplatz
              </Text>
            )
          }
          return null
        })()}

        {/* Frame5 Text Label */}
        {gltf && gltf.scene && (() => {
          const frame5 = gltf.scene.getObjectByName('Frame5')
          if (frame5) {
            const textPosition = frame5.position.clone()
            textPosition.y -= 0.15 // Position text very close to the frame
            return (
              <Text
                position={textPosition}
                fontSize={0.03}
                color="#BCA375"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.005}
                outlineColor="#000000"
              >
                Illyrian Brains
              </Text>
            )
          }
          return null
        })()}
        
        {/* Interactive Publishing Guides */}
      {showPublishingGuides && publishingObjects.map((obj, index) => {
        const position = new THREE.Vector3()
        obj.getWorldPosition(position)
        
        return (
          <group key={`guide-${index}`} name={`guide-${index}`} position={position}>
            {/* Animated Arrow - Extremely small and upside down, positioned above object */}
            <mesh position={[0, 0.25, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.015, 0.04, 8]} />
              <meshStandardMaterial 
                color="#BCA375" 
                emissive="#BCA375"
                emissiveIntensity={0.8}
                transparent
                opacity={0.9}
              />
            </mesh>
            
            {/* Arrow Shaft - Extremely thin and short */}
            <mesh position={[0, 0.2, 0]}>
              <cylinderGeometry args={[0.004, 0.004, 0.06]} />
              <meshStandardMaterial 
                color="#BCA375" 
                emissive="#BCA375"
                emissiveIntensity={0.6}
                transparent
                opacity={0.9}
              />
            </mesh>
            
            {/* Click Animation Ring - Extremely small and close */}
            <mesh position={[0, 0.08, 0]}>
              <ringGeometry args={[0.04, 0.06, 8]} />
              <meshStandardMaterial 
                color="#BCA375" 
                emissive="#BCA375"
                emissiveIntensity={0.4}
                transparent
                opacity={0.8}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        )
      })}
    </>
  )
}

export default Room
