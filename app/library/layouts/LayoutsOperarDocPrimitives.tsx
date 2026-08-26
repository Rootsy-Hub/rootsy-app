"use client"

import "@/app/library/layouts/layoutsOperarTheme.css"
import "@/app/library/radius/rootsyRadiusSystem.css"
import {
  LAYOUTS_OPERAR_CATALOG_SIDEBAR_WIDTH_PX,
  LAYOUTS_OPERAR_SUMMARY_PANEL_WIDTH_PX,
  layoutsOperarBodyMainGridClass,
  layoutsOperarBodyScopeClass,
  layoutsOperarBodyShellClass,
  layoutsOperarBodyWireframeClass,
  layoutsOperarCatalogCanvasClass,
  layoutsOperarCatalogCanvasScrollClass,
  layoutsOperarCatalogColumnClass,
  layoutsOperarCatalogRowClass,
  layoutsOperarOperationColumnClass,
  layoutsOperarCatalogGridClass,
  layoutsOperarCatalogGridStyle,
  layoutsOperarCatalogSidebarClass,
  layoutsOperarCatalogSidebarOpenClass,
  layoutsOperarCatalogSectionShellClass,
  layoutsOperarHeaderGridClass,
  layoutsOperarHeaderScopeClass,
  layoutsOperarSummaryCartRowClass,
  layoutsOperarSummaryTotalRowClass,
  layoutsOperarSummaryTotalsAmountClass,
  layoutsOperarSummaryTotalsLabelClass,
  layoutsOperarSummaryPanelClass,
  layoutsOperarSummaryPanelStandaloneClass,
  layoutsOperarToolboxDemoShellClass,
  layoutsOperarToolboxRowClass,
  layoutsOperarWireframeCatalogCanvasClass,
  layoutsOperarWireframeCatalogSidebarClass,
  layoutsOperarWireframeCatalogToolbarClass,
  layoutsOperarWireframeSummaryPanelClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import {
  getLayoutsOperarScreenComponentsByLayer,
  LAYOUTS_OPERAR_SCREEN_COMPONENTS,
} from "@/app/library/layouts/layoutsOperarScreenComponents"
import {
  getLayoutsOperarGridCssVariables,
  getLayoutsOperarWireframeZoneLabel,
  getLayoutsOperarWireframeSurfaceToken,
  getLayoutsOperarWireframeZoneStyle,
  layoutsOperarTicketProposalActionsClass,
  LAYOUTS_OPERAR_ANATOMY,
  type LayoutsOperarWireframeZone,
} from "@/app/library/layouts/layoutsOperarHardcodedSpec"
import {
  LayoutsOperarTicketDemoShell,
  LayoutsOperarTicketProposalPanel,
  LayoutsOperarTicketProposalsDemo,
} from "@/app/library/layouts/LayoutsOperarTicketProposalPrimitives"
import { LAYOUTS_OPERAR_DEFAULT_TICKET_PROPOSAL } from "@/app/library/layouts/rootsyLayoutsOperarSystem"
import { LayoutsOperarCatalogRailProposal } from "@/app/library/layouts/LayoutsOperarCatalogRailProposalPrimitives"
import {
  LayoutsOperarProductCardDemoCanvas,
  LayoutsOperarProductCardProposalGrid,
  LayoutsOperarProductCardProposalList,
  LAYOUTS_OPERAR_DEMO_ARTICLE,
  LAYOUTS_OPERAR_DEMO_ARTICLE_NO_IMAGE,
  LAYOUTS_OPERAR_DEMO_ARTICLE_OFFER,
  type LayoutsOperarDemoProduct,
} from "@/app/library/layouts/LayoutsOperarProductCardProposalPrimitives"
import {
  LayoutsOperarToolboxProposalGridCell,
  LayoutsOperarToolboxProposalStrip,
} from "@/app/library/layouts/LayoutsOperarToolboxProposalPrimitives"
import { LAYOUTS_OPERAR_DEFAULT_TOOLBOX_PROPOSAL } from "@/app/library/layouts/rootsyLayoutsOperarSystem"
import { LayoutsModuleShellWithContent } from "@/app/library/layouts/LayoutsModuleDocPrimitives"
import { ROOTSY_LAYOUTS_MODULE_HEADER } from "@/app/library/layouts/rootsyLayoutsModuleSystem"
import { OperarTicketEmptyState } from "@/components/layouts-module/OperarTicketEmptyState"
import { SaleOperationActionsBar } from "@/components/sale-operation/SaleOperationActionsBar"
import { DataWorkspaceHeaderTitle } from "@/components/layouts/DataWorkspaceHeaderTitle"
import {
  dataWorkspaceHeaderChromeButtonClass,
  dataWorkspaceHeaderDividerClass,
  dataWorkspaceHeaderPopRingClass,
  dataWorkspaceHeaderRoleLabelClass,
} from "@/components/layouts/dataWorkspaceHeaderStyles"
import { SaleCatalogToolbar } from "@/components/sale-operation/SaleCatalogToolbar"
import { SALE_CATALOG_DEFAULT_PRICE_LIST_ID } from "@/components/sale-operation/saleCatalogPriceLists"
import { Avatar } from "@/components/Avatar"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  Maximize2,
  PanelLeftOpen,
  Store,
} from "lucide-react"
import { useState } from "react"

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

