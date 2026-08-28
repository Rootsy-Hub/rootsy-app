import { createPopLocalDatabase } from "@/lib/popLocalDb/engine"
import { POP_LOCAL_DB_DIR, popLocalDbFileName } from "@/lib/popLocalDb/schema"
import type { PopLocalDatabase } from "@/lib/popLocalDb/database"

const PERSIST_DEBOUNCE_MS = 400

export class PopLocalDbHandle {
  private dirty = false
  private persistTimer: ReturnType<typeof setTimeout> | null = null
  private persistChain: Promise<void> = Promise.resolve()

  constructor(
    readonly popId: string,
    readonly database: PopLocalDatabase,
    private readonly fileHandle: FileSystemFileHandle | null,
  ) {}

  markDirty() {
    this.dirty = true
    if (!this.fileHandle) return
    if (this.persistTimer) clearTimeout(this.persistTimer)
    this.persistTimer = setTimeout(() => {
      this.persistTimer = null
      void this.flush()
    }, PERSIST_DEBOUNCE_MS)
  }

  async flush() {
    if (this.persistTimer) {
      clearTimeout(this.persistTimer)
      this.persistTimer = null
    }
    if (!this.dirty || !this.fileHandle) return
    const write = async () => {
      if (!this.dirty || !this.fileHandle) return
      const bytes = this.database.export()
      const writable = await this.fileHandle.createWritable()
      await writable.write(bytes)
      await writable.close()
      this.dirty = false
    }
    this.persistChain = this.persistChain.then(write, write)
    try {
      await this.persistChain
    } catch (error) {
      this.dirty = true
      throw error
    }
  }
}

const handles = new Map<string, Promise<PopLocalDbHandle>>()

async function readOpfsBytes(
  fileHandle: FileSystemFileHandle,
): Promise<Uint8Array | null> {
  const file = await fileHandle.getFile()
  if (file.size === 0) return null
  return new Uint8Array(await file.arrayBuffer())
}

async function openOpfsFile(popId: string): Promise<FileSystemFileHandle | null> {
  if (typeof navigator === "undefined" || !navigator.storage?.getDirectory) {
    return null
  }
  const root = await navigator.storage.getDirectory()
  const dir = await root.getDirectoryHandle(POP_LOCAL_DB_DIR, { create: true })
  return dir.getFileHandle(popLocalDbFileName(popId), { create: true })
}

export async function openPopLocalDb(popId: string): Promise<PopLocalDbHandle> {
  const cached = handles.get(popId)
  if (cached) return cached

  const opening = (async () => {
    let fileHandle: FileSystemFileHandle | null = null
    let bytes: Uint8Array | null = null
    try {
      fileHandle = await openOpfsFile(popId)
      if (fileHandle) bytes = await readOpfsBytes(fileHandle)
    } catch {
      fileHandle = null
      bytes = null
    }
    const database = await createPopLocalDatabase(bytes)
    return new PopLocalDbHandle(popId, database, fileHandle)
  })()

  handles.set(popId, opening)
  try {
    return await opening
  } catch (error) {
    handles.delete(popId)
    throw error
  }
}

export async function getOpenedPopLocalDb(
  popId: string,
): Promise<PopLocalDbHandle> {
  return openPopLocalDb(popId)
}

export function peekPopLocalDb(
  popId: string,
): Promise<PopLocalDbHandle> | undefined {
  return handles.get(popId)
}
