import * as THREE from 'three';

const sunGLBPath = '/galaxy/stars/sun/sun.glb';
const sunHaloGLBPath = '/galaxy/stars/sun/sunHalo.glb';
const rotationPeriod = 10;
const scaleFactor = 10;
const pos = { x: 0, y: 0, z: 0 };
const mass = 100000;
const speedVector = new THREE.Vector3(0, 0, 0);

export { sunGLBPath, sunHaloGLBPath, rotationPeriod, scaleFactor, pos, mass, speedVector };
