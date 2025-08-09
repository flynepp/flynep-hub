import * as THREE from 'three';

// 计算包围盒
function calcBoundingBox(gltf) {
  const meshes = [];
  gltf.scene.traverse((child) => {
    if (child.isMesh) {
      meshes.push(child);
    }
  });

  const box = new THREE.Box3();

  meshes.forEach((mesh) => {
    if (!mesh.geometry.boundingBox) {
      mesh.geometry.computeBoundingBox();
    }
    box.expandByPoint(mesh.geometry.boundingBox.min);
    box.expandByPoint(mesh.geometry.boundingBox.max);
  });

  const bboxMin = box.min.clone();
  const bboxSize = box.getSize(new THREE.Vector3());

  return { bboxMin, bboxSize };
}

export { calcBoundingBox };
