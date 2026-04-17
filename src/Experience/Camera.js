import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import Experience from './Experience.js'
import EventEmitter from './Utils/EventEmitter.js'

/**
 * Caméra par défaut de l’Experience (quand aucune `camerasFactory` n’est fournie).
 *
 * - **PerspectiveCamera** : FOV 45°, `aspect` synchronisé avec `Sizes` (viewport = fenêtre).
 * - **Quand l’utiliser** : scènes “génériques” (ex. scène 01) ou démo template ; une seule caméra orbit.
 * - **Resize** : cette classe écoute `experience.sizes` et met à jour `aspect` + `updateProjectionMatrix`.
 */
export default class Camera extends EventEmitter {
  constructor() {
    super()
    this.experience = new Experience()
    this.sizes = this.experience.sizes
    this.scene = this.experience.scene
    this.canvas = this.experience.canvas

    this._onResize = () => this.resize()

    this.setInstance()
    this.setControls()
  }

  setInstance() {
    // fov° | aspect dynamique | près | loin — voir bloc doc dans Experience.js
    this.instance = new THREE.PerspectiveCamera(
      45,
      this.sizes.aspect,
      0.1,
      100,
    )
    this.instance.position.set(7, 5.5, 9)
    this.scene.add(this.instance)

    this.sizes.on('resize', this._onResize)
  }

  setControls() {
    this.controls = new OrbitControls(this.instance, this.canvas)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.06
    this.controls.target.set(0, 1.2, 0)
    this.controls.autoRotate = true
    this.controls.autoRotateSpeed = 0.35
    this.controls.minDistance = 4
    this.controls.maxDistance = 28
    this.controls.maxPolarAngle = Math.PI * 0.495
  }

  resize() {
    this.instance.aspect = this.sizes.aspect
    this.instance.updateProjectionMatrix()
  }

  update() {
    this.controls.update()
  }

  destroy() {
    this.sizes.off('resize', this._onResize)
  }
}
