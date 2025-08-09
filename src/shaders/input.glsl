float fresnel(vec3 viewDir, vec3 normal, float IOR) {
  return pow(1.0 - dot(viewDir, normalize(normal)), IOR);
}

// uniform vec3 bboxMin;
// uniform vec3 bboxSize;
vec3 getGeneratedCoord(vec3 objectPosition) {
  return (objectPosition - bboxMin) / bboxSize;
}
