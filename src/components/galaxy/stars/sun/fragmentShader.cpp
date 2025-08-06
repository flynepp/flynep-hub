uniform vec3 cameraPos;

varying vec3 vPosition;
varying vec3 vNormal;

${INPUT.LayerWeight()};
${TRANSFORMER.ColourRamp()};

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(cameraPos - vPosition);

  float fresnelWeight = fresnel(viewDir, normal, 0.035);
  vec3 colour = colourRamp(fresnelWeight, 0.0, 1.0, vec3(0.0, 0.0, 0.0),
                           vec3(1.0, 1.0, 1.0));

  gl_FragColor = vec4(colour, 1.0);
}