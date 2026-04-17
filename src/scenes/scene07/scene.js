import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import '../../sceneNav.js'
import Debug from '../../Experience/Utils/Debug.js'

const canvas = document.querySelector('canvas.scene07-webgl')
const dropzone = document.querySelector('[data-scene07-dropzone]')

if (!(canvas instanceof HTMLCanvasElement) || !(dropzone instanceof HTMLElement)) {
  throw new Error('UI scene07 introuvable')
}

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true

const scene = new THREE.Scene()
scene.background = new THREE.Color('#090b12')

// Hors Experience : page full canvas ; `resize()` aligne aspect + renderer sur `window`.
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200)
camera.position.set(3.4, 2.2, 4.4)
scene.add(camera)

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.target.set(0, 1, 0)

const ambient = new THREE.AmbientLight(0xffffff, 1.5)
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
  modeDuration: 7,
  transitionDuration: 1.4,
  drawMode: 'points',
  pointTessellation: 0,
  ambientIntensity: 0.5,
  directionalIntensity: 1.5,
  pointSize: 0.005,
  pointSizePulse: false,
  pointSizePulseDuration: 4,
  pointSizePulseAmplitude: 0.25,
}

if (debug.active && debug.ui) {
  const f = debug.ui.addFolder('Scene07 modèle')
  f.add(settings, 'drawMode', ['cycle', 'triangles', 'lines', 'points'])
    .name('Mode draw')
    .onChange(() => {
      modeCycleStart = clock.elapsedTime
      applyDrawMode(0)
    })
  f.add(settings, 'autoRotate').name('Auto-rotation')
  f.add(settings, 'rotateSpeed', 0, 4, 0.01).name('Vitesse')
  f.add(settings, 'roughness', 0, 5, 0.01).name('Roughness').onChange(applyGlobalMaterialSettings)
  f.add(settings, 'normalScale', 0, 5, 0.01).name('Normal scale').onChange(applyGlobalMaterialSettings)
  f.add(settings, 'modeDuration', 2, 15, 0.1).name('Durée mode (s)')
  f.add(settings, 'transitionDuration', 0.2, 4, 0.05).name('Transition (s)')
  f.add(settings, 'pointTessellation', 0, 16 , 1)
    .name('Tessellation points')
    .onChange(() => rebuildPointRenderMode())
  f.add(settings, 'pointSize', 0.002, 0.01, 0.0001)
    .name('Taille points')
    .onChange(() => updatePointMaterialUniforms())
  f.add(settings, 'pointSizePulse')
    .name('Anim. taille points')
    .onChange(() => updatePointMaterialUniforms())
  f.add(settings, 'pointSizePulseDuration', 0, 8, 0.01)
    .name('Durée anim. points (s)')
    .onChange(() => updatePointMaterialUniforms())
  f.add(settings, 'pointSizePulseAmplitude', 0, 1, 0.01)
    .name('Amplitude anim. points')
    .onChange(() => updatePointMaterialUniforms())

  const lf = debug.ui.addFolder('Scene07 lumières')
  lf.add(settings, 'ambientIntensity', 0, 3, 0.01)
    .name('Ambient')
    .onChange(applyLightSettings)
  lf.add(settings, 'directionalIntensity', 0, 5, 0.01)
    .name('Directionnelle')
    .onChange(applyLightSettings)
}

/** @type {THREE.Object3D | null} */
let modelRoot = null
let lineRoot = null
let pointRoot = null
let modeCycleStart = 0

function applyLightSettings() {
  ambient.intensity = settings.ambientIntensity
  directional.intensity = settings.directionalIntensity
}

function resize() {
  const w = window.innerWidth
  const h = window.innerHeight
  renderer.setSize(w, h, false)
  camera.aspect = w / Math.max(1, h)
  camera.updateProjectionMatrix()
  updatePointMaterialUniforms()
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
      if ('opacity' in mat) mat.transparent = true
      mat.needsUpdate = true
    }
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
    const lineMaterial = new THREE.LineBasicMaterial({
      color: '#dce6ff',
      transparent: true,
      opacity: 0,
      depthWrite: false,
    })
    const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial)
    lineSegments.matrixAutoUpdate = false
    lineSegments.matrix.copy(worldMatrix)
    lineRoot.add(lineSegments)

    const pointsGeometry = createDensifiedPointGeometry(obj.geometry, settings.pointTessellation)
    const pointsMaterial = createPointMaterial()
    const points = new THREE.Points(pointsGeometry, pointsMaterial)
    points.matrixAutoUpdate = false
    points.matrix.copy(worldMatrix)
    pointRoot.add(points)
  })

  root.add(lineRoot)
  root.add(pointRoot)
  updatePointMaterialUniforms()
}

