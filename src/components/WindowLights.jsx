import React, { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js'
import * as THREE from 'three'

const WindowLights = () => {
  const { scene } = useThree()
  const light1Ref = useRef()
  const light2Ref = useRef()
  const window1Ref = useRef()
  const window2Ref = useRef()

  // Window light configurations - enhanced for high contrast
  const windowConfigs = [
    {
      position: [1.6, 1.2, -2.2], // Right window - positioned behind diffuser
      rotation: [0, Math.PI, 0], // Facing inward
      size: [1.2, 1.6], // Larger for more diffused light
      intensity: 8, // Reduced for better contrast
      color: '#ffffff', // Pure white for maximum contrast
      emissiveColor: '#ffffff'
    },
    {
      position: [-0.5, 1.3, -2.3], // Left window - positioned behind diffuser
      rotation: [0, Math.PI, 0], // Facing inward
      size: [1.2, 1.6], // Larger for more diffused light
      intensity: 8, // Reduced for better contrast
      color: '#ffffff', // Pure white for maximum contrast
      emissiveColor: '#ffffff'
    }
  ]
  
  // Lamp light configuration - enhanced for high contrast
  const lampConfig = {
    position: [0.4, 0.8, 2.1], // Position from GUI
    intensity: 4, // Reduced for better contrast
    color: '#ffd700', // Brighter golden light for contrast
    distance: 2.5, // Tighter falloff for focused glow
    decay: 2.5 // Stronger decay for dramatic falloff
  }
  


  useEffect(() => {
          // Create window plane meshes (visual representation)
      windowConfigs.forEach((config, index) => {
        const windowGeometry = new THREE.PlaneGeometry(config.size[0], config.size[1])
        const windowMaterial = new THREE.MeshStandardMaterial({
          color: config.emissiveColor,
          emissive: config.emissiveColor,
          emissiveIntensity: 0.5, // Increased glow intensity
          transparent: true,
          opacity: 0, // Completely invisible
          side: THREE.DoubleSide
        })

        const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial)
        windowMesh.position.set(...config.position)
        windowMesh.rotation.set(...config.rotation)
        windowMesh.name = `Window${index + 1}`
        
        if (index === 0) {
          window1Ref.current = windowMesh
        } else {
          window2Ref.current = windowMesh
        }
        
        scene.add(windowMesh)
      })

    // Create RectAreaLights
    windowConfigs.forEach((config, index) => {
      const light = new THREE.RectAreaLight(
        config.color,
        config.intensity,
        config.size[0],
        config.size[1]
      )
      
      light.position.set(...config.position)
      light.rotation.set(...config.rotation)
      light.name = `WindowLight${index + 1}`
      
      if (index === 0) {
        light1Ref.current = light
      } else {
        light2Ref.current = light
      }
      
      scene.add(light)
      
      // Add directional light for shadows (RectAreaLight doesn't cast shadows)
      const shadowLight = new THREE.DirectionalLight(config.color, config.intensity * 0.6)
      shadowLight.position.set(...config.position)
      shadowLight.rotation.set(...config.rotation)
      shadowLight.castShadow = true
      shadowLight.shadow.mapSize.width = 2048
      shadowLight.shadow.mapSize.height = 2048
      shadowLight.shadow.camera.near = 0.1
      shadowLight.shadow.camera.far = 8
      shadowLight.shadow.camera.left = -3
      shadowLight.shadow.camera.right = 3
      shadowLight.shadow.camera.top = 3
      shadowLight.shadow.camera.bottom = -3
      shadowLight.shadow.bias = -0.003
      shadowLight.shadow.normalBias = 0.1
      shadowLight.shadow.radius = 1.5
      shadowLight.name = `WindowShadowLight${index + 1}`
      scene.add(shadowLight)
    })

    // Create lamp light (point light for circular illumination)
    const lampLight = new THREE.PointLight(
      lampConfig.color,
      lampConfig.intensity,
      lampConfig.distance,
      lampConfig.decay
    )
    lampLight.position.set(...lampConfig.position)
    lampLight.castShadow = true
    lampLight.shadow.mapSize.width = 2048
    lampLight.shadow.mapSize.height = 2048
    lampLight.shadow.camera.near = 0.1
    lampLight.shadow.camera.far = 8
    lampLight.shadow.camera.left = -3
    lampLight.shadow.camera.right = 3
    lampLight.shadow.camera.top = 3
    lampLight.shadow.camera.bottom = -3
    lampLight.shadow.bias = -0.003
    lampLight.shadow.normalBias = 0.1
    lampLight.shadow.radius = 1.5
    lampLight.name = 'LampLight'
    scene.add(lampLight)

    // Create lamp visual representation (small glowing sphere)
    const lampGeometry = new THREE.SphereGeometry(0.1, 16, 16)
    const lampMaterial = new THREE.MeshStandardMaterial({
      color: lampConfig.color,
      emissive: lampConfig.color,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0 // Completely invisible
    })
    const lampMesh = new THREE.Mesh(lampGeometry, lampMaterial)
    lampMesh.position.set(...lampConfig.position)
    lampMesh.name = 'Lamp'
    scene.add(lampMesh)


    


    // Setup shadow casting for all meshes in the scene
    scene.traverse((object) => {
      if (object.isMesh) {
        object.castShadow = true
        object.receiveShadow = true
        
        // Ensure materials are shadow-compatible
        if (object.material) {
          object.material.needsUpdate = true
        }
      }
    })

    return () => {
      // Cleanup
      if (window1Ref.current) scene.remove(window1Ref.current)
      if (window2Ref.current) scene.remove(window2Ref.current)
      if (light1Ref.current) scene.remove(light1Ref.current)
      if (light2Ref.current) scene.remove(light2Ref.current)
      
      // Cleanup shadow lights
      const shadowLight1 = scene.getObjectByName('WindowShadowLight1')
      if (shadowLight1) scene.remove(shadowLight1)
      const shadowLight2 = scene.getObjectByName('WindowShadowLight2')
      if (shadowLight2) scene.remove(shadowLight2)
      
      // Cleanup lamp
      const lampLight = scene.getObjectByName('LampLight')
      if (lampLight) scene.remove(lampLight)
      const lamp = scene.getObjectByName('Lamp')
      if (lamp) scene.remove(lamp)
      

      

    }
  }, [scene])

  useFrame(() => {
    // Helpers update automatically, no need to call update()
    // The useFrame is kept for potential future updates
  })

  return null
}

export default WindowLights
