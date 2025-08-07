
vec3 colourRamp(float factor, float blackPos, float whitePos, vec3 blackColor,
                vec3 whiteColor) {
  float t = clamp((factor - blackPos) / (whitePos - blackPos), 0.0, 1.0);
  return mix(blackColor, whiteColor, t);
}

vec3 colourRamp(float factor, float blackPos, float whitePos) {
  float t = clamp((factor - blackPos) / (whitePos - blackPos), 0.0, 1.0);
  return mix(vec3(0.0, 0.0, 0.0), vec3(1.0, 1.0, 1.0), t);
}
