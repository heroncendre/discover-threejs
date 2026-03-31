import Experience from '../../../Experience/Experience.js'

export default class WorldDebug {
  /**
   * @param {import('./World.js').default} world
   */
  constructor(world) {
    this.experience = new Experience()
    this.debug = this.experience.debug
    this.world = world

    if (!this.debug.active || !this.debug.ui) return

    const env = this.world.environment
    if (!env) return

    const amb = env.ambientLight
    const dir = env.directionalLight
    const ambParams = { intensity: amb.intensity, color: `#${amb.color.getHexString()}` }
    const dirParams = { intensity: dir.intensity, color: `#${dir.color.getHexString()}` }

    const ambFolder = this.debug.ui.addFolder('Scene05 Ambient')
    ambFolder.add(ambParams, 'intensity', 0, 3, 0.01).onChange((v) => {
      amb.intensity = v
    })
    ambFolder.addColor(ambParams, 'color').onChange((v) => {
      amb.color.set(v)
    })

    const dirFolder = this.debug.ui.addFolder('Scene05 Directional')
    dirFolder.add(dirParams, 'intensity', 0, 5, 0.01).onChange((v) => {
      dir.intensity = v
    })
    dirFolder.addColor(dirParams, 'color').onChange((v) => {
      dir.color.set(v)
    })

    const modes = this.world.visualModes
    if (modes) {
      const modeParams = { mode: modes.mode }
      const modeFolder = this.debug.ui.addFolder('Scene05 Visual mode')
      modeFolder
        .add(modeParams, 'mode', ['day', 'night', 'ir'])
        .name('Mode')
        .onChange((v) => {
          modes.setMode(v)
        })
    }
  }
}
