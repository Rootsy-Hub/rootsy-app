import { useEffect, useState, useSyncExternalStore } from "react"

const subscribe = () => () => {}
const getClientSnapshot = () => true
const getServerSnapshot = () => false

/** False en SSR y en el primer paint de hidratación; true después. */
export function useIsHydrated() {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot)
}

let layoutIdentitySessionReady = false

/** False en SSR y en el primer paint; true después. En la misma sesión, las navegs siguientes ya arrancan en true. */
export function useAfterHydration() {
  const [ready, setReady] = useState(layoutIdentitySessionReady)
  useEffect(() => {
    layoutIdentitySessionReady = true
    setReady(true)
  }, [])
  return ready
}
