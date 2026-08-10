"use client"

import type { SaleCatalogCategory } from "@/app/[siteId]/[popId]/sale/actions"
import type { MenuCatalogCategorySection } from "@/app/[siteId]/[popId]/menu-catalog/actions"
import type { SaleCatalogProduct } from "@/components/sale-operation/saleCatalogProduct"
import type { MenuCartItemKind } from "@/lib/menuCart"
import type { MenuCatalogProduct } from "@/lib/menuCatalogProduct"
import { SaleCatalogEmptyMascot } from "@/components/sale-operation/SaleCatalogEmptyMascot"
import { SaleCatalogBrowserSkeleton } from "@/components/sale-operation/SaleCatalogBrowserSkeleton"
import { SaleCatalogProductCard } from "@/components/sale-operation/SaleCatalogProductCard"
import { SaleCatalogSidebarNav } from "@/components/sale-operation/SaleCatalogSidebarNav"
import { SaleCatalogSidebarNavSkeleton } from "@/components/sale-operation/SaleCatalogSidebarNavSkeleton"
import { useDataWorkspaceSidebar } from "@/components/layouts/useDataWorkspaceSidebar"
import { SaleCatalogToolbar } from "@/components/sale-operation/SaleCatalogToolbar"
import { useSaleScanInputFocus } from "@/components/sale-operation/SaleScanInputFocusContext"
import { SALE_CATALOG_DEFAULT_PRICE_LIST_ID } from "@/components/sale-operation/saleCatalogPriceLists"
import { findCatalogProductByScanQuery } from "@/lib/saleCatalogScan"
import {
  readSavedSaleCatalogView,
  writeSavedSaleCatalogView,
  type SaleCatalogViewPersisted,
} from "@/lib/saleCatalogPreference"
import {
  layoutsOperarCatalogCanvasClass,
  layoutsOperarCatalogCanvasScrollClass,
  layoutsOperarCatalogColumnClass,
  layoutsOperarCatalogGridClass,
  layoutsOperarCatalogSidebarClass,
  layoutsOperarCatalogSidebarClosedClass,
  layoutsOperarCatalogSidebarInnerClass,
  layoutsOperarCatalogSidebarOpenClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import { cn } from "@/lib/utils"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

const CATEGORIA_TODOS = "Todos"

type CatalogScope = "sale" | "menu"

type Props = {
  siteId: string
  popId: string
  categories: SaleCatalogCategory[]
  /** Secciones separadas (Recetas / Productos) para Mesas y Mostrador. */
  categorySections?: MenuCatalogCategorySection[]
  products: SaleCatalogProduct[]
  loading: boolean
  error: string | null
  onAddProduct: (productId: string, kind?: MenuCartItemKind, quantity?: number) => void
  addDisabled?: boolean
  /** Control externo del panel de categorías (p. ej. botón del header). */
  catalogSidebarOpen?: boolean
  /** Filtros del rail: venta directa vs catálogo menú (mesas/mostrador). */
  catalogScope?: CatalogScope
  /** Devuelve foco al input escaneo tras acciones (p. ej. Vender). */
  keepScanFocused?: boolean
  className?: string
}

function productMatchesCatalogView(
  product: SaleCatalogProduct,
  vistaCatalogo: SaleCatalogViewPersisted,
  hayBusqueda: boolean,
  catalogScope: CatalogScope,
) {
  if (hayBusqueda) return true

  const menuProduct = product as MenuCatalogProduct
  const kind = "kind" in menuProduct ? menuProduct.kind : undefined

  if (vistaCatalogo.modo === "categoria") {
    if (catalogScope === "sale") {
      return (
        kind === "article" &&
        (vistaCatalogo.categoria === CATEGORIA_TODOS ||
          product.categoria === vistaCatalogo.categoria)
      )
    }

    const categoriaFiltro =
      "categoriaFiltro" in menuProduct && typeof menuProduct.categoriaFiltro === "string"
        ? menuProduct.categoriaFiltro
        : null

    return (
      vistaCatalogo.categoria === CATEGORIA_TODOS ||
      (categoriaFiltro
        ? categoriaFiltro === vistaCatalogo.categoria
        : product.categoria === vistaCatalogo.categoria)
    )
  }

  if (vistaCatalogo.modo === "promociones") {
    if (catalogScope === "sale") {
      return kind === "promotion" || Boolean(product.promo?.trim())
    }

    return (
      ("section" in menuProduct && menuProduct.section === "promotions") ||
      Boolean(product.promo?.trim()) ||
      (product.precioOriginal != null && product.precioOriginal > product.precio)
    )
  }

  return product.precioOriginal != null && product.precioOriginal > product.precio
}

export function SaleCatalogBrowser({
  siteId,
  popId,
  categories,
  categorySections,
  products,
  loading,
  error,
  onAddProduct,
  addDisabled = false,
  catalogSidebarOpen: catalogSidebarOpenProp,
  catalogScope = "menu",
  keepScanFocused = false,
  className,
}: Props) {
  const scanFocus = useSaleScanInputFocus()
  const internalSidebar = useDataWorkspaceSidebar(
    siteId,
    popId,
    catalogSidebarOpenProp === undefined,
  )
  const sidebarOpen = catalogSidebarOpenProp ?? internalSidebar.open

  const [vistaCatalogo, setVistaCatalogo] = useState<SaleCatalogViewPersisted>(() => {
    return (
      readSavedSaleCatalogView(popId) ?? {
        modo: "categoria",
        categoria: CATEGORIA_TODOS,
      }
    )
  })
  const [modoVista, setModoVista] = useState<"grid" | "lista">("grid")
  const [busqueda, setBusqueda] = useState("")
  const [cantidadIngreso, setCantidadIngreso] = useState(1)
  const [priceListId, setPriceListId] = useState(SALE_CATALOG_DEFAULT_PRICE_LIST_ID)
  const busquedaInputRef = useRef<HTMLInputElement>(null)
  const vistaAntesBusquedaRef = useRef<SaleCatalogViewPersisted | null>(null)
  const busquedaTrimPrevRef = useRef("")

  const registerScanInputRef = useCallback(
    (element: HTMLInputElement | null) => {
      busquedaInputRef.current = element
      if (keepScanFocused) {
        scanFocus?.registerScanInput(element)
      }
    },
    [keepScanFocused, scanFocus],
  )

  const refocusScan = useCallback(() => {
    if (!keepScanFocused) return
    scanFocus?.focusScanInput()
  }, [keepScanFocused, scanFocus])

  const handleAddProduct = useCallback(
    (productId: string, kind?: MenuCartItemKind, quantity = cantidadIngreso) => {
      if (addDisabled) return
      onAddProduct(productId, kind, quantity)
      refocusScan()
    },
    [addDisabled, cantidadIngreso, onAddProduct, refocusScan],
  )

  const handleScanKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== "Enter") return
      event.preventDefault()
      const match = findCatalogProductByScanQuery(products, busqueda)
      if (!match) return
      const kind =
        "kind" in match && typeof match.kind === "string"
          ? (match.kind as MenuCartItemKind)
          : undefined
      handleAddProduct(match.id, kind)
      setBusqueda("")
    },
    [busqueda, handleAddProduct, products],
  )

  const persistVistaCatalogo = useCallback(
    (view: SaleCatalogViewPersisted) => {
      setVistaCatalogo(view)
      writeSavedSaleCatalogView(popId, view)
      refocusScan()
    },
    [popId, refocusScan],
  )

  const productosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    const hayBusqueda = q.length > 0

    return products.filter((product) => {
      const matchVista = productMatchesCatalogView(
        product,
        vistaCatalogo,
        hayBusqueda,
        catalogScope,
      )
      const matchQ =
        !q ||
        product.nombre.toLowerCase().includes(q) ||
        product.descripcion.toLowerCase().includes(q) ||
        (product.barcode != null && String(product.barcode).toLowerCase().includes(q))
      return matchVista && matchQ
    })
  }, [busqueda, catalogScope, products, vistaCatalogo])

  useEffect(() => {
    const trimmed = busqueda.trim()
    const prevTrimmed = busquedaTrimPrevRef.current
    const wasEmpty = prevTrimmed.length === 0
    const isEmpty = trimmed.length === 0

    if (!isEmpty && wasEmpty) {
      vistaAntesBusquedaRef.current = vistaCatalogo
    }

    if (isEmpty && !wasEmpty) {
      const saved = vistaAntesBusquedaRef.current
      if (saved != null) {
        setVistaCatalogo(saved)
        vistaAntesBusquedaRef.current = null
      }
    }

    if (!isEmpty) {
      setVistaCatalogo((prev) => {
        if (prev.modo === "categoria" && prev.categoria === CATEGORIA_TODOS) {
          return prev
        }
        return { modo: "categoria", categoria: CATEGORIA_TODOS }
      })
    }

    busquedaTrimPrevRef.current = trimmed
  }, [busqueda, vistaCatalogo])

  useEffect(() => {
    if (!keepScanFocused || loading) return
    refocusScan()
  }, [keepScanFocused, loading, refocusScan])

  return (
    <div className={cn(layoutsOperarCatalogColumnClass, className)}>
      <aside
        id="data-workspace-sidebar"
        className={cn(
          layoutsOperarCatalogSidebarClass,
          sidebarOpen
            ? layoutsOperarCatalogSidebarOpenClass
            : layoutsOperarCatalogSidebarClosedClass,
        )}
        aria-hidden={!sidebarOpen}
        {...(!sidebarOpen ? { inert: true } : {})}
        aria-label="Filtros del catálogo"
      >
        <div className={layoutsOperarCatalogSidebarInnerClass}>
          {loading && !error ? (
            <SaleCatalogSidebarNavSkeleton />
          ) : (
            <SaleCatalogSidebarNav
              categories={categories}
              categorySections={categorySections}
              vistaCatalogo={vistaCatalogo}
              onVistaChange={persistVistaCatalogo}
            />
          )}
        </div>
      </aside>

      <section className={layoutsOperarCatalogCanvasClass}>
        <SaleCatalogToolbar
          variant="operar"
          modoVista={modoVista}
          onModoVistaChange={(modo) => {
            setModoVista(modo)
            refocusScan()
          }}
          busqueda={busqueda}
          onBusquedaChange={setBusqueda}
          onBusquedaKeyDown={handleScanKeyDown}
          scanInputRef={registerScanInputRef}
          cantidadIngreso={cantidadIngreso}
          onCantidadIngresoChange={(cantidad) => {
            setCantidadIngreso(cantidad)
            refocusScan()
          }}
          priceListId={priceListId}
          onPriceListChange={setPriceListId}
          onPriceListSelectClosed={refocusScan}
        />

        <div
          className={cn(
            "min-h-0",
            loading && !error
              ? cn(layoutsOperarCatalogCanvasScrollClass)
              : error
                ? "flex flex-1 flex-col p-6"
                : productosFiltrados.length === 0
                  ? "relative overflow-hidden p-0"
                  : cn(layoutsOperarCatalogCanvasScrollClass),
          )}
        >
          {loading && !error ? (
            <SaleCatalogBrowserSkeleton variant={modoVista} />
          ) : error ? (
            <div className="flex min-h-[200px] flex-1 flex-col items-center justify-center gap-2 text-center">
              <p className="max-w-md text-sm text-rose-300">{error}</p>
            </div>
          ) : productosFiltrados.length === 0 ? (
            <SaleCatalogEmptyMascot hasSearch={busqueda.trim().length > 0} />
          ) : (
            <div
              className={
                modoVista === "grid"
                  ? layoutsOperarCatalogGridClass
                  : "flex flex-col gap-2"
              }
            >
              {productosFiltrados.map((product) => {
                const productKind =
                  "kind" in product && typeof product.kind === "string"
                    ? (product.kind as MenuCartItemKind)
                    : undefined

                return (
                  <SaleCatalogProductCard
                    key={`${productKind ?? "article"}:${product.id}`}
                    product={product}
                    variant={modoVista}
                    disabled={addDisabled}
                    onClick={() => handleAddProduct(product.id, productKind)}
                  />
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
