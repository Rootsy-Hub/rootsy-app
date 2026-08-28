import type { HrDashboardData, PopRoleRow } from "@/app/[siteId]/[popId]/hr/hrTypes"
import { getBrowserQueryClient } from "@/lib/queryClient"
import { popHrDashboardQueryKey } from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import {
  fetchHrDashboard,
  getRolePermissionsEditorData,
} from "@/lib/rootsyApi/hrClient"
import type { QueryClient } from "@tanstack/react-query"

export type HrDashboardPageData = HrDashboardData & {
  roleGrantKeys: Record<string, string[]>
}

export type HrDashboardQueryData =
  | ({ ok: true } & HrDashboardPageData)
  | { ok: false; error: string; redirect?: string }

async function loadRoleGrantKeys(
  popId: string,
  roles: PopRoleRow[],
): Promise<Record<string, string[]>> {
  const editable = roles.filter((role) => role.popId)
  if (editable.length === 0) return {}
  const entries = await Promise.all(
    editable.map(async (role) => {
      const editor = await getRolePermissionsEditorData(popId, role.id)
      if (!editor.success) return [role.id, [] as string[]] as const
      return [role.id, editor.selectedGrantKeys] as const
    }),
  )
  return Object.fromEntries(entries)
}

export async function loadHrDashboardQuery(
  popId: string,
): Promise<HrDashboardQueryData> {
  try {
    const res = await fetchHrDashboard(popId)
    if (!res.success) {
      return { ok: false, error: res.error, redirect: res.redirect }
    }
    const { success: _success, ...dashboard } = res
    return {
      ok: true,
      ...dashboard,
      roleGrantKeys: await loadRoleGrantKeys(popId, dashboard.roles),
    }
  } catch {
    return { ok: false, error: "Error inesperado" }
  }
}

export function hrDashboardQueryOptions(popId: string) {
  return {
    queryKey: popHrDashboardQueryKey(popId),
    queryFn: () => loadHrDashboardQuery(popId),
    ...sessionListQueryOptions,
  }
}

export function prefetchHrDashboardQuery(
  popId: string,
  queryClient: QueryClient = getBrowserQueryClient(),
) {
  if (!popId) return Promise.resolve()
  return queryClient.prefetchQuery(hrDashboardQueryOptions(popId))
}

export function invalidateHrDashboardQuery(
  queryClient: QueryClient,
  popId: string,
) {
  return queryClient.invalidateQueries({
    queryKey: popHrDashboardQueryKey(popId),
  })
}

export function patchHrDashboardRoleGrants(
  queryClient: QueryClient,
  popId: string,
  roleId: string,
  grantKeys: string[],
) {
  queryClient.setQueryData<HrDashboardQueryData>(
    popHrDashboardQueryKey(popId),
    (current) => {
      if (!current || !current.ok) return current
      return {
        ...current,
        roleGrantKeys: { ...current.roleGrantKeys, [roleId]: grantKeys },
      }
    },
  )
}
