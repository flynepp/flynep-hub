import * as THREE from 'three';
import shaderCode from './atmosphereMaterial.glsl?raw';

export function createAtmosphereMaterial({
  cameraPos,
  sunPos,
}: {
  cameraPos: THREE.Vector3;
  sunPos: THREE.Vector3;
}) {
  return new THREE.ShaderMaterial({
    vertexShader: `
            varying vec3 vNormal;
            varying vec3 vWorldPosition;

            void main() {
            vNormal = normalize(mat3(modelMatrix) * normal);

            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPos.xyz;

            gl_Position = projectionMatrix * viewMatrix * worldPos;
            }
        `,
    fragmentShader: shaderCode,
    uniforms: {
      cameraPos: { value: cameraPos || new THREE.Vector3() },
      sunPos: { value: sunPos || new THREE.Vector3() },
    },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.BackSide,
  });
}
