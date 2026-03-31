import Experience from '../../../Experience/Experience.js'
import Maze from './Maze.js'
import Environment from './Environment.js'
import PlayerController from './PlayerController.js'
import WorldDebug from './WorldDebug.js'
import VisualModes from './VisualModes.js'

export default class World {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene

    this.maze = new Maze()
    this.environment = new Environment()
    this.visualModes = new VisualModes(this.environment)
    this.player = new PlayerController(this.maze)
    this._setupHud()

    if (this.experience.debug.active) {
      this.worldDebug = new WorldDebug(this)
    }
  }

  _setupHud() {
    this.hudCanvas = /** @type {HTMLCanvasElement | null} */ (
      document.querySelector('[data-scene05-hud-map]')
    )
    this.hudCtx = this.hudCanvas?.getContext('2d') ?? null
    this.hudRange = Math.max(this.maze.cellSize * 0.5, this.player.radius * 4)
  }

  _worldToHud(x, z) {
    if (!this.hudCanvas) return { x: 0, y: 0 }
    const px = ((x + this.maze.width * 0.5) / this.maze.width) * this.hudCanvas.width
    const py = ((z + this.maze.depth * 0.5) / this.maze.depth) * this.hudCanvas.height
    return { x: px, y: py }
  }

  _drawHud() {
    if (!this.hudCanvas || !this.hudCtx) return
    const ctx = this.hudCtx
    const w = this.hudCanvas.width
    const h = this.hudCanvas.height

    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = 'rgba(8, 10, 16, 0.92)'
    ctx.fillRect(0, 0, w, h)

    const cellW = w / this.maze.cols
    const cellH = h / this.maze.rows
    for (let row = 0; row < this.maze.rows; row += 1) {
      for (let col = 0; col < this.maze.cols; col += 1) {
        if (this.maze.isWallCell(col, row)) {
          ctx.fillStyle = '#9ea6b7'
          ctx.fillRect(col * cellW, row * cellH, cellW, cellH)
        } else {
          ctx.fillStyle = '#1d2230'
          ctx.fillRect(col * cellW, row * cellH, cellW, cellH)
        }
      }
    }

    const p = this.player.position
    const hudPos = this._worldToHud(p.x, p.z)
    const nearest = this.maze.getNearestWallDistanceXZ(p)
    const t = Math.min(1, Math.max(0, (nearest - this.player.radius) / this.hudRange))
    const g = Math.round(255 * t)
    const b = Math.round(255 * t)
    const color = `rgb(255 ${g} ${b})`

    const dotRadius = Math.max(3, (this.player.radius / this.maze.cellSize) * cellW)
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(hudPos.x, hudPos.y, dotRadius, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)'
    ctx.lineWidth = 1
    ctx.strokeRect(0.5, 0.5, w - 1, h - 1)
  }

  update() {
    this.player.update()
    this.visualModes.update()
    this._drawHud()
  }
}
