import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import '../../sceneNav.js'
import Debug from '../../Experience/Utils/Debug.js'

const leftPane = document.querySelector('[data-scene06-left]')
const treeHost = document.querySelector('[data-scene06-tree]')
const dropzone = document.querySelector('[data-scene06-dropzone]')
const canvas = document.querySelector('canvas.scene06-webgl')
const modeButtons = /** @type {NodeListOf<HTMLButtonElement>} */ (
  document.querySelectorAll('[data-scene06-mode-btn]')
)

if (
  !(leftPane instanceof HTMLElement) ||
  !(treeHost instanceof HTMLElement) ||
  !(dropzone instanceof HTMLElement) ||
  !(canvas instanceof HTMLCanvasElement)
) {
  throw new Error('UI scene06 introuvable')
}

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true

const scene = new THREE.Scene()
scene.background = new THREE.Color('#090b12')

const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200)
camera.position.set(3.4, 2.2, 4.4)
scene.add(camera)

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.target.set(0, 1, 0)

const ambient = new THREE.AmbientLight(0xffffff, 0.35)
scene.add(ambient)

const directional = new THREE.DirectionalLight(0xffffff, 1.5)
directional.position.set(4, 7, 5)
directional.castShadow = true
scene.add(directional)

const root = new THREE.Group()
scene.add(root)

const loader = new GLTFLoader()
const clock = new THREE.Clock()

const debug = new Debug()
const settings = {
  autoRotate: true,
  rotateSpeed: 0.6,
  roughness: 1.0,
  normalScale: 1.0,
  additiveBlend: false,
  pointSize: 0.02,
  pointDisplacement: 0.03,
  pointNoiseSpeed: 0.7,
  drawMode: 'triangles',
}

if (debug.active && debug.ui) {
  const f = debug.ui.addFolder('Scene06 modèle')
  f.add(settings, 'autoRotate').name('Auto-rotation')
  f.add(settings, 'rotateSpeed', 0, 4, 0.01).name('Vitesse')
  f.add(settings, 'drawMode', ['triangles', 'lines', 'points'])
    .name('Draw type')
    .onChange((v) => setDrawMode(v))
  f.add(settings, 'roughness', 0, 5, 0.01).name('Roughness').onChange(applyGlobalMaterialSettings)
  f.add(settings, 'normalScale', 0, 5, 0.01).name('Normal scale').onChange(applyGlobalMaterialSettings)
  f.add(settings, 'pointSize', 0.005, 0.05, 0.001).name('Point size').onChange(updatePointMaterialSettings)
  f.add(settings, 'pointDisplacement', 0, 0.2, 0.001)
    .name('Point disp')
    .onChange(updatePointMaterialSettings)
  f.add(settings, 'pointNoiseSpeed', 0, 4, 0.01).name('Noise speed').onChange(updatePointMaterialSettings)
  f.add(settings, 'additiveBlend').name('Blend additif').onChange(updatePointMaterialSettings)
}

/** @type {THREE.Object3D | null} */
let modelRoot = null
let lineRoot = null
let pointRoot = null
/** @type {Map<THREE.Material, { emissive: THREE.Color, emissiveIntensity: number }> | null} */
let emissiveBackup = null
let pulseTarget = null
let drawMode = 'triangles'

function resize() {
  const w = leftPane.clientWidth
  const h = leftPane.clientHeight
  renderer.setSize(w, h, false)
  camera.aspect = w / Math.max(1, h)
  camera.updateProjectionMatrix()
  updatePointMaterialSettings()
}

function clearModel() {
  if (!modelRoot) return
  root.remove(modelRoot)
  if (lineRoot) root.remove(lineRoot)
  if (pointRoot) root.remove(pointRoot)
  modelRoot.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return
    obj.geometry?.dispose?.()
  })
  lineRoot?.traverse((obj) => {
    if (obj instanceof THREE.LineSegments) {
      obj.geometry?.dispose?.()
      obj.material?.dispose?.()
    }
  })
  pointRoot?.traverse((obj) => {
    if (obj instanceof THREE.Points) {
      obj.geometry?.dispose?.()
      obj.material?.dispose?.()
    }
  })
  modelRoot = null
  lineRoot = null
  pointRoot = null
  treeHost.innerHTML = ''
  clearPulse()
}

function clearPulse() {
  if (!emissiveBackup) return
  for (const [mat, saved] of emissiveBackup.entries()) {
    if ('emissive' in mat) mat.emissive.copy(saved.emissive)
    if ('emissiveIntensity' in mat) mat.emissiveIntensity = saved.emissiveIntensity
  }
  emissiveBackup = null
  pulseTarget = null
}

