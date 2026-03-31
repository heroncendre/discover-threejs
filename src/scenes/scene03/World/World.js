import Experience from '../../../Experience/Experience.js'
import Environment from './Environment.js'
import SphereSubject from './SphereSubject.js'

export default class World {
  constructor() {
    this.experience = new Experience()
    this.environment = new Environment()
    this.sphere = new SphereSubject(this.environment)
  }

  update() {
    this.sphere.update()
  }
}
