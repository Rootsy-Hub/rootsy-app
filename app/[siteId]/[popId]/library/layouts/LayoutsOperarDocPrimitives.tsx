"use client"

import "@/app/[siteId]/[popId]/library/color/rootsyNaturePalette.css"
import "@/app/[siteId]/[popId]/library/radius/rootsyRadiusSystem.css"
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
  layoutsOperarCatalogGridClass,
  layoutsOperarCatalogRailItemClass,
  layoutsOperarCatalogRailItemDiscountSelectedClass,
  layoutsOperarCatalogRailItemPromoSelectedClass,
  layoutsOperarCatalogRailItemSelectedClass,
  layoutsOperarCatalogRailItemWithIconClass,
  layoutsOperarCatalogRailListClass,
  layoutsOperarCatalogRailListItemClass,
  layoutsOperarCatalogRailNavClass,
  layoutsOperarCatalogRailSectionLabelClass,
  layoutsOperarCatalogSidebarClass,
  layoutsOperarCatalogSidebarOpenClass,
  layoutsOperarCatalogSectionShellClass,
  layoutsOperarCatalogArticleCanvasClass,
  layoutsOperarCatalogToolbarClass,
  layoutsOperarHeaderGridClass,
  layoutsOperarHeaderScopeClass,
  layoutsOperarProductCardAddClass,
  layoutsOperarProductCardClass,
  layoutsOperarProductCardGridBodyClass,
  layoutsOperarProductCardListBodyClass,
  layoutsOperarProductCardListClass,
  layoutsOperarProductCardListMediaClass,
  layoutsOperarProductCardDescClass,
  layoutsOperarProductCardMediaClass,
  layoutsOperarProductCardMediaPlaceholderClass,
  layoutsOperarProductCardMediaPlaceholderIconClass,
  layoutsOperarProductCardMediaPlaceholderLabelClass,
  layoutsOperarProductCardOfferClass,
  layoutsOperarProductCardPriceClass,
  layoutsOperarProductCardTitleClass,
  layoutsOperarSummaryCartHeadingClass,
  layoutsOperarSummaryCartMetaClass,
  layoutsOperarSummaryCartRowClass,
  layoutsOperarSummaryActionsRowClass,
  layoutsOperarSummaryHeaderRowClass,
  layoutsOperarSummaryTotalRowClass,
  layoutsOperarSummaryEmptyIconWrapClass,
  layoutsOperarSummaryEmptyStateClass,
  layoutsOperarSummaryEmptyStateContentClass,
  layoutsOperarSummaryEmptyTitleClass,
  layoutsOperarSummaryPanelClass,
  layoutsOperarSummaryPanelStandaloneClass,
  layoutsOperarToolboxBandClass,
  layoutsOperarToolboxBarClass,
  layoutsOperarToolboxIconWrapClass,
  layoutsOperarToolboxRowClass,
  layoutsOperarToolboxSlotClass,
  layoutsOperarWireframeCatalogCanvasClass,
  layoutsOperarWireframeCatalogSidebarClass,
  layoutsOperarWireframeCatalogToolbarClass,
  layoutsOperarWireframeSummaryPanelClass,
} from "@/app/[siteId]/[popId]/library/layouts/layoutsOperarStyles"
import {
  getLayoutsOperarScreenComponentsByLayer,
  LAYOUTS_OPERAR_SCREEN_COMPONENTS,
} from "@/app/[siteId]/[popId]/library/layouts/layoutsOperarScreenComponents"
import {
  getLayoutsOperarGridCssVariables,
  getLayoutsOperarWireframeZoneLabel,
  getLayoutsOperarWireframeSurfaceToken,
  getLayoutsOperarWireframeZoneStyle,
  type LayoutsOperarWireframeZone,
  LAYOUTS_OPERAR_ANATOMY,
} from "@/app/[siteId]/[popId]/library/layouts/layoutsOperarHardcodedSpec"
import { LayoutsModuleShellWithContent } from "@/app/[siteId]/[popId]/library/layouts/LayoutsModuleDocPrimitives"
import { ROOTSY_LAYOUTS_MODULE_HEADER } from "@/app/[siteId]/[popId]/library/layouts/rootsyLayoutsModuleSystem"
import { DataWorkspaceHeaderTitle } from "@/components/layouts/DataWorkspaceHeaderTitle"
import { SaleCatalogProductOfferOverlay } from "@/components/sale-operation/SaleCatalogProductOfferOverlay"
import {
  dataWorkspaceHeaderChromeButtonClass,
  dataWorkspaceHeaderDividerClass,
  dataWorkspaceHeaderPopRingClass,
  dataWorkspaceHeaderRoleLabelClass,
} from "@/components/layouts/dataWorkspaceHeaderStyles"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  Banknote,
  ImageOff,
  LayoutGrid,
  Maximize2,
  PanelLeftOpen,
  Percent,
  Plus,
  Receipt,
  Store,
  Rows3,
  Search,
  Tag,
  User,
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