const DEMO_PRODUCTS: LayoutsOperarDemoProduct[] = [
  LAYOUTS_OPERAR_DEMO_ARTICLE,
  LAYOUTS_OPERAR_DEMO_ARTICLE_OFFER,
  {
    id: "leche",
    name: "Leche entera 1 L",
    description: "Clásica · fraccionada del día",
    price: 1850,
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=300&fit=crop",
  },
  {
    id: "jamon",
    name: "Jamón cocido",
    description: "Feteado · bandeja 200 g",
    price: 5600,
    image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=300&fit=crop",
  },
  LAYOUTS_OPERAR_DEMO_ARTICLE_NO_IMAGE,
  {
    id: "arroz",
    name: "Arroz largo fino",
    description: "Premium · bolsa 1 kg",
    price: 2100,
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop",
  },
]

function useOperationsHeaderChromeButtonClass() {
  return dataWorkspaceHeaderChromeButtonClass(HEADER_VARIANT)
}

function LayoutHeightBadge({ label, onDark = false }: { label: string; onDark?: boolean }) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute right-2 top-1.5 z-20 rounded-md px-1.5 py-0.5 font-mono text-[10px] ring-1",
        onDark
          ? "bg-[color-mix(in_srgb,var(--rootsy-sombra-800)_88%,#ffffff_12%)] text-[color-mix(in_srgb,var(--rootsy-savia-300)_72%,#ffffff)] ring-[color-mix(in_srgb,var(--rootsy-sombra-border)_55%,transparent)]"
          : "bg-background/95 text-[var(--rootsy-bruma-500)] ring-border/60",
      )}
    >
      {label}
    </span>
  )
}

function LayoutsOperarWireframeZoneLabel({
  zone,
  mode,
  measure,
  onDark = false,
}: {
  zone: LayoutsOperarWireframeZone
  mode: "fijo" | "fluido" | "min"
  measure: string
  onDark?: boolean
}) {
  const token = getLayoutsOperarWireframeSurfaceToken(zone)

  return (
    <span
      className={cn(
        "pointer-events-none absolute inset-0 flex items-center justify-center px-2 text-center font-mono text-[10px] leading-snug",
        onDark
          ? "text-[color-mix(in_srgb,var(--rootsy-sombra-300)_72%,transparent)]"
          : "text-[color-mix(in_srgb,var(--rootsy-bruma-500)_82%,transparent)]",
      )}
    >
      {getLayoutsOperarWireframeZoneLabel(token, mode, measure)}
    </span>
  )
}

