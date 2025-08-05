import { useGLTF } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'

const Sun = () => {
    const sunRef = useRef<THREE.Group>(null)
    
    const sunModel = useGLTF('/src/components/galaxy/stars/sun/sun.glb')
    const sunHaloModel = useGLTF('/src/components/galaxy/stars/sun/sunHalo.glb')
    
    return (
      <group ref={sunRef}>
        <primitive object={sunModel.scene} />
        <primitive object={sunHaloModel.scene} />
      </group>
    )
  }
  
  export default Sun