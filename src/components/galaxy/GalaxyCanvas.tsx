import React, { Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Text } from '@react-three/drei';
import { camera } from './camera';
import { particles, updateParticleFlicker } from './background';

// 异步加载组件
const LazySun = React.lazy(() => import('./stars/sun/Sun'));

// 闪烁动画组件
const FlickerAnimation: React.FC = () => {
  useFrame((state) => {
    updateParticleFlicker(state.clock.elapsedTime);
  });
  
  return null;
};

// 加载占位符
const LoadingPlaceholder: React.FC = () => (
  <mesh>
    <boxGeometry args={[1, 1, 1]} />
    <meshBasicMaterial color="#666666" />
  </mesh>
);

const GalaxyCanvas: React.FC = () => {
  return (
    <Canvas style={{ background: '#000011' }}>
      <PerspectiveCamera
        makeDefault
        position={camera.position as [number, number, number]}
        fov={camera.fov}
        near={camera.near}
        far={camera.far}
        onUpdate={self => self.lookAt(0, 0, 0)}
      />

      {/* 闪烁动画 */}
      <FlickerAnimation />
      
      {/* 星空背景 */}
      <primitive object={particles} />
      
      <axesHelper args={[20]} />
      <Text position={[6, 1, 0]} fontSize={0.5} color="red">X</Text>
      <Text position={[1, 6, 0]} fontSize={0.5} color="green">Y</Text>
      <Text position={[1, 0, 6]} fontSize={0.5} color="blue">Z</Text>

      {/* 太阳 */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <LazySun />
      </Suspense>
    </Canvas>
  );
};

export default GalaxyCanvas; 