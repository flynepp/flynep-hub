uniform vec3 cameraPos;
uniform vec3 sunPos;

varying vec3 vNormal;
varying vec3 vWorldPosition;

// hexToRGB 这里不需要实现，直接用常量代替

const vec3 atmosphereDayColor = vec3(0.302, 0.698, 1.0); // #4db2ff
const vec3 atmosphereTwilightColor = vec3(0.737, 0.286, 0.043); // #bc490b

// remap 函数：将 x 从 [a,b] 映射到 [c,d]
float remap(float x, float a, float b, float c, float d) {
  return clamp((x - a) / (b - a), 0.0, 1.0) * (d - c) + c;
}

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDirection = normalize(cameraPos - vWorldPosition);
  vec3 sunDirection = normalize(sunPos - vWorldPosition);

  float sunOrientation = dot(normal, sunDirection);

  float fresnel = 1.0 - abs(dot(viewDirection, normal));

  float alphaBase = pow(remap(fresnel, 0.73, 1.0, 1.0, 0.0), 2.0);

  float edgeFade = smoothstep(0.0, 0.3, fresnel);

  float alphaSun = smoothstep(-0.5, 1.0, sunOrientation);

  float alpha = alphaBase * edgeFade * alphaSun;

  float dotNV = dot(viewDirection, normal);
  float edgeStart = 0.0;
  float edgeEnd = 1.0;

  float edgeFactor = 1.0 - smoothstep(edgeStart, edgeEnd, abs(dotNV));

  alpha *= pow(edgeFactor, 1.5);

  float t = smoothstep(-0.5, 1.0, sunOrientation);
  vec3 atmColor = mix(atmosphereTwilightColor, atmosphereDayColor, t);

  vec3 scatterColor = vec3(0.5, 0.7, 1.0);
  atmColor = mix(atmColor, scatterColor, 1.0 - alpha);

  gl_FragColor = vec4(atmColor, alpha * 0.5);
}

