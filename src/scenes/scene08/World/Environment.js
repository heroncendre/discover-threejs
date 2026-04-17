import * as THREE from 'three'
import Experience from '../../../Experience/Experience.js'

export default class Environment {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.time = this.experience.time

    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.35)
    this.scene.add(this.ambientLight)

    this.directionalLight = new THREE.DirectionalLight(0xfff4e6, 1.35)
    this.directionalLight.position.set(8, 14, 10)
    this.directionalLight.castShadow = true
    this.directionalLight.shadow.mapSize.set(2048, 2048)
    this.directionalLight.shadow.camera.near = 0.5
    this.directionalLight.shadow.camera.far = 55
    this.directionalLight.shadow.camera.left = -18
    this.directionalLight.shadow.camera.right = 18
    this.directionalLight.shadow.camera.top = 18
    this.directionalLight.shadow.camera.bottom = -18
    this.scene.add(this.directionalLight)

    this.directionalLightHelper = new THREE.DirectionalLightHelper(this.directionalLight, 2.8, 0xff9944)
    this.scene.add(this.directionalLightHelper)

    this.shadowCameraHelper = new THREE.CameraHelper(this.directionalLight.shadow.camera)
    this.scene.add(this.shadowCameraHelper)

    this.orbitCenter = new THREE.Vector3(0, 1.2, 0)
    this._orbitCenterReady = false

    this.pointLight = new THREE.PointLight(0xffffff, 9.0, 120, 2)
    this.pointLight.position.copy(this.orbitCenter).add(new THREE.Vector3(8, 3.5, 0))
    this.pointLight.castShadow = false
    this.scene.add(this.pointLight)

    this.pointOrbit = {
      radius: 7.5,
      height: 3.0,
      speed: 0.65,
    }
  }

  setOrbitCenterFromSubjects(subjects) {
    if (!subjects?.getRaycastRoots) return

    const roots = subjects.getRaycastRoots()
    if (!roots?.length) return

    const box = new THREE.Box3()
    for (const r of roots) {
      box.expandByObject(r)
    }

    this.orbitCenter = box.getCenter(new THREE.Vector3())
    this.orbitCenter.y += 0.05
    this._orbitCenterReady = true
  }

  update() {
    this.directionalLightHelper.update()
    this.shadowCameraHelper.update()

    if (!this._orbitCenterReady) return

    const t = this.time.elapsed * 0.001
    const angle = t * this.pointOrbit.speed

    const ox = Math.cos(angle) * this.pointOrbit.radius
    const oz = Math.sin(angle) * this.pointOrbit.radius
    const oy = this.pointOrbit.height

    this.pointLight.position.set(
      this.orbitCenter.x + ox,
      this.orbitCenter.y + oy,
      this.orbitCenter.z + oz,
    )
  }
}
