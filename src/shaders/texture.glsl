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

    float noiseVal = valueNoise4D(vec4(pos * frequency, w * frequency));
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