uniform vec3 cameraPos;
uniform vec3 bboxMin;
uniform vec3 bboxSize;
uniform float w;

varying vec3 vNormal;
varying vec3 vWorldPos;
varying vec3 vLocalPos;

vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }

float mod289(float x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }

vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }

float permute(float x) { return mod289(((x * 34.0) + 10.0) * x); }

vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float taylorInvSqrt(float r) { return 1.79284291400159 - 0.85373472095314 * r; }

vec4 grad4(float j, vec4 ip) {
  const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
  vec4 p, s;

  p.xyz = floor(fract(vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
  p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
  s = vec4(lessThan(p, vec4(0.0)));
  p.xyz = p.xyz + (s.xyz * 2.0 - 1.0) * s.www;

  return p;
}

// (sqrt(5) - 1)/4 = F4, used once below
#define F4 0.309016994374947451

float snoise(vec4 v) {
  const vec4 C = vec4(0.138196601125011,   // (5 - sqrt(5))/20  G4
                      0.276393202250021,   // 2 * G4
                      0.414589803375032,   // 3 * G4
                      -0.447213595499958); // -1 + 4 * G4

  // First corner
  vec4 i = floor(v + dot(v, vec4(F4)));
  vec4 x0 = v - i + dot(i, C.xxxx);

  // Other corners

  // Rank sorting originally contributed by Bill Licea-Kane, AMD (formerly ATI)
  vec4 i0;
  vec3 isX = step(x0.yzw, x0.xxx);
  vec3 isYZ = step(x0.zww, x0.yyz);
  //  i0.x = dot( isX, vec3( 1.0 ) );
  i0.x = isX.x + isX.y + isX.z;
  i0.yzw = 1.0 - isX;
  //  i0.y += dot( isYZ.xy, vec2( 1.0 ) );
  i0.y += isYZ.x + isYZ.y;
  i0.zw += 1.0 - isYZ.xy;
  i0.z += isYZ.z;
  i0.w += 1.0 - isYZ.z;

  // i0 now contains the unique values 0,1,2,3 in each channel
  vec4 i3 = clamp(i0, 0.0, 1.0);
  vec4 i2 = clamp(i0 - 1.0, 0.0, 1.0);
  vec4 i1 = clamp(i0 - 2.0, 0.0, 1.0);

  //  x0 = x0 - 0.0 + 0.0 * C.xxxx
  //  x1 = x0 - i1  + 1.0 * C.xxxx
  //  x2 = x0 - i2  + 2.0 * C.xxxx
  //  x3 = x0 - i3  + 3.0 * C.xxxx
  //  x4 = x0 - 1.0 + 4.0 * C.xxxx
  vec4 x1 = x0 - i1 + C.xxxx;
  vec4 x2 = x0 - i2 + C.yyyy;
  vec4 x3 = x0 - i3 + C.zzzz;
  vec4 x4 = x0 + C.wwww;

  // Permutations
  i = mod289(i);
  float j0 = permute(permute(permute(permute(i.w) + i.z) + i.y) + i.x);
  vec4 j1 = permute(permute(permute(permute(i.w + vec4(i1.w, i2.w, i3.w, 1.0)) +
                                    i.z + vec4(i1.z, i2.z, i3.z, 1.0)) +
                            i.y + vec4(i1.y, i2.y, i3.y, 1.0)) +
                    i.x + vec4(i1.x, i2.x, i3.x, 1.0));

  // Gradients: 7x7x6 points over a cube, mapped onto a 4-cross polytope
  // 7*7*6 = 294, which is close to the ring size 17*17 = 289.
  vec4 ip = vec4(1.0 / 294.0, 1.0 / 49.0, 1.0 / 7.0, 0.0);

  vec4 p0 = grad4(j0, ip);
  vec4 p1 = grad4(j1.x, ip);
  vec4 p2 = grad4(j1.y, ip);
  vec4 p3 = grad4(j1.z, ip);
  vec4 p4 = grad4(j1.w, ip);

  // Normalise gradients
  vec4 norm =
      taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  p4 *= taylorInvSqrt(dot(p4, p4));

  // Mix contributions from the five corners
  vec3 m0 = max(0.6 - vec3(dot(x0, x0), dot(x1, x1), dot(x2, x2)), 0.0);
  vec2 m1 = max(0.6 - vec2(dot(x3, x3), dot(x4, x4)), 0.0);
  m0 = m0 * m0;
  m1 = m1 * m1;
  return 49.0 * (dot(m0 * m0, vec3(dot(p0, x0), dot(p1, x1), dot(p2, x2))) +
                 dot(m1 * m1, vec2(dot(p3, x3), dot(p4, x4))));
}

float fbm4D(vec3 pos, float w, float detail, float roughness,
            float lacunarity) {
  float total = 0.0;
  float amplitude = 1.0;
  float frequency = 1.0;
  float maxValue = 0.0;

  // 处理 detail 的整数和小数部分，做混合
  int intDetail = int(floor(detail));
  float fracDetail = detail - float(intDetail);

  for (int i = 0; i <= intDetail; i++) {
    float noiseVal = snoise(vec4(pos * frequency, w * frequency));
    noiseVal = noiseVal * 0.5 + 0.5; // 映射到0-1

    // 最后一个octave做插值
    if (float(i) == float(intDetail)) {
      noiseVal *= fracDetail;
    }

    total += noiseVal * amplitude;
    maxValue += amplitude * (float(i) == float(intDetail) ? fracDetail : 1.0);

    amplitude *= roughness;
    frequency *= lacunarity;
  }

  return total / maxValue;
}

// 然后你自己包装一个接口函数
float noiseTextureFBM(vec3 coord, float w, float scale, float detail,
                      float roughness, float lacunarity, float distortion) {
  vec3 p = coord * scale;

  if (distortion > 0.0) {
    vec4 warp = vec4(p, w) + vec4(snoise(vec4(p, w))) * distortion;
    p = warp.xyz;
    w = warp.w;
  }

  return fbm4D(p, w, detail, roughness, lacunarity);
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

vec3 getGeneratedCoord(vec3 objectPosition) {
  return (objectPosition - bboxMin) / bboxSize;
}

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

void main() {
  vec3 viewDir = normalize(cameraPos - vWorldPos);
  vec3 normal = normalize(vNormal);

  vec3 baseColour = vec3(0.8, 0.68, 0.34);

  vec3 generatedCoord = getGeneratedCoord(vLocalPos);
  vec3 mappingVector = pointMapping(generatedCoord, vec3(0.0, 0.0, 0.0),
                                    vec3(0.0, 0.0, 0.0), vec3(1.0, 1.0, 1.0));

  float factor = noiseTextureFBM(mappingVector, w, 2.5, 15.0, 0.8, 3.0, 2.0);
  float whitePos = 1.0;
  float blackPos = 0.523;
  float t = clamp((factor - blackPos) / (whitePos - blackPos), 0.0, 1.0);

  vec4 opacityShader = opacity(baseColour, 0.0);
  vec4 emissiveShader = vec4(baseColour, 1.0) * 20.0;

  vec4 result = mix(opacityShader, emissiveShader, t);

  gl_FragColor = result;
}