function LayoutsOperarHeaderChromeButtons() {
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

function LayoutsOperarHeaderPopProfile() {
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

function LayoutsOperarHeaderUserProfile() {
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
      <Avatar
        imageUrl={DEMO_USER_AVATAR}
        initials={DEMO_USER_INITIALS}
        size="lg"
        isOnline
      />
    </>
  )
}

function LayoutsOperarHeaderLeftZone() {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <LayoutsOperarHeaderChromeButtons />
      <div className={cn("h-6 w-px", dataWorkspaceHeaderDividerClass(HEADER_VARIANT))} aria-hidden />
      <LayoutsOperarHeaderPopProfile />
    </div>
  )
}

function LayoutsOperarHeaderRightZone() {
  return (
    <div className="flex min-w-0 items-center justify-end gap-3">
      <LayoutsOperarHeaderUserProfile />
    </div>
  )
}

function LayoutsOperarHeaderDemo({
  composed = false,
  wireframe = false,
}: {
  composed?: boolean
  wireframe?: boolean
}) {
  return (
    <div
      className={cn(
        layoutsOperarHeaderScopeClass,
        composed ? "h-17 shrink-0" : wireframe ? "relative shrink-0" : "overflow-hidden rounded-xl",
        !composed && !wireframe && "h-17",
      )}
    >
      {wireframe ? <LayoutHeightBadge label="h-17 · sombra-950→900" onDark /> : null}
      <div className={layoutsOperarHeaderGridClass}>
        {wireframe ? (
          <>
            <div className="min-w-0" />
            <div className="min-w-0" />
            <div className="min-w-0" />
          </>
        ) : (
          <>
            <LayoutsOperarHeaderLeftZone />
            <DataWorkspaceHeaderTitle title={DEMO_PAGE_TITLE} headerVariant={HEADER_VARIANT} />
            <LayoutsOperarHeaderRightZone />
          </>
        )}
      </div>
    </div>
  )
}

function LayoutsOperarCatalogArticleCanvas({ children }: { children: React.ReactNode }) {
  return <LayoutsOperarProductCardDemoCanvas>{children}</LayoutsOperarProductCardDemoCanvas>
}

