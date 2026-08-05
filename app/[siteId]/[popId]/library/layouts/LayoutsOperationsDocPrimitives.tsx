"use client"

import "@/app/[siteId]/[popId]/library/color/rootsyNaturePalette.css"
import "@/app/[siteId]/[popId]/library/radius/rootsyRadiusSystem.css"
import {
  LAYOUTS_OPERATIONS_CANVAS_RAIL_WIDTH_PX,
  LAYOUTS_OPERATIONS_SUMMARY_PANEL_WIDTH_PX,
  layoutsOperationsBodyColumnsClass,
  layoutsOperationsBodyScopeClass,
  layoutsOperationsBodyShellClass,
  layoutsOperationsBodyWireframeClass,
  layoutsOperationsCatalogCanvasScrollClass,
  layoutsOperationsCatalogGridClass,
  layoutsOperationsCatalogRailItemClass,
  layoutsOperationsCatalogRailItemDiscountSelectedClass,
  layoutsOperationsCatalogRailItemPromoSelectedClass,
  layoutsOperationsCatalogRailItemSelectedClass,
  layoutsOperationsCatalogRailItemWithIconClass,
  layoutsOperationsCatalogRailListClass,
  layoutsOperationsCatalogRailListItemClass,
  layoutsOperationsCatalogRailNavClass,
  layoutsOperationsCatalogRailSectionLabelClass,
  layoutsOperationsHeaderGridClass,
  layoutsOperationsHeaderScopeClass,
  layoutsOperationsMainColumnClass,
  layoutsOperationsMainCanvasClass,
  layoutsOperationsMainCanvasContentClass,
  layoutsOperationsMainCanvasRailClass,
  layoutsOperationsMainFooterClass,
  layoutsOperationsProductCardAddClass,
  layoutsOperationsProductCardBodyClass,
  layoutsOperationsProductCardClass,
  layoutsOperationsProductCardDescClass,
  layoutsOperationsProductCardMediaClass,
  layoutsOperationsProductCardMediaPlaceholderClass,
  layoutsOperationsProductCardMediaPlaceholderIconClass,
  layoutsOperationsProductCardMediaPlaceholderLabelClass,
  layoutsOperationsProductCardOfferClass,
  layoutsOperationsProductCardPriceClass,
  layoutsOperationsProductCardTitleClass,
  layoutsOperationsToolboxBarClass,
  layoutsOperationsToolboxIconWrapClass,
  layoutsOperationsToolboxIconWrapConfiguredClass,
  layoutsOperationsToolboxSlotClass,
  layoutsOperationsToolboxSlotConfiguredClass,
  layoutsOperationsToolboxSlotLabelClass,
  layoutsOperationsToolboxSlotValueClass,
  layoutsOperationsToolboxSlotValueMutedClass,
  layoutsOperationsSummaryContentClass,
  layoutsOperationsSummaryPanelClass,
  layoutsOperationsSummaryTabsRowClass,
  layoutsOperationsSummaryTotalsRowClass,
  layoutsOperationsSummaryTotalsRowEdgeClass,
  layoutsOperationsSummaryTotalsLabelClass,
  layoutsOperationsSummaryTotalsAmountClass,
  layoutsOperationsSummaryCartHeadingClass,
  layoutsOperationsSummaryCartMetaClass,
  layoutsOperationsSummaryEmptyStateClass,
  layoutsOperationsSummaryEmptyStateContentClass,
  layoutsOperationsSummaryEmptyIconWrapClass,
  layoutsOperationsSummaryEmptyTitleClass,
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
import {
  ArrowLeft,
  Banknote,
  ImageOff,
  Maximize2,
  PanelLeftOpen,
  Percent,
  Plus,
  Receipt,
  Store,
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
  offerLabel?: string
}

const DEMO_PRODUCTS: DemoProduct[] = [
  {
    id: "cafe",
    name: "Café en grano",
    description: "Tostado medio · origen Colombia · 250 g",
    price: 4500,
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop",
  },
  {
    id: "medialunas",
    name: "Medialunas x6",
    description: "Manteca · recién horneadas",
    price: 3200,
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop",
    offerLabel: "15% off",
  },
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
          ? "bg-[color-mix(in_srgb,var(--nature-night-800)_88%,#ffffff_12%)] text-[color-mix(in_srgb,var(--nature-canopy-300)_72%,#ffffff)] ring-[color-mix(in_srgb,var(--nature-night-600)_50%,transparent)]"
          : "bg-background/95 text-muted-foreground ring-border/60",
      )}
    >
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
        composed ? "h-17 shrink-0" : wireframe ? "relative shrink-0" : "overflow-hidden rounded-xl",
        !composed && !wireframe && "h-17",
      )}
    >
      {wireframe ? <LayoutHeightBadge label="h-17 · noche 950→800" onDark /> : null}
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

