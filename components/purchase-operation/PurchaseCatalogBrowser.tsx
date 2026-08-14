"use client"

import type { PurchaseCatalogCategorySection } from "@/app/[siteId]/[popId]/purchases/actions"
import {
  type PurchaseCatalogProduct,
  type PurchaseCatalogView,
} from "@/components/purchase-operation/purchaseCatalogTypes"
import { PurchaseCatalogProductCard } from "@/components/purchase-operation/PurchaseCatalogProductCard"
import { PurchaseCatalogSidebarNav } from "@/components/purchase-operation/PurchaseCatalogSidebarNav"
import { PurchaseCatalogToolbar } from "@/components/purchase-operation/PurchaseCatalogToolbar"
import { SaleCatalogBrowserSkeleton } from "@/components/sale-operation/SaleCatalogBrowserSkeleton"
import { SaleCatalogEmptyMascot } from "@/components/sale-operation/SaleCatalogEmptyMascot"
import { SaleCatalogSidebarNavSkeleton } from "@/components/sale-operation/SaleCatalogSidebarNavSkeleton"
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
import { useEffect, useMemo, useRef, useState } from "react"

type Props = {
  categorySections: readonly PurchaseCatalogCategorySection[]
  products: PurchaseCatalogProduct[]
  loading: boolean
  error: string | null
  onAddProduct: (productId: string, quantity?: number) => void
  catalogSidebarOpen?: boolean
  className?: string
}

function defaultPurchaseCatalogView(
  categorySections: readonly PurchaseCatalogCategorySection[],
): PurchaseCatalogView {
  for (const section of categorySections) {
    const first = section.categories[0]
    if (first) {
      return { modo: "categoria", categoria: `${section.id}:${first.id}` }
    }
  }
  return { modo: "categoria", categoria: "" }
}

function isValidPurchaseCatalogView(
  categoria: string,
  categorySections: readonly PurchaseCatalogCategorySection[],
): boolean {
  if (!categoria) return false
  return categorySections.some((section) =>
    section.categories.some((cat) => `${section.id}:${cat.id}` === categoria),
  )
}

export function PurchaseCatalogBrowser({
  categorySections,
  products,
  loading,
  error,
  onAddProduct,
  catalogSidebarOpen = true,
  className,
}: Props) {
  const [vistaCatalogo, setVistaCatalogo] = useState<PurchaseCatalogView>(() =>
    defaultPurchaseCatalogView(categorySections),
  )
  const [modoVista, setModoVista] = useState<"grid" | "lista">("grid")
  const [busqueda, setBusqueda] = useState("")
  const [cantidadIngreso, setCantidadIngreso] = useState(1)
  const vistaAntesBusquedaRef = useRef<PurchaseCatalogView | null>(null)
  const busquedaTrimPrevRef = useRef("")

  const productosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    const hayBusqueda = q.length > 0
    return products.filter((p) => {
      const matchVista =
        hayBusqueda || p.categoriaFiltro === vistaCatalogo.categoria
      const matchQ =
        !q ||
        p.nombre.toLowerCase().includes(q) ||
        p.descripcion.toLowerCase().includes(q)
      return matchVista && matchQ
    })
  }, [busqueda, products, vistaCatalogo])

  useEffect(() => {
    setVistaCatalogo((prev) => {
      if (isValidPurchaseCatalogView(prev.categoria, categorySections)) {
        return prev
      }
      return defaultPurchaseCatalogView(categorySections)
    })
  }, [categorySections])

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

    busquedaTrimPrevRef.current = trimmed
  }, [busqueda, vistaCatalogo])

  return (
    <div className={cn(layoutsOperarCatalogColumnClass, className)}>
      <aside
        id="data-workspace-sidebar"
        className={cn(
          layoutsOperarCatalogSidebarClass,
          catalogSidebarOpen
            ? layoutsOperarCatalogSidebarOpenClass
            : layoutsOperarCatalogSidebarClosedClass,
        )}
        aria-hidden={!catalogSidebarOpen}
        {...(!catalogSidebarOpen ? { inert: true } : {})}
        aria-label="Filtros del catálogo"
      >
        <div className={layoutsOperarCatalogSidebarInnerClass}>
          {loading && !error ? (
            <SaleCatalogSidebarNavSkeleton />
          ) : (
            <PurchaseCatalogSidebarNav
              categorySections={categorySections}
              vistaCatalogo={vistaCatalogo}
              onVistaChange={setVistaCatalogo}
            />
          )}
        </div>
      </aside>

      <section className={layoutsOperarCatalogCanvasClass}>
        <PurchaseCatalogToolbar
          modoVista={modoVista}
          onModoVistaChange={setModoVista}
          busqueda={busqueda}
          onBusquedaChange={setBusqueda}
          cantidadIngreso={cantidadIngreso}
          onCantidadIngresoChange={setCantidadIngreso}
          resultCount={productosFiltrados.length}
        />

        <div
          className={cn(
            "min-h-0",
            loading && !error
              ? layoutsOperarCatalogCanvasScrollClass
              : error
                ? "flex flex-1 flex-col p-6"
                : productosFiltrados.length === 0
                  ? "relative overflow-hidden p-0"
                  : layoutsOperarCatalogCanvasScrollClass,
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
              {productosFiltrados.map((product) => (
                <PurchaseCatalogProductCard
                  key={product.id}
                  product={product}
                  variant={modoVista}
                  onClick={() => {
                    onAddProduct(product.id, cantidadIngreso)
                    setCantidadIngreso(1)
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
