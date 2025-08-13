import * as THREE from 'three';
// sun 1000
// earth 1
const G = 0.5;

function calGravity(m1: number, m2: number, r: number) {
    return G * m1 * m2 / r / r;
}

export default function nextPostion(nowPosition: THREE.Vector3, ms: number, speedVector: THREE.Vector3) {
    return {
        x: nowPosition.x + speedVector.x * ms,
        y: nowPosition.y + speedVector.y * ms,
        z: nowPosition.z + speedVector.z * ms
    };
}