function LayoutsOperationsCatalogRail() {
  const [vistaCatalogo, setVistaCatalogo] = useState<DemoCatalogView>(DEMO_CATALOG_VIEW_DEFAULT)

  return (
    <nav className={layoutsOperationsCatalogRailNavClass} aria-label="Filtros del catálogo">
      <div>
        <p className={layoutsOperationsCatalogRailSectionLabelClass}>Categorías</p>
        <ul className={layoutsOperationsCatalogRailListClass} role="list">
          <li className={layoutsOperationsCatalogRailListItemClass}>
            <button
              type="button"
              aria-pressed={
                vistaCatalogo.modo === "categoria" && vistaCatalogo.categoria === "Todos"
              }
              onClick={() => setVistaCatalogo({ modo: "categoria", categoria: "Todos" })}
              className={cn(
                layoutsOperationsCatalogRailItemClass,
                vistaCatalogo.modo === "categoria" &&
                  vistaCatalogo.categoria === "Todos" &&
                  layoutsOperationsCatalogRailItemSelectedClass,
              )}
            >
              Todos
            </button>
          </li>
          {DEMO_CATALOG_CATEGORIES.map((name) => {
            const seleccionado =
              vistaCatalogo.modo === "categoria" && vistaCatalogo.categoria === name
            return (
              <li key={name} className={layoutsOperationsCatalogRailListItemClass}>
                <button
                  type="button"
                  aria-pressed={seleccionado}
                  onClick={() => setVistaCatalogo({ modo: "categoria", categoria: name })}
                  className={cn(
                    layoutsOperationsCatalogRailItemClass,
                    seleccionado && layoutsOperationsCatalogRailItemSelectedClass,
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
        <p className={layoutsOperationsCatalogRailSectionLabelClass}>Listados rápidos</p>
        <ul className={layoutsOperationsCatalogRailListClass} role="list">
          <li className={layoutsOperationsCatalogRailListItemClass}>
            <button
              type="button"
              aria-pressed={vistaCatalogo.modo === "promociones"}
              onClick={() => setVistaCatalogo({ modo: "promociones" })}
              className={cn(
                layoutsOperationsCatalogRailItemClass,
                layoutsOperationsCatalogRailItemWithIconClass,
                vistaCatalogo.modo === "promociones" &&
                  layoutsOperationsCatalogRailItemPromoSelectedClass,
              )}
            >
              <Tag className="size-4 shrink-0 opacity-80" aria-hidden />
              Promociones
            </button>
          </li>
          <li className={layoutsOperationsCatalogRailListItemClass}>
            <button
              type="button"
              aria-pressed={vistaCatalogo.modo === "con_descuento"}
              onClick={() => setVistaCatalogo({ modo: "con_descuento" })}
              className={cn(
                layoutsOperationsCatalogRailItemClass,
                layoutsOperationsCatalogRailItemWithIconClass,
                vistaCatalogo.modo === "con_descuento" &&
                  layoutsOperationsCatalogRailItemDiscountSelectedClass,
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

function LayoutsOperationsProductCardMedia({
  image,
  offerLabel,
}: {
  image: string
  offerLabel?: string
}) {
  const [imageFailed, setImageFailed] = useState(false)

  return (
    <div className={layoutsOperationsProductCardMediaClass}>
      {imageFailed ? (
        <div className={layoutsOperationsProductCardMediaPlaceholderClass} aria-hidden>
          <div className={layoutsOperationsProductCardMediaPlaceholderIconClass}>
            <ImageOff className="size-7 stroke-[1.5]" />
          </div>
          <span className={layoutsOperationsProductCardMediaPlaceholderLabelClass}>Sin imagen</span>
        </div>
      ) : (
        <img
          src={image}
          alt=""
          onError={() => setImageFailed(true)}
          className="size-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
        />
      )}
      {offerLabel ? (
        <span className={layoutsOperationsProductCardOfferClass}>{offerLabel}</span>
      ) : null}
      <span className={layoutsOperationsProductCardAddClass} aria-hidden>
        <Plus className="size-4" strokeWidth={2.5} aria-hidden />
      </span>
    </div>
  )
}

function LayoutsOperationsProductCatalog() {
  return (
    <div className={layoutsOperationsCatalogCanvasScrollClass}>
      <div className={layoutsOperationsCatalogGridClass}>
        {DEMO_PRODUCTS.map((product) => (
          <button
            key={product.id}
            type="button"
            tabIndex={-1}
            aria-hidden
            className={layoutsOperationsProductCardClass}
          >
            <LayoutsOperationsProductCardMedia
              image={product.image}
              offerLabel={product.offerLabel}
            />
            <div className={layoutsOperationsProductCardBodyClass}>
              <div className="min-h-0">
                <h3 className={layoutsOperationsProductCardTitleClass}>{product.name}</h3>
                <p className={layoutsOperationsProductCardDescClass}>{product.description}</p>
              </div>
              <span className={layoutsOperationsProductCardPriceClass}>
                {formatDemoPrice(product.price)}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function LayoutsOperationsToolboxBar() {
  return (
    <div
      role="toolbar"
      aria-label="Configuración de la venta"
      className={layoutsOperationsToolboxBarClass}
    >
      {DEMO_TOOLBOX_SLOTS.map((slot) => (
        <button
          key={slot.id}
          type="button"
          tabIndex={-1}
          aria-hidden
          className={cn(
            layoutsOperationsToolboxSlotClass,
            slot.configured && layoutsOperationsToolboxSlotConfiguredClass,
          )}
        >
          <span
            className={cn(
              layoutsOperationsToolboxIconWrapClass,
              slot.configured && layoutsOperationsToolboxIconWrapConfiguredClass,
            )}
          >
            {slot.icon}
          </span>
          <span className="min-w-0 flex-1">
            <span className={layoutsOperationsToolboxSlotLabelClass}>{slot.label}</span>
            <span
              className={
                slot.configured
                  ? layoutsOperationsToolboxSlotValueClass
                  : layoutsOperationsToolboxSlotValueMutedClass
              }
            >
              {slot.value}
            </span>
          </span>
        </button>
      ))}
    </div>
  )
}

function LayoutsOperationsMainColumn({
  wireframe = false,
  composed = false,
}: {
  wireframe?: boolean
  composed?: boolean
}) {
  return (
    <div className={layoutsOperationsMainColumnClass}>
      <div className={layoutsOperationsMainCanvasClass}>
        <div
          className={cn(
            layoutsOperationsMainCanvasRailClass,
            composed && "flex min-h-0 flex-col",
            wireframe && "relative",
          )}
        >
          {wireframe ? (
            <LayoutHeightBadge
              label={`${LAYOUTS_OPERATIONS_CANVAS_RAIL_WIDTH_PX}px · noche 950`}
              onDark
            />
          ) : composed ? (
            <LayoutsOperationsCatalogRail />
          ) : null}
        </div>
        <div
          className={cn(
            layoutsOperationsMainCanvasContentClass,
            composed && "flex min-h-0 flex-col",
            wireframe && "relative",
          )}
        >
          {wireframe ? (
            <LayoutHeightBadge label="flex-1 · noche 900" onDark />
          ) : composed ? (
            <LayoutsOperationsProductCatalog />
          ) : null}
        </div>
      </div>
      <div className={cn(layoutsOperationsMainFooterClass, wireframe && "relative")}>
        {wireframe ? (
          <LayoutHeightBadge label="h-20 · noche 800" onDark />
        ) : composed ? (
          <LayoutsOperationsToolboxBar />
        ) : null}
      </div>
    </div>
  )
}

function LayoutsOperationsSummaryCartHeader() {
  return (
    <>
      <h2 className={layoutsOperationsSummaryCartHeadingClass}>Tu pedido</h2>
      <span className={layoutsOperationsSummaryCartMetaClass}>0 líneas</span>
    </>
  )
}

function LayoutsOperationsSummaryEmptyOrder() {
  return (
    <div className={layoutsOperationsSummaryEmptyStateClass}>
      <div className={layoutsOperationsSummaryEmptyStateContentClass}>
        <div className={layoutsOperationsSummaryEmptyIconWrapClass} aria-hidden>
          <Receipt className="size-7 stroke-[1.75]" />
        </div>
        <p className={layoutsOperationsSummaryEmptyTitleClass}>Pedido vacío</p>
      </div>
    </div>
  )
}

function LayoutsOperationsSummaryPanel({
  wireframe = false,
  composed = false,
}: {
  wireframe?: boolean
  composed?: boolean
}) {
  const showDraftCart = wireframe || composed

  return (
    <aside className={layoutsOperationsSummaryPanelClass} aria-label="Columna de resumen">
      {wireframe ? (
        <LayoutHeightBadge label={`${LAYOUTS_OPERATIONS_SUMMARY_PANEL_WIDTH_PX}px · light`} />
      ) : null}

      <div
        className={cn(
          layoutsOperationsSummaryTabsRowClass,
          showDraftCart && "flex items-center justify-between gap-2 px-3",
        )}
      >
        {showDraftCart ? <LayoutsOperationsSummaryCartHeader /> : null}
      </div>

      <div
        className={cn(
          layoutsOperationsSummaryContentClass,
          showDraftCart && "relative flex min-h-0 flex-col",
        )}
      >
        {showDraftCart ? <LayoutsOperationsSummaryEmptyOrder /> : null}
      </div>

      <div className={cn(layoutsOperationsSummaryTotalsRowClass, wireframe && "relative")}>
        <div className={layoutsOperationsSummaryTotalsRowEdgeClass} aria-hidden />
        {wireframe ? (
          <LayoutHeightBadge label="h-20 · tierra 700→900 · totales" />
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

export function LayoutsOperationsBody({
  wireframe = false,
  composed = false,
}: {
  wireframe?: boolean
  composed?: boolean
}) {
  return (
    <div
      className={cn(
        layoutsOperationsBodyScopeClass,
        layoutsOperationsBodyShellClass,
        wireframe && layoutsOperationsBodyWireframeClass,
      )}
    >
      <main className={cn(layoutsOperationsBodyColumnsClass, "h-full min-h-0")}>
        <LayoutsOperationsMainColumn wireframe={wireframe} composed={composed} />
        <LayoutsOperationsSummaryPanel wireframe={wireframe} composed={composed} />
      </main>
    </div>
  )
}

function LayoutsOperationsFrame({
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

export function LayoutsOperationsFullPageDraft() {
  return (
    <LayoutsOperationsFrame heightClass="h-[32rem]">
      <LayoutsOperationsHeaderDemo composed />
      <LayoutsOperationsBody composed />
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
            Header reutilizable (<code className="text-[11px]">h-17</code>, gradiente{" "}
            <code className="text-[11px]">noche 950→800</code>). Columna{" "}
            <span className="font-medium text-foreground">noche</span>: rail{" "}
            <code className="text-[11px]">noche 950</code>, canvas{" "}
            <code className="text-[11px]">noche 900</code>, cards{" "}
            <code className="text-[11px]">noche 800</code>, toolbox{" "}
            <code className="text-[11px]">h-20 · noche 800</code>. Columna{" "}
            <span className="font-medium text-foreground">light</span> (
            <code className="text-[11px]">{LAYOUTS_OPERATIONS_SUMMARY_PANEL_WIDTH_PX}px</code> —
            ticket tierra 50/100, totales{" "}
            <code className="text-[11px]">h-20</code> en gradiente tierra{" "}
            <code className="text-[11px]">700→900</code>).
          </p>
        </div>
      </div>
    </div>
  )
}
