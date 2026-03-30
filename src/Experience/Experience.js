import * as THREE from 'three'
import sources from './sources.js'
import Debug from './Utils/Debug.js'
import Sizes from './Utils/Sizes.js'
import Time from './Utils/Time.js'
import Resources from './Utils/Resources.js'
import Camera from './Camera.js'
import Renderer from './Renderer.js'

let instance = null

/**
 * @typedef {{
 *   camerasFactory?: (experience: Experience) => {
 *     instance: THREE.Camera
 *     resize: () => void
 *     update: () => void
 *     controls?: { dispose: () => void }
 *     dispose?: () => void
 *   }
 * }} ExperienceOptions
 */

export default class Experience {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {new () => { update: () => void }} WorldClass
   * @param {ExperienceOptions} [options]
   */
  constructor(canvas, WorldClass, options = {}) {
    if (instance) {
      return instance
    }
    instance = this

    this.canvas = canvas
    window.experience = this

    this.debug = new Debug()
    this.sizes = new Sizes()
    this.time = new Time()
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color('#0b0c10')

    this.resources = new Resources(sources)
    // Le monde est créé avant la caméra pour que les scènes multi-cam puissent s’y rattacher au `ready`.
    this.world = new WorldClass()

    this.camera =
      typeof options.camerasFactory === 'function'
        ? options.camerasFactory(this)
        : new Camera()

    this.renderer = new Renderer()

    this._onResize = () => this.resize()
    this._onTick = () => this.update()
    this.sizes.on('resize', this._onResize)
    this.time.on('tick', this._onTick)
  }

  resize() {
    this.camera.resize()
    this.renderer.resize()
  }

  update() {
    this.world.update()
    this.camera.update()
    this.renderer.update()
  }

  destroy() {
    this.sizes.off('resize', this._onResize)
    this.time.off('tick', this._onTick)

    this.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry?.dispose()
        const mat = child.material
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
        else mat?.dispose()
      }
    })

    if (typeof this.camera.dispose === 'function') {
      this.camera.dispose()
    } else {
      this.camera.controls?.dispose()
    }
    this.renderer.instance.dispose()
    this.debug.destroy()
    instance = null
  }
}
