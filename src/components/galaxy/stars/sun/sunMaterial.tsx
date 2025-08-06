import * as THREE from 'three';
import * as INPUT from '../../../../shaders/input';
import * as TRANSFORMER from '../../../../shaders/transformer';
import { camera } from '../../camera';

const createSunMaterial = () => {
  return new THREE.MeshStandardMaterial({
    color: '#ffd700',
    emissive: '#ffd700',
    emissiveIntensity: 0.3,
    metalness: 0.1,
    roughness: 0.8
  });
};

export default createSunMaterial;

// 自发光材质
const emissionMaterial = new THREE.ShaderMaterial({
    vertexShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        void main() {
            vPosition = position;
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float time;
        uniform vec3 emissionColor;
        uniform float emissionIntensity;

        varying vec3 vPosition;
        varying vec3 vNormal;

        ${INPUT.LayerWeight()};
        ${TRANSFORMER.ColourRamp()};

        void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(cameraPos - vPosition);

        float fresnelWeight = fresnel(viweDir, normal, 0.035);
        vec3 colour = colorRamp(fresnelWeight, 0, 1);
        }
    `,
    uniforms: {
      time: { value: 0 },
      emissionColor: { value: new THREE.Color(0xffd700) },
      emissionIntensity: { value: 2.0 },
      cameraPos: {value: new THREE.Vector3(...camera.position)},
    }
  });