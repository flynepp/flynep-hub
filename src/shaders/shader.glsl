vec3 emissive(vec3 color, vec3 intensity) {
  // 自发光
  return color * intensity;
}

vec3 emissive(vec3 color, float intensity) {
  // 自发光
  return color * intensity;
}