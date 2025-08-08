uniform vec3 cameraPos;
uniform vec3 bboxMin;
uniform vec3 bboxSize;
uniform float w;

varying vec3 vNormal;
varying vec3 vWorldPos;

float fresnel(vec3 viewDir, vec3 normal, float IOR) {
  return pow(1.0 - dot(viewDir, normalize(normal)), IOR);
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

float hash(vec4 p) {
  return fract(sin(dot(p, vec4(12.9898, 78.233, 45.164, 94.673))) * 43758.5453);
}

float valueNoise4D(vec4 p) {
  vec4 i = floor(p);
  vec4 f = fract(p);

  vec4 u = f * f * (3.0 - 2.0 * f);

  float n0000 = hash(i + vec4(0, 0, 0, 0));
  float n1000 = hash(i + vec4(1, 0, 0, 0));
  float n0100 = hash(i + vec4(0, 1, 0, 0));
  float n1100 = hash(i + vec4(1, 1, 0, 0));
  float n0010 = hash(i + vec4(0, 0, 1, 0));
  float n1010 = hash(i + vec4(1, 0, 1, 0));
  float n0110 = hash(i + vec4(0, 1, 1, 0));
  float n1110 = hash(i + vec4(1, 1, 1, 0));
  float n0001 = hash(i + vec4(0, 0, 0, 1));
  float n1001 = hash(i + vec4(1, 0, 0, 1));
  float n0101 = hash(i + vec4(0, 1, 0, 1));
  float n1101 = hash(i + vec4(1, 1, 0, 1));
  float n0011 = hash(i + vec4(0, 0, 1, 1));
  float n1011 = hash(i + vec4(1, 0, 1, 1));
  float n0111 = hash(i + vec4(0, 1, 1, 1));
  float n1111 = hash(i + vec4(1, 1, 1, 1));

  float nx00 = mix(n0000, n1000, u.x);
  float nx10 = mix(n0100, n1100, u.x);
  float nx01 = mix(n0010, n1010, u.x);
  float nx11 = mix(n0110, n1110, u.x);

  float nxy0 = mix(nx00, nx10, u.y);
  float nxy1 = mix(nx01, nx11, u.y);

  float nxyz0 = mix(nxy0, nxy1, u.z);

  float nx01_1 = mix(n0001, n1001, u.x);
  float nx11_1 = mix(n0101, n1101, u.x);
  float nx01_1b = mix(n0011, n1011, u.x);
  float nx11_1b = mix(n0111, n1111, u.x);

  float nxy0_1 = mix(nx01_1, nx11_1, u.y);
  float nxy1_1 = mix(nx01_1b, nx11_1b, u.y);

  float nxyz1 = mix(nxy0_1, nxy1_1, u.z);

  return mix(nxyz0, nxyz1, u.w);
}

float fbm4D(vec3 pos, float w, float detail, float roughness,
            float lacunarity) {
  float total = 0.0;
  float amplitude = 1.0;
  float frequency = 1.0;
  float maxValue = 0.0;

  for (int i = 0; i < 8; i++) {
    if (float(i) >= detail)
      break;

    float noiseVal =
        valueNoise4D(vec4(pos * frequency, w * frequency)) * 2.0 - 1.0;
    total += noiseVal * amplitude;
    maxValue += amplitude;

    amplitude *= roughness;
    frequency *= lacunarity;
  }

  return total / maxValue;
}

float noiseTextureFBM(vec3 coord, float w, float scale, float detail,
                      float roughness, float lacunarity, float distortion) {
  vec3 p = coord * scale;

  if (distortion > 0.0) {
    vec4 warp = vec4(p, w) + valueNoise4D(vec4(p, w)) * distortion;
    p = warp.xyz;
    w = warp.w;
  }

  return fbm4D(p, w, detail, roughness, lacunarity);
}

vec3 addColors(vec3 c1, vec3 c2, float clampFactor) {
  vec3 result = c1 + c2;
  // clampFactor: 0.0 表示不钳制，1.0 表示完全钳制，中间值线性插值
  // 这里用 mix 来渐变地钳制结果
  vec3 clamped = clamp(result, 0.0, 1.0);
  return mix(result, clamped, clampFactor);
}

vec3 emissive(vec3 color, vec3 intensity) {
  // 自发光
  return color * intensity;
}

vec3 emissive(vec3 color, float intensity) {
  // 自发光
  return color * intensity;
}

void main() {
  vec3 viewDir = normalize(cameraPos - vWorldPos);
  vec3 normal = normalize(vNormal);

  vec3 baseColour = vec3(1.0, 1.0, 0.0);

  float fresnel = fresnel(viewDir, normal, 3.0);
  vec3 colour = colourRamp(fresnel, 0.0, 1.0);

  vec3 result1 = colour * 0.5;

  vec3 generatedCoord = getGeneratedCoord(vWorldPos);
  vec3 mappingVector =
      pointMapping(generatedCoord, vec3(0, 0, 0), vec3(0, 0, 0), vec3(1, 1, 1));

  // 第1种纹理
  float factor1 = noiseTextureFBM(mappingVector, w, 2.5, 10.0, 0.85, 2.0, 0.26);
  vec3 colour1 = colourRamp(factor1, 0.523, 0.773);

  // 第2种纹理
  float factor2 = noiseTextureFBM(mappingVector, w, 30.0, 4.0, 0.6, 2.0, 0.26);
  vec3 colour2 = colourRamp(factor1, 0.486, 1.0);

  // 第3种纹理
  float factor3 =
      noiseTextureFBM(mappingVector, 0.0, 120.0, 2.0, 0.5, 2.0, 0.0);
  vec3 colour3 = colourRamp(factor1, 0.514, 1.0);

  vec3 colourMixed = addColors(colour2, colour3, 1.0);

  vec3 colourRes = result1 + colour1 + colourMixed;
  colourRes *= 20.0;

  vec3 emission = emissive(baseColour, colour);

  gl_FragColor = vec4(emission, 1.0);
}