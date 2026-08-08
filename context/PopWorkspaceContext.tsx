"use client"

import type { PopAccessCache } from "@/app/home/homeUserDataTypes"
import {
  getPopCacheRevisions,
  type PopCacheRevisions,
} from "@/lib/popCacheRevisions"
import { permissionKeysFromPopAccess } from "@/lib/popAccessPermissions"
import { permissionKeysInclude } from "@/lib/popPermissionConstants"
import { siteIdsMatchClientRoute } from "@/lib/popRoutes"
import type { PopWorkspaceBootstrapData } from "@/lib/popWorkspaceBootstrap"
import { buildWorkspaceBootstrapFromAccess } from "@/lib/popWorkspaceFromAccess"
import { usePopAccessData } from "@/hooks/usePopAccessData"
import { popAccessQueryKey, userProfileQueryKey } from "@/lib/queryKeys"
import { USER_PROFILE_UPDATED_EVENT } from "@/lib/userProfileEvents"
import { useAuth } from "@/context/AuthContextSupabase"
import { useQueryClient } from "@tanstack/react-query"
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
  popAccess: PopAccessCache | null
  bootstrap: PopWorkspaceBootstrapData | null
  cacheRevisions: PopCacheRevisions | null
  loading: boolean
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
  /** Si false, no carga `_pop-access` (p. ej. menú POP con hook propio). */
  accessEnabled?: boolean
  children: ReactNode
}

export function PopWorkspaceProvider({
  siteId,
  popId,
  accessEnabled = true,
  children,
}: ProviderProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user, loading: authLoading } = useAuth()
  const userId = user?.id ?? null

  const {
    isLoading: accessLoading,
    loadError,
    popAccess,
    profile,
    refetch,
  } = usePopAccessData(popId, { enabled: accessEnabled })

  const accessReady =
    accessEnabled && !accessLoading && Boolean(popAccess && profile)

  const routeError = useMemo(() => {
    if (!accessEnabled || accessLoading || !popAccess) return null
    if (!siteIdsMatchClientRoute(siteId, popAccess.pop.siteId)) {
      return "Ruta inválida para este punto de venta."
    }
    if (!popAccess.canEnter) {
      return "No tenés acceso activo a este punto de venta."
    }
    return null
  }, [accessEnabled, accessLoading, popAccess, siteId])

  useEffect(() => {
    if (!routeError || !popAccess) return
    if (!siteIdsMatchClientRoute(siteId, popAccess.pop.siteId)) {
      router.replace(`/${popAccess.pop.siteId}/${popId}/menu`)
    }
  }, [routeError, popAccess, siteId, popId, router])

  useEffect(() => {
    if (!userId) return

    const onProfileUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ userId?: string }>).detail
      if (detail?.userId && detail.userId !== userId) return
      void queryClient.invalidateQueries({
        queryKey: userProfileQueryKey(userId),
      })
      void queryClient.invalidateQueries({
        queryKey: popAccessQueryKey(popId),
      })
      void queryClient.invalidateQueries({
        queryKey: ["sale-comprobante-emitter", popId],
      })
    }

    window.addEventListener(USER_PROFILE_UPDATED_EVENT, onProfileUpdated)
    return () => {
      window.removeEventListener(USER_PROFILE_UPDATED_EVENT, onProfileUpdated)
    }
  }, [userId, popId, queryClient])

  const bootstrap = useMemo((): PopWorkspaceBootstrapData | null => {
    if (!accessReady || !popAccess || !profile) return null
    return buildWorkspaceBootstrapFromAccess(popAccess, profile)
  }, [accessReady, popAccess, profile])

  const permissionKeys = useMemo(
    () => (popAccess ? permissionKeysFromPopAccess(popAccess) : []),
    [popAccess],
  )

  const hasPermission = useCallback(
    (resource: string, action: string) => {
      if (!popAccess) return false
      return permissionKeysInclude(permissionKeys, resource, action)
    },
    [popAccess, permissionKeys],
  )

  const refreshRevisions = useCallback(async (): Promise<PopCacheRevisions | null> => {
    if (!popId) return null
    const res = await getPopCacheRevisions(popId)
    if (!res.success) return null
    return res.revisions
  }, [popId])

  const error = useMemo(() => {
    if (!accessEnabled) return null
    if (loadError) return "Error al cargar datos del punto de venta."
    if (routeError) return routeError
    if (!accessLoading && accessEnabled && !popAccess && !authLoading) {
      return "No tenés acceso a este punto de venta."
    }
    return null
  }, [
    accessEnabled,
    loadError,
    routeError,
    accessLoading,
    popAccess,
    authLoading,
  ])

  const value = useMemo(
    (): PopWorkspaceContextValue => ({
      siteId,
      popId,
      popAccess: accessEnabled ? popAccess : null,
      bootstrap,
      cacheRevisions: bootstrap?.cacheRevisions ?? null,
      loading: authLoading || (accessEnabled && accessLoading),
      revalidating: false,
      error,
      refresh: accessEnabled ? refetch : async () => {},
      refreshRevisions,
      hasPermission,
    }),
    [
      siteId,
      popId,
      accessEnabled,
      popAccess,
      bootstrap,
      authLoading,
      accessLoading,
      error,
      refetch,
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
