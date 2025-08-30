import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

const Background = () => {
  const groupRef = useRef()
  
  // Simple rotation animation
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime()
      groupRef.current.rotation.y = time * 0.1
    }
  })
  
  return (
    <group ref={groupRef}>
      {/* Simple background spheres */}
      <mesh position={[10, 5, -10]}>
        <sphereGeometry args={[2, 16, 16]} />
        <meshBasicMaterial color="#4a90e2" transparent opacity={0.3} />
      </mesh>
      
      <mesh position={[-8, 3, -15]}>
        <sphereGeometry args={[1.5, 16, 16]} />
        <meshBasicMaterial color="#e24a90" transparent opacity={0.4} />
      </mesh>
      
      <mesh position={[5, -2, -20]}>
        <sphereGeometry args={[3, 16, 16]} />
        <meshBasicMaterial color="#90e24a" transparent opacity={0.2} />
      </mesh>
    </group>
  )
}

export default Background
