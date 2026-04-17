import * as THREE from 'three'
import Experience from '../../../Experience/Experience.js'

const SHADOW_TYPE_LABELS = /** @type {const} */ ([
  'Basic',
  'PCF',
  'PCF soft',
  'VSM',
])

/** @type {Record<(typeof SHADOW_TYPE_LABELS)[number], number>} */
const SHADOW_TYPE_VALUES = {
  Basic: THREE.BasicShadowMap,
  PCF: THREE.PCFShadowMap,
  'PCF soft': THREE.PCFSoftShadowMap,
  VSM: THREE.VSMShadowMap,
}

const MAP_SIZES_POT = [16, 32, 64, 128, 256, 512, 1024, 2048, 4096]

/**
 * Contrôles shadow map : type renderer, frustum ortho (lié ou non), near/far, taille texture.
 */
export default class WorldDebug {
  constructor() {
    this.experience = new Experience()
    this.debug = this.experience.debug

    if (!this.debug.active || !this.debug.ui) return

    const renderer = this.experience.renderer.instance
    const env = this.experience.world?.environment
    if (!env?.directionalLight) return

    const light = env.directionalLight
    const shadowCam = light.shadow.camera

    /** @type {{
     *   linkFrustum: boolean
     *   extent: number
     *   left: number
     *   right: number
     *   top: number
     *   bottom: number
     *   near: number
     *   far: number
     *   mapSize: number
     *   shadowType: (typeof SHADOW_TYPE_LABELS)[number]
     * }} */
    const params = {
      linkFrustum: false,
      extent: shadowCam.right,
      left: shadowCam.left,
      right: shadowCam.right,
      top: shadowCam.top,
      bottom: shadowCam.bottom,
      near: shadowCam.near,
      far: shadowCam.far,
      mapSize: light.shadow.mapSize.width,
      shadowType: this._labelFromShadowType(renderer.shadowMap.type),
    }

    const applyShadowCam = () => {
      shadowCam.updateProjectionMatrix()
      env.shadowCameraHelper.update()
    }

    const applyLinked = () => {
      const e = params.extent
      shadowCam.left = -e
      shadowCam.right = e
      shadowCam.top = e
      shadowCam.bottom = -e
      applyShadowCam()
    }

    const applyFree = () => {
      shadowCam.left = params.left
      shadowCam.right = params.right
      shadowCam.top = params.top
      shadowCam.bottom = params.bottom
      applyShadowCam()
    }

    const applyMapSize = () => {
      const s = params.mapSize
      light.shadow.mapSize.set(s, s)
      if (light.shadow.map) {
        light.shadow.map.dispose()
        light.shadow.map = null
      }
    }

    const root = this.debug.ui

    const typeFolder = root.addFolder('Ombres · renderer')
    typeFolder
      .add(params, 'shadowType', [...SHADOW_TYPE_LABELS])
      .name('Type de filtre')
      .onChange((/** @type {(typeof SHADOW_TYPE_LABELS)[number]} */ v) => {
        renderer.shadowMap.type = SHADOW_TYPE_VALUES[v]
      })
    typeFolder.open()

    const frFolder = root.addFolder('Caméra d’ombre (orthographique)')
    /** @type {import('lil-gui').Controller[]} */
    let frustumControllers = []

    const clearFrustumControllers = () => {
      for (const c of frustumControllers) {
        c.destroy()
      }
      frustumControllers = []
    }

    const syncLinkedSliderDisplays = () => {
      for (const c of frustumControllers) {
        c.updateDisplay()
      }
    }

    const buildFrustumControllers = () => {
      clearFrustumControllers()
      if (params.linkFrustum) {
        const names = ['Gauche (−extent)', 'Droit (+extent)', 'Haut (+extent)', 'Bas (−extent)']
        for (const name of names) {
          const ctrl = frFolder
            .add(params, 'extent', 0.5, 40, 0.01)
            .name(name)
            .onChange(() => {
              applyLinked()
              syncLinkedSliderDisplays()
            })
          frustumControllers.push(ctrl)
        }
      } else {
        const c1 = frFolder.add(params, 'left', -40, -0.05, 0.01).name('Gauche').onChange(applyFree)
        const c2 = frFolder.add(params, 'right', 0.05, 40, 0.01).name('Droit').onChange(applyFree)
        const c3 = frFolder.add(params, 'top', 0.05, 40, 0.01).name('Haut').onChange(applyFree)
        const c4 = frFolder.add(params, 'bottom', -40, -0.05, 0.01).name('Bas').onChange(applyFree)
        frustumControllers.push(c1, c2, c3, c4)
      }
    }

    frFolder
      .add(params, 'linkFrustum')
      .name('Lier les 4 côtés (carré)')
      .onChange(() => {
        if (params.linkFrustum) {
          params.extent = params.right
          applyLinked()
        } else {
          params.left = shadowCam.left
          params.right = shadowCam.right
          params.top = shadowCam.top
          params.bottom = shadowCam.bottom
        }
        buildFrustumControllers()
      })

    buildFrustumControllers()

    frFolder
      .add(params, 'near', 0.05, 30, 0.01)
      .name('Near')
      .onChange((v) => {
        shadowCam.near = v
        applyShadowCam()
      })

    frFolder
      .add(params, 'far', 1, 200, 0.5)
      .name('Far')
      .onChange((v) => {
        shadowCam.far = v
        applyShadowCam()
      })

    frFolder.open()

    const texFolder = root.addFolder('Texture d’ombre')
    texFolder
      .add(params, 'mapSize', MAP_SIZES_POT)
      .name('Taille (POT)')
      .onChange(() => {
        applyMapSize()
      })
    texFolder.open()

    const lightsFolder = root.addFolder('Lumières (rappel)')
    lightsFolder.addColor(
      { color: '#' + env.ambientLight.color.getHexString() },
      'color',
    ).name('Ambiante · couleur').onChange((v) => {
      env.ambientLight.color.set(v)
    })
    lightsFolder.add(env.ambientLight, 'intensity', 0, 10, 0.01).name('Ambiante · intensité')
    lightsFolder.add(env.directionalLight, 'intensity', 0, 10, 0.01).name('Directionnelle')
    lightsFolder.add(env.pointLight, 'intensity', 0, 10, 0.01).name('Point (orbit, sans ombre)')
    lightsFolder.open()
  }

  /**
   * @param {number} t
   * @returns {(typeof SHADOW_TYPE_LABELS)[number]}
   */
  _labelFromShadowType(t) {
    for (const label of SHADOW_TYPE_LABELS) {
      if (SHADOW_TYPE_VALUES[label] === t) return label
    }
    return 'PCF soft'
  }
}
