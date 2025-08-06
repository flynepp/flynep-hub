import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import createSunMaterial from './sunMaterial.tsx'

const Sun = () => {
  const sunRootRef = useRef<THREE.Group>(null)
  const sunCoreRef = useRef<THREE.Group>(null)
  const sunHaloRef = useRef<THREE.Group>(null)

  const sunModel = useGLTF('/src/components/galaxy/stars/sun/sun.glb')
  const sunHaloModel = useGLTF('/src/components/galaxy/stars/sun/sunHalo.glb')

  const sunMat = createSunMaterial();
  const rotationPeriod = 3; // min

  // 应用材质到模型
  useEffect(() => {
    if (sunModel.scene) {
      sunModel.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = sunMat;
        }
      });
    }
  }, [sunModel, sunMat]);

  useFrame((state) => {
    const elapsedTime = state.clock.elapsedTime;
    const rotationAngle = (elapsedTime / (rotationPeriod * 60)) * 2 * Math.PI;

    // 太阳核心旋转
    if (sunCoreRef.current) {
      sunCoreRef.current.rotation.y = rotationAngle // 调整速度
    }

    // 太阳光环旋转
    if (sunHaloRef.current) {
      sunHaloRef.current.rotation.y = (rotationAngle / 2) // 光环转得慢一些
    }
  })

  return (
    <group ref={sunRootRef} position={[0, 0, 0]}>
      {/* 太阳核心 */}
      <group  ref={sunCoreRef} position={[0, 0, 0]}>
        <primitive object={sunModel.scene} />
      </group>

      {/* 太阳光环 */}
      <group ref={sunHaloRef} position={[0, 0, 0]}>
        <primitive object={sunHaloModel.scene} />
      </group>
    </group>
  )
}

export default Sun