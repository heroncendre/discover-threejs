import Experience from '../../../Experience/Experience.js'
import Floor from './Floor.js'
import Subjects from './Subjects.js'
import Environment from './Environment.js'
import WorldDebug from './WorldDebug.js'

/** Monde de la scène 01 : sol, sujets animés, environnement lumineux. */
export default class World {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources

    /** @type {Floor | null} */
    this.floor = null
    /** @type {Subjects | null} */
    this.subjects = null
    /** @type {Environment | null} */
    this.environment = null

    this.resources.on('ready', () => {
      this.floor = new Floor()
      this.subjects = new Subjects()
      this.environment = new Environment()

      // PointLight orbite autour du torus knot.
      const torusEntry = this.subjects.entries.find((e) => e.id === 'torus')
      if (torusEntry?.mesh) {
        this.environment.setPointLightOrbitTarget(torusEntry.mesh)
      }

      if (this.experience.debug.active) {
        this.worldDebug = new WorldDebug()
      }
    })
  }

  update() {
    if (this.subjects) this.subjects.update()
    if (this.environment) this.environment.update()
    this.worldDebug?.update()
  }
}
