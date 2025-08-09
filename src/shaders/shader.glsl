vec3 emissive(vec3 color, vec3 intensity) {
  // 自发光
  return color * intensity;
}

vec3 emissive(vec3 color, float intensity) {
  // 自发光
  return color * intensity;
}

vec4 opacity(vec3 color, float v) {
  // BSDF
  return vec4(color, v);
}

vec4 mixShader(vec4 c1, vec4 c2, vec4 factor) {
  return vec4(
    c1.r * factor.r + c2.r * (1.0 - factor.r),
    c1.g * factor.g + c2.g * (1.0 - factor.g),
    c1.b * factor.b + c2.b * (1.0 - factor.b),
    c1.a * factor.a + c2.a * (1.0 - factor.a)
  );
}
