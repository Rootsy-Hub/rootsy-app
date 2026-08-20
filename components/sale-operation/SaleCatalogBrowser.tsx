"use client"

import type { SaleCatalogCategory } from "@/app/[siteId]/[popId]/sale/actions"
import type { MenuCatalogCategorySection } from "@/app/[siteId]/[popId]/menu-catalog/actions"
import { findMenuCatalogItemByScan } from "@/app/[siteId]/[popId]/menu-catalog/actions"
import { findSaleCatalogArticleByScan } from "@/app/[siteId]/[popId]/sale/actions"
import type { SaleCatalogProduct } from "@/components/sale-operation/saleCatalogProduct"
import type { MenuCartItemKind } from "@/lib/menuCart"
import {
  menuArticleToProduct,
  menuRecipeToProduct,
  type MenuCatalogProduct,
} from "@/lib/menuCatalogProduct"
import { SaleCatalogEmptyMascot } from "@/components/sale-operation/SaleCatalogEmptyMascot"
import { SaleCatalogBrowserSkeleton } from "@/components/sale-operation/SaleCatalogBrowserSkeleton"
import { SaleCatalogInfiniteFooter } from "@/components/sale-operation/SaleCatalogInfiniteFooter"
import { SaleCatalogVirtualGrid } from "@/components/sale-operation/SaleCatalogVirtualGrid"
import { SaleCatalogProductCard } from "@/components/sale-operation/SaleCatalogProductCard"
import { SaleCatalogSidebarNav } from "@/components/sale-operation/SaleCatalogSidebarNav"
import { SaleCatalogSidebarNavSkeleton } from "@/components/sale-operation/SaleCatalogSidebarNavSkeleton"
import { useDataWorkspaceSidebar } from "@/components/layouts/useDataWorkspaceSidebar"
import { SaleCatalogToolbar } from "@/components/sale-operation/SaleCatalogToolbar"
import { useSaleScanInputFocus } from "@/components/sale-operation/SaleScanInputFocusContext"
import { SALE_CATALOG_DEFAULT_PRICE_LIST_ID } from "@/components/sale-operation/saleCatalogPriceLists"
import { getPopPriceLists } from "@/app/[siteId]/[popId]/articles/priceListActions"
import { defaultPriceList, type SalePriceList } from "@/lib/salePriceLists"
import { setSalePriceListSession } from "@/lib/salePriceListSession"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { useInfiniteScrollSentinel } from "@/hooks/useInfiniteScrollSentinel"
import {
  useMenuCatalogItems,
  useSaleCatalogItems,
} from "@/hooks/useOperateCatalogItems"
import { findCatalogProductByScanQuery } from "@/lib/saleCatalogScan"
import {
  OPERATE_CATALOG_SEARCH_DEBOUNCE_MS,
} from "@/lib/operateCatalogPage"
import {
  readSavedSaleCatalogView,
  resolveSaleCatalogView,
  saleCatalogViewToItemsFilter,
  writeSavedSaleCatalogView,
  type SaleCatalogViewPersisted,
} from "@/lib/saleCatalogPreference"
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
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { flushSync } from "react-dom"

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
  itemsSource?: CatalogScope
  mergeCatalogArticles?: (articles: Parameters<typeof menuArticleToProduct>[0][]) => void
  mergeCatalogRecipes?: (recipes: Parameters<typeof menuRecipeToProduct>[0][]) => void
  /** Devuelve foco al input escaneo tras acciones (p. ej. Vender). */
  keepScanFocused?: boolean
  className?: string
}