function disposePointRoot() {
  pointRoot?.traverse((obj) => {
    if (obj instanceof THREE.Points) {
      obj.geometry?.dispose?.()
      obj.material?.dispose?.()
    }
  })
}

function rebuildPointRenderMode() {
  if (!modelRoot) return
  modelRoot.updateMatrixWorld(true)
  if (pointRoot) {
    root.remove(pointRoot)
    disposePointRoot()
  }
  pointRoot = new THREE.Group()

  modelRoot.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return
    const worldMatrix = obj.matrixWorld.clone()
    const pointsGeometry = createDensifiedPointGeometry(obj.geometry, settings.pointTessellation)
    const pointsMaterial = createPointMaterial()
    const points = new THREE.Points(pointsGeometry, pointsMaterial)
    points.matrixAutoUpdate = false
    points.matrix.copy(worldMatrix)
    pointRoot.add(points)
  })

  root.add(pointRoot)
  updatePointMaterialUniforms()
  applyDrawMode(clock.elapsedTime - modeCycleStart)
}

function createDensifiedPointGeometry(geometry, tessellationLevel = 0) {
  const level = Math.max(0, Math.floor(tessellationLevel))
  if (level <= 0) return geometry.clone()

  const source = geometry.index ? geometry.toNonIndexed() : geometry
  const pos = source.getAttribute('position')
  if (!pos) return geometry.clone()

  const triangleCount = Math.floor(pos.count / 3)
  if (triangleCount <= 0) return geometry.clone()

  const pointsPerTriangle = ((level + 1) * (level + 2)) / 2
  const maxPoints = 180000
  const estimated = triangleCount * pointsPerTriangle
  const stride = Math.max(1, Math.ceil(estimated / maxPoints))

  const out = []
  const a = new THREE.Vector3()
  const b = new THREE.Vector3()
  const c = new THREE.Vector3()
  let sampleId = 0

  for (let tri = 0; tri < triangleCount; tri += 1) {
    const i0 = tri * 3
    const i1 = i0 + 1
    const i2 = i0 + 2
    a.fromBufferAttribute(pos, i0)
    b.fromBufferAttribute(pos, i1)
    c.fromBufferAttribute(pos, i2)

    for (let i = 0; i <= level; i += 1) {
      for (let j = 0; j <= level - i; j += 1) {
        sampleId += 1
        if (sampleId % stride !== 0) continue
        const u = i / level
        const v = j / level
        const w = 1 - u - v
        out.push(
          a.x * w + b.x * u + c.x * v,
          a.y * w + b.y * u + c.y * v,
          a.z * w + b.z * u + c.z * v,
        )
      }
    }
  }

  if (out.length === 0) return geometry.clone()
  const densified = new THREE.BufferGeometry()
  densified.setAttribute('position', new THREE.Float32BufferAttribute(out, 3))
  return densified
}

function createPointMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uColor: { value: new THREE.Color('#3b82f6') },
      uPointSize: { value: settings.pointSize },
      uResolutionY: { value: Math.max(1, window.innerHeight) },
      uOpacity: { value: 0 },
      uAlpha: { value: 0.75 },
    },
    vertexShader: `
uniform float uPointSize;
uniform float uResolutionY;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  float depthScale = 1.0 / max(0.0001, -mvPosition.z);
  float sizePx = uPointSize * uResolutionY * depthScale;
  gl_PointSize = clamp(sizePx, 1.0, 96.0);
}
`,
    fragmentShader: `
precision highp float;
uniform vec3 uColor;
uniform float uOpacity;
uniform float uAlpha;

void main() {
  vec2 p = gl_PointCoord - vec2(0.5);
  float d = length(p);
  float alpha = (1.0 - smoothstep(0.4, 0.5, d)) * uOpacity * uAlpha;
  if (alpha <= 0.0) discard;
  gl_FragColor = vec4(uColor, alpha);
}
`,
  })
}

function effectivePointSizePx(timeSec) {
  const base = settings.pointSize
  if (!settings.pointSizePulse) return base
  const duration = Math.max(0.001, settings.pointSizePulseDuration)
  const wobble = 1 + settings.pointSizePulseAmplitude * Math.sin((2 * Math.PI * timeSec) / duration)
  return base * wobble
}

