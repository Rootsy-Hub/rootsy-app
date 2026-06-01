"use client"

import { getLayoutPreviewHeaderData } from "./actions"
import { LayoutPreviewListTable } from "./LayoutPreviewListTable"
import {
  LayoutPreviewReportsDashboard,
  LayoutPreviewSummaryDashboard,
} from "./layoutPreviewDashboards"
import { DataWorkspaceLayout } from "@/components/layouts/DataWorkspaceLayout"
import {
  DataWorkspaceSidebar,
  getDefaultWorkspaceViewId,
} from "@/components/layouts/DataWorkspaceSidebar"
import { cn } from "@/lib/utils"
import withAuth from "@/hoc/withAuth"
import {
  BarChart3,
  FileText,
  LayoutGrid,
  Package,
  Table2,
} from "lucide-react"
import { useParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"

const CREATION_ITEMS = [
  { id: "create-article", label: "Crear artículo", icon: Package },
  { id: "create-invoice", label: "Crear factura", icon: FileText },
] as const

const VIEW_ITEMS = [
  { id: "list", label: "Listado", icon: Table2 },
  { id: "reports", label: "Reportes", icon: BarChart3 },
  { id: "summary", label: "Resumen", icon: LayoutGrid },
] as const

function LayoutPreviewPage() {
  const params = useParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : undefined

  const [loading, setLoading] = useState(true)
  const [headerError, setHeaderError] = useState<string | null>(null)
  const [popName, setPopName] = useState("")
  const [userFullName, setUserFullName] = useState("")
  const [userImageUrl, setUserImageUrl] = useState<string | null>(null)
  const [roleLabel, setRoleLabel] = useState("")

  const [activeId, setActiveId] = useState(() =>
    getDefaultWorkspaceViewId(CREATION_ITEMS, VIEW_ITEMS),
  )

  const load = useCallback(async () => {
    if (!popId) return
    setLoading(true)
    const res = await getLayoutPreviewHeaderData(popId)
    setLoading(false)
    if (!res.success) {
      setHeaderError(res.error)
      setPopName("")
      setUserFullName("")
      setUserImageUrl(null)
      setRoleLabel("")
      return
    }
    setHeaderError(null)
    setPopName(res.popName)
    setUserFullName(res.userFullName)
    setUserImageUrl(res.userImageUrl)
    setRoleLabel(res.roleLabel)
  }, [popId])

  useEffect(() => {
    void load()
  }, [load])

  const panelCopy = useMemo(() => {
    switch (activeId) {
      case "create-article":
        return {
          title: "Alta de artículo",
          body: "Vista de ejemplo para un flujo de creación (formulario, pasos, etc.).",
        }
      case "create-invoice":
        return {
          title: "Nueva factura",
          body: "Otro flujo de creación con el mismo patrón de selección en la barra lateral.",
        }
      case "list":
      case "reports":
      case "summary":
        return null
      default:
        return { title: "Vista", body: "" }
    }
  }, [activeId])

  if (!popId || !siteId) {
    return (
      <div className="rootsy-app-light min-h-screen bg-background p-10 text-foreground">
        <p className="text-sm">Punto de venta no encontrado.</p>
      </div>
    )
  }

  return (
    <DataWorkspaceLayout
      siteId={siteId}
      popId={popId}
      popName={popName}
      title="Layout tablas"
      headerVariant="dark"
      loading={loading}
      userName={userFullName || undefined}
      userAvatarSrc={userImageUrl}
      userRoleLabel={roleLabel || undefined}
      sidebar={
        <DataWorkspaceSidebar
          creationItems={CREATION_ITEMS}
          viewItems={VIEW_ITEMS}
          activeId={activeId}
          onSelect={setActiveId}
        />
      }
    >
      <div className="relative flex min-h-[500px] w-full flex-1 flex-col gap-6">
        {headerError ? (
          <div
            role="alert"
            className="relative shrink-0 rounded-2xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive shadow-sm"
          >
            Cabecera: {headerError}
          </div>
        ) : null}

        {activeId === "list" ? (
          <div className="relative flex min-h-0 flex-1 flex-col">
            <LayoutPreviewListTable siteId={siteId} popId={popId} />
          </div>
        ) : (
          <>
            {panelCopy ? (
              <div className="relative shrink-0">
                <h2 className="bg-linear-to-br from-foreground to-foreground/65 bg-clip-text text-lg font-semibold tracking-tight text-transparent">
                  {panelCopy.title}
                </h2>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {panelCopy.body} Vista previa estática para iterar shell +
                  sidebar.
                </p>
              </div>
            ) : null}
            {activeId === "reports" ? (
              <LayoutPreviewReportsDashboard />
            ) : activeId === "summary" ? (
              <LayoutPreviewSummaryDashboard />
            ) : (
              <div
                className={cn(
                  "rounded-2xl border border-dashed border-primary/15 bg-muted/20",
                  "px-6 py-12 text-center text-sm text-muted-foreground",
                )}
              >
                Contenido de demostración para la pestaña seleccionada.
              </div>
            )}
          </>
        )}
      </div>
    </DataWorkspaceLayout>
  )
}

export default withAuth(LayoutPreviewPage)
