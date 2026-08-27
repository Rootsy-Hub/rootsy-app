"use client"

import type { SaleCatalogCategory } from "@/app/[siteId]/[popId]/sale/actions"
import type { MenuCatalogCategorySection } from "@/app/[siteId]/[popId]/menu-catalog/actions"
import { findMenuCatalogItemByScan } from "@/lib/rootsyApi/menuCatalogClient"
import { findSaleBoardArticleByScan, openPopLocalDb } from "@/lib/popLocalDb"
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
import { SaleCatalogMobileCategoryBar } from "@/components/sale-operation/SaleCatalogMobileCategoryBar"
import { useOperarCatalogMobileChrome } from "@/components/layouts-module/OperarCatalogMobileChrome"
import { useRegisterOperarMobileCategoryPicker } from "@/components/layouts-module/OperarMobileStage"
import { showRootsyToast } from "@/components/rootsy-toast"
import { useSaleScanInputFocus } from "@/components/sale-operation/SaleScanInputFocusContext"
import {
  SALE_CATALOG_DEFAULT_PRICE_LIST_ID,
  SALE_CATALOG_DEFAULT_PRICE_LISTS,
} from "@/components/sale-operation/saleCatalogPriceLists"
import { usePopPriceLists } from "@/hooks/usePopPriceLists"
import { defaultPriceList } from "@/lib/salePriceLists"
import {
  getSalePriceListSession,
  setSalePriceListSession,
} from "@/lib/salePriceListSession"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { useInfiniteScrollSentinel } from "@/hooks/useInfiniteScrollSentinel"
import { useMenuCatalogSections } from "@/hooks/useMenuCatalogSections"
import { useSaleBoardArticles } from "@/hooks/useSaleBoardArticles"
import { useSaleBoardCategories } from "@/hooks/useSaleBoardCategories"
import { useSaleBoardPromotions } from "@/hooks/useSaleBoardPromotions"
import { useMenuCatalogBoardItems } from "@/hooks/useMenuCatalogBoardItems"
import { menuPromotionToProduct } from "@/lib/menuCheckoutPromotions"
import { findCatalogProductByScanQuery } from "@/lib/saleCatalogScan"
import {
  OPERATE_CATALOG_SEARCH_DEBOUNCE_MS,
} from "@/lib/operateCatalogPage"
import {
  readSavedSaleCatalogView,
  resolveSaleCatalogView,
  saleCatalogCategoryIdFromView,
  saleCatalogViewLabel,
  saleCatalogViewsEqual,
  saleCatalogViewToItemsFilter,
  saleCatalogVisibleCategoryIds,
  subscribeSaleCatalogView,
  writeSavedSaleCatalogView,
  type SaleCatalogViewPersisted,
} from "@/lib/saleCatalogPreference"
import { MenuSidebar } from "@/components/MenuSidebar"
import {
  layoutsOperarCatalogCanvasBodyClass,
  layoutsOperarCatalogCanvasClass,
  layoutsOperarCatalogCanvasScrollClass,
  layoutsOperarCatalogColumnClass,
  layoutsOperarCatalogEmptyCanvasClass,
  layoutsOperarCatalogSidebarClass,
  layoutsOperarCatalogSidebarClosedClass,
  layoutsOperarCatalogSidebarOpenClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import { cn } from "@/lib/utils"
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import { flushSync } from "react-dom"

type CatalogScope = "sale" | "menu"

const EMPTY_SALE_BOARD_CATEGORIES: SaleCatalogCategory[] = []

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
  onCatalogSidebarOpenChange?: (open: boolean) => void
  /** Filtros del rail: venta directa vs catálogo menú (mesas/mostrador). */
  catalogScope?: CatalogScope
  itemsSource?: CatalogScope
  mergeCatalogArticles?: (articles: Parameters<typeof menuArticleToProduct>[0][]) => void
  mergeCatalogRecipes?: (recipes: Parameters<typeof menuRecipeToProduct>[0][]) => void
  /** Pedir páginas del catálogo. En Mesas/Mostrador: solo cuando esa UI se ve. */
  itemsEnabled?: boolean
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
  products,
  loading: _catalogLoading,
  error: _catalogError,
  onAddProduct,
  addDisabled = false,
  catalogSidebarOpen: catalogSidebarOpenProp,
  onCatalogSidebarOpenChange,
  catalogScope = "menu",
  itemsSource,
  mergeCatalogArticles,
  mergeCatalogRecipes,
  itemsEnabled = true,
  keepScanFocused = false,
  className,
}: Props) {
  const source = itemsSource ?? catalogScope
  const isSaleBoard = source === "sale"
  const savedView = useSyncExternalStore(
    subscribeSaleCatalogView,
    () => readSavedSaleCatalogView(popId),
    () => undefined,
  )
  const saleCategoriesQuery = useSaleBoardCategories(popId, {
    enabled: isSaleBoard && itemsEnabled && Boolean(popId),
  })
  const salePromotionsQuery = useSaleBoardPromotions(popId, {
    enabled: isSaleBoard && itemsEnabled && Boolean(popId),
    hydrate: Boolean(popId) && isSaleBoard,
  })
  const menuSectionsQuery = useMenuCatalogSections(popId, {
    enabled: !isSaleBoard && itemsEnabled && Boolean(popId),
  })
  const saleBoardCategories = useMemo(() => {
    const rows = saleCategoriesQuery.data
    if (!rows?.length) return EMPTY_SALE_BOARD_CATEGORIES
    return rows.map((category) => ({
      id: category.id,
      name: category.name,
      sortOrder: category.sortOrder,
    }))
  }, [saleCategoriesQuery.data])
  const saleBoardSections = useMemo((): MenuCatalogCategorySection[] => {
    const sections: MenuCatalogCategorySection[] = []
    if (salePromotionsQuery.combos.length > 0) {
      sections.push({
        id: "promotions",
        label: "Promociones",
        categories: [{ id: "all", name: "Promociones", sortOrder: 0 }],
      })
    }
    if (saleBoardCategories.length === 0) return sections
    sections.push({
      id: "products",
      label: "Productos",
      categories: saleBoardCategories,
    })
    return sections
  }, [saleBoardCategories, salePromotionsQuery.combos.length])
  const railCategories = isSaleBoard ? saleBoardCategories : categories
  const railSections = isSaleBoard ? saleBoardSections : menuSectionsQuery.data
  const railLoading = isSaleBoard
    ? saleCategoriesQuery.isLoading
    : menuSectionsQuery.isLoading
  const saleCategoriesError =
    saleCategoriesQuery.error instanceof Error
      ? saleCategoriesQuery.error.message
      : saleCategoriesQuery.error
        ? String(saleCategoriesQuery.error)
        : null
  const menuSectionsError = menuSectionsQuery.error
  const scanFocus = useSaleScanInputFocus()
  const internalSidebar = useDataWorkspaceSidebar(
    siteId,
    popId,
    catalogSidebarOpenProp === undefined,
  )
  const sidebarOpen = catalogSidebarOpenProp ?? internalSidebar.open
  const catalogMobileChrome = useOperarCatalogMobileChrome()
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false)
  const [isMobileViewport, setIsMobileViewport] = useState(false)

  const [vistaCatalogo, setVistaCatalogo] = useState<SaleCatalogViewPersisted>(
    () =>
      readSavedSaleCatalogView(popId) ?? {
        modo: "categoria",
        categoria: "",
      },
  )
  const [modoVista, setModoVista] = useState<"grid" | "lista">("grid")
  const [busqueda, setBusqueda] = useState("")
  const [cantidadIngreso, setCantidadIngreso] = useState(1)
  const [priceListsNeeded, setPriceListsNeeded] = useState(false)
  const priceListsQuery = usePopPriceLists(popId, { enabled: priceListsNeeded })
  const priceLists = priceListsQuery.data ?? []
  const [priceListId, setPriceListId] = useState(
    () => getSalePriceListSession(popId) ?? SALE_CATALOG_DEFAULT_PRICE_LIST_ID,
  )
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

  const namedProductsRef = useRef<SaleCatalogProduct[]>(products)
  namedProductsRef.current = products

  const handleAddProduct = useCallback(
    (productId: string, kind?: MenuCartItemKind, quantity = cantidadIngreso) => {
      if (addDisabled) return
      onAddProduct(productId, kind, quantity)
      if (isMobileViewport && kind !== "promotion") {
        const nombre =
          products.find((product) => product.id === productId)?.nombre ??
          namedProductsRef.current.find((product) => product.id === productId)
            ?.nombre
        if (nombre) {
          showRootsyToast({
            title: `Se agregó ${nombre} ${quantity}x`,
            intent: "success",
          })
        }
      }
      setCantidadIngreso(1)
      refocusScan()
    },
    [
      addDisabled,
      cantidadIngreso,
      onAddProduct,
      refocusScan,
      isMobileViewport,
      products,
    ],
  )

  const debouncedSearch = useDebouncedValue(
    busqueda,
    OPERATE_CATALOG_SEARCH_DEBOUNCE_MS,
  )
  const vistaResuelta = useMemo(
    () =>
      resolveSaleCatalogView(
        savedView ?? vistaCatalogo,
        railCategories,
        railSections,
      ),
    [railCategories, railSections, savedView, vistaCatalogo],
  )
  const itemsFilter = useMemo(() => {
    const base = saleCatalogViewToItemsFilter(
      vistaResuelta,
      debouncedSearch,
      railCategories,
      railSections,
    )
    return {
      ...base,
      priceListId,
      catalogCategoryIds: saleCatalogVisibleCategoryIds(
        railCategories,
        railSections,
      ),
    }
  }, [debouncedSearch, priceListId, railCategories, railSections, vistaResuelta])
  const isSearch = Boolean(itemsFilter.search.trim())
  const saleBoardCategoryId = isSaleBoard
    ? saleCatalogCategoryIdFromView(vistaResuelta)
    : null
  const itemsQueryReady = isSaleBoard
    ? isSearch ||
      itemsFilter.section === "promotions" ||
      Boolean(saleBoardCategoryId)
    : isSearch ||
      itemsFilter.section === "promotions" ||
      itemsFilter.section === "discounts" ||
      Boolean(itemsFilter.categoryId)

  useEffect(() => {
    if (railLoading) return
    if (saleCatalogViewsEqual(vistaCatalogo, vistaResuelta)) return
    setVistaCatalogo(vistaResuelta)
    writeSavedSaleCatalogView(popId, vistaResuelta)
  }, [popId, railLoading, vistaCatalogo, vistaResuelta])

  useEffect(() => {
    if (priceLists.length === 0) return
    const fallback = defaultPriceList(priceLists)
    setPriceListId((current) => {
      if (fallback && !priceLists.some((list) => list.id === current)) {
        return fallback.id
      }
      return current
    })
  }, [priceLists])

  useEffect(() => {
    setSalePriceListSession(popId, priceListId)
  }, [popId, priceListId])

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)")
    const apply = () => setIsMobileViewport(mq.matches)
    apply()
    mq.addEventListener("change", apply)
    return () => mq.removeEventListener("change", apply)
  }, [])

  const vistaEfectiva = isMobileViewport ? "lista" : modoVista
  const priceListOptions = useMemo(
    () =>
      priceLists.length > 0
        ? priceLists.map((list) => ({ id: list.id, label: list.name }))
        : SALE_CATALOG_DEFAULT_PRICE_LISTS,
    [priceLists],
  )
  const categoryLabel = saleCatalogViewLabel(
    vistaResuelta,
    railCategories,
    railSections,
  )
  const usesMobileStage = useRegisterOperarMobileCategoryPicker(
    categoryLabel || "Categoría",
    categoryPickerOpen,
    setCategoryPickerOpen,
  )

  const registerPriceList = catalogMobileChrome?.registerPriceList
  useEffect(() => {
    if (!registerPriceList) return
    registerPriceList({
      priceListId,
      priceLists: priceListOptions,
      onChange: setPriceListId,
      onOpen: () => setPriceListsNeeded(true),
    })
    return () => registerPriceList(null)
  }, [registerPriceList, priceListId, priceListOptions])

  const saleBoardItems = useSaleBoardArticles(popId, saleBoardCategoryId, {
    enabled:
      Boolean(popId) &&
      isSaleBoard &&
      itemsEnabled &&
      itemsQueryReady &&
      itemsFilter.section !== "promotions",
    hydrate: Boolean(popId) && isSaleBoard,
    search: isSearch ? itemsFilter.search : "",
    priceListId,
  })
  const menuItems = useMenuCatalogBoardItems(popId, itemsFilter, {
    enabled:
      Boolean(popId) && source === "menu" && itemsEnabled && itemsQueryReady,
  })
  const paged = source === "sale" ? saleBoardItems : menuItems
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
      setCategoryPickerOpen(false)
      refocusScan()
    },
    [popId, refocusScan],
  )

  const promotionProducts = useMemo(() => {
    if (source === "menu") {
      return menuItems.promotions.map(menuPromotionToProduct)
    }
    return products.filter(
      (product) => isMenuProduct(product) && product.kind === "promotion",
    )
  }, [menuItems.promotions, products, source])

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
  namedProductsRef.current = productosFiltrados.length > 0 ? productosFiltrados : products

  const handleScanKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== "Enter") return
      event.preventDefault()
      if (addDisabled) return
      const query = busqueda
      const visibleMatch = findCatalogProductByScanQuery(
        productosFiltrados,
        query,
      )
      if (visibleMatch && source !== "sale") {
        const kind =
          "kind" in visibleMatch && typeof visibleMatch.kind === "string"
            ? (visibleMatch.kind as MenuCartItemKind)
            : undefined
        handleAddProduct(visibleMatch.id, kind)
        setBusqueda("")
        return
      }

      void (async () => {
        if (source === "sale") {
          try {
            const handle = await openPopLocalDb(popId)
            const article = findSaleBoardArticleByScan(handle.database, query)
            if (article) {
              handleAddProduct(article.id, "article")
              setBusqueda("")
              return
            }
          } catch {
            /* miss local */
          }
          const promoMatch = findCatalogProductByScanQuery(
            promotionProducts,
            query,
          )
          if (promoMatch) {
            handleAddProduct(promoMatch.id, "promotion")
            setBusqueda("")
            return
          }
          showRootsyToast({
            title: "No está en el catálogo local",
            intent: "warning",
          })
          return
        }
        const match =
          visibleMatch ?? findCatalogProductByScanQuery(products, query)
        if (match) {
          const kind =
            "kind" in match && typeof match.kind === "string"
              ? (match.kind as MenuCartItemKind)
              : undefined
          handleAddProduct(match.id, kind)
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
      addDisabled,
      busqueda,
      handleAddProduct,
      mergeCatalogArticles,
      mergeCatalogRecipes,
      popId,
      priceListId,
      products,
      productosFiltrados,
      promotionProducts,
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
    setVistaCatalogo((prev) => {
      const next = resolveSaleCatalogView(prev, railCategories, railSections)
      return saleCatalogViewsEqual(prev, next) ? prev : next
    })
  }, [railCategories, railSections])

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
    if (!keepScanFocused || railLoading) return
    refocusScan()
  }, [keepScanFocused, railLoading, refocusScan])

  const itemsError = paged.error
  const boardError = isSaleBoard ? saleCategoriesError : menuSectionsError
  const showGridSkeleton =
    !boardError &&
    (paged.isLoading || (railLoading && !itemsQueryReady)) &&
    productosFiltrados.length === 0 &&
    itemsFilter.section !== "promotions"
  const displayError = boardError ?? itemsError
  const isEmpty =
    !showGridSkeleton &&
    !displayError &&
    productosFiltrados.length === 0

  return (
    <div className={cn(layoutsOperarCatalogColumnClass, className)}>
      <MenuSidebar
        id="data-workspace-sidebar"
        collapseBelow={false}
        padded={false}
        fixedWidth={false}
        className={cn(
          "max-md:hidden",
          layoutsOperarCatalogSidebarClass,
          sidebarOpen
            ? layoutsOperarCatalogSidebarOpenClass
            : layoutsOperarCatalogSidebarClosedClass,
        )}
        aria-hidden={!sidebarOpen}
        inert={!sidebarOpen}
        aria-label="Filtros del catálogo"
      >
        {railLoading && !boardError ? (
          <SaleCatalogSidebarNavSkeleton />
        ) : (
          <SaleCatalogSidebarNav
            categories={railCategories}
            categorySections={railSections}
            vistaCatalogo={vistaResuelta}
            onVistaChange={persistVistaCatalogo}
          />
        )}
      </MenuSidebar>

      <section
        className={cn(
          layoutsOperarCatalogCanvasClass,
          "relative",
          !usesMobileStage &&
            "max-md:[grid-template-rows:var(--layouts-operar-catalog-toolbar-h)_var(--layouts-operar-catalog-toolbar-h)_minmax(0,1fr)]",
        )}
      >
        {!usesMobileStage ? (
          <SaleCatalogMobileCategoryBar
            label={categoryLabel || "Categoría"}
            open={categoryPickerOpen}
            onToggle={() => setCategoryPickerOpen((current) => !current)}
          />
        ) : null}
        {categoryPickerOpen ? (
          <div
            className={cn(
              "absolute z-30 overflow-hidden md:hidden",
              "bg-[var(--rootsy-sombra-950)]",
              usesMobileStage
                ? "inset-0"
                : cn(
                    "inset-x-0 bottom-0 top-[var(--layouts-operar-catalog-toolbar-h)]",
                    "max-md:col-start-1 max-md:row-start-1",
                    "border-b border-[var(--layouts-operar-border-dark-hairline)]",
                  ),
            )}
          >
            <SaleCatalogSidebarNav
              categories={railCategories}
              categorySections={railSections}
              vistaCatalogo={vistaResuelta}
              onVistaChange={persistVistaCatalogo}
              density="comfortable"
            />
          </div>
        ) : null}
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
          onPriceListOpenChange={(open) => {
            if (open) setPriceListsNeeded(true)
          }}
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
                  ? layoutsOperarCatalogEmptyCanvasClass
                  : cn(layoutsOperarCatalogCanvasScrollClass),
          )}
        >
          {showGridSkeleton ? (
            <SaleCatalogBrowserSkeleton variant={vistaEfectiva} />
          ) : displayError ? (
            <div className="flex min-h-[200px] flex-1 flex-col items-center justify-center gap-2 text-center">
              <p className="max-w-md text-sm text-rose-300">{displayError}</p>
            </div>
          ) : isEmpty ? (
            <SaleCatalogEmptyMascot
              hasSearch={busqueda.trim().length > 0}
              categoryName={
                !isSearch && vistaResuelta.modo === "categoria" && categoryLabel !== "Categoría"
                  ? categoryLabel
                  : undefined
              }
              articlesHref={
                isSearch
                  ? undefined
                  : `/${siteId}/${popId}/articles${
                      itemsFilter.categoryId ? `?cat=${itemsFilter.categoryId}` : ""
                    }`
              }
            />
          ) : (
            <SaleCatalogVirtualGrid
              items={productosFiltrados}
              modoVista={vistaEfectiva}
              scrollRoot={scrollRoot}
              resetKey={`${itemsFilter.section}:${itemsFilter.categoryId ?? ""}:${itemsFilter.search}:${vistaEfectiva}`}
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
                    variant={vistaEfectiva}
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
