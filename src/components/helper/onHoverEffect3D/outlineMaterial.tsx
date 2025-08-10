import * as THREE from 'three';
import shaderCode from './outlineMaterial.glsl?raw';
import { useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';

function createOutlineMaterial(cameraPos, r, g, b) {
  return new THREE.ShaderMaterial({
    vertexShader: `
        // 顶点着色器
        varying vec3 vNormal;
        varying vec3 vWorldPos;
        varying vec3 vLocalPos;

        void main() {
            // 世界空间法线
            vNormal = normalize(mat3(modelMatrix) * normal);

            // 世界空间位置
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPos = worldPosition.xyz;
            vLocalPos = position; 

            // 投影变换
            gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
    `,
    fragmentShader: shaderCode,
    uniforms: {
      cameraPos: { value: cameraPos || new THREE.Vector3() },
      r: { value: r },
      g: { value: g },
      b: { value: b },
    },
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
  });
}

export function OutlineModel({ model, colour = [0.8, 0.0, 0.8], size = 10.0 }) {
  const [outlineObject, setOutlineObject] = useState(null);
  const [r, g, b] = colour;
  const outlineMat = useMemo(() => createOutlineMaterial(new THREE.Vector3(), r, g, b), []);

  useEffect(() => {
    if (model) {
      const clone = model.clone(true);

      clone.traverse((child) => {
        if (child.isMesh) {
          child.material = outlineMat;
          child.scale.set(size, size, size);
        }
      });
      setOutlineObject(clone);
    }
  }, [model, outlineMat]);

  useFrame(({ camera }) => {
    if (outlineMat.uniforms.cameraPos) {
      outlineMat.uniforms.cameraPos.value.copy(camera.position);
    }
  });

  if (!outlineObject) return null;
  return <primitive object={outlineObject} />;
}

/**
 * const [hovered, setHovered] = useState(false);
 *
 *
 * {hovered && <OutlineModel model={model.scene} />}
 *
 *
 * import { OutlineModel } from '../../../helper/onHoverEffect3D/outlineMaterial';
 *
 *
 */
