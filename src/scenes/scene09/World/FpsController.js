import * as THREE from 'three'
import Experience from '../../../Experience/Experience.js'
import { Capsule } from 'three/addons/math/Capsule.js'

export default class FpsController {
  /**
   * @param {import('three/addons/math/Octree.js').Octree} worldOctree
   */
  constructor(worldOctree) {
    this.experience = new Experience()
    this.time = this.experience.time
    this.canvas = this.experience.canvas
    this.worldOctree = worldOctree

    this.camera = null

    this.walkSpeed = 11
    this.airControl = 0.35
    this.jumpSpeed = 12
    this.gravity = 30
    this.lookSensitivity = 0.0022

    this.yaw = 0
    this.pitch = 0
    this.onFloor = false
    this.wantsJump = false

    this.keys = { w: false, a: false, s: false, d: false }
    this.velocity = new THREE.Vector3()

    this.playerCollider = new Capsule(
      new THREE.Vector3(0, 4.35, 0),
      new THREE.Vector3(0, 5.8, 0),
      0.35,
    )

    this._tmpForward = new THREE.Vector3()
    this._tmpRight = new THREE.Vector3()
    this._tmpMove = new THREE.Vector3()

    this._bindInput()
  }

  _bindInput() {
    window.addEventListener('keydown', (e) => this._onKey(e.code, true))
    window.addEventListener('keyup', (e) => this._onKey(e.code, false))

    this.canvas.addEventListener('click', () => {
      this.canvas.requestPointerLock()
    })

    window.addEventListener('mousemove', (e) => {
      if (document.pointerLockElement !== this.canvas) return
      this.yaw -= e.movementX * this.lookSensitivity
      this.pitch -= e.movementY * this.lookSensitivity
      this.pitch = THREE.MathUtils.clamp(this.pitch, -1.45, 1.45)
      this._applyCameraRotation()
    })
  }

  _onKey(code, down) {
    if (code === 'KeyW') this.keys.w = down
    if (code === 'KeyA') this.keys.a = down
    if (code === 'KeyS') this.keys.s = down
    if (code === 'KeyD') this.keys.d = down
    if (code === 'Space' && down) this.wantsJump = true
  }

  _ensureCameraReady() {
    if (this.camera) return true
    const cam = this.experience.camera?.instance
    if (!cam) return false
    this.camera = cam
    this._applyCameraPosition()
    this._applyCameraRotation()
    return true
  }

  _applyCameraRotation() {
    if (!this.camera) return
    this.camera.rotation.order = 'YXZ'
    this.camera.rotation.y = this.yaw
    this.camera.rotation.x = this.pitch
  }

  _applyCameraPosition() {
    if (!this.camera) return
    this.camera.position.copy(this.playerCollider.end)
  }

  _computeWishDirection() {
    this._tmpForward.set(Math.sin(this.yaw), 0, Math.cos(this.yaw))
    this._tmpRight.set(this._tmpForward.z, 0, -this._tmpForward.x)

    this._tmpMove.set(0, 0, 0)
    if (this.keys.w) this._tmpMove.add(this._tmpForward)
    if (this.keys.s) this._tmpMove.sub(this._tmpForward)
    if (this.keys.d) this._tmpMove.add(this._tmpRight)
    if (this.keys.a) this._tmpMove.sub(this._tmpRight)

    if (this._tmpMove.lengthSq() > 0) {
      this._tmpMove.normalize()
    }
  }

  _integrateMovement(dt) {
    this._computeWishDirection()

    const accel = this.onFloor ? this.walkSpeed : this.walkSpeed * this.airControl
    this.velocity.x += this._tmpMove.x * accel * dt * 9
    this.velocity.z += this._tmpMove.z * accel * dt * 9

    const damping = Math.exp(-8 * dt)
    this.velocity.x *= damping
    this.velocity.z *= damping

    if (!this.onFloor) {
      this.velocity.y -= this.gravity * dt
    } else {
      this.velocity.y = Math.max(0, this.velocity.y)
      if (this.wantsJump) {
        this.velocity.y = this.jumpSpeed
        this.onFloor = false
      }
    }
    this.wantsJump = false

    const deltaPos = this.velocity.clone().multiplyScalar(dt)
    this.playerCollider.translate(deltaPos)
  }

  _resolveCollisions() {
    const result = this.worldOctree.capsuleIntersect(this.playerCollider)
    this.onFloor = false

    if (!result) return
    this.onFloor = result.normal.y > 0

    if (!this.onFloor) {
      const vn = result.normal.dot(this.velocity)
      this.velocity.addScaledVector(result.normal, -vn)
    } else {
      this.velocity.y = Math.max(0, this.velocity.y)
    }

    this.playerCollider.translate(result.normal.multiplyScalar(result.depth))
  }

  update() {
    if (!this._ensureCameraReady()) return

    const dt = Math.min(0.05, this.time.delta * 0.001)
    this._integrateMovement(dt)
    this._resolveCollisions()
    this._applyCameraPosition()
  }

  getPosition() {
    return this.playerCollider.end
  }

  getFacingXZ() {
    return new THREE.Vector2(Math.sin(this.yaw), Math.cos(this.yaw))
  }
}