/** @param {number} [timeSec] temps pour l'animation (défaut: horloge) */
function updatePointMaterialUniforms(timeSec = clock.elapsedTime) {
  if (!pointRoot) return
  const h = Math.max(1, window.innerHeight)
  const sizePx = effectivePointSizePx(timeSec)
  pointRoot.traverse((obj) => {
    if (!(obj instanceof THREE.Points)) return
    const mat = obj.material
    if (!(mat instanceof THREE.ShaderMaterial)) return
    mat.uniforms.uResolutionY.value = h
    mat.uniforms.uPointSize.value = sizePx
  })
}

function smoothstep01(t) {
  const x = Math.min(1, Math.max(0, t))
  return x * x * (3 - 2 * x)
}

function getModeWeights(timeSec) {
  const modeDuration = Math.max(0.1, settings.modeDuration)
  const transitionDuration = Math.min(Math.max(0.01, settings.transitionDuration), modeDuration * 0.49)
  const idx = Math.floor(timeSec / modeDuration) % 3
  const local = timeSec % modeDuration
  const weights = [0, 0, 0]
  weights[idx] = 1

  if (local >= modeDuration - transitionDuration) {
    const nextIdx = (idx + 1) % 3
    const t = (local - (modeDuration - transitionDuration)) / transitionDuration
    const s = smoothstep01(t)
    weights[idx] = 1 - s
    weights[nextIdx] = s
  }

  return weights
}

function setMeshOpacity(group, opacity) {
  if (!group) return
  const visible = opacity > 0.001
  group.visible = visible
  if (!visible) return
  group.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
    for (const mat of mats) {
      if (!mat || !('opacity' in mat)) continue
      mat.transparent = true
      mat.opacity = opacity
      mat.needsUpdate = true
    }
  })
}

function setLineOpacity(group, opacity) {
  if (!group) return
  const visible = opacity > 0.001
  group.visible = visible
  if (!visible) return
  group.traverse((obj) => {
    if (!(obj instanceof THREE.LineSegments)) return
    const mat = obj.material
    if (!(mat instanceof THREE.LineBasicMaterial)) return
    mat.opacity = opacity
    mat.needsUpdate = true
  })
}

function setPointOpacity(group, opacity) {
  if (!group) return
  const visible = opacity > 0.001
  group.visible = visible
  if (!visible) return
  group.traverse((obj) => {
    if (!(obj instanceof THREE.Points)) return
    const mat = obj.material
    if (!(mat instanceof THREE.ShaderMaterial)) return
    mat.uniforms.uOpacity.value = opacity
    mat.needsUpdate = true
  })
}

function updateRenderModeAnimation(elapsedSec) {
  if (!modelRoot || !lineRoot || !pointRoot) return
  const [trianglesW, linesW, pointsW] = getModeWeights(elapsedSec)
  setMeshOpacity(modelRoot, trianglesW)
  setLineOpacity(lineRoot, linesW)
  setPointOpacity(pointRoot, pointsW)
}

function applyDrawMode(elapsedSec) {
  if (!modelRoot || !lineRoot || !pointRoot) return
  if (settings.drawMode === 'cycle') {
    updateRenderModeAnimation(elapsedSec)
    return
  }

  const isTriangles = settings.drawMode === 'triangles'
  const isLines = settings.drawMode === 'lines'
  const isPoints = settings.drawMode === 'points'
  setMeshOpacity(modelRoot, isTriangles ? 1 : 0)
  setLineOpacity(lineRoot, isLines ? 1 : 0)
  setPointOpacity(pointRoot, isPoints ? 1 : 0)
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
      modeCycleStart = clock.elapsedTime
      applyDrawMode(0)
      dropzone.classList.add('scene07-dropzone--hidden')
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
    dropzone.classList.add('scene07-dropzone--active')
  })
  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('scene07-dropzone--active')
  })
  dropzone.addEventListener('drop', (e) => {
    dropzone.classList.remove('scene07-dropzone--active')
    const file = e.dataTransfer?.files?.[0]
    if (file) loadFromFile(file)
  })
}

function tick() {
  const dt = clock.getDelta()
  const elapsed = clock.elapsedTime
  controls.update()
  if (modelRoot && settings.autoRotate) root.rotation.y += settings.rotateSpeed * dt
  if (modelRoot) applyDrawMode(elapsed - modeCycleStart)
  if (modelRoot && pointRoot && settings.pointSizePulse) updatePointMaterialUniforms(elapsed)
  renderer.render(scene, camera)
  requestAnimationFrame(tick)
}

installDropzone()
window.addEventListener('resize', resize)
resize()
tick()
