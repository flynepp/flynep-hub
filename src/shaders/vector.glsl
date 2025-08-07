// 点映射函数
vec3 pointMapping(vec3 pos, vec3 translate, vec3 rotate, vec3 scale) {
  // 缩放
  vec3 scaled = pos * scale;

  // 旋转
  float DEG2RAD = 3.14159265359 / 180.0;

  vec3 rotRad = rotate * DEG2RAD;

  float c = cos(rotRad.x);
  float s = sin(rotRad.x);
  mat3 rotX = mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c);

  c = cos(rotRad.y);
  s = sin(rotRad.y);
  mat3 rotY = mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c);

  c = cos(rotRad.z);
  s = sin(rotRad.z);
  mat3 rotZ = mat3(c, -s, 0.0, s, c, 0.0, 0.0, 0.0, 1.0);

  mat3 rotMat = rotZ * rotY * rotX;
  vec3 rotated = rotMat * scaled;

  // 平移
  vec3 translated = rotated + translate;

  return translated;
}