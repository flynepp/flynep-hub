import * as THREE from 'three';
import shaderCode from './globeMaterial.glsl?raw';

export function createGlobeMaterial({
  cameraPos,
  sunPos,
  dayTexture,
  nightTexture,
  bumpRoughnessCloudsTexture,
}) {
  return new THREE.ShaderMaterial({
    vertexShader: `
        // 顶点着色器
        varying vec3 vNormal;
        varying vec3 vWorldPos;
        varying vec2 vUv;

        void main() {
            // 世界空间法线
            vNormal = normalize(mat3(modelMatrix) * normal);

            // 世界空间位置
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPos = worldPosition.xyz;
            vUv = uv;  

            // 投影变换
            gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
    `,
    fragmentShader: shaderCode,
    uniforms: {
      cameraPos: { value: cameraPos || new THREE.Vector3() },
      sunPos: { value: sunPos || new THREE.Vector3() },
      dayTexture: { value: dayTexture },
      nightTexture: { value: nightTexture },
      bumpMap: { value: bumpRoughnessCloudsTexture },
    },
  });
}
