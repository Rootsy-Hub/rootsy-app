"use client"

import {
  getPopWorkspaceBootstrap,
  type PopWorkspaceBootstrapData,
} from "@/lib/popWorkspaceBootstrap"
import {
  getPopCacheRevisions,
  type PopCacheRevisions,
} from "@/lib/popCacheRevisions"
import { resolvePopBootstrapRefreshKind } from "@/lib/popCacheRevisionCompare"
import {
  clearPopWorkspaceCache,
  readPopWorkspaceCache,
  writePopWorkspaceCache,
} from "@/lib/popWorkspaceClientCache"
import {
  getUserProfileRev,
  USER_PROFILE_UPDATED_EVENT,
} from "@/lib/userProfileClientCache"
import { permissionKeysInclude } from "@/lib/popPermissionConstants"
import { useAuth } from "@/context/AuthContextSupabase"
import { useRouter } from "next/navigation"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"

export type PopWorkspaceContextValue = {
  siteId: string
  popId: string
  bootstrap: PopWorkspaceBootstrapData | null
  cacheRevisions: PopCacheRevisions | null
  loading: boolean
  /** true cuando se muestra cache de sessionStorage mientras se valida en background */
  revalidating: boolean
  error: string | null
  refresh: () => Promise<void>
  refreshRevisions: () => Promise<PopCacheRevisions | null>
  hasPermission: (resource: string, action: string) => boolean
}

const PopWorkspaceContext = createContext<PopWorkspaceContextValue | undefined>(
  undefined,
)

type ProviderProps = {
  siteId: string
  popId: string
  children: ReactNode
}

function persistCache(
  userId: string,
  siteId: string,
  popId: string,
  bootstrap: PopWorkspaceBootstrapData,
  userProfileRev: number,
) {
  writePopWorkspaceCache(userId, siteId, popId, {
    userProfileRev,
    bootstrap,
    cachedAt: Date.now(),
  })
}

