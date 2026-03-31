import Experience from '../../../Experience/Experience.js'
import DrawCallLab from './DrawCallLab.js'

export default class World {
  constructor() {
    this.experience = new Experience()
    this.renderer = this.experience.renderer
    this.lab = new DrawCallLab()

    this.fpsEl = document.querySelector('[data-scene04-fps]')
    this.callsEl = document.querySelector('[data-scene04-calls]')
    this.modeEl = document.querySelector('[data-scene04-mode]')
    this.countEl = document.querySelector('[data-scene04-count]')

    this._lastFpsTime = performance.now()
    this._frames = 0
    this._bindUi()
    this._syncInfo()
  }

  _bindUi() {
    const modeButtons = /** @type {NodeListOf<HTMLButtonElement>} */ (
      document.querySelectorAll('[data-scene04-mode-btn]')
    )
    modeButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const mode = button.dataset.scene04ModeBtn
        if (!mode) return
        this.lab.setMode(mode)
        this._setActiveModeButton(modeButtons, mode)
        this._syncInfo()
      })
    })

    const slider = /** @type {HTMLInputElement | null} */ (document.querySelector('[data-scene04-slider]'))
    slider?.addEventListener('input', () => {
      this.lab.setTriangleCount(Number(slider.value))
      this._syncInfo()
    })
  }

  _setActiveModeButton(buttons, activeMode) {
    buttons.forEach((button) => {
      const isActive = button.dataset.scene04ModeBtn === activeMode
      button.classList.toggle('scene04-controls__mode-btn--active', isActive)
    })
  }

  _syncInfo() {
    const modeNames = {
      meshes: 'meshes',
      oneMesh: 'one mesh',
      instancedMesh: 'instanced mesh',
    }
    if (this.modeEl) this.modeEl.textContent = modeNames[this.lab.mode] ?? this.lab.mode
    if (this.countEl) this.countEl.textContent = `${this.lab.triangleCount.toLocaleString('fr-FR')}`
  }

  update() {
    this._frames += 1
    const now = performance.now()
    const dt = now - this._lastFpsTime
    if (dt >= 300) {
      const fps = (this._frames * 1000) / dt
      if (this.fpsEl) this.fpsEl.textContent = fps.toFixed(0)
      this._frames = 0
      this._lastFpsTime = now
    }

    const calls = this.renderer?.instance?.info?.render?.calls ?? 0
    if (this.callsEl) this.callsEl.textContent = `${calls}`
  }
}
