import { popScopedHref } from "@/lib/popRoutes"
import {
  BarChart3,
  Component,
  FileText,
  LayoutGrid,
  Package,
  Table2,
} from "lucide-react"

export const LAYOUT_CREATION_ITEMS = [
  { id: "create-article", label: "Crear artículo", icon: Package },
  { id: "create-invoice", label: "Crear factura", icon: FileText },
] as const

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
    return popScopedHref(siteId, popId, "layout/library")
  }
  return popScopedHref(siteId, popId, "layout")
}