function LayoutsOperarProductCatalog() {
  return (
    <div className={layoutsOperarCatalogCanvasScrollClass}>
      <div className={layoutsOperarCatalogGridClass} style={layoutsOperarCatalogGridStyle}>
        {DEMO_PRODUCTS.map((product) => (
          <LayoutsOperarProductCardProposalGrid key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}

function LayoutsOperarCatalogToolbar() {
  const [modoVista, setModoVista] = useState<"grid" | "lista">("grid")
  const [cantidadIngreso, setCantidadIngreso] = useState(1)
  const [priceListId, setPriceListId] = useState(SALE_CATALOG_DEFAULT_PRICE_LIST_ID)

  return (
    <SaleCatalogToolbar
      variant="operar"
      demo
      modoVista={modoVista}
      onModoVistaChange={setModoVista}
      busqueda=""
      onBusquedaChange={() => {}}
      cantidadIngreso={cantidadIngreso}
      onCantidadIngresoChange={setCantidadIngreso}
      priceListId={priceListId}
      onPriceListChange={setPriceListId}
    />
  )
}

function LayoutsOperarWireframeToolboxZone({
  measureBadge,
}: {
  measureBadge?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        layoutsOperarToolboxRowClass,
        "relative min-h-[var(--layouts-operar-toolbox-min-h)] sm:min-h-[var(--layouts-operar-toolbox-min-h-sm)]",
      )}
      style={getLayoutsOperarWireframeZoneStyle("toolbox")}
    >
      {measureBadge}
    </div>
  )
}

function LayoutsOperarCatalogColumn({
  wireframe = false,
  composed = false,
  inMainGrid = false,
}: {
  wireframe?: boolean
  composed?: boolean
  inMainGrid?: boolean
}) {
  return (
    <div className={inMainGrid ? layoutsOperarCatalogColumnClass : layoutsOperarCatalogColumnClass}>
      <aside
        className={cn(layoutsOperarCatalogSidebarClass, layoutsOperarCatalogSidebarOpenClass, wireframe && "relative")}
        aria-label="Filtros del catálogo"
      >
        {wireframe ? (
          <LayoutHeightBadge label={`${LAYOUTS_OPERAR_CATALOG_SIDEBAR_WIDTH_PX}px · library-sidebar`} onDark />
        ) : composed ? (
          <LayoutsOperarCatalogRailProposal />
        ) : null}
      </aside>
      <section className={cn(layoutsOperarCatalogCanvasClass, wireframe && "relative")}>
        {composed ? <LayoutsOperarCatalogToolbar /> : null}
        {wireframe ? (
          <LayoutHeightBadge label="canvas · sombra-800 · scroll" onDark />
        ) : composed ? (
          <LayoutsOperarProductCatalog />
        ) : null}
      </section>
    </div>
  )
}

function LayoutsOperarSummaryEmptyOrder() {
  return <OperarTicketEmptyState kind="order" />
}

function LayoutsOperarAnatomyScope({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className} style={getLayoutsOperarGridCssVariables()}>
      {children}
    </div>
  )
}

function LayoutsOperarSummaryPanel({
  wireframe = false,
  composed = false,
  standalone = false,
}: {
  wireframe?: boolean
  composed?: boolean
  standalone?: boolean
}) {
  const showDraftCart = wireframe || composed

  return (
    <aside
      className={standalone ? layoutsOperarSummaryPanelStandaloneClass : layoutsOperarSummaryPanelClass}
      aria-label="Carrito de la venta"
    >
      {wireframe ? (
        <LayoutHeightBadge label={`${LAYOUTS_OPERAR_SUMMARY_PANEL_WIDTH_PX}px · bruma-50`} />
      ) : null}
      {showDraftCart ? (
        <>
          <div className={cn(layoutsOperarSummaryCartRowClass, "min-h-0 flex-1")}>
            <LayoutsOperarSummaryEmptyOrder />
          </div>
          <div className={layoutsOperarTicketProposalActionsClass(LAYOUTS_OPERAR_DEFAULT_TICKET_PROPOSAL)}>
            <SaleOperationActionsBar
              variant="operar"
              onDiscard={() => {}}
              onConfirm={() => {}}
            />
          </div>
          <div className={layoutsOperarSummaryTotalRowClass}>
            <span className={layoutsOperarSummaryTotalsLabelClass}>Total a cobrar</span>
            <span className={layoutsOperarSummaryTotalsAmountClass}>$ 0,00</span>
          </div>
        </>
      ) : null}
    </aside>
  )
}

export function LayoutsOperarBody({
  wireframe = false,
  composed = false,
}: {
  wireframe?: boolean
  composed?: boolean
}) {
  return (
    <div
      className={cn(
        "rootsy-theme-pos",
        layoutsOperarBodyScopeClass,
        layoutsOperarBodyShellClass,
        wireframe && layoutsOperarBodyWireframeClass,
      )}
      style={getLayoutsOperarGridCssVariables()}
    >
      <main className={cn(layoutsOperarBodyMainGridClass, "relative z-10 h-full min-h-0")}>
        <div className={layoutsOperarOperationColumnClass}>
          <div className={layoutsOperarCatalogRowClass}>
            <LayoutsOperarCatalogColumn wireframe={wireframe} composed={composed} inMainGrid />
          </div>
          {wireframe ? (
            <LayoutsOperarWireframeToolboxZone
              measureBadge={
                <LayoutHeightBadge
                  label={`toolbox · min ${LAYOUTS_OPERAR_ANATOMY.toolboxRowMinHeightPx}px`}
                  onDark
                />
              }
            />
          ) : composed ? (
            <LayoutsOperarToolboxProposalGridCell
              proposalId={LAYOUTS_OPERAR_DEFAULT_TOOLBOX_PROPOSAL}
            />
          ) : null}
        </div>
        {wireframe ? (
          <LayoutsOperarSummaryPanel wireframe={wireframe} composed={composed} />
        ) : composed ? (
          <LayoutsOperarTicketProposalPanel
            proposalId={LAYOUTS_OPERAR_DEFAULT_TICKET_PROPOSAL}
            placement="grid"
          />
        ) : null}
      </main>
    </div>
  )
}

function LayoutsOperarFrame({
  children,
  heightClass = "h-[28rem]",
  maxWidthClass = "max-w-5xl",
}: {
  children: React.ReactNode
  heightClass?: string
  maxWidthClass?: string
}) {
  return (
    <div
      className={cn(
        "rootsy-theme-pos rootsy-radius-system mx-auto flex flex-col overflow-hidden rounded-2xl border border-[var(--rootsy-bruma-200)]",
        maxWidthClass,
        "shadow-[0_24px_48px_-28px_rgba(41,37,36,0.38)] ring-1 ring-black/[0.04]",
        heightClass,
      )}
    >
      {children}
    </div>
  )
}

export function LayoutsOperarFullPageDraft({ composed = false }: { composed?: boolean } = {}) {
  if (composed) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <LayoutsOperarHeaderDemo composed />
        <LayoutsOperarBody composed />
      </div>
    )
  }

  return (
    <LayoutsOperarFrame heightClass="h-[32rem]">
      <LayoutsOperarHeaderDemo composed />
      <LayoutsOperarBody composed />
    </LayoutsOperarFrame>
  )
}

