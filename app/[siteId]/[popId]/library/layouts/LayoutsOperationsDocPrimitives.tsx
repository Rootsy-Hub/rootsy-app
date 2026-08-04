"use client"

import "@/app/[siteId]/[popId]/library/color/rootsyNaturePalette.css"
import {
  LAYOUTS_OPERATIONS_CANVAS_RAIL_WIDTH_PX,
  LAYOUTS_OPERATIONS_SUMMARY_PANEL_WIDTH_PX,
  layoutsOperationsBodyColumnsClass,
  layoutsOperationsBodyScopeClass,
  layoutsOperationsBodyShellClass,
  layoutsOperationsHeaderGridClass,
  layoutsOperationsHeaderScopeClass,
  layoutsOperationsMainColumnClass,
  layoutsOperationsMainCanvasClass,
  layoutsOperationsMainCanvasContentClass,
  layoutsOperationsMainCanvasRailClass,
  layoutsOperationsMainFooterClass,
  layoutsOperationsSummaryContentClass,
  layoutsOperationsSummaryPanelClass,
  layoutsOperationsSummaryTabsRowClass,
  layoutsOperationsSummaryTotalsRowClass,
  layoutsOperationsSummaryTotalsRowEdgeClass,
  layoutsOperationsSummaryTotalsLabelClass,
  layoutsOperationsSummaryTotalsAmountClass,
} from "@/app/[siteId]/[popId]/library/layouts/layoutsOperationsStyles"
import { DataWorkspaceHeaderTitle } from "@/components/layouts/DataWorkspaceHeaderTitle"
import {
  dataWorkspaceHeaderChromeButtonClass,
  dataWorkspaceHeaderDividerClass,
  dataWorkspaceHeaderPopRingClass,
  dataWorkspaceHeaderRoleLabelClass,
} from "@/components/layouts/dataWorkspaceHeaderStyles"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { ArrowLeft, Maximize2, PanelLeftOpen, Store } from "lucide-react"

const HEADER_VARIANT = "dark" as const
const DEMO_PAGE_TITLE = "Vender"
const DEMO_POP_NAME = "Rootsy Market"
const DEMO_POP_LOGO =
  "https://api.dicebear.com/7.x/shapes/svg?seed=demo-pop&backgroundColor=e8f5ef"
const DEMO_USER_NAME = "Arián Fernandez"
const DEMO_USER_ROLE = "Dueño"
const DEMO_USER_AVATAR =
  "https://api.dicebear.com/7.x/avataaars/svg?seed=arian-fernandez"
const DEMO_USER_INITIALS = "AF"

function useOperationsHeaderChromeButtonClass() {
  return dataWorkspaceHeaderChromeButtonClass(HEADER_VARIANT)
}

function LayoutHeightBadge({ label }: { label: string }) {
  return (
    <span className="pointer-events-none absolute right-2 top-1.5 z-20 rounded-md bg-background/95 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground ring-1 ring-border/60">
      {label}
    </span>
  )
}

function LayoutsOperationsHeaderChromeButtons() {
  const chromeButtonClass = useOperationsHeaderChromeButtonClass()

  return (
    <>
      <button type="button" className={chromeButtonClass} aria-hidden tabIndex={-1}>
        <ArrowLeft className="size-5" aria-hidden />
      </button>
      <button type="button" className={chromeButtonClass} aria-hidden tabIndex={-1}>
        <Maximize2 className="size-5" aria-hidden />
      </button>
      <button type="button" className={chromeButtonClass} aria-hidden tabIndex={-1}>
        <PanelLeftOpen className="size-5" aria-hidden />
      </button>
    </>
  )
}

function LayoutsOperationsHeaderPopProfile() {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <div
        className={cn(
          "size-8 overflow-hidden rounded-lg ring-1",
          dataWorkspaceHeaderPopRingClass(HEADER_VARIANT),
        )}
      >
        <img src={DEMO_POP_LOGO} alt="" className="size-full object-cover" />
      </div>
      <span className="truncate text-sm font-semibold text-zinc-100">{DEMO_POP_NAME}</span>
    </div>
  )
}

