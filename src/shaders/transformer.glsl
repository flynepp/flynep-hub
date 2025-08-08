
vec3 colourRamp(float factor, float blackPos, float whitePos, vec3 blackColor,
                vec3 whiteColor) {
  float t = clamp((factor - blackPos) / (whitePos - blackPos), 0.0, 1.0);
  return mix(blackColor, whiteColor, t);
}

vec3 colourRamp(float factor, float blackPos, float whitePos) {
  float t = clamp((factor - blackPos) / (whitePos - blackPos), 0.0, 1.0);
  return mix(vec3(0.0, 0.0, 0.0), vec3(1.0, 1.0, 1.0), t);
}

vec3 addColors(vec3 c1, vec3 c2, float clampFactor) {
  vec3 result = c1 + c2;
  // clampFactor: 0.0 表示不钳制，1.0 表示完全钳制，中间值线性插值
  // 这里用 mix 来渐变地钳制结果
  vec3 clamped = clamp(result, 0.0, 1.0);
  return mix(result, clamped, clampFactor);
}