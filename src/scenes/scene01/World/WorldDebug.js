import * as THREE from 'three'
import Experience from '../../../Experience/Experience.js'

const MATERIAL_TYPES = [
  'basic',
  'lambert',
  'phong',
  'normal',
  'matcap',
  'standard',
  'physical',
  'toon',
  'shader',
]

const MATCAP_LABELS = {
  'Vert mat': 0,
  'Blanc metal': 1,
  'Bleu plastique': 2,
  'Brun metal': 3,
}

/**
 * Panneaux lil-gui — uniquement si Debug.active (#debug), comme dans le cours.
 */
export default class WorldDebug {
  constructor() {
    this.experience = new Experience()
    this.debug = this.experience.debug
    this.world = this.experience.world

    if (!this.debug.active || !this.debug.ui) return

    this._buildSubjects()
    this._buildLights()
    this._buildAxisSceneHelper()
  }

  _syncColorToMaterial(entry) {
    const m = entry.mesh.material
    if (m instanceof THREE.MeshMatcapMaterial) {
      m.color.setHex(0xffffff)
      return
    }
    if (m instanceof THREE.ShaderMaterial && m.uniforms?.uColor) {
      m.uniforms.uColor.value.copy(entry.color)
      return
    }
    if (m instanceof THREE.MeshNormalMaterial) return
    if ('color' in m && m.color) m.color.copy(entry.color)
  }

  /**
   * @param {*} entry
   * @param {*} params
   * @param {{ roughness: number, metalness: number }} pbr
   * @param {{ matcapCtrl: import('lil-gui').Controller, colorCtrl: import('lil-gui').Controller, roughCtrl: import('lil-gui').Controller, metalCtrl: import('lil-gui').Controller }} ctrls
   */
  _refreshSubjectControls(entry, params, pbr, ctrls) {
    const type = params.materialType
    const m = entry.mesh.material

    if (type === 'matcap') {
      ctrls.colorCtrl.disable()
      params.color = '#ffffff'
      ctrls.colorCtrl.updateDisplay()
      ctrls.matcapCtrl.enable()
    } else {
      ctrls.colorCtrl.enable()
      params.color = '#' + entry.color.getHexString()
      ctrls.colorCtrl.updateDisplay()
      ctrls.matcapCtrl.disable()
    }

    const isPbr = type === 'standard' || type === 'physical'
    if (isPbr && m && 'roughness' in m && 'metalness' in m) {
      pbr.roughness = m.roughness
      pbr.metalness = m.metalness
      ctrls.roughCtrl.enable()
      ctrls.metalCtrl.enable()
      ctrls.roughCtrl.updateDisplay()
      ctrls.metalCtrl.updateDisplay()
    } else {
      ctrls.roughCtrl.disable()
      ctrls.metalCtrl.disable()
    }
  }

  _buildSubjects() {
    const subjects = this.world.subjects
    if (!subjects) return

    for (const entry of subjects.entries) {
      const params = {
        materialType: entry.materialType,
        matcapIndex: entry.matcapIndex,
        color: '#' + entry.color.getHexString(),
      }

      const pbr = { roughness: 0.45, metalness: 0.2 }

      const folder = this.debug.ui.addFolder(entry.label)

      /** @type {{ matcapCtrl: import('lil-gui').Controller, colorCtrl: import('lil-gui').Controller, roughCtrl: import('lil-gui').Controller, metalCtrl: import('lil-gui').Controller }} */
      const ctrls = {
        matcapCtrl: null,
        colorCtrl: null,
        roughCtrl: null,
        metalCtrl: null,
      }

      folder
        .add(params, 'materialType', MATERIAL_TYPES)
        .name('Matériau')
        .onChange((/** @type {string} */ v) => {
          subjects.applyMaterialToMesh(entry.mesh, v, params.matcapIndex)
          this._syncColorToMaterial(entry)
          this._refreshSubjectControls(entry, params, pbr, ctrls)
        })

      ctrls.matcapCtrl = folder
        .add(params, 'matcapIndex', MATCAP_LABELS)
        .name('Matcap')
        .onChange((/** @type {number} */ idx) => {
          if (params.materialType !== 'matcap') return
          subjects.applyMaterialToMesh(entry.mesh, 'matcap', idx)
          this._syncColorToMaterial(entry)
        })

      ctrls.colorCtrl = folder
        .addColor(params, 'color')
        .name('Couleur')
        .onChange((/** @type {string} */ v) => {
          entry.color.set(v)
          this._syncColorToMaterial(entry)
        })

      ctrls.roughCtrl = folder
        .add(pbr, 'roughness', 0, 1, 0.01)
        .name('Rugosité')
        .onChange((/** @type {number} */ v) => {
          const mat = entry.mesh.material
          if (
            (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) &&
            'roughness' in mat
          ) {
            mat.roughness = v
          }
        })

      ctrls.metalCtrl = folder
        .add(pbr, 'metalness', 0, 1, 0.01)
        .name('Métallicité')
        .onChange((/** @type {number} */ v) => {
          const mat = entry.mesh.material
          if (
            (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) &&
            'metalness' in mat
          ) {
            mat.metalness = v
          }
        })

      this._refreshSubjectControls(entry, params, pbr, ctrls)

      // Axis helper local au mesh (il suit la rotation du mesh).
      const meshAxesHelper = new THREE.AxesHelper(1.2)
      meshAxesHelper.visible = false
      entry.mesh.add(meshAxesHelper)

      const axesParams = { show: false }
      folder
        .add(axesParams, 'show')
        .name('Axes mesh')
        .onChange((v) => {
          meshAxesHelper.visible = v
        })

      folder.open()
    }
  }

