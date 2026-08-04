import { popScopedHref } from "@/lib/popRoutes"
import {
  BarChart3,
  Component,
  LayoutGrid,
  Table2,
} from "lucide-react"

export const LAYOUT_VIEW_ITEMS = [
  { id: "list", label: "Listado", icon: Table2 },
  { id: "reports", label: "Reportes", icon: BarChart3 },
  { id: "summary", label: "Resumen", icon: LayoutGrid },
  { id: "library", label: "Librería UI", icon: Component },
] as const

export type LayoutViewId = (typeof LAYOUT_VIEW_ITEMS)[number]["id"]

export function layoutViewHref(
  siteId: string,
  popId: string,
  viewId: LayoutViewId,
): string {
  if (viewId === "library") {
    return popScopedHref(siteId, popId, "library")
  }
  return popScopedHref(siteId, popId, "layout")
}
