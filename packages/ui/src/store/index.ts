export class Store {
  data:Record<string, unknown>
  watchMap: Map<string, (...rest:any)=>void>
  constructor () {
    this.data = Object.create(null)
    this.watchMap = new Map()
  }

  commit (key:string, value:unknown) {
    this.data[key] = value
    if (this.watchMap.has(key)) {
      this.watchMap.get(key)!(value)
    }
  }

  getter (key:string) {
    return this.data[key]
  }

  delete (key:string) {
    delete this.data[key]
  }

  watch (key:string, callback:(...rest:any)=>void) {
    this.watchMap.set(key, callback)
  }
}

export default new Store()