function LayoutsOperarContentGridWireframeBody() {
  const a = LAYOUTS_OPERAR_ANATOMY
  const headerPx = ROOTSY_LAYOUTS_MODULE_HEADER.heightPx
  const zoneStyle = getLayoutsOperarWireframeZoneStyle

  return (
    <div
      className={cn(
        "rootsy-theme-pos relative flex min-h-0 flex-1 flex-col overflow-hidden",
        layoutsOperarBodyWireframeClass,
      )}
      style={{
        ...zoneStyle("shell"),
        ...getLayoutsOperarGridCssVariables(),
      }}
    >
      <div
        className="relative shrink-0"
        style={{
          height: headerPx,
          ...zoneStyle("header"),
        }}
      >
        <LayoutsOperarWireframeZoneLabel
          zone="header"
          mode="fijo"
          measure={`${headerPx}px`}
          onDark
        />
      </div>

      <main className={cn(layoutsOperarBodyMainGridClass, "relative z-10 h-full min-h-0")}>
        <div className={layoutsOperarOperationColumnClass}>
          <div className={layoutsOperarCatalogRowClass}>
            <div className={layoutsOperarCatalogColumnClass}>
              <div
                className={cn(layoutsOperarWireframeCatalogSidebarClass, "relative")}
                style={zoneStyle("sidebar")}
              >
                <LayoutsOperarWireframeZoneLabel
                  zone="sidebar"
                  mode="fijo"
                  measure={`${a.catalogSidebarWidthPx}px`}
                  onDark
                />
              </div>
              <section className={layoutsOperarWireframeCatalogCanvasClass}>
                <div
                  className={layoutsOperarWireframeCatalogToolbarClass}
                  style={zoneStyle("toolbar")}
                >
                  <LayoutsOperarWireframeZoneLabel
                    zone="toolbar"
                    mode="fijo"
                    measure={`${a.catalogToolbarHeightPx}px`}
                    onDark
                  />
                </div>
                <div className="relative min-h-0" style={zoneStyle("canvas")}>
                  <LayoutsOperarWireframeZoneLabel
                    zone="canvas"
                    mode="fluido"
                    measure="1fr"
                    onDark
                  />
                </div>
              </section>
            </div>
          </div>

          <LayoutsOperarWireframeToolboxZone
            measureBadge={
              <LayoutsOperarWireframeZoneLabel
                zone="toolbox"
                mode="min"
                measure={`${a.toolboxRowMinHeightPx}px`}
                onDark
              />
            }
          />
        </div>

        <aside className={cn(layoutsOperarWireframeSummaryPanelClass, "relative")}>
          <div className="relative" style={zoneStyle("ticket-header")}>
            <LayoutsOperarWireframeZoneLabel
              zone="ticket-header"
              mode="fijo"
              measure={`${a.ticketHeaderHeightPx}px`}
            />
          </div>
          <div className="relative" style={zoneStyle("ticket-cart")}>
            <LayoutsOperarWireframeZoneLabel
              zone="ticket-cart"
              mode="fluido"
              measure="1fr"
            />
          </div>
          <div className="relative" style={zoneStyle("ticket-actions")}>
            <LayoutsOperarWireframeZoneLabel
              zone="ticket-actions"
              mode="fijo"
              measure={`${a.ticketActionsHeightPx}px`}
            />
          </div>
          <div className="relative" style={zoneStyle("ticket-total")}>
            <LayoutsOperarWireframeZoneLabel
              zone="ticket-total"
              mode="min"
              measure={`${a.ticketTotalMinHeightPx}px`}
              onDark
            />
          </div>
        </aside>
      </main>
    </div>
  )
}