  _buildLights() {
    const env = this.world.environment
    if (!env) return

    const amb = env.ambientLight
    const dir = env.directionalLight
    const pt = env.pointLight

    // Helpers lumières (visibles uniquement si l'utilisateur active le toggle).
    this.dirHelper = new THREE.DirectionalLightHelper(dir, 1.2)
    this.dirHelper.visible = false
    this.world.scene.add(this.dirHelper)
    this.dirHelper.update()

    this.ptHelper = new THREE.PointLightHelper(pt, 0.35, pt.color)
    this.ptHelper.visible = false
    this.world.scene.add(this.ptHelper)
    this.ptHelper.update()

    const ambP = { color: '#' + amb.color.getHexString(), intensity: amb.intensity }
    const dirP = { color: '#' + dir.color.getHexString(), intensity: dir.intensity }
    const ptP = { color: '#' + pt.color.getHexString(), intensity: pt.intensity }

    const f1 = this.debug.ui.addFolder('Lumière ambiante')
    f1.addColor(ambP, 'color').name('Couleur').onChange((v) => amb.color.set(v))
    f1.add(ambP, 'intensity', 0, 3, 0.01).name('Intensité').onChange((v) => {
      amb.intensity = v
    })

    const f2 = this.debug.ui.addFolder('Lumière directionnelle')
    f2.addColor(dirP, 'color').name('Couleur').onChange((v) => {
      dir.color.set(v)
      this.dirHelper.update()
    })
    f2.add(dirP, 'intensity', 0, 4, 0.01).name('Intensité').onChange((v) => {
      dir.intensity = v
    })

    const dirHelperParams = { show: false }
    f2.add(dirHelperParams, 'show').name('Helper').onChange((v) => {
      this.dirHelper.visible = v
    })

    const f3 = this.debug.ui.addFolder('Lumière ponctuelle')
    f3.addColor(ptP, 'color').name('Couleur').onChange((v) => {
      pt.color.set(v)
      this.ptHelper.update()
    })
    f3.add(ptP, 'intensity', 0, 6, 0.01).name('Intensité').onChange((v) => {
      pt.intensity = v
    })

    const ptHelperParams = { show: false }
    f3.add(ptHelperParams, 'show').name('Helper').onChange((v) => {
      this.ptHelper.visible = v
    })
  }

  _buildAxisSceneHelper() {
    this.axesSceneHelper = new THREE.AxesHelper(5)
    this.axesSceneHelper.visible = false
    this.world.scene.add(this.axesSceneHelper)

    const params = { show: false }
    const f = this.debug.ui.addFolder('Helpers')
    f.add(params, 'show').name('Axis scène').onChange((v) => {
      this.axesSceneHelper.visible = v
    })
  }

  update() {
    // Synchronise les light helpers avec l'état courant des lights (nécessaire car
    // DirectionalLightHelper/PointLightHelper n'auto-update pas).
    if (this.dirHelper) this.dirHelper.update()
    if (this.ptHelper) this.ptHelper.update()
  }
}
