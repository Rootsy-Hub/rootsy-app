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
  children: ReactNode
}

export function PopWorkspaceProvider({
  siteId,
  popId,
  children,
}: ProviderProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user, loading: authLoading } = useAuth()
  const userId = user?.id ?? null
  const enabled = !authLoading && Boolean(popId && siteId && userId)

  const bootstrapQuery = useQuery({
    queryKey: popWorkspaceBootstrapQueryKey(siteId, popId, userId ?? ""),
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
    enabled,
  })

  const refresh = useCallback(async () => {
    await bootstrapQuery.refetch()
  }, [bootstrapQuery])

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

  const bootstrap = bootstrapQuery.data ?? null
  const error =
    bootstrapQuery.error instanceof Error
      ? bootstrapQuery.error.message
      : bootstrapQuery.error
        ? String(bootstrapQuery.error)
        : null

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
      loading: authLoading || (enabled && bootstrapQuery.isLoading),
      revalidating: bootstrapQuery.isFetching && !bootstrapQuery.isLoading,
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
      enabled,
      bootstrapQuery.isLoading,
      bootstrapQuery.isFetching,
      error,
      refresh,
      refreshRevisions,
      hasPermission,
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
