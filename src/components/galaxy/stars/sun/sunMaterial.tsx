import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { camera } from '../../camera';
import shaderCode from './fragmentShader.glsl?raw';

let sunMeshes = [];
let bboxMin = new THREE.Vector3();
let bboxSize = new THREE.Vector3();

const loader = new GLTFLoader();

loader.load('/galaxy/stars/sun/sun.glb', (gltf) => {
    sunMeshes = [];

    gltf.scene.traverse((child) => {
        if (child.isMesh) {
            sunMeshes.push(child);
        }
    });

    // 计算包围盒
    const box = new THREE.Box3();
    sunMeshes.forEach(mesh => {
        mesh.geometry.computeBoundingBox();
        box.expandByPoint(mesh.geometry.boundingBox.min);
        box.expandByPoint(mesh.geometry.boundingBox.max);
    });

    bboxMin.copy(box.min);
    bboxSize.copy(box.getSize(new THREE.Vector3()));

    material.uniforms.bboxMin.value.copy(bboxMin);
    material.uniforms.bboxSize.value.copy(bboxSize);
});

const material = new THREE.ShaderMaterial({
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
        cameraPos: { value: new THREE.Vector3(...camera.position) },
        bboxMin: { value: new THREE.Vector3() },
        bboxSize: { value: new THREE.Vector3() },
    }
});

const createSunMaterial = () => {
    return material;
};

export default createSunMaterial;