import * as THREE from 'three';
import * as INPUT from '../../../../shaders/input';
import * as TRANSFORMER from '../../../../shaders/transformer';
import { camera } from '../../camera';

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
    fragmentShader: `
        uniform vec3 cameraPos;

        varying vec3 vPosition;
        varying vec3 vNormal;

        ${INPUT.LayerWeight()}
        ${TRANSFORMER.ColourRamp()}

        void main() {
            vec3 normal = normalize(vNormal);
            vec3 viewDir = normalize(cameraPos - vPosition);

            float fresnelWeight = fresnel(viewDir, normal, 0.035);
            vec3 colour = colourRamp(fresnelWeight, 0.0, 1.0, vec3(0.0, 0.0, 0.0),
                           vec3(1.0, 1.0, 1.0));

            gl_FragColor = vec4(colour, 1.0);
        }
    `,
    uniforms: {
      cameraPos: {value: new THREE.Vector3(...camera.position)},
    }
});

const createSunMaterial = () => {
    return material; 
};

export default createSunMaterial;