function LayoutsOperationsHeaderUserProfile() {
  const chromeButtonClass = useOperationsHeaderChromeButtonClass()

  return (
    <>
      <div className="hidden min-w-0 flex-col leading-tight sm:flex">
        <span className="truncate text-sm font-semibold text-zinc-100">{DEMO_USER_NAME}</span>
        <span
          className={cn(
            "truncate text-[10px] font-semibold uppercase tracking-wider",
            dataWorkspaceHeaderRoleLabelClass(HEADER_VARIANT, true),
          )}
        >
          {DEMO_USER_ROLE}
        </span>
      </div>
      <button
        type="button"
        className={cn(chromeButtonClass, "relative overflow-hidden p-0")}
        tabIndex={-1}
        aria-hidden
      >
        <Avatar className="size-full rounded-[inherit]">
          <AvatarImage src={DEMO_USER_AVATAR} alt="" className="object-cover" />
          <AvatarFallback className="rounded-[inherit] bg-[#1c2824] text-[11px] font-semibold text-emerald-200">
            {DEMO_USER_INITIALS}
          </AvatarFallback>
        </Avatar>
        <span
          className="absolute bottom-1 right-1 size-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0c1210]"
          aria-hidden
        />
      </button>
    </>
  )
}

function LayoutsOperationsHeaderLeftZone() {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <LayoutsOperationsHeaderChromeButtons />
      <div className={cn("h-6 w-px", dataWorkspaceHeaderDividerClass(HEADER_VARIANT))} aria-hidden />
      <LayoutsOperationsHeaderPopProfile />
    </div>
  )
}

function LayoutsOperationsHeaderRightZone() {
  return (
    <div className="flex min-w-0 items-center justify-end gap-3">
      <LayoutsOperationsHeaderUserProfile />
    </div>
  )
}

function LayoutsOperationsHeaderDemo({
  composed = false,
  wireframe = false,
}: {
  composed?: boolean
  wireframe?: boolean
}) {
  return (
    <div
      className={cn(
        layoutsOperationsHeaderScopeClass,
        composed ? "h-18 shrink-0" : wireframe ? "relative shrink-0" : "overflow-hidden rounded-xl",
        !composed && !wireframe && "h-18",
      )}
    >
      {wireframe ? <LayoutHeightBadge label="h-18" /> : null}
      <div className={layoutsOperationsHeaderGridClass}>
        {wireframe ? (
          <>
            <div className="min-w-0" />
            <div className="min-w-0" />
            <div className="min-w-0" />
          </>
        ) : (
          <>
            <LayoutsOperationsHeaderLeftZone />
            <DataWorkspaceHeaderTitle title={DEMO_PAGE_TITLE} headerVariant={HEADER_VARIANT} />
            <LayoutsOperationsHeaderRightZone />
          </>
        )}
      </div>
    </div>
  )
}

function LayoutsOperationsMainColumn({ wireframe = false }: { wireframe?: boolean }) {
  return (
    <div className={layoutsOperationsMainColumnClass}>
      <div className={layoutsOperationsMainCanvasClass}>
        <div className={cn(layoutsOperationsMainCanvasRailClass, wireframe && "relative")}>
          {wireframe ? (
            <LayoutHeightBadge label={`${LAYOUTS_OPERATIONS_CANVAS_RAIL_WIDTH_PX}px · dark rail`} />
          ) : null}
        </div>
        <div className={cn(layoutsOperationsMainCanvasContentClass, wireframe && "relative")}>
          {wireframe ? <LayoutHeightBadge label="flex-1 · dark canvas" /> : null}
        </div>
      </div>
      <div className={cn(layoutsOperationsMainFooterClass, wireframe && "relative")}>
        {wireframe ? <LayoutHeightBadge label="h-17 · dark config" /> : null}
      </div>
    </div>
  )
}