export function LayoutsOperarContentGridWireframeDemo() {
  return (
    <div
      className="mx-auto flex max-w-5xl flex-col library-doc-table-shell overflow-hidden rounded-2xl"
      style={{ height: "36rem" }}
    >
      <LayoutsOperarContentGridWireframeBody />
    </div>
  )
}

export function LayoutsOperarLayoutGridDemo({ contentOnly = false }: { contentOnly?: boolean } = {}) {
  if (contentOnly) {
    return (
      <div className="h-[36rem] library-doc-table-shell overflow-hidden rounded-2xl">
        <LayoutsOperarContentGridWireframeBody />
      </div>
    )
  }

  return (
    <div
      className="mx-auto flex max-w-5xl flex-col overflow-hidden rounded-2xl border border-[var(--rootsy-bruma-200)] "
      style={{ height: "40rem" }}
    >
      <LayoutsOperarContentGridWireframeBody />
    </div>
  )
}

export function LayoutsOperarOverviewIntro() {
  return (
    <div className="rounded-2xl border border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-white)] p-6 ">
      <div className="flex items-start gap-3">
        <span className="inline-flex size-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--rootsy-savia-600)_10%,transparent)] text-[var(--rootsy-savia-600)]">
          <Store className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 space-y-2">
          <h2 className="text-lg font-semibold tracking-tight text-[var(--rootsy-bruma-900)]">
            Layout operar · Vender
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--rootsy-bruma-500)]">
            Referencia de producción en{" "}
            <code className="text-[11px]">sale/page.tsx</code> — split POS sombra + bruma. En la
            lib: pila <code className="text-[11px]">ROOTSY_SURFACE_STACKS.pos</code> y tema{" "}
            <code className="text-[11px]">.rootsy-theme-pos</code> (
            <code className="text-[11px]">colors-new</code>). Mismo patrón en Comprar, Mesas y
            Mostrador.
          </p>
        </div>
      </div>
    </div>
  )
}

export function LayoutsOperarDocSubsection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-[var(--rootsy-bruma-900)]">{title}</h4>
      {children}
    </div>
  )
}

export function LayoutsOperarModulePreviewDemo() {
  return (
    <LayoutsModuleShellWithContent height="26rem" contentLabel="layout.module.content · operar">
      <LayoutsOperarFullPageDraft composed />
    </LayoutsModuleShellWithContent>
  )
}

