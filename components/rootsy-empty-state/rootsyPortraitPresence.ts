"use client"

import { useLayoutEffect, useSyncExternalStore } from "react"

/** Prioridad: toast → catálogo → pedido. */
export type RootsyPortraitSlot = "toast" | "catalog" | "ticket"

export const ROOTSY_PORTRAIT_RANK: Record<RootsyPortraitSlot, number> = {
  toast: 1,
  catalog: 2,
  ticket: 3,
}

export const ROOTSY_ELSEWHERE_LABEL: Record<RootsyPortraitSlot, string> = {
  toast: "Rootsy está en el aviso",
  catalog: "Rootsy está en el catálogo",
  ticket: "Rootsy está en el pedido",
}

type PresenceSnapshot = {
  holder: RootsyPortraitSlot | null
}

const SERVER_SNAPSHOT: PresenceSnapshot = Object.freeze({
  holder: null,
})

const claims = new Map<RootsyPortraitSlot, number>()
let cached: PresenceSnapshot = SERVER_SNAPSHOT
const listeners = new Set<() => void>()

function computeHolder(): RootsyPortraitSlot | null {
  let holder: RootsyPortraitSlot | null = null
  let best = Infinity
  for (const slot of claims.keys()) {
    const rank = ROOTSY_PORTRAIT_RANK[slot]
    if (rank < best) {
      best = rank
      holder = slot
    }
  }
  return holder
}

function recompute() {
  const holder = computeHolder()
  if (cached.holder === holder) return
  cached = { holder }
}

function emit() {
  recompute()
  listeners.forEach((listener) => listener())
}

export function claimRootsyPortrait(slot: RootsyPortraitSlot) {
  claims.set(slot, (claims.get(slot) ?? 0) + 1)
  emit()
  return () => {
    const next = (claims.get(slot) ?? 1) - 1
    if (next <= 0) {
      claims.delete(slot)
    } else {
      claims.set(slot, next)
    }
    emit()
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function subscribeNoop() {
  return () => {}
}

function getSnapshot() {
  return cached
}

function getServerSnapshot() {
  return SERVER_SNAPSHOT
}

export function useRootsyPortraitSlot(slot?: RootsyPortraitSlot) {
  const snapshot = useSyncExternalStore(
    slot ? subscribe : subscribeNoop,
    getSnapshot,
    getServerSnapshot,
  )

  useLayoutEffect(() => {
    if (!slot) return
    return claimRootsyPortrait(slot)
  }, [slot])

  if (!slot) {
    return {
      showPortrait: true,
      elsewhereToward: null as RootsyPortraitSlot | null,
    }
  }

  const showPortrait = snapshot.holder === slot
  const elsewhereToward =
    snapshot.holder && snapshot.holder !== slot ? snapshot.holder : null

  return { showPortrait, elsewhereToward }
}
