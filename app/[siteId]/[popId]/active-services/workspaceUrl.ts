import {
  isActiveServicesViewFilter,
  type ActiveServicesViewFilter,
} from "@/lib/serviceChargeTypes"

export type ActiveServicesWorkspaceState = {
  view: ActiveServicesViewFilter
  q: string
}

export function parseActiveServicesWorkspaceUrl(
  searchParams: URLSearchParams,
): ActiveServicesWorkspaceState {
  const viewRaw = searchParams.get("view") ?? "clients"
  const view = isActiveServicesViewFilter(viewRaw) ? viewRaw : "clients"
  return {
    view,
    q: searchParams.get("q")?.trim() ?? "",
  }
}

export function mergeActiveServicesWorkspaceUrl(
  base: ActiveServicesWorkspaceState,
  patch: Partial<ActiveServicesWorkspaceState>,
): string {
  const next = { ...base, ...patch }
  const params = new URLSearchParams()
  if (next.view !== "clients") params.set("view", next.view)
  if (next.q.trim()) params.set("q", next.q.trim())
  const qs = params.toString()
  return qs ? `?${qs}` : ""
}
