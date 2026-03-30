import * as THREE from 'three'
import Experience from '../../../Experience/Experience.js'

/**
 * Lumières de scène — instancié en dernier dans World (comme Environment du cours).
 */
export default class Environment {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene

    this.setLights()

    // Orbit autour du torus knot (défini quand Subjects est prêt).
    this.pointLightOrbitTarget = null
    this._tmpTargetPos = new THREE.Vector3()
    this._tmpOffset = new THREE.Vector3()

    this.pointLightOrbit = {
      radius: 3.8,
      height: 0.5,
      speed: 0.55,
    }
  }

  /**
   * @param {THREE.Object3D} mesh
   */
  setPointLightOrbitTarget(mesh) {
    this.pointLightOrbitTarget = mesh
  }

  setLights() {
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.22)
    this.scene.add(this.ambientLight)

    this.directionalLight = new THREE.DirectionalLight(0xfff4e6, 1.1)
    this.directionalLight.position.set(6, 10, 4)
    this.directionalLight.castShadow = true
    this.directionalLight.shadow.mapSize.set(2048, 2048)
    this.directionalLight.shadow.camera.near = 0.5
    this.directionalLight.shadow.camera.far = 40
    this.directionalLight.shadow.camera.left = -12
    this.directionalLight.shadow.camera.right = 12
    this.directionalLight.shadow.camera.top = 12
    this.directionalLight.shadow.camera.bottom = -12
    this.scene.add(this.directionalLight)

    this.pointLight = new THREE.PointLight(0xaaccff, 1.35, 40, 2)
    this.pointLight.position.set(-4, 0.2, 2)
    this.pointLight.castShadow = true
    this.pointLight.shadow.mapSize.set(1024, 1024)
    this.scene.add(this.pointLight)
  }

  update() {
    if (!this.pointLightOrbitTarget) return

    const t = this.experience.time.elapsed * 0.001
    const target = this.pointLightOrbitTarget

    target.getWorldPosition(this._tmpTargetPos)

    const angle = t * this.pointLightOrbit.speed
    const r = this.pointLightOrbit.radius

    // Orbite dans le plan XZ autour du torus
    this._tmpOffset.set(Math.cos(angle) * r, this.pointLightOrbit.height, Math.sin(angle) * r)
    this.pointLight.position.copy(this._tmpTargetPos).add(this._tmpOffset)

    // Oriente la lumière vers le torus knot
    this.pointLight.lookAt(this._tmpTargetPos)
  }
}
