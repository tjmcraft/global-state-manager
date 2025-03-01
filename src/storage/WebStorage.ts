import getStorage from "./getStorage"

export default function createWebStorage(type: string = 'local'): any {
  const storage = getStorage(type)
  return {
    getItem: (key: string): Promise<string> => {
      return new Promise((resolve) => {
        resolve(storage.getItem(key))
      })
    },
    setItem: (key: string, item: string): Promise<void> => {
      return new Promise((resolve) => {
        resolve(storage.setItem(key, item))
      })
    },
    removeItem: (key: string): Promise<void> => {
      return new Promise((resolve) => {
        resolve(storage.removeItem(key))
      })
    },
  }
}