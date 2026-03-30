import GUI from 'lil-gui'

export default class Debug {
  constructor() {
    this.active = window.location.hash === '#debug'
    if (this.active) {
      this.ui = new GUI({ title: 'Debug (#debug)' })
      this.ui.domElement.style.marginTop = '52px'
    }
  }

  destroy() {
    if (this.active && this.ui) {
      this.ui.destroy()
    }
  }
}
