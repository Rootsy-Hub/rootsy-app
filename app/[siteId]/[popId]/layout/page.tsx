"use client"

import { LayoutPreviewListTable } from "./LayoutPreviewListTable"
import {
  LayoutPreviewReportsDashboard,
  LayoutPreviewSummaryDashboard,
} from "./layoutPreviewDashboards"
import { DataWorkspaceLayout } from "@/components/layouts/DataWorkspaceLayout"
import { DataWorkspaceSectionMenu } from "@/components/layouts/DataWorkspaceSectionMenu"
import { getDefaultWorkspaceViewId } from "@/components/layouts/DataWorkspaceSidebar"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
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
import { useMemo, useState } from "react"

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

  const { bootstrap, loading: bootstrapLoading, error: bootstrapError } =
    usePopWorkspace()

  const [activeId, setActiveId] = useState(() =>
    getDefaultWorkspaceViewId(CREATION_ITEMS, VIEW_ITEMS),
  )

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
          body: "Otro flujo de creación con el mismo patrón de selección en el menú del header.",
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
      popName={bootstrap?.popName ?? ""}
      title="Layout tablas"
      headerVariant="dark"
      contentFlush
      loading={bootstrapLoading}
      userName={bootstrap?.userFullName || undefined}
      userAvatarSrc={bootstrap?.userImageUrl ?? undefined}
      userRoleLabel={bootstrap?.roleLabel || undefined}
      sectionMenu={
        <DataWorkspaceSectionMenu
          headerVariant="dark"
          creationItems={CREATION_ITEMS}
          viewItems={VIEW_ITEMS}
          activeId={activeId}
          onSelect={setActiveId}
        />
      }
    >
      <div className="relative flex min-h-0 w-full flex-1 flex-col">
        {bootstrapError ? (
          <div
            role="alert"
            className="relative shrink-0 border-b border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            Cabecera: {bootstrapError}
          </div>
        ) : null}

        {activeId === "list" ? (
          <LayoutPreviewListTable siteId={siteId} popId={popId} />
        ) : (
          <>
            {panelCopy ? (
              <div className="relative shrink-0">
                <h2 className="bg-linear-to-br from-foreground to-foreground/65 bg-clip-text text-lg font-semibold tracking-tight text-transparent">
                  {panelCopy.title}
                </h2>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {panelCopy.body} Vista previa estática para iterar shell +
                  menú de sección.
                </p>
              </div>
            ) : null}
            {activeId === "reports" ? (
              <div className="relative flex w-full flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
                <LayoutPreviewReportsDashboard />
              </div>
            ) : activeId === "summary" ? (
              <div className="relative flex w-full flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
                <LayoutPreviewSummaryDashboard />
              </div>
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
