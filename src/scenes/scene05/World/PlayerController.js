import * as THREE from 'three'
import Experience from '../../../Experience/Experience.js'

export default class PlayerController {
  /**
   * @param {{ collidesCircleXZ: (pos: THREE.Vector3, radius: number) => boolean, getSpawnPosition: (y?: number) => THREE.Vector3 }} maze
   */
  constructor(maze) {
    this.experience = new Experience()
    this.camera = null
    this.canvas = this.experience.canvas
    this.time = this.experience.time
    this.maze = maze

    this.eyeHeight = 1.65
    this.radius = 0.22
    this.moveSpeed = 4.2
    this.mouseSensitivity = 0.0022

    this.yaw = 0
    this.pitch = 0
    this.position = maze.getSpawnPosition(this.eyeHeight)

    this.keys = { w: false, a: false, s: false, d: false }
    this._tmpForward = new THREE.Vector3()
    this._tmpRight = new THREE.Vector3()
    this._tmpMove = new THREE.Vector3()

    this._bindInput()
  }

  _bindInput() {
    window.addEventListener('keydown', (e) => this._setKey(e.code, true))
    window.addEventListener('keyup', (e) => this._setKey(e.code, false))

    this.canvas.addEventListener('click', () => {
      this.canvas.requestPointerLock()
    })

    window.addEventListener('mousemove', (e) => {
      if (document.pointerLockElement !== this.canvas) return
      this.yaw -= e.movementX * this.mouseSensitivity
      this.pitch -= e.movementY * this.mouseSensitivity
      this.pitch = THREE.MathUtils.clamp(this.pitch, -1.25, 1.25)
      this._applyRotation()
    })
  }

  _setKey(code, value) {
    if (code === 'KeyW') this.keys.w = value
    if (code === 'KeyA') this.keys.a = value
    if (code === 'KeyS') this.keys.s = value
    if (code === 'KeyD') this.keys.d = value
  }

  _applyRotation() {
    if (!this.camera) return
    this.camera.rotation.order = 'YXZ'
    this.camera.rotation.y = this.yaw
    this.camera.rotation.x = this.pitch
  }

  _ensureCameraReady() {
    if (this.camera) return true
    const cam = this.experience.camera?.instance
    if (!cam) return false
    this.camera = cam
    this.camera.position.copy(this.position)
    this._applyRotation()
    return true
  }

  update() {
    if (!this._ensureCameraReady()) return

    const dt = Math.min(0.05, this.time.delta * 0.001)
    this._tmpForward.set(Math.sin(this.yaw), 0, Math.cos(this.yaw))
    this._tmpRight.set(this._tmpForward.z, 0, -this._tmpForward.x)

    this._tmpMove.set(0, 0, 0)
    if (this.keys.w) this._tmpMove.add(this._tmpForward)
    if (this.keys.s) this._tmpMove.sub(this._tmpForward)
    if (this.keys.d) this._tmpMove.add(this._tmpRight)
    if (this.keys.a) this._tmpMove.sub(this._tmpRight)

    if (this._tmpMove.lengthSq() > 0) {
      this._tmpMove.normalize().multiplyScalar(this.moveSpeed * dt)
      this._moveWithCollisions(this._tmpMove.x, this._tmpMove.z)
    }

    this.camera.position.copy(this.position)
  }

  _moveWithCollisions(dx, dz) {
    const nextX = this.position.clone()
    nextX.x += dx
    if (!this.maze.collidesCircleXZ(nextX, this.radius)) {
      this.position.x = nextX.x
    }

    const nextZ = this.position.clone()
    nextZ.z += dz
    if (!this.maze.collidesCircleXZ(nextZ, this.radius)) {
      this.position.z = nextZ.z
    }
  }
}
