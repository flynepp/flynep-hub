import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useState, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { sunGLBPath, sunHaloGLBPath, rotationPeriod } from './sunData';
import { calcBoundingBox } from '../../../helper/helperFunction';
import { createSunMaterial } from './sunMaterial';
import { createSunHaloMaterial } from './sunHaloMaterial';

export default function Sun() {
  const sunModel = useGLTF(sunGLBPath);
  const sunHaloModel = useGLTF(sunHaloGLBPath);

  const [bboxMin, setBboxMin] = useState(new THREE.Vector3());
  const [bboxSize, setBboxSize] = useState(new THREE.Vector3());

  const [bboxMinHalo, setBboxMinHalo] = useState(new THREE.Vector3());
  const [bboxSizeHalo, setBboxSizeHalo] = useState(new THREE.Vector3());

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

  useEffect(() => {
    if (sunHaloModel.scene) {
      const { bboxMin, bboxSize } = calcBoundingBox(sunHaloModel);
      setBboxMinHalo(bboxMin);
      setBboxSizeHalo(bboxSize);
    }
  }, [sunHaloModel]);

  // 创建材质，每当bbox或cameraPos更新时重新创建
  const sunMat = useMemo(() => {
    return createSunMaterial({
      cameraPos: new THREE.Vector3(), // 先给空，后面用useFrame更新
      bboxMin: bboxMin,
      bboxSize: bboxSize,
      w: 0,
    });
  }, [bboxMin, bboxSize]);

  const sunHaloMat = useMemo(() => {
    return createSunHaloMaterial({
      cameraPos: new THREE.Vector3(), // 先给空，后面用useFrame更新
      bboxMin: bboxMinHalo,
      bboxSize: bboxSizeHalo,
      w: 0,
    });
  }, [bboxMinHalo, bboxSizeHalo]);

  // 在useFrame中更新uniform动态数据
  useFrame(({ clock, camera }) => {
    const elapsed = clock.getElapsedTime();

    sunMat.uniforms.w.value = elapsed * 0.01;
    sunMat.uniforms.cameraPos.value.copy(camera.position);

    sunHaloMat.uniforms.w.value = elapsed * 0.001;
    sunHaloMat.uniforms.cameraPos.value.copy(camera.position);

    const baseScale = 0.90;
    const amplitude = 0.05;
    const frequency = 0.005;

    const sc = baseScale + amplitude * Math.sin(elapsed * frequency * 2 * Math.PI);

    sunHaloModel.scene.scale.set(sc, sc, sc);

    // 旋转
    if (sunCoreRef.current) {
      const rotationAngle = (elapsed / (rotationPeriod * 60)) * 2 * Math.PI;
      sunCoreRef.current.rotation.y = rotationAngle;
    }
    if (sunHaloRef.current) {
      const rotationAngle = (elapsed / (rotationPeriod * 60)) * 2 * Math.PI;
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

  useEffect(() => {
    if (sunHaloModel.scene) {
      sunHaloModel.scene.traverse((child) => {
        if (child.isMesh) {
          child.material = sunHaloMat;
        }
      });
    }
  }, [sunHaloModel, sunHaloMat]);

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
