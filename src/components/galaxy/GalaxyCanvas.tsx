import React, { useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { camera } from './camera';
import { particles, updateParticleFlicker } from './background';
import { Axes } from '../helper/axesHelper';
import nextPostion from './physics/gravity';

import Sun from './stars/sun/Sun';
import Earth from './stars/earth/earth';
import * as earthData from './stars/earth/earthData';
import * as sunData from './stars/sun/sunData';

// 闪烁动画
const FlickerAnimation: React.FC = () => {
  useFrame((state) => {
    updateParticleFlicker(state.clock.elapsedTime * 0.1);
  });
  return null;
};

const OrbitFocus: React.FC = () => {
  const controls = useRef<OrbitControls>(null);

  useFrame(() => {
    if (controls.current) {
      const { x, y, z } = sunData.pos;

      controls.current.target.set(x, y, z);
      controls.current.update();
    }
  });

  return <OrbitControls ref={controls} />;
};

const Gravity: React.FC<{ earthRef: React.RefObject<THREE.Mesh> }> = ({ earthRef }) => {
  useFrame((state, delta) => {
    const ms = Number(delta.toFixed(4));

    const next = nextPostion(new THREE.Vector3(earthData.pos.x, earthData.pos.y, earthData.pos.z), ms, earthData.speedVector);

    earthData.pos.x = next.x;
    earthData.pos.y = next.y;
    earthData.pos.z = next.z;

    // 直接更新 mesh 位置
    if (earthRef.current) {
      earthRef.current.position.set(earthData.pos.x, earthData.pos.y, earthData.pos.z);
    }
  });
  return null;
};

const GalaxyCanvas: React.FC = () => {
  const earthRef = React.useRef<THREE.Mesh>(null!);

  return (
    <Canvas style={{ background: '#030308' }}>
      <PerspectiveCamera
        makeDefault
        position={camera.position as [number, number, number]}
        fov={camera.fov}
        near={camera.near}
        far={camera.far}
      />
      <OrbitFocus />

      <FlickerAnimation />
      <primitive object={particles} />

      <Axes position={[earthData.pos.x, earthData.pos.y, earthData.pos.z]} />

      <Sun />
      <Earth position={[earthData.pos.x, earthData.pos.y, earthData.pos.z]} />

      <Gravity earthRef={earthRef} />
    </Canvas>
  );
};

export default GalaxyCanvas;
