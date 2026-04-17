import Experience from '../../../Experience/Experience.js'
import Floor from './Floor.js'
import Subjects from './Subjects.js'
import Ball from './Ball.js'
import Environment from './Environment.js'
import WorldDebug from './WorldDebug.js'

export default class World {
  constructor() {
    this.experience = new Experience()
    this.resources = this.experience.resources

    /** @type {Floor | null} */
    this.floor = null
    /** @type {Subjects | null} */
    this.subjects = null
    /** @type {Ball | null} */
    this.ball = null
    /** @type {Environment | null} */
    this.environment = null

    this.resources.on('ready', () => {
      this.floor = new Floor()
      this.subjects = new Subjects()
      const matcap = this.resources.items.matcapBlueRed
      if (!matcap) console.warn('matcapBlueRed manquant — vérifiez sources / public/textures')
      this.ball = new Ball(this.floor, matcap)
      this.environment = new Environment()
      this.environment.setOrbitCenterFromSubjects(this.subjects)
      if (this.experience.debug.active) {
        this.worldDebug = new WorldDebug()
      }
    })
  }

  update() {
    this.ball?.update()
    this.subjects?.update()
    this.environment?.update()
  }
}
