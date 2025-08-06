import React from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Text } from '@react-three/drei';
import Sun from './stars/sun/Sun';
import { camera } from './camera';

const GalaxyCanvas: React.FC = () => {
  return (
    <Canvas style={{ background: '#000011' }}
    >

    <PerspectiveCamera
        makeDefault
        // @ts-ignore-next-line
        position={camera.position}
        fov={camera.fov}
        near={camera.near}
        far={camera.far}
        onUpdate={self => self.lookAt(0, 0, 0)}
      />

    <axesHelper args={[20]} />
    <Text position={[6, 1, 0]} fontSize={0.5} color="red">X</Text>
    <Text position={[1, 6, 0]} fontSize={0.5} color="green">Y</Text>
    <Text position={[1, 0, 6]} fontSize={0.5} color="blue">Z</Text>

    <Sun />
    </Canvas>
  );
};

export default GalaxyCanvas; 