export default class EventEmitter {
  constructor() {
    this._callbacks = {}
  }

  on(name, callback) {
    if (!this._callbacks[name]) this._callbacks[name] = []
    this._callbacks[name].push(callback)
    return this
  }

  off(name, callback) {
    if (!this._callbacks[name]) return this
    this._callbacks[name] = this._callbacks[name].filter((cb) => cb !== callback)
    return this
  }

  trigger(name, ...args) {
    const cbs = this._callbacks[name]
    if (!cbs) return this
    for (const cb of cbs) cb(...args)
    return this
  }
}
