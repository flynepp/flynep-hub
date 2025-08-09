import * as THREE from 'three';
import shaderCode from './sunFragmentShader.glsl?raw';

export function createSunMaterial({ cameraPos, bboxMin, bboxSize, w }) {
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
      bboxMin: { value: bboxMin || new THREE.Vector3() },
      bboxSize: { value: bboxSize || new THREE.Vector3() },
      w: { value: w || 0.0 },
    },
  });
}
