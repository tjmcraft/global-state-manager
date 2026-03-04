import getStorage from "./getStorage"
import type { WebStorage } from "../types";

export default function createWebStorage(type: string = 'local'): WebStorage {
  const storage = getStorage(type)
  return {
    getItem: (key: string): Promise<string | null> => Promise.resolve(storage.getItem(key) as string | null),
    setItem: (key: string, item: string): Promise<void> => Promise.resolve(storage.setItem(key, item)),
    removeItem: (key: string): Promise<void> => Promise.resolve(storage.removeItem(key)),
    getAllKeys: (): Promise<Array<string>> => Promise.resolve(storage.keys || []),
  }
}
