"use client"

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
  categories: readonly string[]
  products: PurchaseCatalogProduct[]
  loading: boolean
  error: string | null
  onAddProduct: (productId: string) => void
  catalogSidebarOpen?: boolean
  className?: string
}

export function PurchaseCatalogBrowser({
  categories,
  products,
  loading,
  error,
  onAddProduct,
  catalogSidebarOpen = true,
  className,
}: Props) {
  const [vistaCatalogo, setVistaCatalogo] = useState<PurchaseCatalogView>({
    modo: "categoria",
    categoria: categories[0] ?? "",
  })
  const [modoVista, setModoVista] = useState<"grid" | "lista">("grid")
  const [busqueda, setBusqueda] = useState("")
  const vistaAntesBusquedaRef = useRef<PurchaseCatalogView | null>(null)
  const busquedaTrimPrevRef = useRef("")

  const productosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    const hayBusqueda = q.length > 0
    return products.filter((p) => {
      const matchVista =
        hayBusqueda || p.categoria === vistaCatalogo.categoria
      const matchQ =
        !q ||
        p.nombre.toLowerCase().includes(q) ||
        p.descripcion.toLowerCase().includes(q)
      return matchVista && matchQ
    })
  }, [busqueda, products, vistaCatalogo])

  useEffect(() => {
    setVistaCatalogo((prev) => {
      if (categories.includes(prev.categoria)) return prev
      return { modo: "categoria", categoria: categories[0] ?? "" }
    })
  }, [categories])

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
              categories={categories}
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
                  onClick={() => onAddProduct(product.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
