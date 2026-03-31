precision highp float;

uniform vec3 uBaseColor;
uniform vec3 uLightDirection;
uniform vec3 uAmbientColor;

varying vec3 vNormal;
varying vec3 vWorldPosition;

void main() {
  vec3 n = normalize(vNormal);
  vec3 l = normalize(uLightDirection);
  float diffuse = max(dot(n, l), 0.0);

  vec3 viewDir = normalize(cameraPosition - vWorldPosition);
  float fresnel = pow(1.0 - max(dot(n, viewDir), 0.0), 1.0);

  vec3 color = vec3(1.);//(uAmbientColor + diffuse) * uBaseColor;
  float alpha = 1.0 - fresnel;
  gl_FragColor = vec4(color, alpha);
}