function isMenuProduct(product: SaleCatalogProduct): product is MenuCatalogProduct {
  return "kind" in product && typeof (product as MenuCatalogProduct).kind === "string"
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
  itemsSource,
  mergeCatalogArticles,
  mergeCatalogRecipes,
  keepScanFocused = false,
  className,
}: Props) {
  const source = itemsSource ?? catalogScope
  const scanFocus = useSaleScanInputFocus()
  const internalSidebar = useDataWorkspaceSidebar(
    siteId,
    popId,
    catalogSidebarOpenProp === undefined,
  )
  const sidebarOpen = catalogSidebarOpenProp ?? internalSidebar.open

  const [vistaCatalogo, setVistaCatalogo] = useState<SaleCatalogViewPersisted>(() =>
    resolveSaleCatalogView(
      readSavedSaleCatalogView(popId),
      categories,
      categorySections,
    ),
  )
  const [modoVista, setModoVista] = useState<"grid" | "lista">("grid")
  const [busqueda, setBusqueda] = useState("")
  const [cantidadIngreso, setCantidadIngreso] = useState(1)
  const [priceLists, setPriceLists] = useState<SalePriceList[]>([])
  const [priceListId, setPriceListId] = useState(SALE_CATALOG_DEFAULT_PRICE_LIST_ID)
  const busquedaInputRef = useRef<HTMLInputElement>(null)
  const vistaAntesBusquedaRef = useRef<SaleCatalogViewPersisted | null>(null)
  const busquedaTrimPrevRef = useRef("")
  const canvasScrollRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [scrollRoot, setScrollRoot] = useState<HTMLElement | null>(null)
  const [sentinel, setSentinel] = useState<HTMLElement | null>(null)

  const setCanvasScrollRef = useCallback((node: HTMLDivElement | null) => {
    canvasScrollRef.current = node
    setScrollRoot(node)
  }, [])
  const setSentinelRef = useCallback((node: HTMLDivElement | null) => {
    sentinelRef.current = node
    setSentinel(node)
  }, [])

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
      setCantidadIngreso(1)
      refocusScan()
    },
    [addDisabled, cantidadIngreso, onAddProduct, refocusScan],
  )

  const debouncedSearch = useDebouncedValue(
    busqueda,
    OPERATE_CATALOG_SEARCH_DEBOUNCE_MS,
  )
  const itemsFilter = useMemo(() => {
    const base = saleCatalogViewToItemsFilter(
      vistaCatalogo,
      debouncedSearch,
      categories,
      categorySections,
    )
    return { ...base, priceListId }
  }, [categories, categorySections, debouncedSearch, priceListId, vistaCatalogo])

  useEffect(() => {
    let cancelled = false
    void getPopPriceLists(popId).then((res) => {
      if (cancelled || !res.success) return
      setPriceLists(res.lists)
      const fallback = defaultPriceList(res.lists)
      setPriceListId((current) => {
        if (fallback && !res.lists.some((list) => list.id === current)) {
          return fallback.id
        }
        return current
      })
    })
    return () => {
      cancelled = true
    }
  }, [popId])

  useEffect(() => {
    setSalePriceListSession(popId, priceListId)
  }, [popId, priceListId])

  const saleItems = useSaleCatalogItems(
    popId,
    itemsFilter,
    Boolean(popId) && !error && source === "sale",
  )
  const menuItems = useMenuCatalogItems(
    popId,
    itemsFilter,
    Boolean(popId) && !error && source === "menu",
  )
  const paged = source === "sale" ? saleItems : menuItems
  const pagedRecipes = source === "menu" ? menuItems.recipes : []

  useEffect(() => {
    mergeCatalogArticles?.(paged.articles)
  }, [mergeCatalogArticles, paged.articles])

  useEffect(() => {
    mergeCatalogRecipes?.(pagedRecipes)
  }, [mergeCatalogRecipes, pagedRecipes])

  const persistVistaCatalogo = useCallback(
    (view: SaleCatalogViewPersisted) => {
      setVistaCatalogo(view)
      writeSavedSaleCatalogView(popId, view)
      refocusScan()
    },
    [popId, refocusScan],
  )

  const promotionProducts = useMemo(
    () => products.filter((product) => isMenuProduct(product) && product.kind === "promotion"),
    [products],
  )

  const pagedProducts = useMemo((): SaleCatalogProduct[] => {
    const articles = paged.articles.map(menuArticleToProduct)
    const recipes = pagedRecipes.map(menuRecipeToProduct)
    return [...recipes, ...articles]
  }, [paged.articles, pagedRecipes])

  const productosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    const showPromos =
      itemsFilter.section === "promotions" || itemsFilter.search.length > 0
    const promos = showPromos
      ? promotionProducts.filter((product) => {
          if (!q) return true
          return (
            product.nombre.toLowerCase().includes(q) ||
            product.descripcion.toLowerCase().includes(q)
          )
        })
      : []
    return [...promos, ...pagedProducts]
  }, [busqueda, itemsFilter.search, itemsFilter.section, pagedProducts, promotionProducts])

  const handleScanKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== "Enter") return
      event.preventDefault()
      const query = busqueda
      const match =
        findCatalogProductByScanQuery(productosFiltrados, query) ??
        findCatalogProductByScanQuery(products, query)
      if (match) {
        const kind =
          "kind" in match && typeof match.kind === "string"
            ? (match.kind as MenuCartItemKind)
            : undefined
        handleAddProduct(match.id, kind)
        setBusqueda("")
        return
      }

      void (async () => {
        if (source === "sale") {
          const res = await findSaleCatalogArticleByScan(popId, query, priceListId)
          if (!res.success || !res.article) return
          const article = res.article
          flushSync(() => {
            mergeCatalogArticles?.([article])
          })
          handleAddProduct(article.id, "article")
          setBusqueda("")
          return
        }
        const res = await findMenuCatalogItemByScan(popId, query, priceListId)
        if (!res.success) return
        if (res.article) {
          const article = res.article
          flushSync(() => {
            mergeCatalogArticles?.([article])
          })
          handleAddProduct(article.id, "article")
          setBusqueda("")
          return
        }
        if (res.recipe) {
          const recipe = res.recipe
          flushSync(() => {
            mergeCatalogRecipes?.([recipe])
          })
          handleAddProduct(recipe.id, "recipe")
          setBusqueda("")
        }
      })()
    },
    [
      busqueda,
      handleAddProduct,
      mergeCatalogArticles,
      mergeCatalogRecipes,
      popId,
      priceListId,
      products,
      productosFiltrados,
      source,
    ],
  )

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

  useEffect(() => {
    setVistaCatalogo((prev) =>
      resolveSaleCatalogView(prev, categories, categorySections),
    )
  }, [categories, categorySections])

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

  useEffect(() => {
    if (!keepScanFocused || loading) return
    refocusScan()
  }, [keepScanFocused, loading, refocusScan])

  const itemsError = paged.error
  const showGridSkeleton =
    !error &&
    paged.isLoading &&
    productosFiltrados.length === 0 &&
    itemsFilter.section !== "promotions"
  const displayError = error ?? itemsError
  const isEmpty =
    !showGridSkeleton &&
    !displayError &&
    productosFiltrados.length === 0

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
          priceLists={
            priceLists.length > 0
              ? priceLists.map((list) => ({ id: list.id, label: list.name }))
              : undefined
          }
        />

        <div className={layoutsOperarCatalogCanvasBodyClass}>
        <div
          ref={setCanvasScrollRef}
          className={cn(
            "min-h-0 h-full",
            showGridSkeleton
              ? cn(layoutsOperarCatalogCanvasScrollClass)
              : displayError
                ? "flex flex-1 flex-col p-6"
                : isEmpty
                  ? "relative overflow-hidden p-0"
                  : cn(layoutsOperarCatalogCanvasScrollClass),
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
              getItemKey={(product) => {
                const productKind =
                  "kind" in product && typeof product.kind === "string"
                    ? (product.kind as MenuCartItemKind)
                    : "article"
                return `${productKind}:${product.id}`
              }}
              renderItem={(product) => {
                const productKind =
                  "kind" in product && typeof product.kind === "string"
                    ? (product.kind as MenuCartItemKind)
                    : undefined
                return (
                  <SaleCatalogProductCard
                    product={product}
                    variant={modoVista}
                    disabled={addDisabled}
                    onClick={() => handleAddProduct(product.id, productKind)}
                  />
                )
              }}
              footer={
                paged.hasNextPage || paged.isFetchingNextPage ? (
                  <SaleCatalogInfiniteFooter
                    hasMore={paged.hasNextPage}
                    loadingMore={paged.isFetchingNextPage}
                    sentinelRef={setSentinelRef}
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
