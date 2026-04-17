import * as THREE from 'three'
import { Octree } from 'three/addons/math/Octree.js'
import Experience from '../../../Experience/Experience.js'
import ProceduralTerrain from './ProceduralTerrain.js'
import CityBlocks from './CityBlocks.js'
import FpsController from './FpsController.js'

export default class World {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene

    this._setLights()

    this.terrain = new ProceduralTerrain()
    this.city = new CityBlocks(this.terrain)

    this.staticWorld = new THREE.Group()
    this.staticWorld.add(this.terrain.group)
    this.staticWorld.add(this.city.group)
    this.scene.add(this.staticWorld)

    this.worldOctree = new Octree()
    this.staticWorld.updateMatrixWorld(true)
    this.worldOctree.fromGraphNode(this.staticWorld)

    this.player = new FpsController(this.worldOctree)

    this._setupHud()
  }

  _setLights() {
    this.scene.background = new THREE.Color('#0b1020')
    this.scene.fog = new THREE.Fog('#0b1020', 85, 240)

    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
    this.scene.add(this.ambientLight)

    this.directionalLight = new THREE.DirectionalLight(0xe8f2ff, 1.5)
    this.directionalLight.position.set(40, 62, 18)
    this.directionalLight.castShadow = true
    this.directionalLight.shadow.mapSize.set(2048, 2048)
    this.directionalLight.shadow.camera.near = 0.5
    this.directionalLight.shadow.camera.far = 280
    this.directionalLight.shadow.camera.left = -110
    this.directionalLight.shadow.camera.right = 110
    this.directionalLight.shadow.camera.top = 110
    this.directionalLight.shadow.camera.bottom = -110
    this.scene.add(this.directionalLight)
  }

  _setupHud() {
    this.hudCanvas = /** @type {HTMLCanvasElement | null} */ (
      document.querySelector('[data-scene09-hud-map]')
    )
    this.hudCtx = this.hudCanvas?.getContext('2d') ?? null
  }

  _worldToHud(x, z) {
    if (!this.hudCanvas) return { x: 0, y: 0 }
    const half = this.terrain.size * 0.5
    const px = ((x + half) / this.terrain.size) * this.hudCanvas.width
    const py = ((z + half) / this.terrain.size) * this.hudCanvas.height
    return { x: px, y: py }
  }

  _drawHud() {
    if (!this.hudCtx || !this.hudCanvas) return
    const ctx = this.hudCtx
    const w = this.hudCanvas.width
    const h = this.hudCanvas.height

    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = 'rgba(8, 10, 16, 0.92)'
    ctx.fillRect(0, 0, w, h)

    const half = this.terrain.size * 0.5
    const cells = 14
    const step = this.terrain.size / cells
    for (let rz = 0; rz < cells; rz += 1) {
      for (let rx = 0; rx < cells; rx += 1) {
        const x = -half + rx * step + step * 0.5
        const z = -half + rz * step + step * 0.5
        const y = this.terrain.getHeightAt(x, z)
        const t = THREE.MathUtils.clamp((y + this.terrain.maxHeight) / (this.terrain.maxHeight * 2), 0, 1)
        const g = Math.round(50 + t * 110)
        const b = Math.round(55 + t * 45)
        ctx.fillStyle = `rgb(${18 + Math.round(t * 20)} ${g} ${b})`
        const px = (rx / cells) * w
        const py = (rz / cells) * h
        ctx.fillRect(px, py, w / cells, h / cells)
      }
    }

    const hudScale = w / this.terrain.size
    ctx.fillStyle = 'rgba(175, 180, 192, 0.85)'
    for (const block of this.city.blocks) {
      const topLeft = this._worldToHud(block.x - block.sx * 0.5, block.z - block.sz * 0.5)
      const bw = Math.max(1, block.sx * hudScale)
      const bh = Math.max(1, block.sz * hudScale)
      ctx.fillRect(topLeft.x, topLeft.y, bw, bh)
    }

    const pos = this.player.getPosition()
    const p = this._worldToHud(pos.x, pos.z)
    const facing = this.player.getFacingXZ()
    const len = 12

    ctx.strokeStyle = 'rgba(255,255,255,0.28)'
    ctx.lineWidth = 1
    ctx.strokeRect(0.5, 0.5, w - 1, h - 1)

    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
    ctx.lineTo(p.x + facing.x * len, p.y + facing.y * len)
    ctx.stroke()

    ctx.fillStyle = '#ff6767'
    ctx.beginPath()
    ctx.arc(p.x, p.y, 3.8, 0, Math.PI * 2)
    ctx.fill()
  }

  update() {
    this.player.update()
    this._drawHud()
  }
}