export function LayoutsOperarCatalogSectionDemo() {
  return (
    <div className="space-y-6">
      <LayoutsOperarDocSubsection title="Catálogo · sidebar + toolbar + cards">
        <LayoutsOperarFrame heightClass="h-[24rem]" maxWidthClass="max-w-5xl">
          <LayoutsOperarAnatomyScope
          className={cn("rootsy-theme-pos rootsy-radius-system", layoutsOperarCatalogSectionShellClass)}
        >
            <div className={cn(layoutsOperarCatalogColumnClass, "min-h-0 flex-1")}>
              <aside className={cn(layoutsOperarCatalogSidebarClass, layoutsOperarCatalogSidebarOpenClass)}>
                <LayoutsOperarCatalogRailProposal />
              </aside>
              <section className={layoutsOperarCatalogCanvasClass}>
                <LayoutsOperarCatalogToolbar />
                <LayoutsOperarProductCatalog />
              </section>
            </div>
          </LayoutsOperarAnatomyScope>
        </LayoutsOperarFrame>
      </LayoutsOperarDocSubsection>

      <LayoutsOperarDocSubsection title="2.1 · Artículo">
        <div className="space-y-6">
          <LayoutsOperarDocSubsection title="2.1.a · Grilla · tarjeta vertical">
            <p className="text-sm text-[var(--rootsy-bruma-500)]">
              Vista grilla (<code className="text-[11px]">modoVista grid</code>) — mosaico 256×120+ cuerpo.
            </p>
            <LayoutsOperarCatalogArticleCanvas>
              <div className="max-w-xs">
                <LayoutsOperarProductCardProposalGrid product={LAYOUTS_OPERAR_DEMO_ARTICLE} />
              </div>
            </LayoutsOperarCatalogArticleCanvas>
          </LayoutsOperarDocSubsection>

          <LayoutsOperarDocSubsection title="2.1.b · Lista · fila horizontal">
            <p className="text-sm text-[var(--rootsy-bruma-500)]">
              Vista lista (<code className="text-[11px]">modoVista lista</code>) — fila min 80px · imagen 80px.
            </p>
            <LayoutsOperarCatalogArticleCanvas>
              <LayoutsOperarProductCardProposalList product={LAYOUTS_OPERAR_DEMO_ARTICLE} />
            </LayoutsOperarCatalogArticleCanvas>
          </LayoutsOperarDocSubsection>

          <LayoutsOperarDocSubsection title="Con descuento">
            <p className="text-sm text-[var(--rootsy-bruma-500)]">
                Mismos formatos con overlay de oferta (<code className="text-[11px]">SaleCatalogProductOfferOverlay</code>).
            </p>
            <div className="grid gap-4 lg:grid-cols-2">
              <LayoutsOperarCatalogArticleCanvas>
                <div className="max-w-xs">
                  <LayoutsOperarProductCardProposalGrid product={LAYOUTS_OPERAR_DEMO_ARTICLE_OFFER} />
                </div>
              </LayoutsOperarCatalogArticleCanvas>
              <LayoutsOperarCatalogArticleCanvas>
                <LayoutsOperarProductCardProposalList product={LAYOUTS_OPERAR_DEMO_ARTICLE_OFFER} />
              </LayoutsOperarCatalogArticleCanvas>
            </div>
          </LayoutsOperarDocSubsection>

          <LayoutsOperarDocSubsection title="Sin imagen">
            <p className="text-sm text-[var(--rootsy-bruma-500)]">
              Superficie foto ausente — luz de estudio, pools de color y grano. Sin icono ni copy en
              el media; el nombre del producto va en el cuerpo de la tarjeta.
            </p>
            <div className="grid gap-4 lg:grid-cols-2">
              <LayoutsOperarCatalogArticleCanvas>
                <div className="max-w-xs">
                  <LayoutsOperarProductCardProposalGrid product={LAYOUTS_OPERAR_DEMO_ARTICLE_NO_IMAGE} />
                </div>
              </LayoutsOperarCatalogArticleCanvas>
              <LayoutsOperarCatalogArticleCanvas>
                <LayoutsOperarProductCardProposalList product={LAYOUTS_OPERAR_DEMO_ARTICLE_NO_IMAGE} />
              </LayoutsOperarCatalogArticleCanvas>
            </div>
          </LayoutsOperarDocSubsection>
        </div>
      </LayoutsOperarDocSubsection>

      <LayoutsOperarComponentsTable
        rows={getLayoutsOperarScreenComponentsByLayer("Catálogo")}
        caption="Inventario · catálogo"
      />
    </div>
  )
}

