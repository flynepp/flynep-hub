uniform vec3 cameraPos;
uniform float r;
uniform float g;
uniform float b;

varying vec3 vNormal;
varying vec3 vWorldPos;
varying vec3 vLocalPos;

void main() {
  vec3 viewDir = normalize(cameraPos - vWorldPos);
  vec3 normal = normalize(vNormal);

  // 计算视线方向和法线的夹角余弦（dot product）
  float dp = dot(viewDir, normal);

  // 让边缘（法线与视线夹角接近90°，即dp接近0）更明显
  // 用smoothstep做一个柔和的过渡，让中心部分透明，边缘渐变显色
  float edgeFactor = smoothstep(0.0, 15.0, abs(dp));

  vec3 baseColour = vec3(r, g, b);

  // alpha 根据 edgeFactor 渐变，边缘更不透明
  gl_FragColor = vec4(baseColour, edgeFactor);
}