const DEMO_CATALOG_CATEGORIES = [
  "Bebidas",
  "Panadería",
  "Lácteos",
  "Fiambres",
  "Verdulería",
  "Almacén",
] as const

type DemoCatalogView =
  | { modo: "categoria"; categoria: string }
  | { modo: "promociones" }
  | { modo: "con_descuento" }

const DEMO_CATALOG_VIEW_DEFAULT: DemoCatalogView = {
  modo: "categoria",
  categoria: "Todos",
}

type DemoToolboxSlot = {
  id: string
  label: string
  value: string
  configured: boolean
  icon: React.ReactNode
}

const DEMO_TOOLBOX_SLOTS: DemoToolboxSlot[] = [
  {
    id: "cliente",
    label: "Cliente",
    value: "Elegir cliente",
    configured: false,
    icon: <User className="size-4" aria-hidden />,
  },
  {
    id: "comprobante",
    label: "Comprobante",
    value: "Ticket",
    configured: true,
    icon: <Receipt className="size-4" aria-hidden />,
  },
  {
    id: "pago",
    label: "Pago",
    value: "Efectivo",
    configured: true,
    icon: <Banknote className="size-4" aria-hidden />,
  },
  {
    id: "descuento",
    label: "Descuento",
    value: "Sin descuento",
    configured: false,
    icon: <Percent className="size-4" aria-hidden />,
  },
]

type DemoProduct = {
  id: string
  name: string
  description: string
  price: number
  image: string
  originalPrice?: number
  offerLabel?: string
}

const DEMO_ARTICLE: DemoProduct = {
  id: "cafe",
  name: "Café en grano",
  description: "Tostado medio · origen Colombia · 250 g",
  price: 4500,
  image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop",
}

const DEMO_ARTICLE_OFFER: DemoProduct = {
  id: "medialunas",
  name: "Medialunas x6",
  description: "Manteca · recién horneadas",
  price: 3200,
  originalPrice: 3760,
  image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop",
  offerLabel: "15% off",
}

const DEMO_PRODUCTS: DemoProduct[] = [
  DEMO_ARTICLE,
  { ...DEMO_ARTICLE_OFFER },
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
  {
    id: "tomate",
    name: "Tomate cherry",
    description: "Bandeja 500 g · huerta local",
    price: 2400,
    image: "https://images.unsplash.com/photo-1592924357888-269s2d88a169?w=400&h=300&fit=crop",
  },
  {
    id: "arroz",
    name: "Arroz largo fino",
    description: "Premium · bolsa 1 kg",
    price: 2100,
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop",
  },
]

function formatDemoPrice(amount: number) {
  return `$ ${amount.toLocaleString("es-AR")},00`
}

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
          : "bg-background/95 text-muted-foreground ring-border/60",
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
      {wireframe ? <LayoutHeightBadge label="h-17 · sombra-950→800" onDark /> : null}
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

