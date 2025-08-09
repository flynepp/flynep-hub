import React, { Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Text, OrbitControls } from '@react-three/drei';
import { camera } from './camera';
import { particles, updateParticleFlicker } from './background';
import { Axes } from '../helper/axesHelper';
import * as earthData from './stars/earth/earthData';
import * as sunData from './stars/sun/sunData';

// 异步加载组件
const LazySun = React.lazy(() => import('./stars/sun/Sun'));
const LazyEarth = React.lazy(() => import('./stars/earth/earth'));

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
    <Canvas style={{ background: '#00000F' }}>
      <PerspectiveCamera
        makeDefault
        position={camera.position as [number, number, number]}
        fov={camera.fov}
        near={camera.near}
        far={camera.far}
      />
      <OrbitControls target={[earthData.pos.x, earthData.pos.y, earthData.pos.z]} />

      {/* 闪烁动画 */}
      <FlickerAnimation />

      {/* 星空背景 */}
      <primitive object={particles} />

      <Axes />

      {/* 太阳 */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <LazySun />
      </Suspense>
      <pointLight
        position={[sunData.pos.x, sunData.pos.y, sunData.pos.z]}
        intensity={100000}
        color="#ffffff"
      />

      {/* 地球 */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <LazyEarth position={[earthData.pos.x, earthData.pos.y, earthData.pos.z]} />
      </Suspense>
    </Canvas>
  );
};

export default GalaxyCanvas;
