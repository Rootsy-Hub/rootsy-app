"use client"

import {
  layoutsOperarBodyMainGridClass,
  layoutsOperarCatalogRowClass,
  layoutsOperarOperationColumnClass,
  layoutsOperarToolboxRowClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import {
  OperarMobileStageBar,
  useOperarMobileStage,
} from "@/components/layouts-module/OperarMobileStage"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { useEffect, useLayoutEffect, type ReactNode } from "react"

type Props = {
  /** 1.1.1 — sidebar categorías + canvas productos (desktop) */
  catalog: ReactNode
  /** 1.1.2 — banda toolbox (4 slots). `null` oculta la fila (Mesas/Mostrador fuera de Pedido). */
  toolbox?: ReactNode
  /** 1.2 — panel ticket (4 filas) */
  ticket: ReactNode
  /** Ubicación de la banda toolbox dentro de la columna operación. */
  toolboxPosition?: "top" | "bottom"
  /** Plano / kanban — solo mobile, escena Mesas o Mostrador. */
  mobileHome?: ReactNode
  /** Label del tab izquierdo en mobile (Mesas · Mostrador). */
  mobileHomeLabel?: string
  /** Catálogo de artículos en mobile cuando `catalog` en desktop es el plano. */
  mobileCatalog?: ReactNode
  /** Deshabilita Catálogo en mobile (p. ej. mesa sin sesión abierta). */
  mobileCatalogDisabled?: boolean
  /** Muestra la banda toolbox en desktop. Default: hay toolbox. */
  desktopToolbox?: boolean
  className?: string
}

/**
 * Grid operar nivel 1 — producción (Vender · Mostrador · Mesas · Compras).
 *
 * Desktop: 1.1 col izquierda (catálogo + toolbox) · 1.2 ticket
 * Mobile: barra Mesas/Catálogo · una escena (pedido · catálogo · plano)
 */
export function LayoutsOperarMainGrid({
  catalog,
  toolbox,
  ticket,
  toolboxPosition = "bottom",
  mobileHome,
  mobileHomeLabel,
  mobileCatalog,
  mobileCatalogDisabled = false,
  desktopToolbox,
  className,
}: Props) {
  const isMobile = useIsMobile()
  const stageApi = useOperarMobileStage()
  const showToolbox = toolbox != null
  const showDesktopToolbox = desktopToolbox ?? showToolbox
  const toolboxOnTop = toolboxPosition === "top"
  const stage = stageApi?.stage ?? "ticket"
  const setHomeLabel = stageApi?.setHomeLabel
  const setCatalogDisabled = stageApi?.setCatalogDisabled

  useLayoutEffect(() => {
    if (!setHomeLabel) return
    setHomeLabel(mobileHomeLabel ?? null)
    return () => setHomeLabel(null)
  }, [setHomeLabel, mobileHomeLabel])

  useEffect(() => {
    if (!setCatalogDisabled) return
    setCatalogDisabled(mobileCatalogDisabled)
    return () => setCatalogDisabled(false)
  }, [setCatalogDisabled, mobileCatalogDisabled])

  if (isMobile && stageApi) {
    return (
      <main
        className={cn(
          "relative z-10 flex min-h-0 flex-1 flex-col",
          className,
        )}
      >
        <OperarMobileStageBar />
        <div className="relative min-h-0 flex-1 overflow-hidden">
          {mobileHome ? (
            <div
              className={cn(
                "absolute inset-0 min-h-0",
                stage !== "home" && "hidden",
              )}
            >
              {mobileHome}
            </div>
          ) : null}
          <div
            className={cn(
              "absolute inset-0 min-h-0",
              stage !== "catalog" && "hidden",
            )}
          >
            {mobileCatalog ?? catalog}
          </div>
          <div
            className={cn(
              "absolute inset-0 min-h-0",
              stage !== "ticket" && "hidden",
            )}
          >
            {ticket}
          </div>
        </div>
        {showToolbox ? <div className="hidden">{toolbox}</div> : null}
      </main>
    )
  }

  return (
    <main
      className={cn("relative z-10 min-h-0 flex-1", layoutsOperarBodyMainGridClass, className)}
    >
      <div
        className={cn(
          layoutsOperarOperationColumnClass,
          !showDesktopToolbox && "[grid-template-rows:minmax(0,1fr)]",
          showDesktopToolbox &&
            toolboxOnTop &&
            "sm:[grid-template-rows:minmax(var(--layouts-operar-toolbox-min-h-sm),auto)_minmax(0,1fr)] [grid-template-rows:minmax(var(--layouts-operar-toolbox-min-h),auto)_minmax(0,1fr)]",
        )}
      >
        <div
          className={cn(
            layoutsOperarCatalogRowClass,
            showDesktopToolbox && toolboxOnTop && "row-start-2",
          )}
        >
          {catalog}
        </div>
        {showToolbox && showDesktopToolbox ? (
          <div
            className={cn(
              layoutsOperarToolboxRowClass,
              toolboxOnTop && "row-start-1",
            )}
          >
            {toolbox}
          </div>
        ) : showToolbox ? (
          <div className="hidden">{toolbox}</div>
        ) : null}
      </div>
      {ticket}
    </main>
  )
}
