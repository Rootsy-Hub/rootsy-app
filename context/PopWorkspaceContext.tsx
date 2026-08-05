"use client"

import {
  getPopWorkspaceBootstrap,
  type PopWorkspaceBootstrapData,
} from "@/lib/popWorkspaceBootstrap"
import {
  getPopCacheRevisions,
  type PopCacheRevisions,
} from "@/lib/popCacheRevisions"
import { popWorkspaceBootstrapQueryKey } from "@/lib/queryKeys"
import { USER_PROFILE_UPDATED_EVENT } from "@/lib/userProfileEvents"
import { permissionKeysInclude } from "@/lib/popPermissionConstants"
import { useAuth } from "@/context/AuthContextSupabase"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

export type PopWorkspaceContextValue = {
  siteId: string
  popId: string
  bootstrap: PopWorkspaceBootstrapData | null
  cacheRevisions: PopCacheRevisions | null
  loading: boolean
  /** Refetch en background (React Query). */
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
  /** Si false, no monta la query de bootstrap (p. ej. menú POP). */
  bootstrapEnabled?: boolean
  children: ReactNode
}

type BootstrapLoaderProps = {
  siteId: string
  popId: string
  userId: string
  onState: (state: BootstrapLoaderState) => void
}

type BootstrapLoaderState = {
  bootstrap: PopWorkspaceBootstrapData | null
  loading: boolean
  revalidating: boolean
  error: string | null
  refresh: () => Promise<void>
}

function PopWorkspaceBootstrapLoader({
  siteId,
  popId,
  userId,
  onState,
}: BootstrapLoaderProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const bootstrapQuery = useQuery({
    queryKey: popWorkspaceBootstrapQueryKey(siteId, popId, userId),
    queryFn: async (): Promise<PopWorkspaceBootstrapData> => {
      const res = await getPopWorkspaceBootstrap(popId, siteId)
      if (!res.success) {
        if (res.redirect) {
          router.replace(res.redirect)
        }
        throw new Error(res.error)
      }
      return res.data
    },
    enabled: Boolean(popId && siteId && userId),
  })

  const refresh = useCallback(async () => {
    await bootstrapQuery.refetch()
  }, [bootstrapQuery])

  useEffect(() => {
    if (!userId) return

    const onProfileUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ userId?: string }>).detail
      if (detail?.userId && detail.userId !== userId) return
      void queryClient.invalidateQueries({
        queryKey: popWorkspaceBootstrapQueryKey(siteId, popId, userId),
      })
      void queryClient.invalidateQueries({
        queryKey: ["sale-comprobante-emitter", popId],
      })
    }

    window.addEventListener(USER_PROFILE_UPDATED_EVENT, onProfileUpdated)
    return () => {
      window.removeEventListener(USER_PROFILE_UPDATED_EVENT, onProfileUpdated)
    }
  }, [userId, siteId, popId, queryClient])

  useEffect(() => {
    onState({
      bootstrap: bootstrapQuery.data ?? null,
      loading: bootstrapQuery.isLoading,
      revalidating: bootstrapQuery.isFetching && !bootstrapQuery.isLoading,
      error:
        bootstrapQuery.error instanceof Error
          ? bootstrapQuery.error.message
          : bootstrapQuery.error
            ? String(bootstrapQuery.error)
            : null,
      refresh,
    })
  }, [
    bootstrapQuery.data,
    bootstrapQuery.isLoading,
    bootstrapQuery.isFetching,
    bootstrapQuery.error,
    refresh,
    onState,
  ])

  return null
}

export function PopWorkspaceProvider({
  siteId,
  popId,
  bootstrapEnabled = true,
  children,
}: ProviderProps) {
  const queryClient = useQueryClient()
  const { user, loading: authLoading } = useAuth()
  const userId = user?.id ?? null

  const [bootstrapState, setBootstrapState] = useState<BootstrapLoaderState>({
    bootstrap: null,
    loading: false,
    revalidating: false,
    error: null,
    refresh: async () => {},
  })

  const handleBootstrapState = useCallback((state: BootstrapLoaderState) => {
    setBootstrapState(state)
  }, [])

  const refreshRevisions = useCallback(async (): Promise<PopCacheRevisions | null> => {
    if (!popId || !userId) return null
    const res = await getPopCacheRevisions(popId)
    if (!res.success) return null

    queryClient.setQueryData<PopWorkspaceBootstrapData>(
      popWorkspaceBootstrapQueryKey(siteId, popId, userId),
      (prev) => (prev ? { ...prev, cacheRevisions: res.revisions } : prev),
    )
    return res.revisions
  }, [popId, siteId, userId, queryClient])

  const bootstrap = bootstrapEnabled ? bootstrapState.bootstrap : null
  const error = bootstrapEnabled ? bootstrapState.error : null
  const refresh = bootstrapEnabled ? bootstrapState.refresh : async () => {}

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
      loading:
        authLoading || (bootstrapEnabled && bootstrapState.loading),
      revalidating: bootstrapEnabled && bootstrapState.revalidating,
      error,
      refresh,
      refreshRevisions,
      hasPermission,
    }),
    [
      siteId,
      popId,
      bootstrap,
      authLoading,
      bootstrapEnabled,
      bootstrapState.loading,
      bootstrapState.revalidating,
      error,
      refresh,
      refreshRevisions,
      hasPermission,
    ],
  )

  return (
    <PopWorkspaceContext.Provider value={value}>
      {bootstrapEnabled && userId ? (
        <PopWorkspaceBootstrapLoader
          siteId={siteId}
          popId={popId}
          userId={userId}
          onState={handleBootstrapState}
        />
      ) : null}
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
