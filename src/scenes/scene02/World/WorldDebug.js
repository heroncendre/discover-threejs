import Experience from '../../../Experience/Experience.js'
import Scene02Cameras from './Scene02Cameras.js'

/**
 * Choix de la caméra active (#debug uniquement).
 */
export default class WorldDebug {
  constructor() {
    this.experience = new Experience()
    this.debug = this.experience.debug

    if (!this.debug.active || !this.debug.ui) return

    const cam = this.experience.camera
    if (!(cam instanceof Scene02Cameras)) return

    const folder = this.debug.ui.addFolder('Caméras')

    const actions = {
      camera1() {
        cam.setActiveIndex(0)
      },
      camera2() {
        cam.setActiveIndex(1)
      },
      camera3() {
        cam.setActiveIndex(2)
      },
    }

    folder.add(actions, 'camera1').name('1 · Vue ensemble (orbite)')
    folder.add(actions, 'camera2').name('2 · Sur la bille')
    folder.add(actions, 'camera3').name('3 · Plan (ortho., dessus)')
    folder.open()

    const tools = {
      openGltfViewer() {
        window.open('https://gltf-viewer.donmccurdy.com/', '_blank', 'noopener,noreferrer')
      },
    }
    this.debug.ui.add(tools, 'openGltfViewer').name('GLTF Viewer')

    const env = this.experience.world?.environment
    if (env) {
      const f = this.debug.ui.addFolder('Lumières')
      const ambientParams = {
        color: '#' + env.ambientLight.color.getHexString(),
      }
      f.addColor(ambientParams, 'color').name('Ambiante · couleur').onChange((v) => {
        env.ambientLight.color.set(v)
      })
      f.add(env.ambientLight, 'intensity', 0, 10, 0.01).name('Ambiante · intensité')
      f.add(env.directionalLight, 'intensity', 0, 10, 0.01).name('Directionnelle')
      f.add(env.pointLight, 'intensity', 0, 10, 0.01).name('Point (orbit)')
      f.open()
    }
  }
}
