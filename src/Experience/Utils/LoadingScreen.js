export default class LoadingScreen {
  /**
   * @param {{ message?: string }} [opts]
   */
  constructor(opts = {}) {
    const message = opts.message ?? 'Chargement...'

    this.root = document.createElement('div')
    this.root.id = 'loading-overlay'
    this.root.style.position = 'fixed'
    this.root.style.inset = '0'
    this.root.style.display = 'flex'
    this.root.style.flexDirection = 'column'
    this.root.style.alignItems = 'center'
    this.root.style.justifyContent = 'center'
    this.root.style.background = 'rgba(8, 10, 16, 0.72)'
    this.root.style.zIndex = '9999'
    this.root.style.pointerEvents = 'none'

    this.text = document.createElement('div')
    this.text.style.color = 'rgba(224, 228, 238, 0.95)'
    this.text.style.fontFamily = 'inherit'
    this.text.style.fontSize = '0.95rem'
    this.text.style.marginBottom = '0.75rem'
    this.text.textContent = message

    const barOuter = document.createElement('div')
    barOuter.style.width = 'min(520px, 82vw)'
    barOuter.style.height = '10px'
    barOuter.style.borderRadius = '999px'
    barOuter.style.background = 'rgba(255, 255, 255, 0.10)'
    barOuter.style.overflow = 'hidden'

    this.barInner = document.createElement('div')
    this.barInner.style.height = '100%'
    this.barInner.style.width = '0%'
    this.barInner.style.borderRadius = '999px'
    this.barInner.style.background = 'linear-gradient(90deg, rgba(122,184,255,0.9), rgba(80,160,255,0.9))'
    barOuter.appendChild(this.barInner)

    this.percent = document.createElement('div')
    this.percent.style.color = 'rgba(224, 228, 238, 0.75)'
    this.percent.style.fontSize = '0.8rem'
    this.percent.style.marginTop = '0.5rem'
    this.percent.textContent = '0%'

    this.root.appendChild(this.text)
    this.root.appendChild(barOuter)
    this.root.appendChild(this.percent)

    document.body.appendChild(this.root)
  }

  /**
   * @param {number} ratio 0..1
   * @param {string} [extra]
   */
  setProgress(ratio, extra) {
    const r = Math.min(1, Math.max(0, ratio))
    const pct = Math.round(r * 100)
    this.barInner.style.width = `${pct}%`
    if (extra) this.text.textContent = extra
    this.percent.textContent = `${pct}%`
  }

  /**
   * @param {string} [message]
   */
  setMessage(message) {
    if (message) this.text.textContent = message
  }

  hide() {
    this.root.style.transition = 'opacity 220ms ease'
    this.root.style.opacity = '0'
    window.setTimeout(() => {
      this.root.remove()
    }, 240)
  }
}

