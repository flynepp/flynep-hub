import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three/webgpu';
import * as sun from '../sun/sunData';
import { camera } from '../../camera';
import { createGlobeMaterial } from './globeMaterial';
import {
  rotationPeriod,
  tiltAngle,
  dayTexturePath,
  nightTexturePath,
  bumpRoughnessCloudsTexturePath,
} from './earthData';

export default function Earth({ position = [0, 0, 0] }) {
  const meshRef = useRef<THREE.Mesh>(null);

  // 纹理加载
  const textureLoader = new THREE.TextureLoader();
  const dayTexture = textureLoader.load(dayTexturePath);
  dayTexture.colorSpace = THREE.SRGBColorSpace;
  dayTexture.anisotropy = 8;

  const nightTexture = textureLoader.load(nightTexturePath);
  nightTexture.colorSpace = THREE.SRGBColorSpace;
  nightTexture.anisotropy = 8;

  const bumpRoughnessCloudsTexture = textureLoader.load(bumpRoughnessCloudsTexturePath);
  bumpRoughnessCloudsTexture.anisotropy = 8;

  const { position: cameraPosition } = camera;
  const cameraPos = new THREE.Vector3(cameraPosition[0], cameraPosition[1], cameraPosition[2]);

  const { pos: sunPosition } = sun;
  const sunPos = new THREE.Vector3(sunPosition.x, sunPosition.y, sunPosition.z);

  const angle = THREE.MathUtils.degToRad(tiltAngle);

  const globeMaterial = useMemo(() => {
    return createGlobeMaterial({
      cameraPos,
      sunPos,
      dayTexture,
      nightTexture,
      bumpRoughnessCloudsTexture,
    });
  }, [cameraPos, sunPos]);

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.material = globeMaterial;
      meshRef.current.material.needsUpdate = true;
      meshRef.current.rotation.z = angle;
    }
  }, [globeMaterial]);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();

    if (meshRef.current) {
      const rotationAngle = (elapsed / (rotationPeriod * 60)) * 2 * Math.PI;
      meshRef.current.rotation.y = rotationAngle / 2;
    }
  });

  return (
    <group position={position as [number, number, number]}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 64, 64]} />
      </mesh>
    </group>
  );
}