function LayoutsOperarCatalogRail() {
  const [vistaCatalogo, setVistaCatalogo] = useState<DemoCatalogView>(DEMO_CATALOG_VIEW_DEFAULT)

  return (
    <nav className={layoutsOperarCatalogRailNavClass} aria-label="Filtros del catálogo">
      <div>
        <p className={layoutsOperarCatalogRailSectionLabelClass}>Categorías</p>
        <ul className={layoutsOperarCatalogRailListClass} role="list">
          <li className={layoutsOperarCatalogRailListItemClass}>
            <button
              type="button"
              aria-pressed={
                vistaCatalogo.modo === "categoria" && vistaCatalogo.categoria === "Todos"
              }
              onClick={() => setVistaCatalogo({ modo: "categoria", categoria: "Todos" })}
              className={cn(
                layoutsOperarCatalogRailItemClass,
                vistaCatalogo.modo === "categoria" &&
                  vistaCatalogo.categoria === "Todos" &&
                  layoutsOperarCatalogRailItemSelectedClass,
              )}
            >
              Todos
            </button>
          </li>
          {DEMO_CATALOG_CATEGORIES.map((name) => {
            const seleccionado =
              vistaCatalogo.modo === "categoria" && vistaCatalogo.categoria === name
            return (
              <li key={name} className={layoutsOperarCatalogRailListItemClass}>
                <button
                  type="button"
                  aria-pressed={seleccionado}
                  onClick={() => setVistaCatalogo({ modo: "categoria", categoria: name })}
                  className={cn(
                    layoutsOperarCatalogRailItemClass,
                    seleccionado && layoutsOperarCatalogRailItemSelectedClass,
                  )}
                >
                  {name}
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <div>
        <p className={layoutsOperarCatalogRailSectionLabelClass}>Listados rápidos</p>
        <ul className={layoutsOperarCatalogRailListClass} role="list">
          <li className={layoutsOperarCatalogRailListItemClass}>
            <button
              type="button"
              aria-pressed={vistaCatalogo.modo === "promociones"}
              onClick={() => setVistaCatalogo({ modo: "promociones" })}
              className={cn(
                layoutsOperarCatalogRailItemClass,
                layoutsOperarCatalogRailItemWithIconClass,
                vistaCatalogo.modo === "promociones" &&
                  layoutsOperarCatalogRailItemPromoSelectedClass,
              )}
            >
              <Tag className="size-4 shrink-0 opacity-80" aria-hidden />
              Promociones
            </button>
          </li>
          <li className={layoutsOperarCatalogRailListItemClass}>
            <button
              type="button"
              aria-pressed={vistaCatalogo.modo === "con_descuento"}
              onClick={() => setVistaCatalogo({ modo: "con_descuento" })}
              className={cn(
                layoutsOperarCatalogRailItemClass,
                layoutsOperarCatalogRailItemWithIconClass,
                vistaCatalogo.modo === "con_descuento" &&
                  layoutsOperarCatalogRailItemDiscountSelectedClass,
              )}
            >
              <Percent className="size-4 shrink-0 opacity-80" aria-hidden />
              Con descuento
            </button>
          </li>
        </ul>
      </div>
    </nav>
  )
}

function LayoutsOperarProductCardMedia({
  product,
  variant,
}: {
  product: DemoProduct
  variant: "grid" | "list"
}) {
  const [imageFailed, setImageFailed] = useState(false)
  const mediaClass =
    variant === "grid" ? layoutsOperarProductCardMediaClass : layoutsOperarProductCardListMediaClass
  const showOfferOverlay = product.originalPrice != null && product.originalPrice > product.price

  return (
    <div className={mediaClass}>
      {imageFailed ? (
        <div className={layoutsOperarProductCardMediaPlaceholderClass} aria-hidden>
          <div className={layoutsOperarProductCardMediaPlaceholderIconClass}>
            <ImageOff className="size-7 stroke-[1.5]" />
          </div>
          <span className={layoutsOperarProductCardMediaPlaceholderLabelClass}>Sin imagen</span>
        </div>
      ) : (
        <img
          src={product.image}
          alt=""
          onError={() => setImageFailed(true)}
          className="size-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
        />
      )}
      {showOfferOverlay ? (
        <SaleCatalogProductOfferOverlay
          precioOriginal={product.originalPrice}
          precio={product.price}
          promo={product.offerLabel}
        />
      ) : product.offerLabel ? (
        <span className={layoutsOperarProductCardOfferClass}>{product.offerLabel}</span>
      ) : null}
      <span className={layoutsOperarProductCardAddClass} aria-hidden>
        <Plus className="size-4" strokeWidth={2.5} aria-hidden />
      </span>
    </div>
  )
}

function LayoutsOperarProductCardBody({ product, variant }: { product: DemoProduct; variant: "grid" | "list" }) {
  return (
    <div
      className={
        variant === "grid" ? layoutsOperarProductCardGridBodyClass : layoutsOperarProductCardListBodyClass
      }
    >
      <div className="min-h-0 self-start">
        <h3 className={layoutsOperarProductCardTitleClass}>{product.name}</h3>
        <p className={layoutsOperarProductCardDescClass}>{product.description}</p>
      </div>
      <div className={variant === "grid" ? "self-end" : "shrink-0"}>
        <span className={layoutsOperarProductCardPriceClass}>{formatDemoPrice(product.price)}</span>
      </div>
    </div>
  )
}

function LayoutsOperarProductCardGrid({ product }: { product: DemoProduct }) {
  return (
    <button type="button" tabIndex={-1} aria-hidden className={layoutsOperarProductCardClass}>
      <LayoutsOperarProductCardMedia product={product} variant="grid" />
      <LayoutsOperarProductCardBody product={product} variant="grid" />
    </button>
  )
}

function LayoutsOperarProductCardList({ product }: { product: DemoProduct }) {
  return (
    <button type="button" tabIndex={-1} aria-hidden className={layoutsOperarProductCardListClass}>
      <LayoutsOperarProductCardMedia product={product} variant="list" />
      <LayoutsOperarProductCardBody product={product} variant="list" />
    </button>
  )
}

function LayoutsOperarCatalogArticleCanvas({ children }: { children: React.ReactNode }) {
  return <div className={layoutsOperarCatalogArticleCanvasClass}>{children}</div>
}

function LayoutsOperarProductCatalog() {
  return (
    <div className={layoutsOperarCatalogCanvasScrollClass}>
      <div className={layoutsOperarCatalogGridClass}>
        {DEMO_PRODUCTS.map((product) => (
          <LayoutsOperarProductCardGrid key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}

function LayoutsOperarCatalogToolbar() {
  return (
    <div className={layoutsOperarCatalogToolbarClass}>
      <div className="relative flex h-10 shrink-0 items-center rounded-lg border border-white/12 bg-black/25 p-1">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-1 left-1 w-10 rounded-md border border-emerald-300/35 bg-emerald-400/15"
        />
        <button type="button" className="relative z-10 flex h-8 w-10 items-center justify-center text-white" tabIndex={-1} aria-hidden>
          <LayoutGrid className="size-4.5" />
        </button>
        <button type="button" className="relative z-10 flex h-8 w-10 items-center justify-center text-white/50" tabIndex={-1} aria-hidden>
          <Rows3 className="size-4.5" />
        </button>
      </div>
      <div className="relative min-w-0 flex-1 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40" />
        <div className="flex h-10 items-center rounded-md border border-white/10 bg-black/20 pl-9 pr-3 text-sm text-white/35">
          Buscar o escanear producto…
        </div>
      </div>
      <span className="shrink-0 text-sm font-medium text-white/60">6 productos mostrados</span>
    </div>
  )
}

function LayoutsOperarToolboxBar() {
  return (
    <div role="toolbar" aria-label="Configuración de la venta" className={layoutsOperarToolboxBarClass}>
      {DEMO_TOOLBOX_SLOTS.map((slot) => (
        <button
          key={slot.id}
          type="button"
          tabIndex={-1}
          aria-hidden
          className={layoutsOperarToolboxSlotClass(slot.configured)}
        >
          <span className={layoutsOperarToolboxIconWrapClass(slot.configured)}>{slot.icon}</span>
          <span className="min-w-0 flex-1">
            <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/45">
              {slot.label}
            </span>
            <span
              className={cn(
                "block truncate text-sm font-semibold leading-snug",
                slot.configured ? "text-foreground" : "text-foreground/55",
              )}
            >
              {slot.value}
            </span>
          </span>
        </button>
      ))}
    </div>
  )
}

function LayoutsOperarCatalogColumn({
  wireframe = false,
  composed = false,
}: {
  wireframe?: boolean
  composed?: boolean
}) {
  return (
    <div className={layoutsOperarCatalogColumnClass}>
      <aside
        className={cn(layoutsOperarCatalogSidebarClass, layoutsOperarCatalogSidebarOpenClass, wireframe && "relative")}
        aria-label="Filtros del catálogo"
      >
        {wireframe ? (
          <LayoutHeightBadge label={`${LAYOUTS_OPERAR_CATALOG_SIDEBAR_WIDTH_PX}px · sombra-700`} onDark />
        ) : composed ? (
          <LayoutsOperarCatalogRail />
        ) : null}
      </aside>
      <section className={cn(layoutsOperarCatalogCanvasClass, wireframe && "relative")}>
        {composed ? <LayoutsOperarCatalogToolbar /> : null}
        {wireframe ? (
          <LayoutHeightBadge label="canvas · sombra-600 · scroll" onDark />
        ) : composed ? (
          <LayoutsOperarProductCatalog />
        ) : null}
      </section>
    </div>
  )
}

function LayoutsOperarSummaryCartHeader() {
  return (
    <>
      <h2 className={layoutsOperarSummaryCartHeadingClass}>Tu pedido</h2>
      <span className={layoutsOperarSummaryCartMetaClass}>0 líneas</span>
    </>
  )
}

function LayoutsOperarSummaryEmptyOrder() {
  return (
    <div className={layoutsOperarSummaryEmptyStateClass}>
      <div className={layoutsOperarSummaryEmptyStateContentClass}>
        <div className={layoutsOperarSummaryEmptyIconWrapClass} aria-hidden>
          <Receipt className="size-7 stroke-[1.75]" />
        </div>
        <p className={layoutsOperarSummaryEmptyTitleClass}>Pedido vacío</p>
      </div>
    </div>
  )
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
        <LayoutHeightBadge label={`${LAYOUTS_OPERAR_SUMMARY_PANEL_WIDTH_PX}px · bruma-100`} />
      ) : null}
      {showDraftCart ? (
        <>
          <div className={layoutsOperarSummaryHeaderRowClass}>
            <LayoutsOperarSummaryCartHeader />
          </div>
          <div className={layoutsOperarSummaryCartRowClass}>
            <LayoutsOperarSummaryEmptyOrder />
          </div>
          <div className={layoutsOperarSummaryActionsRowClass}>
            <div className="flex items-center justify-center text-sm font-semibold text-rose-700">
              Descartar
            </div>
            <div className="flex items-center justify-center bg-emerald-600 text-sm font-semibold text-white">
              Vender
            </div>
          </div>
          <div className={layoutsOperarSummaryTotalRowClass}>
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60">
              Total a cobrar
            </span>
            <span className="text-lg font-semibold tabular-nums">$ 0,00</span>
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
        layoutsOperarBodyScopeClass,
        layoutsOperarBodyShellClass,
        wireframe && layoutsOperarBodyWireframeClass,
      )}
      style={getLayoutsOperarGridCssVariables()}
    >
      <main className={cn(layoutsOperarBodyMainGridClass, "relative z-10 h-full min-h-0")}>
        <LayoutsOperarCatalogColumn wireframe={wireframe} composed={composed} />
        <div
          className={cn(
            layoutsOperarToolboxRowClass,
            layoutsOperarToolboxBandClass,
            wireframe && "relative",
          )}
          style={composed ? getLayoutsOperarWireframeZoneStyle("toolbox") : undefined}
        >
          {wireframe ? (
            <LayoutHeightBadge
              label={`toolbox · min ${LAYOUTS_OPERAR_ANATOMY.toolboxRowMinHeightPx}px`}
              onDark
            />
          ) : composed ? (
            <LayoutsOperarToolboxBar />
          ) : null}
        </div>
        <LayoutsOperarSummaryPanel wireframe={wireframe} composed={composed} />
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
        "rootsy-nature-palette rootsy-radius-system mx-auto flex flex-col overflow-hidden rounded-2xl border border-border/80",
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

  return (
    <div
      className={cn(
        "rootsy-theme-pos relative flex min-h-0 flex-1 flex-col overflow-hidden",
        layoutsOperarBodyWireframeClass,
      )}
      style={{
        ...getLayoutsOperarWireframeZoneStyle("shell"),
        ...getLayoutsOperarGridCssVariables(),
      }}
    >
      <div
        className="relative shrink-0"
        style={{
          height: headerPx,
          ...getLayoutsOperarWireframeZoneStyle("header"),
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
        <div
          className={cn(layoutsOperarCatalogColumnClass, "border-b border-[var(--rootsy-sombra-border)]")}
        >
          <div
            className={cn(layoutsOperarWireframeCatalogSidebarClass, "relative")}
            style={getLayoutsOperarWireframeZoneStyle("sidebar")}
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
              style={getLayoutsOperarWireframeZoneStyle("toolbar")}
            >
              <LayoutsOperarWireframeZoneLabel
                zone="toolbar"
                mode="fijo"
                measure={`${a.catalogToolbarHeightPx}px`}
                onDark
              />
            </div>
            <div
              className="relative min-h-0"
              style={getLayoutsOperarWireframeZoneStyle("canvas")}
            >
              <LayoutsOperarWireframeZoneLabel
                zone="canvas"
                mode="fluido"
                measure="1fr"
                onDark
              />
            </div>
          </section>
        </div>

        <div
          className={cn(layoutsOperarToolboxRowClass, layoutsOperarToolboxBandClass, "relative")}
          style={getLayoutsOperarWireframeZoneStyle("toolbox")}
        >
          <LayoutsOperarWireframeZoneLabel
            zone="toolbox"
            mode="min"
            measure={`${a.toolboxRowMinHeightPx}px`}
            onDark
          />
        </div>

        <aside className={cn(layoutsOperarWireframeSummaryPanelClass, "relative")}>
          <div
            className="relative"
            style={getLayoutsOperarWireframeZoneStyle("ticket-header")}
          >
            <LayoutsOperarWireframeZoneLabel
              zone="ticket-header"
              mode="fijo"
              measure={`${a.ticketHeaderHeightPx}px`}
            />
          </div>
          <div className="relative" style={getLayoutsOperarWireframeZoneStyle("ticket-cart")}>
            <LayoutsOperarWireframeZoneLabel zone="ticket-cart" mode="fluido" measure="1fr" />
          </div>
          <div className="relative" style={getLayoutsOperarWireframeZoneStyle("ticket-actions")}>
            <LayoutsOperarWireframeZoneLabel
              zone="ticket-actions"
              mode="fijo"
              measure={`${a.ticketActionsHeightPx}px`}
            />
          </div>
          <div className="relative" style={getLayoutsOperarWireframeZoneStyle("ticket-total")}>
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
      className="mx-auto flex max-w-5xl flex-col overflow-hidden rounded-2xl border border-border/70"
      style={{ height: "36rem" }}
    >
      <LayoutsOperarContentGridWireframeBody />
    </div>
  )
}

export function LayoutsOperarLayoutGridDemo({ contentOnly = false }: { contentOnly?: boolean } = {}) {
  if (contentOnly) {
    return (
      <div className="h-[36rem] overflow-hidden rounded-2xl border border-border/70">
        <LayoutsOperarContentGridWireframeBody />
      </div>
    )
  }

  return (
    <div
      className="mx-auto flex max-w-5xl flex-col overflow-hidden rounded-2xl border border-border/80 shadow-sm"
      style={{ height: "40rem" }}
    >
      <LayoutsOperarContentGridWireframeBody />
    </div>
  )
}

export function LayoutsOperarOverviewIntro() {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Store className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 space-y-2">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Layout operar · Vender
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
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
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
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
          <LayoutsOperarAnatomyScope className={layoutsOperarCatalogSectionShellClass}>
            <div className={cn(layoutsOperarCatalogColumnClass, "min-h-0 flex-1")}>
              <aside className={cn(layoutsOperarCatalogSidebarClass, layoutsOperarCatalogSidebarOpenClass)}>
                <LayoutsOperarCatalogRail />
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
            <p className="text-sm text-muted-foreground">
              Vista grilla (<code className="text-[11px]">modoVista grid</code>) — mosaico 318×152+ cuerpo.
            </p>
            <LayoutsOperarCatalogArticleCanvas>
              <div className="max-w-xs">
                <LayoutsOperarProductCardGrid product={DEMO_ARTICLE} />
              </div>
            </LayoutsOperarCatalogArticleCanvas>
          </LayoutsOperarDocSubsection>

          <LayoutsOperarDocSubsection title="2.1.b · Lista · fila horizontal">
            <p className="text-sm text-muted-foreground">
              Vista lista (<code className="text-[11px]">modoVista lista</code>) — fila min 152px · imagen 192px.
            </p>
            <LayoutsOperarCatalogArticleCanvas>
              <LayoutsOperarProductCardList product={DEMO_ARTICLE} />
            </LayoutsOperarCatalogArticleCanvas>
          </LayoutsOperarDocSubsection>

          <LayoutsOperarDocSubsection title="Con descuento">
            <p className="text-sm text-muted-foreground">
                Mismos formatos con overlay de oferta (<code className="text-[11px]">SaleCatalogProductOfferOverlay</code>).
            </p>
            <div className="grid gap-4 lg:grid-cols-2">
              <LayoutsOperarCatalogArticleCanvas>
                <div className="max-w-xs">
                  <LayoutsOperarProductCardGrid product={DEMO_ARTICLE_OFFER} />
                </div>
              </LayoutsOperarCatalogArticleCanvas>
              <LayoutsOperarCatalogArticleCanvas>
                <LayoutsOperarProductCardList product={DEMO_ARTICLE_OFFER} />
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
        <LayoutsOperarAnatomyScope className="max-w-5xl overflow-hidden rounded-2xl border border-border/70">
          <div
            className={layoutsOperarToolboxBandClass}
            style={getLayoutsOperarWireframeZoneStyle("toolbox")}
          >
            <LayoutsOperarToolboxBar />
          </div>
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
        <LayoutsOperarAnatomyScope className="mx-auto h-[24rem] w-[var(--layouts-operar-ticket-w)] max-w-[var(--layouts-operar-ticket-w)] overflow-hidden rounded-2xl border border-border/70">
          <LayoutsOperarSummaryPanel composed standalone />
        </LayoutsOperarAnatomyScope>
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
        <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          {caption}
        </p>
      ) : null}
      <div className="overflow-x-auto rounded-2xl border border-border/70">
        <table className="w-full min-w-180 text-left text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-muted/30">
              <th className="px-4 py-3 font-semibold">Capa</th>
              <th className="px-4 py-3 font-semibold">Componente</th>
              <th className="px-4 py-3 font-semibold">Token</th>
              <th className="px-4 py-3 font-semibold">Fuente</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.layer}-${row.component}`} className="border-b border-border/40 last:border-0">
                <td className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {row.layer}
                </td>
                <td className="px-4 py-3">{row.component}</td>
                <td className="px-4 py-3 font-mono text-[11px] text-primary">{row.token}</td>
                <td className="px-4 py-3 font-mono text-[10px] text-muted-foreground">{row.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