export function PopWorkspaceProvider({
  siteId,
  popId,
  children,
}: ProviderProps) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const userId = user?.id ?? null

  const [bootstrap, setBootstrap] = useState<PopWorkspaceBootstrapData | null>(
    null,
  )
  const [loading, setLoading] = useState(true)
  const [revalidating, setRevalidating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadSeqRef = useRef(0)

  const fetchFullBootstrap = useCallback(async (): Promise<boolean> => {
    const res = await getPopWorkspaceBootstrap(popId, siteId)
    if (!res.success) {
      setBootstrap(null)
      setError(res.error)
      if (res.redirect) {
        router.replace(res.redirect)
      }
      return false
    }

    setBootstrap(res.data)
    setError(null)

    if (userId) {
      persistCache(
        userId,
        siteId,
        popId,
        res.data,
        getUserProfileRev(userId),
      )
    }
    return true
  }, [popId, siteId, router, userId])

  const syncBootstrap = useCallback(
    async (options?: { force?: boolean; showLoading?: boolean }) => {
      if (!popId || !siteId) {
        setBootstrap(null)
        setError(null)
        setLoading(false)
        setRevalidating(false)
        return
      }

      const seq = ++loadSeqRef.current
      const force = options?.force === true
      const cached =
        !force && userId
          ? readPopWorkspaceCache(userId, siteId, popId)
          : null

      if (cached) {
        setBootstrap(cached.bootstrap)
        setError(null)
        setLoading(false)
        setRevalidating(true)
      } else if (options?.showLoading !== false) {
        setLoading(true)
        setRevalidating(false)
      }

      const revRes = await getPopCacheRevisions(popId)
      if (seq !== loadSeqRef.current) return

      const liveRevisions = revRes.success
        ? revRes.revisions
        : cached?.bootstrap.cacheRevisions

      const liveUserProfileRev = userId ? getUserProfileRev(userId) : 1

      if (
        !force &&
        cached &&
        liveRevisions &&
        revRes.success
      ) {
        const refreshKind = resolvePopBootstrapRefreshKind(
          cached.bootstrap.cacheRevisions,
          liveRevisions,
          cached.userProfileRev,
          liveUserProfileRev,
        )

        if (refreshKind === "none") {
          setBootstrap(cached.bootstrap)
          setError(null)
          setLoading(false)
          setRevalidating(false)
          return
        }

        if (refreshKind === "catalog_only") {
          const updated: PopWorkspaceBootstrapData = {
            ...cached.bootstrap,
            cacheRevisions: liveRevisions,
          }
          setBootstrap(updated)
          setError(null)
          setLoading(false)
          setRevalidating(false)
          if (userId) {
            persistCache(userId, siteId, popId, updated, liveUserProfileRev)
          }
          return
        }
      }

      if (!cached) {
        setLoading(true)
      } else {
        setRevalidating(true)
      }

      const ok = await fetchFullBootstrap()
      if (seq !== loadSeqRef.current) return

      setLoading(false)
      setRevalidating(false)
      if (!ok && !cached) {
        setBootstrap(null)
      }
    },
    [popId, siteId, userId, fetchFullBootstrap],
  )

  const load = useCallback(async () => {
    await syncBootstrap({ force: true, showLoading: true })
  }, [syncBootstrap])

  useEffect(() => {
    if (authLoading) return
    void syncBootstrap()
  }, [syncBootstrap, authLoading])

  useEffect(() => {
    if (!userId) return

    const onProfileUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ userId?: string }>).detail
      if (detail?.userId && detail.userId !== userId) return
      clearPopWorkspaceCache(userId, siteId, popId)
      void syncBootstrap({ force: true, showLoading: false })
    }

    const onFocus = () => {
      void syncBootstrap({ showLoading: false })
    }

    window.addEventListener(USER_PROFILE_UPDATED_EVENT, onProfileUpdated)
    window.addEventListener("focus", onFocus)
    return () => {
      window.removeEventListener(USER_PROFILE_UPDATED_EVENT, onProfileUpdated)
      window.removeEventListener("focus", onFocus)
    }
  }, [userId, siteId, popId, syncBootstrap])

  const refreshRevisions = useCallback(async (): Promise<PopCacheRevisions | null> => {
    if (!popId) return null
    const res = await getPopCacheRevisions(popId)
    if (!res.success) return null

    setBootstrap((prev) => {
      if (!prev) return prev
      const next = { ...prev, cacheRevisions: res.revisions }
      if (userId) {
        persistCache(userId, siteId, popId, next, getUserProfileRev(userId))
      }
      return next
    })
    return res.revisions
  }, [popId, siteId, userId])

  const hasPermission = useCallback(
    (resource: string, action: string) => {
      if (!bootstrap) return false
      return permissionKeysInclude(bootstrap.permissionKeys, resource, action)
    },
    [bootstrap],
  )

  const value = useMemo(
    (): PopWorkspaceContextValue => ({
      siteId,
      popId,
      bootstrap,
      cacheRevisions: bootstrap?.cacheRevisions ?? null,
      loading: loading || authLoading,
      revalidating,
      error,
      refresh: load,
      refreshRevisions,
      hasPermission,
    }),
    [
      siteId,
      popId,
      bootstrap,
      loading,
      revalidating,
      error,
      load,
      refreshRevisions,
      hasPermission,
      authLoading,
    ],
  )

  return (
    <PopWorkspaceContext.Provider value={value}>
      {children}
    </PopWorkspaceContext.Provider>
  )
}

export function usePopWorkspace(): PopWorkspaceContextValue {
  const ctx = useContext(PopWorkspaceContext)
  if (ctx === undefined) {
    throw new Error("usePopWorkspace debe usarse dentro de PopWorkspaceProvider")
  }
  return ctx
}

/** Versión opcional para componentes fuera del layout POP (no lanza error). */
export function usePopWorkspaceOptional(): PopWorkspaceContextValue | null {
  return useContext(PopWorkspaceContext) ?? null
}