export function LayoutsOperarToolboxSectionDemo() {
  return (
    <div className="space-y-6">
      <LayoutsOperarDocSubsection title="Toolbox · Cliente · Comprobante · Pago · Descuento">
        <LayoutsOperarAnatomyScope
        className={cn(
          "rootsy-theme-pos rootsy-radius-system max-w-5xl rounded-2xl border border-[var(--rootsy-bruma-200)]",
          layoutsOperarToolboxDemoShellClass,
        )}
      >
          <LayoutsOperarToolboxProposalStrip
            proposalId={LAYOUTS_OPERAR_DEFAULT_TOOLBOX_PROPOSAL}
            canvasLabel="canvas · sombra-800 · referencia dosel denso"
            measureBadge={
              <LayoutHeightBadge
                label={`${LAYOUTS_OPERAR_ANATOMY.toolboxRowMinHeightPx}px · dosel continuo`}
                onDark
              />
            }
          />
        </LayoutsOperarAnatomyScope>
      </LayoutsOperarDocSubsection>

      <LayoutsOperarComponentsTable
        rows={getLayoutsOperarScreenComponentsByLayer("Toolbox")}
        caption="Inventario · toolbox"
      />
    </div>
  )
}

export function LayoutsOperarTicketSectionDemo() {
  return (
    <div className="space-y-6">
      <LayoutsOperarDocSubsection title="Ticket · pedido + acciones + total">
        <p className="text-sm text-[var(--rootsy-bruma-500)]">
          Ticket compuesto canónico (<code className="text-[11px]">bruma-savia</code>) — ítems sin
          descuento, con descuento de catálogo, promo combo y desglose de totales como en Vender.
        </p>
        <LayoutsOperarTicketDemoShell heightClass="h-[32rem]">
          <LayoutsOperarTicketProposalPanel proposalId={LAYOUTS_OPERAR_DEFAULT_TICKET_PROPOSAL} />
        </LayoutsOperarTicketDemoShell>
      </LayoutsOperarDocSubsection>

      <LayoutsOperarDocSubsection title="4.1 · Propuestas">
        <p className="text-sm text-[var(--rootsy-bruma-500)]">
          Tres variantes oficiales sobre bruma + savia — mismos ítems demo y desglose de totales.
        </p>
        <LayoutsOperarTicketProposalsDemo />
      </LayoutsOperarDocSubsection>

      <LayoutsOperarComponentsTable
        rows={getLayoutsOperarScreenComponentsByLayer("Ticket")}
        caption="Inventario · ticket"
      />
    </div>
  )
}

export function LayoutsOperarComponentsTable({
  rows = LAYOUTS_OPERAR_SCREEN_COMPONENTS,
  caption,
}: {
  rows?: typeof LAYOUTS_OPERAR_SCREEN_COMPONENTS
  caption?: string
}) {
  return (
    <div className="space-y-2">
      {caption ? (
        <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--rootsy-bruma-500)]">
          {caption}
        </p>
      ) : null}
      <div className="library-doc-table-shell overflow-x-auto rounded-2xl">
        <table className="w-full min-w-180 text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-bruma-50)]">
              <th className="px-4 py-3 font-semibold">Capa</th>
              <th className="px-4 py-3 font-semibold">Componente</th>
              <th className="px-4 py-3 font-semibold">Token</th>
              <th className="px-4 py-3 font-semibold">Fuente</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.layer}-${row.component}`} className="border-b border-[var(--rootsy-bruma-200)] last:border-0">
                <td className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--rootsy-bruma-500)]">
                  {row.layer}
                </td>
                <td className="px-4 py-3">{row.component}</td>
                <td className="px-4 py-3 font-mono text-[11px] text-[var(--rootsy-savia-600)]">{row.token}</td>
                <td className="px-4 py-3 font-mono text-[10px] text-[var(--rootsy-bruma-500)]">{row.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
