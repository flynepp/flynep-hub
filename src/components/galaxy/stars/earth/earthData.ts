import * as THREE from 'three';

const rotationPeriod = 1;
const pos = { x: 300, y: 0, z: 300 };
const tiltAngle = 23.5;
const dayTexturePath = '/galaxy/textures/planets/earth_day_4096.jpg';
const bumpRoughnessCloudsTexturePath =
  '/galaxy/textures/planets/earth_bump_roughness_clouds_4096.jpg';
const nightTexturePath = '/galaxy/textures/planets/earth_night_4096.jpg';
const mass = 1;
const speedVector = new THREE.Vector3(0, 0, 20);

export {
  rotationPeriod,
  pos,
  tiltAngle,
  dayTexturePath,
  nightTexturePath,
  bumpRoughnessCloudsTexturePath,
  mass,
  speedVector
};
