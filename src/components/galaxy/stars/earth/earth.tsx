import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three/webgpu';
import * as sun from '../sun/sunData';
import { createGlobeMaterial } from './globeMaterial';
import { createAtmosphereMaterial } from './atmosphereMaterial';
import {
  rotationPeriod,
  tiltAngle,
  dayTexturePath,
  nightTexturePath,
  bumpRoughnessCloudsTexturePath,
  pos,
  r
} from './earthData';
import { OutlineModel } from '../../../helper/onHoverEffect3D/outlineMaterial';
import { Panel3D } from '../../../helper/panel';

export default function Earth({ position = [0, 0, 0] }) {
  const [hovered, setHovered] = useState(false);

  const meshRef = useRef<THREE.Mesh>(null);
  const autoMeshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null!);

  const panel = useMemo(() => new Panel3D({ x: 0, y: 0, z: 0 }), []);

  // 纹理加载
  const textureLoader = new THREE.TextureLoader();
  const dayTexture = textureLoader.load(dayTexturePath);
  dayTexture.colorSpace = THREE.SRGBColorSpace;
  dayTexture.anisotropy = 8;

  const nightTexture = textureLoader.load(nightTexturePath);
  nightTexture.colorSpace = THREE.SRGBColorSpace;
  nightTexture.anisotropy = 8;

  // 这个地方云层目前使用云层图，后续更新成实时云层
  // https://open-meteo.com/
  const bumpRoughnessCloudsTexture = textureLoader.load(bumpRoughnessCloudsTexturePath);
  bumpRoughnessCloudsTexture.anisotropy = 8;

  const { camera } = useThree();

  const { pos: sunPosition } = sun;
  const sunPos = new THREE.Vector3(sunPosition.x, sunPosition.y, sunPosition.z);

  const angle = THREE.MathUtils.degToRad(tiltAngle);

  const globeMaterial = useMemo(() => {
    return createGlobeMaterial({
      cameraPos: camera.position,
      sunPos: sunPos,
      dayTexture: dayTexture,
      nightTexture: nightTexture,
      bumpRoughnessCloudsTexture: bumpRoughnessCloudsTexture,
    });
  }, [camera.position, sunPos]);

  const atmosphereMaterial = useMemo(() => {
    return createAtmosphereMaterial({
      cameraPos: camera.position,
      sunPos: sunPos,
    });
  }, [camera.position, sunPos]);

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.material = globeMaterial;
      meshRef.current.material.needsUpdate = true;
    }
  }, [globeMaterial]);

  useEffect(() => {
    if (autoMeshRef.current) {
      autoMeshRef.current.material = atmosphereMaterial;
      autoMeshRef.current.material.needsUpdate = true;
    }
  }, [atmosphereMaterial]);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();

    if (meshRef.current) {
      const rotationAngle = (elapsed / (rotationPeriod * 60)) * 2 * Math.PI;
      meshRef.current.rotation.y = rotationAngle / 2;
    }

    if (groupRef.current) {
      groupRef.current.position.set(pos.x, pos.y, pos.z);
    }

    const earPos = new THREE.Vector3(pos.x, pos.y, pos.z);
    const distance = earPos.distanceTo(sunPos);
    const offset = distance - r;

    if (Math.abs(offset) > 1) {
      const dir = earPos.clone().normalize();
      const targetPos = earPos.clone().add(dir.multiplyScalar(-offset));
      groupRef.current.position.lerp(targetPos, 0.1);
    }
  });

  useFrame(() => {
    const earPos = new THREE.Vector3(pos.x, pos.y, pos.z);

    panel.update(
      { x: pos.x, y: pos.y, z: pos.z, distance: earPos.distanceTo(sunPos) },
      camera,
      pos
    );

    if (panel.group) {
      const target = camera.position.clone();
      target.y = panel.group.position.y;

      panel.group.lookAt(target);

      panel.group.up.set(0, 1, 0);
    }
  });

  return (
    <group
      ref={groupRef}
      position={position as [number, number, number]}
      rotation={[angle, 0, 0]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
      }}
    >
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 64, 64]} />
      </mesh>
      <mesh ref={autoMeshRef}>
        <sphereGeometry args={[1.04, 64, 64]} />
      </mesh>
      {hovered && <OutlineModel model={meshRef.current as THREE.Object3D} />}

      <primitive object={panel.group} />
    </group >
  );
}
