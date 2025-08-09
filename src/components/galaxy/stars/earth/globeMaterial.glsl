varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPos;

uniform vec3 cameraPos;
uniform vec3 sunPos;
uniform sampler2D dayTexture;
uniform sampler2D nightTexture;
uniform sampler2D bumpMap;

void main() {
  vec3 dayColor = texture(dayTexture, vUv).rgb;
  vec3 nightColor = texture(nightTexture, vUv).rgb;
  vec3 bumpData = texture(bumpMap, vUv).rgb;
  nightColor *= 0.5;

  float cloudsStrength = smoothstep(0.2, 1.0, bumpData.b);

  vec3 normal = normalize(vNormal);
  vec3 lightDir = normalize(sunPos - vWorldPos);
  float sunOrientation = dot(normal, lightDir);

  vec3 viewDir = normalize(cameraPos - vWorldPos);
  float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);

  // dayStrength 和 atmosphereDayStrength 不变
  float dayStrength = smoothstep(-0.25, 0.6, sunOrientation);
  float atmosphereDayStrength = smoothstep(-0.5, 0.5, sunOrientation);

  // 计算大气混合的基础值（不包括透明度控制）
  float atmosphereMixRaw = clamp(atmosphereDayStrength * pow(fresnel, 2.0), 0.0, 1.0);

  // 让点积越接近1，大气越透明，简单用 (1 - sunOrientation) 调节混合度
  float transparencyFactor = smoothstep(0.1, 1.2, sunOrientation); // 0 ~ 1

  // 反转，让透明度变成“越大越透明”，用 (1 - transparencyFactor)
  float atmosphereMix = atmosphereMixRaw * (0.9 - transparencyFactor);

  vec3 atmosphereDayColor = vec3(0.302, 0.398, 0.8) * 0.7;
  vec3 atmosphereTwilightColor = vec3(0.237, 0.286, 0.043);

  vec3 atmosphereColor = mix(
    atmosphereTwilightColor,
    atmosphereDayColor,
    smoothstep(-0.25, 0.75, sunOrientation)
  );

  vec3 color = mix(nightColor * 0.3, dayColor, dayStrength);
  vec4 resColor = mix(vec4(color, 1.0), vec4(atmosphereColor * 0.5, 1.0), atmosphereMix);

  gl_FragColor = resColor;
}
