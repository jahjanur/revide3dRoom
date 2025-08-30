
import React, { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import GUI from 'lil-gui'

const LightController = () => {
  const { scene } = useThree()
  const guiRef = useRef()
  const light1Ref = useRef()
  const light2Ref = useRef()
  const window1Ref = useRef()
  const window2Ref = useRef()
  const lampLightRef = useRef()
  const lampRef = useRef()
  const cornerLightRef = useRef()
  const cornerMeshRef = useRef()

  useEffect(() => {
    // Initialize GUI
    guiRef.current = new GUI({ title: 'Window Lights Control' })
    
    // Find lights and windows in scene
    scene.traverse((object) => {
      if (object.type === 'RectAreaLight') {
        if (object.name === 'WindowLight1' || !light1Ref.current) {
          light1Ref.current = object
        } else {
          light2Ref.current = object
        }
      }
      if (object.name === 'Window1') {
        window1Ref.current = object
      }
      if (object.name === 'Window2') {
        window2Ref.current = object
      }
      if (object.name === 'LampLight') {
        lampLightRef.current = object
      }
      if (object.name === 'Lamp') {
        lampRef.current = object
      }
      if (object.name === 'CornerLight' && object.type === 'PointLight') {
        cornerLightRef.current = object
      }
      if (object.name === 'CornerLight' && object.type === 'Mesh') {
        cornerMeshRef.current = object
      }
    })

    // Create GUI controls
    if (light1Ref.current) {
      const light1Folder = guiRef.current.addFolder('Window Light 1')
      
      light1Folder.add(light1Ref.current, 'intensity', 0, 50, 0.1).name('Intensity')
      light1Folder.add(light1Ref.current.position, 'x', -10, 10, 0.1).name('Position X')
      light1Folder.add(light1Ref.current.position, 'y', 0, 10, 0.1).name('Position Y')
      light1Folder.add(light1Ref.current.position, 'z', -10, 10, 0.1).name('Position Z')
      light1Folder.add(light1Ref.current.rotation, 'y', -Math.PI, Math.PI, 0.1).name('Rotation Y')
      
      const color1 = light1Ref.current.color
      light1Folder.addColor({ color: `#${color1.getHexString()}` }, 'color')
        .onChange((value) => {
          light1Ref.current.color.setHex(value.replace('#', '0x'))
        })
        .name('Color')
    }

    if (light2Ref.current) {
      const light2Folder = guiRef.current.addFolder('Window Light 2')
      
      light2Folder.add(light2Ref.current, 'intensity', 0, 50, 0.1).name('Intensity')
      light2Folder.add(light2Ref.current.position, 'x', -10, 10, 0.1).name('Position X')
      light2Folder.add(light2Ref.current.position, 'y', 0, 10, 0.1).name('Position Y')
      light2Folder.add(light2Ref.current.position, 'z', -10, 10, 0.1).name('Position Z')
      light2Folder.add(light2Ref.current.rotation, 'y', -Math.PI, Math.PI, 0.1).name('Rotation Y')
      
      const color2 = light2Ref.current.color
      light2Folder.addColor({ color: `#${color2.getHexString()}` }, 'color')
        .onChange((value) => {
          light2Ref.current.color.setHex(value.replace('#', '0x'))
        })
        .name('Color')
    }

    // Lamp controls
    if (lampLightRef.current) {
      const lampFolder = guiRef.current.addFolder('Lamp Light')
      
      lampFolder.add(lampLightRef.current, 'intensity', 0, 100, 0.1).name('Intensity')
      
      // Position controls with synchronization
      lampFolder.add(lampLightRef.current.position, 'x', -10, 10, 0.1)
        .onChange((value) => {
          if (lampRef.current) {
            lampRef.current.position.x = value
          }
        })
        .name('Position X')
      lampFolder.add(lampLightRef.current.position, 'y', 0, 10, 0.1)
        .onChange((value) => {
          if (lampRef.current) {
            lampRef.current.position.y = value
          }
        })
        .name('Position Y')
      lampFolder.add(lampLightRef.current.position, 'z', -10, 10, 0.1)
        .onChange((value) => {
          if (lampRef.current) {
            lampRef.current.position.z = value
          }
        })
        .name('Position Z')
      
      lampFolder.add(lampLightRef.current, 'distance', 1, 20, 0.1).name('Distance')
      lampFolder.add(lampLightRef.current, 'decay', 0, 5, 0.1).name('Decay')
      
      const lampColor = lampLightRef.current.color
      lampFolder.addColor({ color: `#${lampColor.getHexString()}` }, 'color')
        .onChange((value) => {
          lampLightRef.current.color.setHex(value.replace('#', '0x'))
          if (lampRef.current) {
            lampRef.current.material.color.setHex(value.replace('#', '0x'))
            lampRef.current.material.emissive.setHex(value.replace('#', '0x'))
          }
        })
        .name('Color')
    }

    // Corner light controls
    if (cornerLightRef.current) {
      const cornerFolder = guiRef.current.addFolder('Corner Light')
      
      cornerFolder.add(cornerLightRef.current, 'intensity', 0, 100, 0.1).name('Intensity')
      
      // Position controls with synchronization
      cornerFolder.add(cornerLightRef.current.position, 'x', -10, 10, 0.1)
        .onChange((value) => {
          if (cornerMeshRef.current) {
            cornerMeshRef.current.position.x = value
          }
        })
        .name('Position X')
      cornerFolder.add(cornerLightRef.current.position, 'y', 0, 10, 0.1)
        .onChange((value) => {
          if (cornerMeshRef.current) {
            cornerMeshRef.current.position.y = value
          }
        })
        .name('Position Y')
      cornerFolder.add(cornerLightRef.current.position, 'z', -10, 10, 0.1)
        .onChange((value) => {
          if (cornerMeshRef.current) {
            cornerMeshRef.current.position.z = value
          }
        })
        .name('Position Z')
      
      cornerFolder.add(cornerLightRef.current, 'distance', 1, 20, 0.1).name('Distance')
      cornerFolder.add(cornerLightRef.current, 'decay', 0, 5, 0.1).name('Decay')
      
      const cornerColor = cornerLightRef.current.color
      cornerFolder.addColor({ color: `#${cornerColor.getHexString()}` }, 'color')
        .onChange((value) => {
          cornerLightRef.current.color.setHex(value.replace('#', '0x'))
          if (cornerMeshRef.current) {
            cornerMeshRef.current.material.color.setHex(value.replace('#', '0x'))
            cornerMeshRef.current.material.emissive.setHex(value.replace('#', '0x'))
          }
        })
        .name('Color')
    }

    // Window visibility controls
    const windowFolder = guiRef.current.addFolder('Window Visibility')
    
    if (window1Ref.current) {
      windowFolder.add(window1Ref.current.material, 'opacity', 0, 1, 0.01).name('Window 1 Opacity')
      windowFolder.add(window1Ref.current.material, 'emissiveIntensity', 0, 2, 0.01).name('Window 1 Glow')
    }
    
    if (window2Ref.current) {
      windowFolder.add({ opacity: window2Ref.current.material.opacity }, 'opacity', 0, 1, 0.01)
        .onChange((value) => {
          if (window2Ref.current) window2Ref.current.material.opacity = value
        })
        .name('Window 2 Opacity')
      windowFolder.add({ glow: window2Ref.current.material.emissiveIntensity }, 'glow', 0, 2, 0.01)
        .onChange((value) => {
          if (window2Ref.current) window2Ref.current.material.emissiveIntensity = value
        })
        .name('Window 2 Glow')
    }

    // Helper visibility
    const helperFolder = guiRef.current.addFolder('Helpers')
    helperFolder.add({ showHelpers: true }, 'showHelpers')
      .onChange((value) => {
        scene.traverse((object) => {
          if (object.name && object.name.includes('WindowLightHelper')) {
            object.visible = value
          }
        })
      })
      .name('Show Light Helpers')

    // Shadow controls
    const shadowFolder = guiRef.current.addFolder('Shadows')
    shadowFolder.add({ enabled: true }, 'enabled')
      .onChange((value) => {
        scene.traverse((object) => {
          if (object.isMesh && object.name !== 'ShadowFloor') {
            object.castShadow = value
            object.receiveShadow = value
          }
          if (object.name && object.name.includes('WindowShadowLight')) {
            object.castShadow = value
          }
        })
      })
      .name('Cast Shadows')

    return () => {
      if (guiRef.current) {
        guiRef.current.destroy()
      }
    }
  }, [scene])

  return null
}

export default LightController
