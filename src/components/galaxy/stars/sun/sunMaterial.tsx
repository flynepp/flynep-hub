import * as THREE from 'three';
import shaderCode from './fragmentShader.glsl?raw';

export function createSunMaterial({ cameraPos, bboxMin, bboxSize, w }) {
    return new THREE.ShaderMaterial({
        vertexShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;

        void main() {
            vPosition = position;
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
        fragmentShader: shaderCode,
        uniforms: {
            cameraPos: { value: cameraPos || new THREE.Vector3() },
            bboxMin: { value: bboxMin || new THREE.Vector3() },
            bboxSize: { value: bboxSize || new THREE.Vector3() },
            w: { value: w || 0.0 },
        }
    });
}