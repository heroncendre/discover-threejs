import * as THREE from 'three'
import Experience from '../../../Experience/Experience.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'

const VIGNETTE_SHADER = {
  uniforms: {
    tDiffuse: { value: null },
    uStrength: { value: 1.0 },
    uAspect: { value: 1.0 },
  },
  vertexShader: `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,
  fragmentShader: `
uniform sampler2D tDiffuse;
uniform float uStrength;
uniform float uAspect;
varying vec2 vUv;

void main() {
  vec4 color = texture2D(tDiffuse, vUv);
  vec2 p = vUv - 0.5;
  p.x *= uAspect;
  float vig = smoothstep(0.15, 0.85, length(p));
  float factor = 1.0 - vig * uStrength;
  gl_FragColor = vec4(color.rgb * factor, color.a);
}
`,
}

const IR_SHADER = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uScanlineIntensity: { value: 0.25 },
  },
  vertexShader: `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,
  fragmentShader: `
uniform sampler2D tDiffuse;
uniform float uTime;
uniform float uScanlineIntensity;
varying vec2 vUv;

void main() {
  vec3 src = texture2D(tDiffuse, vUv).rgb;
  float luma = dot(src, vec3(0.2126, 0.7152, 0.0722));
  vec3 greenTint = vec3(0.08, 1.0, 0.35) * luma;

  float scan = sin((vUv.y + uTime * 0.45) * 950.0) * 0.5 + 0.5;
  float scanMix = mix(1.0 - uScanlineIntensity, 1.0, scan);

  gl_FragColor = vec4(greenTint * scanMix, 1.0);
}
`,
}

export default class VisualModes {
  /**
   * @param {import('./Environment.js').default} environment
   */
  constructor(environment) {
    this.experience = new Experience()
    this.environment = environment
    this.mode = 'day'
    this.ready = false
    this._patched = false

    this.lightPresets = {
      day: { ambient: 0.6, directional: 2.0 },
      night: { ambient: 0.4, directional: 3.5 },
      ir: { ambient: 0.4, directional: 3.5 },
    }

    this._bindKeyboard()
    this._applyMode()
  }

  _bindKeyboard() {
    window.addEventListener('keydown', (event) => {
      const k = event.key.toLowerCase()
      if (k === 'j') this.setMode('day')
      if (k === 'n') this.setMode('night')
      if (k === 'i') this.setMode('ir')
    })
  }

  _ensureReady() {
    if (this.ready) return true
    const rendererSystem = this.experience.renderer
    const cameraSystem = this.experience.camera
    if (!rendererSystem?.instance || !cameraSystem?.instance) return false

    this.composer = new EffectComposer(rendererSystem.instance)
    this.renderPass = new RenderPass(this.experience.scene, cameraSystem.instance)
    this.vignettePass = new ShaderPass(VIGNETTE_SHADER)
    this.irPass = new ShaderPass(IR_SHADER)

    this.composer.addPass(this.renderPass)
    this.composer.addPass(this.vignettePass)
    this.composer.addPass(this.irPass)
    this.vignettePass.uniforms.uAspect.value = this.experience.sizes.width / this.experience.sizes.height

    if (!this._patched) {
      const baseResize = rendererSystem.resize.bind(rendererSystem)
      rendererSystem.resize = () => {
        baseResize()
        this.composer.setSize(this.experience.sizes.width, this.experience.sizes.height)
        this.composer.setPixelRatio(this.experience.sizes.pixelRatio)
        this.vignettePass.uniforms.uAspect.value =
          this.experience.sizes.width / this.experience.sizes.height
      }
      rendererSystem.update = () => {
        this.renderPass.camera = this.experience.camera.instance
        this.composer.render()
      }
      this._patched = true
    }

    this.ready = true
    this._applyMode()
    return true
  }

  setMode(mode) {
    if (!['day', 'night', 'ir'].includes(mode)) return
    this.mode = mode
    this._applyMode()
  }

  _applyMode() {
    const preset = this.lightPresets[this.mode]
    this.environment.ambientLight.intensity = preset.ambient
    this.environment.directionalLight.intensity = preset.directional

    if (!this.ready) return
    this.vignettePass.enabled = this.mode === 'night'
    this.irPass.enabled = this.mode === 'ir'

    if (this.mode === 'night') {
      this.vignettePass.uniforms.uStrength.value = 1.45
    }
  }

  update() {
    if (!this._ensureReady()) return
    this.irPass.uniforms.uTime.value = this.experience.time.elapsed * 0.001
  }
}
