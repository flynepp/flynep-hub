import * as THREE from 'three';
// sun 1000
// 0, 0, 0
// earth 1
// 300, 0, 0
const G = 3.2899;

function calGravity(m1: number, m2: number, r: number) {
  return (G * m1 * m2) / r / r;
}

function calAcceleration(f: number, m: number) {
  return f / m;
}

export default function nextPosition(
  sourcePos: THREE.Vector3,
  currentPos: THREE.Vector3,
  delta: number,
  speedVector: THREE.Vector3,
  sourceM: number,
  currentM: number
) {
  const rVec = sourcePos.clone().sub(currentPos);
  const r = rVec.length();
  const accel = rVec.normalize().multiplyScalar((G * sourceM) / (r * r)); // a = GM/r^2

  // 半隐式欧拉积分
  const newSpeed = speedVector.clone().add(accel.multiplyScalar(delta)); // v += a * dt
  const newPos = currentPos.clone().add(newSpeed.clone().multiplyScalar(delta)); // p += v * dt

  return { pos: newPos, speed: newSpeed };
}