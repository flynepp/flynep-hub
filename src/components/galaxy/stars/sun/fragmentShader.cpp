uniform float time;
uniform vec3 emissionColor;
uniform float emissionIntensity;

varying vec3 vPosition;
varying vec3 vNormal;

${INPUT.LayerWeight()};
${TRANSFORMER.ColourRamp()};

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(cameraPos - vPosition);

  float fresnelWeight = fresnel(viweDir, normal, 0.035);
  vec3 colour = colorRamp(fresnelWeight, 0, 1);
}