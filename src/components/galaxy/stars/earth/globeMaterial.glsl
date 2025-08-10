varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPos;

uniform vec3 cameraPos;
uniform vec3 sunPos;
uniform sampler2D dayTexture;
uniform sampler2D nightTexture;
uniform sampler2D bumpMap;

void main() {
  vec3 dayColor = texture2D(dayTexture, vUv).rgb;
  vec3 nightColor = texture2D(nightTexture, vUv).rgb;
  vec3 bumpData = texture2D(bumpMap, vUv).rgb;

  float cloudsStrength = smoothstep(0.2, 1.0, bumpData.b);

  vec3 normal = normalize(vNormal);
  vec3 lightDir = normalize(sunPos - vWorldPos);
  float sunOrientation = dot(normal, lightDir);

  vec3 viewDir = normalize(cameraPos - vWorldPos);

  float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);

  float dayStrength = smoothstep(-0.25, 0.6, sunOrientation);

  float atmosphereDayStrength = smoothstep(-0.5, 0.5, sunOrientation);
  float atmosphereMixRaw = clamp(atmosphereDayStrength * pow(fresnel, 2.0), 0.0, 1.0);
  float transparencyFactor = smoothstep(0.1, 1.2, sunOrientation);
  float atmosphereMix = atmosphereMixRaw * (0.9 - transparencyFactor);

  vec3 atmosphereDayColor = vec3(0.302, 0.398, 0.8) * 0.7;
  vec3 atmosphereTwilightColor = vec3(0.237, 0.286, 0.043);
  vec3 atmosphereColor = mix(
    atmosphereTwilightColor,
    atmosphereDayColor,
    smoothstep(-0.25, 0.75, sunOrientation)
  );

  vec3 cloudColor = vec3(1.0);
  vec3 dayWithClouds = mix(dayColor, cloudColor, cloudsStrength);

  vec3 scatterColor = vec3(0.5, 0.7, 1.0);
  float scatterIntensity = pow(fresnel, 1.5);
  vec3 dayWithScatter = mix(dayWithClouds, scatterColor, scatterIntensity * 0.6);

  vec3 baseColor = mix(nightColor * 0.3, dayWithScatter, dayStrength);

  vec4 resColor = mix(vec4(baseColor, 1.0), vec4(atmosphereColor * 0.5, 1.0), atmosphereMix);

  gl_FragColor = resColor;
}
