import * as THREE from 'three';
// sun 1000
// 0, 0, 0
// earth 1
// 300, 0, 0
const G = 3.2899;

function calculate() {

}

export default function nextPosition(
  sourcePos: { x: number; y: number; z: number },
  currentPos: { x: number; y: number; z: number },
  delta: number,
  speedVector: { x: number; y: number; z: number },
  sourceM: number
) {
  const G = 3.2899; // 你之前的引力常数

  const calcAccel = (pos: { x: number; y: number; z: number }) => {
    const dx = sourcePos.x - pos.x;
    const dy = sourcePos.y - pos.y;
    const dz = sourcePos.z - pos.z;
    const r2 = dx * dx + dy * dy + dz * dz;
    const r = Math.sqrt(r2);
    const factor = (G * sourceM) / (r2 * r); // GM / r^3
    return {
      x: dx * factor,
      y: dy * factor,
      z: dz * factor,
    };
  };

  const addVec = (a: any, b: any, scale = 1) => ({
    x: a.x + b.x * scale,
    y: a.y + b.y * scale,
    z: a.z + b.z * scale,
  });

  const mulVec = (v: any, scale: number) => ({
    x: v.x * scale,
    y: v.y * scale,
    z: v.z * scale,
  });

  // k1
  const a1 = calcAccel(currentPos);
  const v1 = { ...speedVector };
  const p1 = { ...currentPos };

  // k2
  const p2 = addVec(p1, v1, delta * 0.5);
  const v2 = addVec(v1, a1, delta * 0.5);
  const a2 = calcAccel(p2);

  // k3
  const p3 = addVec(p1, v2, delta * 0.5);
  const v3 = addVec(v1, a2, delta * 0.5);
  const a3 = calcAccel(p3);

  // k4
  const p4 = addVec(p1, v3, delta);
  const v4 = addVec(v1, a3, delta);
  const a4 = calcAccel(p4);

  // 新位置
  const newPos = addVec(
    currentPos,
    addVec(addVec(v1, mulVec(v2, 2)), addVec(mulVec(v3, 2), v4)),
    delta / 6
  );

  // 新速度
  const newSpeed = addVec(
    speedVector,
    addVec(addVec(a1, mulVec(a2, 2)), addVec(mulVec(a3, 2), a4)),
    delta / 6
  );

  return { pos: newPos, speed: newSpeed };
}