function resolvePulseMesh(node) {
  if (node instanceof THREE.Mesh) return node
  let mesh = null
  node.traverse((child) => {
    if (!mesh && child instanceof THREE.Mesh) mesh = child
  })
  return mesh
}

function startPulse(node) {
  clearPulse()
  const mesh = resolvePulseMesh(node)
  if (!mesh) return

  const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
  emissiveBackup = new Map()
  pulseTarget = mesh

  for (const mat of mats) {
    if (!mat || !('emissive' in mat)) continue
    emissiveBackup.set(mat, {
      emissive: mat.emissive.clone(),
      emissiveIntensity: 'emissiveIntensity' in mat ? mat.emissiveIntensity : 1,
    })
    mat.emissive.set('#ff4d1f')
  }
}

function pulseUpdate(timeSec) {
  if (!emissiveBackup || !pulseTarget) return
  const pulse = 0.25 + 0.95 * (0.5 + 0.5 * Math.sin(timeSec * 7.2))
  for (const mat of emissiveBackup.keys()) {
    if ('emissiveIntensity' in mat) mat.emissiveIntensity = pulse
  }
}

function getNodeLabel(node, index) {
  const base = node.name?.trim()
  if (base) return base
  return `${node.type} #${index}`
}

function buildTreeView(rootNode) {
  treeHost.innerHTML = ''
  let serial = 0

  const buildItem = (node, depth) => {
    serial += 1
    const row = document.createElement('button')
    row.type = 'button'
    row.className = 'scene06-tree__item'
    row.style.paddingLeft = `${8 + depth * 14}px`
    row.textContent = getNodeLabel(node, serial)
    row.addEventListener('click', () => startPulse(node))
    treeHost.appendChild(row)
    for (const child of node.children) buildItem(child, depth + 1)
  }

  buildItem(rootNode, 0)
}

function applyGlobalMaterialSettings() {
  if (!modelRoot) return
  modelRoot.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
    for (const mat of mats) {
      if (!mat) continue
      if ('roughness' in mat) mat.roughness = settings.roughness
      if ('normalScale' in mat && mat.normalScale) mat.normalScale.set(settings.normalScale, settings.normalScale)
      mat.needsUpdate = true
    }
  })
}

function createPointShaderMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: settings.additiveBlend ? THREE.AdditiveBlending : THREE.NormalBlending,
    uniforms: {
      uColor: { value: new THREE.Color('#e5ecff') },
      uPointSize: { value: settings.pointSize },
      uResolutionY: { value: Math.max(1, leftPane.clientHeight) },
      uTime: { value: 0 },
      uDisplacement: { value: settings.pointDisplacement },
      uNoiseSpeed: { value: settings.pointNoiseSpeed },
    },
    vertexShader: `
uniform float uPointSize;
uniform float uResolutionY;
uniform float uTime;
uniform float uDisplacement;
uniform float uNoiseSpeed;

float hash(vec3 p) {
  return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
}

void main() {
  vec3 seed = position * 3.17 + vec3(uTime * uNoiseSpeed);
  vec3 noiseDir = normalize(vec3(
    hash(seed + vec3(1.0, 0.0, 0.0)) * 2.0 - 1.0,
    hash(seed + vec3(0.0, 1.0, 0.0)) * 2.0 - 1.0,
    hash(seed + vec3(0.0, 0.0, 1.0)) * 2.0 - 1.0
  ));
  float noiseAmp = hash(seed + vec3(4.2, 8.1, 2.7));
  vec3 displaced = position + noiseDir * (noiseAmp * uDisplacement);

  vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  float depthScale = 1.0 / max(0.0001, -mvPosition.z);
  float sizePx = uPointSize * uResolutionY * depthScale;
  gl_PointSize = clamp(sizePx, 1.0, 96.0);
}
`,
    fragmentShader: `
precision highp float;
uniform vec3 uColor;

void main() {
  vec2 p = gl_PointCoord - vec2(0.5);
  float d = length(p);
  float alpha = 1.0 - smoothstep(0.42, 0.5, d);
  if (alpha <= 0.0) discard;
  gl_FragColor = vec4(uColor, alpha);
}
`,
  })
}

