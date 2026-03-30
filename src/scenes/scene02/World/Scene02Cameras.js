import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

/**
 * 3 caméras + orbit (cam 1), suivi bille (cam 2), plan orthographique (cam 3).
 */
export default class Scene02Cameras {
  /**
   * @param {import('../../../Experience/Experience.js').default} experience
   */
  constructor(experience) {
    this.experience = experience
    this.sizes = experience.sizes
    this.scene = experience.scene
    this.canvas = experience.canvas

    /** 0: overview, 1: ball, 2: ortho top */
    this.activeIndex = 0

    /** @type {THREE.Object3D | null} */
    this.lookAtTarget = null

    this._tmpTarget = new THREE.Vector3()
    this._tmpBallPos = new THREE.Vector3()
    this._lookBox = new THREE.Box3()

    this.overview = new THREE.PerspectiveCamera(42, 1, 0.1, 120)
    this.overview.position.set(10, 8, 14)

    this.ballCam = new THREE.PerspectiveCamera(52, 1, 0.05, 80)

    this.topOrtho = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200)
    this.topOrtho.position.set(0, 42, 0)
    this.topOrtho.lookAt(0, 0, 0)

    this._ballCamOffset = new THREE.Vector3(-0.55, 0.42, -0.55)

    this.orbit = new OrbitControls(this.overview, this.canvas)
    this.orbit.enableDamping = true
    this.orbit.dampingFactor = 0.06
    this.orbit.target.set(0, 1.1, 0)
    this.orbit.autoRotate = true
    this.orbit.autoRotateSpeed = 0.28
    this.orbit.minDistance = 6
    this.orbit.maxDistance = 48

    experience.resources.on('ready', () => this._onReady())
  }

  _onReady() {
    const ball = this.experience.world?.ball?.mesh
    if (ball) ball.getWorldPosition(this._tmpBallPos)
    else this._tmpBallPos.set(0, 0.1, 0)
    this.ballCam.position.copy(this._tmpBallPos).add(this._ballCamOffset)
    this.ballCam.lookAt(this._tmpBallPos)

    this.resize()
    this._bindRaycaster()
  }

  _bindRaycaster() {
    const subjects = this.experience.world?.subjects
    if (!subjects) return

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()

    this.canvas.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return
      const rect = this.canvas.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      const cam = this._getActiveThreeCamera()
      raycaster.setFromCamera(pointer, cam)
      const roots = subjects.getRaycastRoots()
      const hit = raycaster.intersectObjects(roots, true)[0]
      if (hit?.object?.userData?.pickRoot) {
        this.lookAtTarget = hit.object.userData.pickRoot
      } else {
        this.lookAtTarget = null
      }
    })
  }

  _getActiveThreeCamera() {
    if (this.activeIndex === 0) return this.overview
    if (this.activeIndex === 1) return this.ballCam
    return this.topOrtho
  }

  /** Compat Renderer : `camera.instance` */
  get instance() {
    return this._getActiveThreeCamera()
  }

  /** Compat Experience.destroy */
  get controls() {
    return this.orbit
  }

  setActiveIndex(index) {
    this.activeIndex = THREE.MathUtils.clamp(index, 0, 2)
    this.orbit.enabled = this.activeIndex === 0
    this.orbit.autoRotate = this.activeIndex === 0
  }

  resize() {
    const aspect = this.sizes.width / this.sizes.height

    this.overview.aspect = aspect
    this.overview.updateProjectionMatrix()

    this.ballCam.aspect = aspect
    this.ballCam.updateProjectionMatrix()

    const frustumSize = 20
    this.topOrtho.left = (-frustumSize * aspect) / 2
    this.topOrtho.right = (frustumSize * aspect) / 2
    this.topOrtho.top = frustumSize / 2
    this.topOrtho.bottom = -frustumSize / 2
    this.topOrtho.updateProjectionMatrix()
  }

  update() {
    const world = this.experience.world
    const ballMesh = world?.ball?.mesh
    if (ballMesh) ballMesh.getWorldPosition(this._tmpBallPos)

    if (this.activeIndex === 0) {
      this.orbit.update()
      if (this.lookAtTarget) {
        this._lookBox.setFromObject(this.lookAtTarget)
        this._lookBox.getCenter(this._tmpTarget)
        this.orbit.target.copy(this._tmpTarget)
      }
    }

    if (this.activeIndex === 1 && ballMesh) {
      this.ballCam.position.copy(this._tmpBallPos).add(this._ballCamOffset)
      if (this.lookAtTarget) {
        this._lookBox.setFromObject(this.lookAtTarget)
        this._lookBox.getCenter(this._tmpTarget)
        this.ballCam.lookAt(this._tmpTarget)
      } else {
        this.ballCam.lookAt(this._tmpBallPos)
      }
    }

    if (this.activeIndex === 2) {
      this.topOrtho.position.set(0, 42, 0)
      this.topOrtho.lookAt(0, 0, 0)
    }
  }

  dispose() {
    this.orbit.dispose()
  }
}
