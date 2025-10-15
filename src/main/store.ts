import Store from "electron-store"

const store = new Store()

export function get<T>(key: string) {
  return (store as any).get(key) as T
}

export function set<T>(key: string, value: T) {
  return (store as any).set(key, value)
}
