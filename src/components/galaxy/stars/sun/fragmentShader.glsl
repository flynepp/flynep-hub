uniform vec3 cameraPos;
uniform vec3 bboxMin;
uniform vec3 bboxSize;

varying vec3 vPosition;
varying vec3 vNormal;

float fresnel(vec3 viewDir, vec3 normal, float blend) {
  // pow(1.0 - dot(viewDir, normal), 5.0) 产生边缘亮度
  // mix(1.0, f, blend) 用于 Blender 的 blend 参数
  return mix(1.0, pow(1.0 - dot(viewDir, normal), 5.0), blend);
}

vec3 colourRamp(float factor, float blackPos, float whitePos, vec3 blackColor,
                vec3 whiteColor) {
  float t = clamp((factor - blackPos) / (whitePos - blackPos), 0.0, 1.0);
  return mix(blackColor, whiteColor, t);
}

vec3 colourRamp(float factor, float blackPos, float whitePos) {
  float t = clamp((factor - blackPos) / (whitePos - blackPos), 0.0, 1.0);
  return mix(vec3(0.0, 0.0, 0.0), vec3(1.0, 1.0, 1.0), t);
}

vec3 getGeneratedCoord(vec3 objectPosition) {
  return (objectPosition - bboxMin) / bboxSize;
}

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

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(cameraPos - vPosition);

  float fresnelWeight = fresnel(viewDir, normal, 0.035);
  vec3 colour = colourRamp(fresnelWeight, 0.0, 1.0, vec3(0.0, 0.0, 0.0),
                           vec3(1.0, 1.0, 1.0));

  vec3 result1 = colour * 0.5;

  vec3 generatedCoord = getGeneratedCoord(vPosition);
  vec3 mappingVector =
      pointMapping(generatedCoord, vec3(0, 0, 0), vec3(0, 0, 0), vec3(1, 1, 1));

  gl_FragColor = vec4(colour, 1.0);
}