import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  loadRootsyChatMessages,
  saveRootsyChatMessages,
} from "@/app/[siteId]/[popId]/chat/chatRootsy"
import type { ChatMessageRow } from "@/app/[siteId]/[popId]/chat/chatTypes"

const SAMPLE: ChatMessageRow = {
  id: "msg-1",
  authorUserId: "u1",
  authorName: "Arian",
  body: "hola",
  createdAt: "2026-08-24T00:00:00.000Z",
  mine: true,
}

function installMemorySessionStorage() {
  const store = new Map<string, string>()
  const storage: Storage = {
    get length() {
      return store.size
    },
    clear() {
      store.clear()
    },
    getItem(key) {
      return store.has(key) ? store.get(key)! : null
    },
    key(index) {
      return [...store.keys()][index] ?? null
    },
    removeItem(key) {
      store.delete(key)
    },
    setItem(key, value) {
      store.set(key, String(value))
    },
  }
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    writable: true,
    value: storage,
  })
  return store
}

describe("historial de sesión de Rootsy", () => {
  it("en development, recargar la página borra el hilo una vez", () => {
    const previousEnv = process.env.NODE_ENV
    const previousStorage = globalThis.sessionStorage
    const previousFlag = (
      globalThis as { __rootsyChatDevReloadCleared?: boolean }
    ).__rootsyChatDevReloadCleared
    process.env.NODE_ENV = "development"
    installMemorySessionStorage()
    delete (globalThis as { __rootsyChatDevReloadCleared?: boolean })
      .__rootsyChatDevReloadCleared

    try {
      sessionStorage.setItem(
        "rootsy-mascot-chat:pop-1",
        JSON.stringify([SAMPLE]),
      )
      const afterReload = loadRootsyChatMessages("pop-1")
      assert.equal(afterReload.length, 0)
      assert.equal(sessionStorage.getItem("rootsy-mascot-chat:pop-1"), null)

      saveRootsyChatMessages("pop-1", [SAMPLE])
      const samePage = loadRootsyChatMessages("pop-1")
      assert.equal(samePage.length, 1)
      assert.equal(samePage[0]?.body, "hola")
    } finally {
      process.env.NODE_ENV = previousEnv
      Object.defineProperty(globalThis, "sessionStorage", {
        configurable: true,
        writable: true,
        value: previousStorage,
      })
      const slot = globalThis as { __rootsyChatDevReloadCleared?: boolean }
      if (previousFlag) slot.__rootsyChatDevReloadCleared = previousFlag
      else delete slot.__rootsyChatDevReloadCleared
    }
  })

  it("fuera de development no borra al cargar", () => {
    const previousEnv = process.env.NODE_ENV
    const previousStorage = globalThis.sessionStorage
    process.env.NODE_ENV = "production"
    installMemorySessionStorage()
    delete (globalThis as { __rootsyChatDevReloadCleared?: boolean })
      .__rootsyChatDevReloadCleared

    try {
      saveRootsyChatMessages("pop-1", [SAMPLE])
      const loaded = loadRootsyChatMessages("pop-1")
      assert.equal(loaded.length, 1)
      assert.equal(loaded[0]?.body, "hola")
    } finally {
      process.env.NODE_ENV = previousEnv
      Object.defineProperty(globalThis, "sessionStorage", {
        configurable: true,
        writable: true,
        value: previousStorage,
      })
      delete (globalThis as { __rootsyChatDevReloadCleared?: boolean })
        .__rootsyChatDevReloadCleared
    }
  })
})
