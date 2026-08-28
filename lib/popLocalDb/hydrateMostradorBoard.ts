import {
  clearMostradorBoardHydratedMark,
  isMostradorBoardHydrated,
  markMostradorBoardHydrated,
} from "@/lib/popLocalDb/hydrateMarks"
import {
  listMostradorOrdersSlim,
  replaceMostradorOrdersSlim,
} from "@/lib/popLocalDb/mostradorBoardRepo"
import { getOpenedPopLocalDb, peekPopLocalDb } from "@/lib/popLocalDb/store"
import { fetchCounterOrders } from "@/lib/rootsyApi/mostradorClient"

const hydrateLocks = new Map<string, Promise<{ fetched: boolean }>>()

function floorOrdersFromApi(
  orders: Awaited<ReturnType<typeof fetchCounterOrders>>,
) {
  if (!orders.success) throw new Error(orders.error)
  return orders.orders.map((order) => ({ ...order, checkout: null }))
}

export async function hydratePopMostradorBoardFromNetwork(
  popId: string,
): Promise<{ fetched: boolean }> {
  const pending = hydrateLocks.get(popId)
  if (pending) return pending

  const run = (async () => {
    const handle = await getOpenedPopLocalDb(popId)
    if (isMostradorBoardHydrated(handle.database)) return { fetched: false }
    const res = await fetchCounterOrders(popId)
    const orders = floorOrdersFromApi(res)
    replaceMostradorOrdersSlim(handle.database, orders)
    markMostradorBoardHydrated(handle.database)
    handle.markDirty()
    await handle.flush()
    return { fetched: true }
  })()

  hydrateLocks.set(popId, run)
  try {
    return await run
  } finally {
    hydrateLocks.delete(popId)
  }
}

export async function clearPopLocalMostradorBoardHydrateMark(popId: string) {
  const handle = await getOpenedPopLocalDb(popId)
  clearMostradorBoardHydratedMark(handle.database)
  handle.markDirty()
  await handle.flush()
}

export async function refreshMostradorOrdersFromNetwork(popId: string) {
  const res = await fetchCounterOrders(popId)
  const orders = floorOrdersFromApi(res)
  const handle = await getOpenedPopLocalDb(popId).catch(() => null)
  if (handle) {
    replaceMostradorOrdersSlim(handle.database, orders)
    handle.markDirty()
  }
  return orders
}

export async function readMostradorOrdersLocalOrFetch(popId: string) {
  const pending = peekPopLocalDb(popId)
  if (pending) {
    const handle = await pending
    if (isMostradorBoardHydrated(handle.database)) {
      return listMostradorOrdersSlim(handle.database)
    }
  }
  const res = await fetchCounterOrders(popId)
  return floorOrdersFromApi(res)
}
