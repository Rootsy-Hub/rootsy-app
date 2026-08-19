"use client"

import type {
  PurchaseCatalogArticle,
  PurchaseCatalogCategorySection,
} from "@/app/[siteId]/[popId]/purchases/actions"
import {
  type PurchaseCatalogProduct,
  type PurchaseCatalogView,
} from "@/components/purchase-operation/purchaseCatalogTypes"
import { PurchaseCatalogProductCard } from "@/components/purchase-operation/PurchaseCatalogProductCard"
import { PurchaseCatalogSidebarNav } from "@/components/purchase-operation/PurchaseCatalogSidebarNav"
import { PurchaseCatalogToolbar } from "@/components/purchase-operation/PurchaseCatalogToolbar"
import { SaleCatalogBrowserSkeleton } from "@/components/sale-operation/SaleCatalogBrowserSkeleton"
import { SaleCatalogEmptyMascot } from "@/components/sale-operation/SaleCatalogEmptyMascot"
import { SaleCatalogInfiniteFooter } from "@/components/sale-operation/SaleCatalogInfiniteFooter"
import { SaleCatalogVirtualGrid } from "@/components/sale-operation/SaleCatalogVirtualGrid"
import { SaleCatalogSidebarNavSkeleton } from "@/components/sale-operation/SaleCatalogSidebarNavSkeleton"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { useInfiniteScrollSentinel } from "@/hooks/useInfiniteScrollSentinel"
import { usePurchaseCatalogItems } from "@/hooks/useOperateCatalogItems"
import {
  OPERATE_CATALOG_SEARCH_DEBOUNCE_MS,
  purchaseCatalogViewToItemsFilter,
} from "@/lib/operateCatalogPage"
import { resolveCatalogProductImage } from "@/lib/menuCatalogProduct"
import {
  layoutsOperarCatalogCanvasBodyClass,
  layoutsOperarCatalogCanvasClass,
  layoutsOperarCatalogCanvasScrollClass,
  layoutsOperarCatalogColumnClass,
  layoutsOperarCatalogSidebarClass,
  layoutsOperarCatalogSidebarClosedClass,
  layoutsOperarCatalogSidebarInnerClass,
  layoutsOperarCatalogSidebarOpenClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import { cn } from "@/lib/utils"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

type Props = {
  popId?: string
  mergeCatalogArticles?: (articles: PurchaseCatalogArticle[]) => void
  categorySections: readonly PurchaseCatalogCategorySection[]
  products: PurchaseCatalogProduct[]
  loading: boolean
  error: string | null
  onAddProduct: (productId: string, quantity?: number) => void
  catalogSidebarOpen?: boolean
  className?: string
}

function articleToProducto(a: PurchaseCatalogArticle): PurchaseCatalogProduct {
  return {
    id: a.id,
    nombre: a.name,
    descripcion: a.description.trim() ? a.description : "—",
    iva: a.iva,
    categoria: a.categoryName.trim() ? a.categoryName : "—",
    categoriaFiltro: `${a.itemKind}:${a.categoryId}`,
    imagen: resolveCatalogProductImage(a.id, a.imageUrl),
    unitOfMeasure: a.unitOfMeasure,
    costs: a.costs,
  }
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
  popId,
  mergeCatalogArticles,
  categorySections,
  products: _products,
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
  const [scrollRoot, setScrollRoot] = useState<HTMLElement | null>(null)
  const [sentinel, setSentinel] = useState<HTMLElement | null>(null)

  const debouncedSearch = useDebouncedValue(
    busqueda,
    OPERATE_CATALOG_SEARCH_DEBOUNCE_MS,
  )
  const itemsFilter = useMemo(
    () => purchaseCatalogViewToItemsFilter(vistaCatalogo.categoria, debouncedSearch),
    [debouncedSearch, vistaCatalogo.categoria],
  )
  const paged = usePurchaseCatalogItems(
    popId,
    itemsFilter,
    Boolean(popId) && !error,
  )

  useEffect(() => {
    mergeCatalogArticles?.(paged.articles)
  }, [mergeCatalogArticles, paged.articles])

  const productosFiltrados = useMemo(
    () => paged.articles.map(articleToProducto),
    [paged.articles],
  )

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

  const fetchNextPage = paged.fetchNextPage
  const loadMore = useCallback(() => {
    if (!paged.hasNextPage || paged.isFetchingNextPage) return
    void fetchNextPage()
  }, [fetchNextPage, paged.hasNextPage, paged.isFetchingNextPage])

  useInfiniteScrollSentinel(
    scrollRoot,
    sentinel,
    paged.hasNextPage && !paged.isFetchingNextPage,
    loadMore,
  )

  const displayError = error ?? paged.error
  const showGridSkeleton =
    !error && paged.isLoading && productosFiltrados.length === 0
  const isEmpty = !showGridSkeleton && !displayError && productosFiltrados.length === 0

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

        <div className={layoutsOperarCatalogCanvasBodyClass}>
        <div
          ref={setScrollRoot}
          className={cn(
            "min-h-0 h-full",
            showGridSkeleton
              ? layoutsOperarCatalogCanvasScrollClass
              : displayError
                ? "flex flex-1 flex-col p-6"
                : isEmpty
                  ? "relative overflow-hidden p-0"
                  : layoutsOperarCatalogCanvasScrollClass,
          )}
        >
          {showGridSkeleton ? (
            <SaleCatalogBrowserSkeleton variant={modoVista} />
          ) : displayError ? (
            <div className="flex min-h-[200px] flex-1 flex-col items-center justify-center gap-2 text-center">
              <p className="max-w-md text-sm text-rose-300">{displayError}</p>
            </div>
          ) : isEmpty ? (
            <SaleCatalogEmptyMascot hasSearch={busqueda.trim().length > 0} />
          ) : (
            <SaleCatalogVirtualGrid
              items={productosFiltrados}
              modoVista={modoVista}
              scrollRoot={scrollRoot}
              resetKey={`${itemsFilter.section}:${itemsFilter.categoryId ?? ""}:${itemsFilter.search}:${modoVista}`}
              getItemKey={(product) => product.id}
              renderItem={(product) => (
                <PurchaseCatalogProductCard
                  product={product}
                  variant={modoVista}
                  onClick={() => {
                    onAddProduct(product.id, cantidadIngreso)
                    setCantidadIngreso(1)
                  }}
                />
              )}
              footer={
                paged.hasNextPage || paged.isFetchingNextPage ? (
                  <SaleCatalogInfiniteFooter
                    hasMore={paged.hasNextPage}
                    loadingMore={paged.isFetchingNextPage}
                    sentinelRef={setSentinel}
                  />
                ) : null
              }
            />
          )}
        </div>
        </div>
      </section>
    </div>
  )
}
