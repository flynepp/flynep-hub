import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useState, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { sunGLBPath, sunHaloGLBPath, rotationPeriod } from './sunData';
import { calcBoundingBox } from '../../../helper/helperFunction';
import { createSunMaterial } from './sunMaterial';

export default function Sun() {
  const sunModel = useGLTF(sunGLBPath);
  const sunHaloModel = useGLTF(sunHaloGLBPath);

  const [bboxMin, setBboxMin] = useState(new THREE.Vector3());
  const [bboxSize, setBboxSize] = useState(new THREE.Vector3());

  const sunCoreRef = useRef();
  const sunHaloRef = useRef();

  // 计算包围盒
  useEffect(() => {
    if (sunModel.scene) {
      const { bboxMin, bboxSize } = calcBoundingBox(sunModel);
      setBboxMin(bboxMin);
      setBboxSize(bboxSize);
    }
  }, [sunModel]);

  // 创建材质，每当bbox或cameraPos更新时重新创建
  const sunMat = useMemo(() => {
    return createSunMaterial({
      cameraPos: new THREE.Vector3(), // 先给空，后面用useFrame更新
      bboxMin,
      bboxSize,
      w: 0,
    });
  }, [bboxMin, bboxSize]);

  // 在useFrame中更新uniform动态数据
  useFrame(({ clock, camera }) => {
    sunMat.uniforms.w.value = clock.getElapsedTime();
    sunMat.uniforms.cameraPos.value.copy(camera.position);

    // 旋转
    if (sunCoreRef.current) {
      const rotationAngle = (clock.getElapsedTime() / (rotationPeriod * 60)) * 2 * Math.PI;
      sunCoreRef.current.rotation.y = rotationAngle;
    }
    if (sunHaloRef.current) {
      const rotationAngle = (clock.getElapsedTime() / (rotationPeriod * 60)) * 2 * Math.PI;
      sunHaloRef.current.rotation.y = rotationAngle / 2;
    }
  });

  // 绑定材质
  useEffect(() => {
    if (sunModel.scene) {
      sunModel.scene.traverse((child) => {
        if (child.isMesh) {
          child.material = sunMat;
        }
      });
    }
  }, [sunModel, sunMat]);

  return (
    <group>
      <group ref={sunCoreRef}>
        <primitive object={sunModel.scene} />
      </group>
      <group ref={sunHaloRef}>
        <primitive object={sunHaloModel.scene} />
      </group>
    </group>
  );
}
