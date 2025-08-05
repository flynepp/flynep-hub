import React from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei'
import Sun from './stars/sun/Sun'

const GalaxyCanvas: React.FC = () => {
  return (
    <Canvas style={{ background: '#000011' }}
    >

    <PerspectiveCamera
        makeDefault
        position={[10, 10, 10]}
        fov={75}
        near={0.1}
        far={1000}
        onUpdate={self => self.lookAt(0, 0, 0)}
      />

    <Sun />
    </Canvas>
  );
};

export default GalaxyCanvas; 