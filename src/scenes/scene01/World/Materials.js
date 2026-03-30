import * as THREE from 'three'

const fragmentShader = /* glsl */ `
precision highp float;
uniform vec3 uColor;
varying vec3 vNormal;
varying vec3 vViewDir;

void main() {
  vec3 n = normalize(vNormal);
  vec3 v = normalize(vViewDir);
  float rim = pow(1.0 - abs(dot(n, v)), 2.5);
  vec3 base = uColor * (0.25 + 0.35 * abs(dot(n, vec3(0.0, 1.0, 0.0))));
  vec3 col = base + uColor * rim * 0.85;
  gl_FragColor = vec4(col, 1.0);
}
`

const vertexShader = /* glsl */ `
varying vec3 vNormal;
varying vec3 vViewDir;

void main() {
  vec3 objectNormal = normalize(normal);
  vNormal = normalize(normalMatrix * objectNormal);
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vViewDir = normalize(-mvPosition.xyz);
  gl_Position = projectionMatrix * mvPosition;
}
`

/**
 * @param {'basic'|'lambert'|'phong'|'normal'|'matcap'|'standard'|'physical'|'toon'|'shader'} type
 * @param {{ color: THREE.Color, matcap: THREE.Texture | null }} opts
 */
export function createMaterialForType(type, { color, matcap }) {
  const c = color.clone()

  switch (type) {
    case 'basic':
      return new THREE.MeshBasicMaterial({ color: c })
    case 'lambert':
      return new THREE.MeshLambertMaterial({ color: c })
    case 'phong':
      return new THREE.MeshPhongMaterial({ color: c, shininess: 80, specular: 0x666666 })
    case 'normal':
      return new THREE.MeshNormalMaterial({ flatShading: false })
    case 'matcap': {
      const tex = matcap
      return new THREE.MeshMatcapMaterial({
        matcap: tex,
        color: new THREE.Color(0xffffff),
      })
    }
    case 'standard':
      return new THREE.MeshStandardMaterial({
        color: c,
        metalness: 0.2,
        roughness: 0.45,
      })
    case 'physical':
      return new THREE.MeshPhysicalMaterial({
        color: c,
        metalness: 0.15,
        roughness: 0.35,
        clearcoat: 0.35,
        clearcoatRoughness: 0.2,
      })
    case 'toon':
      return new THREE.MeshToonMaterial({ color: c })
    case 'shader':
      return new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: c },
        },
        vertexShader,
        fragmentShader,
      })
    default:
      return new THREE.MeshStandardMaterial({ color: c, metalness: 0.2, roughness: 0.45 })
  }
}

export function disposeMaterial(material) {
  if (!material) return
  if (Array.isArray(material)) {
    material.forEach(disposeMaterial)
    return
  }
  material.dispose()
}