function LayoutsOperationsSummaryPanel({ wireframe = false }: { wireframe?: boolean }) {
  return (
    <aside className={layoutsOperationsSummaryPanelClass} aria-label="Columna de resumen">
      {wireframe ? (
        <LayoutHeightBadge label={`${LAYOUTS_OPERATIONS_SUMMARY_PANEL_WIDTH_PX}px · resumen`} />
      ) : null}

      <div className={cn(layoutsOperationsSummaryTabsRowClass, wireframe && "relative")}>
        {wireframe ? <LayoutHeightBadge label="h-11 · light tabs" /> : null}
      </div>

      <div className={cn(layoutsOperationsSummaryContentClass, wireframe && "relative")}>
        {wireframe ? <LayoutHeightBadge label="light · scroll" /> : null}
      </div>

      <div className={cn(layoutsOperationsSummaryTotalsRowClass, wireframe && "relative")}>
        <div className={layoutsOperationsSummaryTotalsRowEdgeClass} aria-hidden />
        {wireframe ? (
          <LayoutHeightBadge label="light · totales" />
        ) : (
          <div className="relative z-10 flex h-full items-center justify-between px-3">
            <span className={layoutsOperationsSummaryTotalsLabelClass}>Total a cobrar</span>
            <span className={layoutsOperationsSummaryTotalsAmountClass}>$ 0,00</span>
          </div>
        )}
      </div>
    </aside>
  )
}

function LayoutsOperationsBody({ wireframe = false }: { wireframe?: boolean }) {
  return (
    <div className={cn(layoutsOperationsBodyScopeClass, layoutsOperationsBodyShellClass)}>
      <main className={layoutsOperationsBodyColumnsClass}>
        <LayoutsOperationsMainColumn wireframe={wireframe} />
        <LayoutsOperationsSummaryPanel wireframe={wireframe} />
      </main>
    </div>
  )
}

function LayoutsOperationsFrame({
  children,
  heightClass = "h-[28rem]",
}: {
  children: React.ReactNode
  heightClass?: string
}) {
  return (
    <div
      className={cn(
        "rootsy-nature-palette mx-auto flex max-w-5xl flex-col overflow-hidden rounded-2xl border border-border/80",
        "shadow-[0_24px_48px_-28px_rgba(41,37,36,0.38)] ring-1 ring-black/[0.04]",
        heightClass,
      )}
    >
      {children}
    </div>
  )
}

export function LayoutsOperationsFullPageDraft() {
  return (
    <LayoutsOperationsFrame heightClass="h-[32rem]">
      <LayoutsOperationsHeaderDemo composed />
      <LayoutsOperationsBody />
    </LayoutsOperationsFrame>
  )
}

export function LayoutsOperationsLayoutGridDemo() {
  return (
    <LayoutsOperationsFrame>
      <LayoutsOperationsHeaderDemo wireframe />
      <LayoutsOperationsBody wireframe />
    </LayoutsOperationsFrame>
  )
}

export function LayoutsOperationsOverviewIntro() {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Store className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 space-y-2">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Layout operaciones
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Header operaciones (<code className="text-[11px]">h-18</code>) — volver, pantalla
            completa, panel catálogo, POP, título y usuario; sin acciones de listado. Cuerpo en dos
            mundos: <span className="font-medium text-foreground">dark</span> a la izquierda (rail{" "}
            <code className="text-[11px]">{LAYOUTS_OPERATIONS_CANVAS_RAIL_WIDTH_PX}px</code> en{" "}
            <code className="text-[11px]">night-950</code>, canvas en{" "}
            <code className="text-[11px]">night-900</code> y banda{" "}
            <code className="text-[11px]">h-17</code> de configuración) y{" "}
            <span className="font-medium text-foreground">light</span> a la derecha (
            <code className="text-[11px]">{LAYOUTS_OPERATIONS_SUMMARY_PANEL_WIDTH_PX}px</code> —
            tabs blancos, ticket en blanco puro y totales en tierra clara con texto oscuro).
          </p>
        </div>
      </div>
    </div>
  )
}
