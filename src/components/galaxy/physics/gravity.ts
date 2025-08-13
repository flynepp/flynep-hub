import * as THREE from 'three';
// sun 1000
// 0, 0, 0
// earth 1
// 300, 0, 0
const G = 2;

function calGravity(m1: number, m2: number, r: number) {
  return (G * m1 * m2) / r / r;
}

function calAcceleration(f: number, m: number) {
  return f / m;
}

export default function nextPostion(
  sourcePosition: THREE.Vector3,
  currentPos: THREE.Vector3,
  ms: number,
  speedVector: THREE.Vector3,
  sourceM: number,
  currentM: number
) {
  const r = sourcePosition.distanceTo(currentPos);

  const acceleration = calAcceleration(calGravity(sourceM, currentM, r), currentM);

  const direction = sourcePosition.clone().sub(currentPos).normalize();

  const F = direction.multiplyScalar(acceleration);

  const resultF = speedVector.clone().add(F.multiplyScalar(ms));

  console.log(resultF);

  const next = {
    x: currentPos.x + resultF.x,
    y: currentPos.y + resultF.y,
    z: currentPos.z + resultF.z,
  };
  return next;
}
