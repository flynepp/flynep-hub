import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useState, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { sunGLBPath, sunHaloGLBPath, rotationPeriod, scaleFactor } from './sunData';
import { calcBoundingBox } from '../../../helper/helperFunction';
import { createSunMaterial } from './sunMaterial';
import { createSunHaloMaterial } from './sunHaloMaterial';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { OutlineModel } from '../../../helper/onHoverEffect3D/outlineMaterial';

export default function Sun() {
  const [hovered, setHovered] = useState(false);

  const sunModel = useGLTF(sunGLBPath);
  const sunHaloModel = useGLTF(sunHaloGLBPath);
  sunModel.scene.scale.set(scaleFactor, scaleFactor, scaleFactor);
  sunHaloModel.scene.scale.set(scaleFactor, scaleFactor, scaleFactor);

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
      const { bboxMin: bboxMinHalo, bboxSize: bboxSizeHalo } = calcBoundingBox(sunHaloModel);
      setBboxMinHalo(bboxMinHalo);
      setBboxSizeHalo(bboxSizeHalo);
    }
  }, [sunHaloModel]);

  // 创建材质，每当bbox或cameraPos更新时重新创建
  const sunMat = useMemo(() => {
    return createSunMaterial({
      cameraPos: new THREE.Vector3(),
      bboxMin: bboxMin,
      bboxSize: bboxSize,
      w: 0,
    });
  }, [bboxMin, bboxSize]);

  const sunHaloMat = useMemo(() => {
    return createSunHaloMaterial({
      cameraPos: new THREE.Vector3(),
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

    const baseScale = 0.9;
    const amplitude = 0.05;
    const frequency = 0.005;

    const sc = (baseScale + amplitude * Math.sin(elapsed * frequency * 2 * Math.PI)) * scaleFactor;

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
    <group
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
      }}
    >
      <group ref={sunCoreRef}>
        <primitive object={sunModel.scene} />
      </group>
      <group ref={sunHaloRef}>
        <primitive object={sunHaloModel.scene} />
      </group>

      {/* 叠加描边模型，hover 时显示 */}
      {hovered && <OutlineModel model={sunModel.scene} />}

      <EffectComposer>
        <Bloom
          intensity={2.0} // 光强
          luminanceThreshold={0.4} // 触发发光的亮度阈值
          luminanceSmoothing={0.5} // 平滑
        />
      </EffectComposer>
    </group>
  );
}
