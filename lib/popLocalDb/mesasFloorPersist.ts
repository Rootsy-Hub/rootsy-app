import type { PopLocalDatabase } from "@/lib/popLocalDb/database"
import { peekPopLocalDb } from "@/lib/popLocalDb/store"

export function writePopLocalIfOpen(
  popId: string,
  write: (db: PopLocalDatabase) => void,
) {
  const pending = peekPopLocalDb(popId)
  if (!pending) return
  void pending.then((handle) => {
    write(handle.database)
    handle.markDirty()
  })
}

export const writeMesasFloorIfOpen = writePopLocalIfOpen
export const writeMostradorBoardIfOpen = writePopLocalIfOpen
export const writeComandasBoardIfOpen = writePopLocalIfOpen