function updatePointMaterialSettings() {
  if (!pointRoot) return
  pointRoot.traverse((obj) => {
    if (!(obj instanceof THREE.Points)) return
    const mat = obj.material
    if (!(mat instanceof THREE.ShaderMaterial)) return
    mat.uniforms.uPointSize.value = settings.pointSize
    mat.uniforms.uResolutionY.value = Math.max(1, leftPane.clientHeight)
    mat.uniforms.uDisplacement.value = settings.pointDisplacement
    mat.uniforms.uNoiseSpeed.value = settings.pointNoiseSpeed
    mat.blending = settings.additiveBlend ? THREE.AdditiveBlending : THREE.NormalBlending
    mat.needsUpdate = true
  })
}

function buildAlternateRenderModes() {
  if (!modelRoot) return
  modelRoot.updateMatrixWorld(true)

  lineRoot = new THREE.Group()
  pointRoot = new THREE.Group()
  modelRoot.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return
    const worldMatrix = obj.matrixWorld.clone()

    const lineGeometry = new THREE.WireframeGeometry(obj.geometry)
    const lineMaterial = new THREE.LineBasicMaterial({ color: '#dce6ff' })
    const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial)
    lineSegments.matrixAutoUpdate = false
    lineSegments.matrix.copy(worldMatrix)
    lineRoot.add(lineSegments)

    const points = new THREE.Points(obj.geometry.clone(), createPointShaderMaterial())
    points.matrixAutoUpdate = false
    points.matrix.copy(worldMatrix)
    pointRoot.add(points)
  })

  root.add(lineRoot)
  root.add(pointRoot)
  updatePointMaterialSettings()
}

function syncDrawModeVisibility() {
  if (!modelRoot) return
  modelRoot.visible = drawMode === 'triangles'
  if (lineRoot) lineRoot.visible = drawMode === 'lines'
  if (pointRoot) pointRoot.visible = drawMode === 'points'
}

function setDrawMode(mode) {
  drawMode = mode
  settings.drawMode = mode
  modeButtons.forEach((btn) => {
    const active = btn.dataset.scene06ModeBtn === mode
    btn.classList.toggle('scene06-modes__btn--active', active)
  })
  syncDrawModeVisibility()
}

function centerAndScaleModel(object) {
  const box = new THREE.Box3().setFromObject(object)
  const center = box.getCenter(new THREE.Vector3())
  const size = box.getSize(new THREE.Vector3())
  object.position.sub(center)

  const maxDim = Math.max(size.x, size.y, size.z, 0.0001)
  const targetSize = 2.4
  const scale = targetSize / maxDim
  object.scale.setScalar(scale)
}

function loadFromFile(file) {
  if (!file || !file.name.toLowerCase().endsWith('.glb')) return
  const url = URL.createObjectURL(file)
  loader.load(
    url,
    (gltf) => {
      clearModel()
      modelRoot = gltf.scene
      modelRoot.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.castShadow = true
          obj.receiveShadow = true
        }
      })
      centerAndScaleModel(modelRoot)
      root.add(modelRoot)
      buildAlternateRenderModes()
      applyGlobalMaterialSettings()
      buildTreeView(modelRoot)
      syncDrawModeVisibility()
      dropzone.classList.add('scene06-dropzone--hidden')
      controls.target.set(0, 0, 0)
    },
    undefined,
    (e) => {
      console.error('Erreur de chargement GLB', e)
    },
  )
}

function installDropzone() {
  const prevent = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  for (const evt of ['dragenter', 'dragover', 'dragleave', 'drop']) {
    dropzone.addEventListener(evt, prevent)
    window.addEventListener(evt, prevent)
  }

  dropzone.addEventListener('dragover', () => {
    dropzone.classList.add('scene06-dropzone--active')
  })
  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('scene06-dropzone--active')
  })
  dropzone.addEventListener('drop', (e) => {
    dropzone.classList.remove('scene06-dropzone--active')
    const file = e.dataTransfer?.files?.[0]
    if (file) loadFromFile(file)
  })
}

function installDrawModeButtons() {
  modeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.scene06ModeBtn
      if (!mode) return
      setDrawMode(mode)
    })
  })
}

function tick() {
  const dt = clock.getDelta()
  const t = clock.elapsedTime
  controls.update()
  if (modelRoot && settings.autoRotate) modelRoot.rotation.y += settings.rotateSpeed * dt
  pulseUpdate(t)
  if (pointRoot) {
    pointRoot.traverse((obj) => {
      if (!(obj instanceof THREE.Points)) return
      const mat = obj.material
      if (!(mat instanceof THREE.ShaderMaterial)) return
      mat.uniforms.uTime.value = t
    })
  }
  renderer.render(scene, camera)
  requestAnimationFrame(tick)
}

installDropzone()
installDrawModeButtons()
window.addEventListener('resize', resize)
resize()
tick()
