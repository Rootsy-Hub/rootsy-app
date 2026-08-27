"use client"

import type {
  InventoryArticleRow,
  InventoryCostLayerRow,
  InventoryMovementRow,
} from "@/app/[siteId]/[popId]/inventory/actions"
import {
  InventoryListStatus,
  useInventoryInfiniteSentinel,
} from "@/app/[siteId]/[popId]/inventory/inventoryInfinite"
import {
  mergeInventoryWorkspaceUrl,
  parseInventoryWorkspaceUrl,
  type InventoryClearingId,
  type InventoryRedFilter,
} from "@/app/[siteId]/[popId]/inventory/workspaceUrl"
import { InventoryHomeSkeleton } from "@/app/[siteId]/[popId]/inventory/InventoryHomeSkeleton"
import { InventoryAdjustmentDialog } from "@/app/[siteId]/[popId]/inventory/InventoryAdjustmentDialog"
import { InventoryExpiryClearing } from "@/app/[siteId]/[popId]/inventory/InventoryExpiryClearing"
import { InventoryLayerExpiryDialog } from "@/app/[siteId]/[popId]/inventory/InventoryLayerExpiryDialog"
import { InventoryLocationsClearing } from "@/app/[siteId]/[popId]/inventory/InventoryLocationsClearing"
import { InventoryOnHandKpi } from "@/app/[siteId]/[popId]/inventory/InventoryOnHandKpi"
import { InventoryArticleRowList } from "@/app/[siteId]/[popId]/inventory/InventoryArticleRowList"
import { InventoryDeleteMovementDialog } from "@/app/[siteId]/[popId]/inventory/InventoryDeleteMovementDialog"
import { InventoryTransferDialog } from "@/app/[siteId]/[popId]/inventory/InventoryTransferDialog"
import {
  formatInventoryMoney,
  formatInventoryMoneyShort,
  formatInventoryQty,
  INVENTORY_MOVEMENT_LABELS,
  shortInventoryUserId,
  shortInventoryUuid,
} from "@/app/[siteId]/[popId]/inventory/inventoryFormat"
import "@/app/[siteId]/[popId]/inventory/inventoryPrint.css"
import { DataWorkspaceBlocksSection } from "@/components/data-workspace/DataWorkspaceBlocksSection"
import { DataWorkspaceTableIconAction } from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import {
  dataWorkspaceBlocksEmptyStateClass,
  dataWorkspaceBlocksPageContentClass,
  dataWorkspaceBlocksPageMainClass,
  dataWorkspaceEntityCardEyebrowClass,
  dataWorkspaceEntityCardLosetaSurfaceClass,
  dataWorkspaceEntityCardStatValueLargeClass,
  dataWorkspaceEntityCardTitleClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { DataWorkspaceHeaderIconButton } from "@/components/layouts/DataWorkspaceHeaderIconButton"
import { DataWorkspaceHeaderTooltipIconButton } from "@/components/layouts/DataWorkspaceHeaderTooltipIconButton"
import {
  DataWorkspaceModuleLayout,
  dataWorkspaceModuleHeaderVariant,
} from "@/components/layouts-module/DataWorkspaceModuleLayout"
import { ReportHubCard, reportHubGridClass } from "@/components/reports/ReportHubCard"
import { RootsBanner } from "@/components/rootsy-banner"
import { RootsPrimaryButton, RootsSubtleButton } from "@/components/rootsy-button"
import { RootsFormSearchField, RootsFormSegmentField } from "@/components/rootsy-form"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { useAfterHydration } from "@/hooks/useIsHydrated"
import {
  usePopInventoryLedgerAllocations,
  usePopInventoryLedgerLayers,
  usePopInventoryLocations,
  usePopInventoryMovements,
  usePopInventoryRows,
  usePopInventorySummary,
} from "@/hooks/usePopInventory"
import { usePopMenuCache } from "@/hooks/usePopMenuCache"
import { hasPopAccessPermission } from "@/lib/popAccessPermissions"
import { POP_PERMS } from "@/lib/popPermissionConstants"
import { popInventoryQueryRoot } from "@/lib/queryKeys"
import {
  applyInventoryMinStockRecommendations,
  archiveInventoryLocation,
  createInventoryAdjustment,
  createInventoryLocation,
  deleteInventoryMovement,
  getArticleInventoryBalance,
  renameInventoryLocation,
  setInventoryLayerExpiry,
  slimToLocationRow,
  transferInventoryStock,
} from "@/lib/rootsyApi/inventoryClient"
import { formatLocaleDateTime } from "@/lib/popTimezone"
import { popScopedHref } from "@/lib/popRoutes"
import { formatInventoryExpiryDate } from "@/lib/inventory/inventoryExpiry"
import { cn } from "@/lib/utils"
import type { InventoryRowsView } from "@/lib/rootsyApi/inventoryClient"
import {
  ArrowLeft,
  ArrowRightLeft,
  ClipboardList,
  Layers,
  Minus,
  Package,
  Plus,
  Printer,
  ShoppingCart,
  Sparkles,
  Timer,
  Trash2,
  TriangleAlert,
  Warehouse,
} from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { useParams, usePathname, useRouter, useSearchParams } from "@/lib/pop-spa/navigation"
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react"

type ClearingId = InventoryClearingId

type RedFilter = InventoryRedFilter

const RED_FILTER_OPTIONS = [
  { value: "todas", label: "Todas" },
  { value: "negative", label: "Negativo" },
  { value: "empty", label: "Vacío" },
  { value: "below_min", label: "Bajo mínimo" },
] as const

const LEDGER_TAB_OPTIONS = [
  { value: "layers", label: "Capas de costo" },
  { value: "allocations", label: "Imputaciones" },
] as const

type LedgerTab = (typeof LEDGER_TAB_OPTIONS)[number]["value"]

const CLEARING_COPY: Record<
  Exclude<ClearingId, "home">,
  { title: string; description: string }
> = {
  red: {
    title: "En rojo",
    description: "Negativo, vacío o debajo del mínimo. Lo que pide reposición.",
  },
  overstock: {
    title: "Sobre stock",
    description: "Más del doble del mínimo. Capital quieto en la góndola.",
  },
  purchase: {
    title: "Para comprar",
    description: "Lista para reponer sin ir a mirar la despensa.",
  },
  pantry: {
    title: "Despensa",
    description: "Todo el stock de este punto, en un solo lugar.",
  },
  movements: {
    title: "Movimientos",
    description: "Lo último que entró y salió.",
  },
  recommend: {
    title: "Recomendaciones",
    description: "Mínimos sugeridos según lo que se vendió en las últimas 4 semanas.",
  },
  ledger: {
    title: "Libro",
    description: "Capas FIFO e imputaciones. El detalle contable del stock.",
  },
  locations: {
    title: "Más depósitos",
    description: "Varias despensas en el mismo punto. El primero no se archiva.",
  },
  expiry: {
    title: "Vencimientos",
    description: "Por lote, no por artículo. Avisamos; no bloqueamos la venta.",
  },
}

const ROW_VIEWS = new Set<ClearingId>([
  "red",
  "overstock",
  "purchase",
  "pantry",
  "recommend",
])

function queryFailMessage(
  query: { data?: { success?: boolean; error?: string }; error: unknown } | undefined,
) {
  if (!query) return null
  if (query.data?.success === false) return query.data.error ?? "Unexpected error"
  if (query.error) return "Unexpected error"
  return null
}

function InventoryKpiCard({
  eyebrow,
  value,
  hint,
}: {
  eyebrow: string
  value: string
  hint: string
}) {
  return (
    <div className={cn(dataWorkspaceEntityCardLosetaSurfaceClass, "p-5")}>
      <p className={dataWorkspaceEntityCardEyebrowClass}>{eyebrow}</p>
      <p className={cn(dataWorkspaceEntityCardStatValueLargeClass, "mt-3")}>
        {value}
      </p>
      <p className="mt-2 font-canopy text-xs leading-relaxed text-[var(--rootsy-bruma-500)]">
        {hint}
      </p>
    </div>
  )
}

export default function InventoryWorkspaceView() {
  const params = useParams()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : undefined
  const { bootstrap, loading: bootstrapLoading, error: bootstrapError, hasPermission } =
    usePopWorkspace()
  const afterHydration = useAfterHydration()
  const menuCache = usePopMenuCache(popId ?? "")

  const [workspaceSearch, setWorkspaceSearch] = useState(() =>
    searchParams.toString(),
  )
  useEffect(() => {
    setWorkspaceSearch(searchParams.toString())
  }, [searchParams])
  const workspaceParams = useMemo(
    () => new URLSearchParams(workspaceSearch),
    [workspaceSearch],
  )
  const ws = useMemo(
    () => parseInventoryWorkspaceUrl(workspaceParams),
    [workspaceParams],
  )
  const clearing = ws.clearing
  const redFilter = ws.redFilter
  const query = ws.q
  const [searchInput, setSearchInput] = useState(query)

  const checkPerm = useCallback(
    (perm: { resource: string; action: string }) =>
      afterHydration &&
      (hasPermission(perm.resource, perm.action) ||
        (menuCache.popAccess
          ? hasPopAccessPermission(
              menuCache.popAccess,
              perm.resource,
              perm.action,
            )
          : false)),
    [afterHydration, hasPermission, menuCache.popAccess],
  )
  const canCreate = checkPerm(POP_PERMS.INVENTORY_CREATE)
  const canPostAdjustmentAccounting = canCreate
  const canUpdate = checkPerm(POP_PERMS.INVENTORY_UPDATE)
  const canDelete = checkPerm(POP_PERMS.INVENTORY_DELETE)
  const canUpdateArticles = checkPerm(POP_PERMS.ARTICLE_UPDATE)

  const needsArticleRows = ROW_VIEWS.has(clearing)
  const rowsView = needsArticleRows ? (clearing as InventoryRowsView) : "pantry"

  const summaryQuery = usePopInventorySummary(popId, {
    enabled: Boolean(popId && siteId),
  })
  const rowsQuery = usePopInventoryRows(
    popId,
    {
      view: rowsView,
      q: query,
      attention: clearing === "red" && redFilter !== "todas" ? redFilter : "",
    },
    {
      enabled: Boolean(popId && siteId && needsArticleRows),
    },
  )
  const fetchMoreRows = rowsQuery.fetchNextPage
  const canFetchMoreRows =
    Boolean(rowsQuery.hasNextPage) && !rowsQuery.isFetchingNextPage
  const loadMoreRows = useCallback(() => {
    if (!canFetchMoreRows) return
    void fetchMoreRows()
  }, [canFetchMoreRows, fetchMoreRows])
  const movementsQuery = usePopInventoryMovements(popId, {
    enabled: Boolean(popId && siteId && clearing === "movements"),
  })
  const fetchMoreMovements = movementsQuery.fetchNextPage
  const canFetchMoreMovements =
    Boolean(movementsQuery.hasNextPage) && !movementsQuery.isFetchingNextPage
  const loadMoreMovements = useCallback(() => {
    if (!canFetchMoreMovements) return
    void fetchMoreMovements()
  }, [canFetchMoreMovements, fetchMoreMovements])
  const locationsQuery = usePopInventoryLocations(popId, {
    enabled: Boolean(popId && siteId && clearing === "locations"),
  })

  const articleRows = rowsQuery.rows
  const rowsTotal = rowsQuery.total
  const metrics = summaryQuery.data?.metrics ?? {
    articleCount: 0,
    articlesWithStock: 0,
    unitsInStock: 0,
    unitsByMeasure: [],
    inventoryValue: 0,
    redCount: 0,
    negativeCount: 0,
    emptyCount: 0,
    belowMinCount: 0,
    overstockCount: 0,
    purchaseCount: 0,
    recommendationCount: 0,
  }
  const slimLocations = summaryQuery.data?.locations ?? []
  const locationsForDialogs = useMemo(
    () => slimLocations.map(slimToLocationRow),
    [slimLocations],
  )
  const locations =
    locationsQuery.data?.locations && locationsQuery.data.locations.length > 0
      ? locationsQuery.data.locations
      : locationsForDialogs
  const movements = movementsQuery.movements
  const expiryAlert = summaryQuery.data?.expiry ?? {
    expiredCount: 0,
    soonCount: 0,
    total: 0,
  }
  const summaryLoading =
    summaryQuery.isPending ||
    (summaryQuery.isFetching && !summaryQuery.isFetched)
  const rowsLoading = needsArticleRows && rowsQuery.isPending
  const error =
    queryFailMessage(summaryQuery) ??
    (needsArticleRows ? rowsQuery.errorMessage : null) ??
    (clearing === "movements" ? movementsQuery.errorMessage : null) ??
    (clearing === "locations" ? queryFailMessage(locationsQuery) : null)

  const [applyBanner, setApplyBanner] = useState<string | null>(null)
  const [applyBusy, setApplyBusy] = useState(false)
  const [ledgerTab, setLedgerTab] = useState<LedgerTab>("layers")

  const [createOpen, setCreateOpen] = useState(false)
  const [createSaving, setCreateSaving] = useState(false)
  const [createBanner, setCreateBanner] = useState<string | null>(null)
  const [createArticleId, setCreateArticleId] = useState("")
  const [createArticleName, setCreateArticleName] = useState("")
  const [createUnitOfMeasure, setCreateUnitOfMeasure] = useState("")
  const [createAddStock, setCreateAddStock] = useState(true)
  const [createQty, setCreateQty] = useState("1")
  const [createNote, setCreateNote] = useState("")
  const [createExpiresAt, setCreateExpiresAt] = useState("")
  const [createStockLoading, setCreateStockLoading] = useState(false)
  const [createStockError, setCreateStockError] = useState<string | null>(null)
  const [createOnHand, setCreateOnHand] = useState<number | null>(null)
  const [createLocationId, setCreateLocationId] = useState("")
  const [locationName, setLocationName] = useState("")
  const [locationBusy, setLocationBusy] = useState(false)
  const [locationBanner, setLocationBanner] = useState<string | null>(null)
  const [transferOpen, setTransferOpen] = useState(false)
  const [transferSaving, setTransferSaving] = useState(false)
  const [transferBanner, setTransferBanner] = useState<string | null>(null)
  const [transferArticleId, setTransferArticleId] = useState("")
  const [transferArticleName, setTransferArticleName] = useState("")
  const [transferUnit, setTransferUnit] = useState("")
  const [transferFromId, setTransferFromId] = useState("")
  const [transferToId, setTransferToId] = useState("")
  const [transferQty, setTransferQty] = useState("1")
  const [transferOnHand, setTransferOnHand] = useState<number | null>(null)
  const [transferStockLoading, setTransferStockLoading] = useState(false)
  const [transferStockError, setTransferStockError] = useState<string | null>(null)

  const [deleteRow, setDeleteRow] = useState<InventoryMovementRow | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteBanner, setDeleteBanner] = useState<string | null>(null)

  const [expiryLayer, setExpiryLayer] = useState<InventoryCostLayerRow | null>(
    null,
  )
  const [expirySaving, setExpirySaving] = useState(false)
  const [expiryBanner, setExpiryBanner] = useState<string | null>(null)

  const pushWs = useCallback(
    (patch: Parameters<typeof mergeInventoryWorkspaceUrl>[1]) => {
      const next = mergeInventoryWorkspaceUrl(workspaceParams, patch)
      const qs = next.toString()
      const href = qs ? `${pathname}?${qs}` : pathname
      if (typeof window !== "undefined") {
        const current = `${window.location.pathname}${window.location.search}`
        if (current !== href) {
          window.history.replaceState(window.history.state, "", href)
        }
      }
      setWorkspaceSearch(qs)
    },
    [pathname, workspaceParams],
  )

  useEffect(() => {
    setSearchInput(query)
  }, [query])

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (searchInput.trim() === query.trim()) return
      pushWs({ q: searchInput })
    }, 400)
    return () => window.clearTimeout(t)
  }, [searchInput, query, pushWs])

  const refreshInventory = useCallback(async () => {
    if (!popId) return
    await queryClient.invalidateQueries({
      queryKey: popInventoryQueryRoot(popId),
    })
  }, [popId, queryClient])

  const pageLoading = bootstrapLoading || (clearing === "home" && summaryLoading)
  const popName = bootstrap?.popName ?? ""
  const stockHref = popScopedHref(siteId, popId ?? "", "articles")
  const defaultLocationId =
    locations.find((row) => row.isDefault)?.id ?? locations[0]?.id ?? ""

  const openCreate = (
    article?: {
      id: string
      name: string
      unitOfMeasure: string
    },
    addStock = true,
    extras?: { qty?: string; note?: string; locationId?: string },
  ) => {
    setCreateBanner(null)
    setCreateArticleId(article?.id ?? "")
    setCreateArticleName(article?.name ?? "")
    setCreateUnitOfMeasure(article?.unitOfMeasure ?? "")
    setCreateAddStock(addStock)
    setCreateQty(extras?.qty ?? "1")
    setCreateNote(extras?.note ?? "")
    setCreateExpiresAt("")
    setCreateStockError(null)
    setCreateOnHand(null)
    setCreateLocationId(extras?.locationId ?? defaultLocationId)
    setCreateOpen(true)
  }

  useEffect(() => {
    if (createLocationId) return
    if (!defaultLocationId) return
    setCreateLocationId(defaultLocationId)
  }, [createLocationId, defaultLocationId])

  const openTransfer = () => {
    const fromId = defaultLocationId
    const toId =
      locations.find((row) => row.id !== fromId)?.id ?? fromId
    setTransferBanner(null)
    setTransferArticleId("")
    setTransferArticleName("")
    setTransferUnit("")
    setTransferFromId(fromId)
    setTransferToId(toId)
    setTransferQty("1")
    setTransferOnHand(null)
    setTransferStockError(null)
    setTransferOpen(true)
  }

  useEffect(() => {
    if (!createOpen || !popId || !siteId) {
      if (!createOpen) {
        setCreateStockLoading(false)
        setCreateStockError(null)
        setCreateOnHand(null)
      }
      return
    }
    if (!createArticleId) {
      setCreateStockLoading(false)
      setCreateStockError(null)
      setCreateOnHand(null)
      return
    }
    let cancelled = false
    setCreateStockLoading(true)
    setCreateStockError(null)
    setCreateOnHand(null)
    void (async () => {
      const res = await getArticleInventoryBalance(popId, {
        articleId: createArticleId,
        locationId: createLocationId || undefined,
      })
      if (cancelled) return
      setCreateStockLoading(false)
      if (!res.success) {
        setCreateStockError(res.error)
        return
      }
      setCreateOnHand(res.onHand)
    })()
    return () => {
      cancelled = true
    }
  }, [createOpen, createArticleId, createLocationId, popId, siteId])

  useEffect(() => {
    if (!transferOpen || !popId || !siteId || !transferArticleId || !transferFromId) {
      if (!transferOpen) {
        setTransferStockLoading(false)
        setTransferStockError(null)
        setTransferOnHand(null)
      }
      return
    }
    let cancelled = false
    setTransferStockLoading(true)
    setTransferStockError(null)
    setTransferOnHand(null)
    void (async () => {
      const res = await getArticleInventoryBalance(popId, {
        articleId: transferArticleId,
        locationId: transferFromId,
      })
      if (cancelled) return
      setTransferStockLoading(false)
      if (!res.success) {
        setTransferStockError(res.error)
        return
      }
      setTransferOnHand(res.onHand)
    })()
    return () => {
      cancelled = true
    }
  }, [popId, siteId, transferArticleId, transferFromId, transferOpen])

  useEffect(() => {
    if (
      !createOpen ||
      createAddStock ||
      createOnHand === null ||
      createStockLoading
    ) {
      return
    }
    const maxS = Math.min(10000, Math.max(0, Math.floor(createOnHand)))
    const q = parseInt(createQty, 10)
    if (Number.isFinite(q) && q > maxS) {
      setCreateQty(String(maxS))
    }
  }, [createOpen, createAddStock, createOnHand, createStockLoading, createQty])

  const submitCreate = async (e: FormEvent) => {
    e.preventDefault()
    if (!popId || !siteId) return
    setCreateSaving(true)
    setCreateBanner(null)
    if (!createArticleId) {
      setCreateSaving(false)
      setCreateBanner("Elegí un artículo.")
      return
    }
    const q = parseInt(createQty, 10)
    if (!Number.isFinite(q) || q < 1 || q > 10000) {
      setCreateSaving(false)
      setCreateBanner(
        q === 0
          ? "Indicá una cantidad mayor que cero para aplicar el ajuste."
          : "La cantidad debe ser un número entero entre 1 y 10000.",
      )
      return
    }
    const res = await createInventoryAdjustment(popId, {
      articleId: createArticleId,
      quantityDelta: createAddStock ? q : -q,
      note: createNote,
      locationId: createLocationId || undefined,
      expiresAt: createAddStock ? createExpiresAt || null : null,
    })
    setCreateSaving(false)
    if (!res.success) {
      setCreateBanner(res.error)
      return
    }
    setCreateOpen(false)
    await refreshInventory()
  }

  const submitCreateLocation = async () => {
    if (!popId || !siteId) return
    setLocationBusy(true)
    setLocationBanner(null)
    const res = await createInventoryLocation(popId, locationName)
    setLocationBusy(false)
    if (!res.success) {
      setLocationBanner(res.error)
      return
    }
    setLocationName("")
    await refreshInventory()
  }

  const submitRenameLocation = async (locationId: string, name: string) => {
    if (!popId || !siteId) return
    setLocationBusy(true)
    setLocationBanner(null)
    const res = await renameInventoryLocation(popId, locationId, name)
    setLocationBusy(false)
    if (!res.success) {
      setLocationBanner(res.error)
      return
    }
    await refreshInventory()
  }

  const submitArchiveLocation = async (locationId: string) => {
    if (!popId || !siteId) return
    setLocationBusy(true)
    setLocationBanner(null)
    const res = await archiveInventoryLocation(popId, locationId)
    setLocationBusy(false)
    if (!res.success) {
      setLocationBanner(res.error)
      return
    }
    if (createLocationId === locationId) setCreateLocationId(defaultLocationId)
    await refreshInventory()
  }

  const submitTransfer = async (e: FormEvent) => {
    e.preventDefault()
    if (!popId || !siteId) return
    setTransferSaving(true)
    setTransferBanner(null)
    const q = parseInt(transferQty, 10)
    const res = await transferInventoryStock(popId, {
      articleId: transferArticleId,
      fromLocationId: transferFromId,
      toLocationId: transferToId,
      quantity: q,
    })
    setTransferSaving(false)
    if (!res.success) {
      setTransferBanner(res.error)
      return
    }
    setTransferOpen(false)
    await refreshInventory()
  }

  const submitDelete = async () => {
    if (!popId || !siteId || !deleteRow) return
    setDeleteBusy(true)
    setDeleteBanner(null)
    const res = await deleteInventoryMovement(popId, deleteRow.id)
    setDeleteBusy(false)
    if (!res.success) {
      setDeleteBanner(res.error)
      return
    }
    setDeleteRow(null)
    await refreshInventory()
  }

  const submitExpiry = async (input: {
    expiresAt: string | null
    quantity: number
  }) => {
    if (!popId || !siteId || !expiryLayer) return
    setExpirySaving(true)
    setExpiryBanner(null)
    const res = await setInventoryLayerExpiry(popId, {
      layerId: expiryLayer.id,
      expiresAt: input.expiresAt,
      quantity: input.quantity,
    })
    setExpirySaving(false)
    if (!res.success) {
      setExpiryBanner(res.error)
      return
    }
    setExpiryLayer(null)
    await refreshInventory()
  }

  const goClearing = (id: ClearingId) => {
    pushWs({ clearing: id, q: "", redFilter: "todas" })
    setApplyBanner(null)
    setLocationBanner(null)
    setLedgerTab("layers")
  }

  const applyRecommendations = async () => {
    if (!popId || !siteId) return
    setApplyBusy(true)
    setApplyBanner(null)
    const res = await applyInventoryMinStockRecommendations(popId)
    setApplyBusy(false)
    if (!res.success) {
      setApplyBanner(res.error)
      return
    }
    setApplyBanner(
      res.applied === 1
        ? "Se aplicó 1 mínimo sugerido."
        : `Se aplicaron ${res.applied} mínimos sugeridos.`,
    )
    await refreshInventory()
  }

  const printPurchaseList = () => {
    window.print()
  }

  if (!popId || !siteId) {
    return (
      <div className="rootsy-app-light min-h-screen bg-background p-10 text-foreground">
        <p className="text-sm">Punto de venta no encontrado</p>
      </div>
    )
  }

  const headerTitle =
    clearing === "home" ? "Inventario" : CLEARING_COPY[clearing].title

  return (
    <>
      <DataWorkspaceModuleLayout
        siteId={siteId}
        popId={popId}
        popName={popName}
        title={headerTitle}
        headerVariant={dataWorkspaceModuleHeaderVariant}
        loading={pageLoading}
        userName={bootstrap?.userFullName}
        userAvatarSrc={bootstrap?.userImageUrl ?? undefined}
        userRoleLabel={bootstrap?.roleLabel}
        contentFlush
        mainMaxWidthClass="max-w-none"
        mainClassName={dataWorkspaceBlocksPageMainClass}
        headerActions={
          <div className="flex items-center gap-2">
            {clearing === "purchase" && metrics.purchaseCount > 0 ? (
              <DataWorkspaceHeaderIconButton
                label="Imprimir lista"
                headerVariant={dataWorkspaceModuleHeaderVariant}
                onClick={printPurchaseList}
              >
                <Printer className="size-5" aria-hidden />
              </DataWorkspaceHeaderIconButton>
            ) : null}
            {canCreate && locations.length > 1 ? (
              <DataWorkspaceHeaderTooltipIconButton
                label="Trasladar stock"
                headerVariant={dataWorkspaceModuleHeaderVariant}
                onClick={openTransfer}
              >
                <ArrowRightLeft className="size-5" aria-hidden />
              </DataWorkspaceHeaderTooltipIconButton>
            ) : null}
            {canCreate ? (
              <>
                <DataWorkspaceHeaderTooltipIconButton
                  label="Sumar stock"
                  headerVariant={dataWorkspaceModuleHeaderVariant}
                  disabled={!canPostAdjustmentAccounting}
                  onClick={() => openCreate(undefined, true)}
                >
                  <Plus className="size-5" aria-hidden />
                </DataWorkspaceHeaderTooltipIconButton>
                <DataWorkspaceHeaderTooltipIconButton
                  label="Restar stock"
                  headerVariant={dataWorkspaceModuleHeaderVariant}
                  disabled={!canPostAdjustmentAccounting}
                  onClick={() => openCreate(undefined, false)}
                >
                  <Minus className="size-5" aria-hidden />
                </DataWorkspaceHeaderTooltipIconButton>
              </>
            ) : null}
          </div>
        }
      >
        <div className={dataWorkspaceBlocksPageContentClass}>
          {bootstrapError ? (
            <RootsBanner
              intent="danger"
              layout="message"
              message={`Cabecera: ${bootstrapError}`}
            />
          ) : null}

          {pageLoading ? (
            <InventoryHomeSkeleton />
          ) : error ? (
            <RootsBanner intent="danger" layout="message" message={error} />
          ) : clearing === "home" ? (
            <div className="space-y-10">
              {canCreate && !canPostAdjustmentAccounting ? (
                <RootsBanner
                  intent="warning"
                  layout="message"
                  message="Para cargar ajustes con asiento necesitás permisos de cuentas (crear y actualizar asientos) además de inventario."
                />
              ) : null}

              <section className="grid gap-4 md:grid-cols-3">
                <InventoryKpiCard
                  eyebrow="Lo que vale"
                  value={formatInventoryMoneyShort(metrics.inventoryValue)}
                  hint={
                    metrics.articlesWithStock === 1
                      ? "1 artículo con valor"
                      : `${metrics.articlesWithStock} artículos valorizados`
                  }
                />
                <InventoryOnHandKpi
                  units={metrics.unitsByMeasure}
                  articleCount={metrics.articleCount}
                />
                <InventoryKpiCard
                  eyebrow="Lo que pide"
                  value={String(metrics.redCount)}
                  hint={
                    metrics.redCount === 0
                      ? "Nada en falta"
                      : metrics.redCount === 1
                        ? "1 artículo pide reposición"
                        : `${metrics.redCount} piden reposición`
                  }
                />
              </section>

              <DataWorkspaceBlocksSection
                title="Por dónde empezar"
                description="Listas cortas. Un sendero cada vez."
              >
                <div className={reportHubGridClass}>
                  <ReportHubCard
                    title="En rojo"
                    description={
                      metrics.redCount === 0
                        ? "Nada en falta"
                        : `${metrics.redCount} piden reposición`
                    }
                    icon={TriangleAlert}
                    onSelect={() => goClearing("red")}
                  />
                  <ReportHubCard
                    title="Sobre stock"
                    description={
                      metrics.overstockCount === 0
                        ? "Sin excedente"
                        : `${metrics.overstockCount} por encima del techo`
                    }
                    icon={Package}
                    onSelect={() => goClearing("overstock")}
                  />
                  <ReportHubCard
                    title="Para comprar"
                    description={
                      metrics.purchaseCount === 0
                        ? "Nada para reponer"
                        : `${metrics.purchaseCount} para la lista`
                    }
                    icon={ShoppingCart}
                    onSelect={() => goClearing("purchase")}
                  />
                  <ReportHubCard
                    title="Despensa"
                    description="El stock de este punto"
                    icon={Warehouse}
                    onSelect={() => goClearing("pantry")}
                  />
                  <ReportHubCard
                    title="Recomendaciones"
                    description="Mínimos sugeridos según las ventas"
                    icon={Sparkles}
                    onSelect={() => goClearing("recommend")}
                  />
                  <ReportHubCard
                    title="Movimientos"
                    description="Entradas y salidas recientes"
                    icon={ClipboardList}
                    onSelect={() => goClearing("movements")}
                  />
                  <ReportHubCard
                    title="Libro"
                    description="Capas FIFO e imputaciones"
                    icon={Layers}
                    onSelect={() => goClearing("ledger")}
                  />
                  <ReportHubCard
                    title="Más depósitos"
                    description={
                      locations.length === 1
                        ? "Una despensa. Podés sumar otra."
                        : `${locations.length} depósitos en este punto`
                    }
                    icon={Warehouse}
                    onSelect={() => goClearing("locations")}
                  />
                  <ReportHubCard
                    title="Traslados"
                    description="Mover stock de un depósito a otro"
                    icon={ArrowRightLeft}
                    onSelect={openTransfer}
                  />
                  <ReportHubCard
                    title="Vencimientos"
                    description={
                      expiryAlert.total === 0
                        ? "Nada vence en los próximos 30 días"
                        : expiryAlert.expiredCount > 0 && expiryAlert.soonCount > 0
                          ? `${expiryAlert.expiredCount} vencidos · ${expiryAlert.soonCount} por vencer`
                          : expiryAlert.expiredCount > 0
                            ? `${expiryAlert.expiredCount} vencidos`
                            : `${expiryAlert.soonCount} por vencer`
                    }
                    icon={Timer}
                    onSelect={() => goClearing("expiry")}
                  />
                </div>
              </DataWorkspaceBlocksSection>

              {metrics.articleCount === 0 ? (
                <DataWorkspaceBlocksSection
                  title="Catálogo"
                  description="Los artículos y sus mínimos se cuidan en Stock."
                  action={
                    <RootsSubtleButton
                      type="button"
                      size="compact"
                      onClick={() => router.push(stockHref)}
                    >
                      Ir a Stock
                    </RootsSubtleButton>
                  }
                >
                  <p className={dataWorkspaceBlocksEmptyStateClass}>
                    Todavía no hay artículos en este punto.
                  </p>
                </DataWorkspaceBlocksSection>
              ) : null}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <RootsSubtleButton
                  type="button"
                  size="compact"
                  onClick={() => goClearing("home")}
                >
                  <ArrowLeft className="size-3.5" aria-hidden />
                  Volver
                </RootsSubtleButton>
                {clearing === "purchase" && rowsTotal > 0 ? (
                  <RootsPrimaryButton
                    type="button"
                    size="compact"
                    withIcon
                    onClick={printPurchaseList}
                  >
                    <Printer className="size-3.5" aria-hidden />
                    Imprimir
                  </RootsPrimaryButton>
                ) : null}
                {clearing === "recommend" &&
                canUpdateArticles &&
                rowsTotal > 0 ? (
                  <RootsPrimaryButton
                    type="button"
                    size="compact"
                    disabled={applyBusy}
                    onClick={() => void applyRecommendations()}
                  >
                    {applyBusy ? "Aplicando…" : "Aplicar mínimos"}
                  </RootsPrimaryButton>
                ) : null}
              </div>

              <DataWorkspaceBlocksSection
                title={CLEARING_COPY[clearing].title}
                description={CLEARING_COPY[clearing].description}
                action={
                  clearing === "ledger" ? (
                    <RootsFormSegmentField
                      label="Sección del libro"
                      aria-label="Sección del libro"
                      layout="inline"
                      className="w-auto [&>span:first-child]:sr-only"
                      value={ledgerTab}
                      onValueChange={(value) =>
                        setLedgerTab(value as LedgerTab)
                      }
                      options={LEDGER_TAB_OPTIONS}
                    />
                  ) : undefined
                }
              >
                {applyBanner ? (
                  <RootsBanner
                    intent={applyBanner.startsWith("Se aplic") ? "success" : "danger"}
                    layout="message"
                    message={applyBanner}
                  />
                ) : null}

                {clearing === "red" ? (
                  <RootsFormSegmentField
                    label="Filtrar en rojo"
                    aria-label="Filtrar en rojo"
                    layout="inline"
                    className="[&>span:first-child]:sr-only"
                    value={redFilter}
                    onValueChange={(value) =>
                      pushWs({ redFilter: value as RedFilter })
                    }
                    options={RED_FILTER_OPTIONS}
                  />
                ) : null}

                {clearing === "red" ||
                clearing === "overstock" ||
                clearing === "purchase" ||
                clearing === "pantry" ||
                clearing === "recommend" ? (
                  <RootsFormSearchField
                    label="Buscar artículo"
                    hideLabel
                    placeholder="Buscar artículo"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onClear={() => {
                      setSearchInput("")
                      pushWs({ q: "" })
                    }}
                  />
                ) : null}

                {clearing === "locations" ? (
                  <InventoryLocationsClearing
                    locations={locations}
                    canCreate={canCreate}
                    canUpdate={canUpdate}
                    saving={locationBusy}
                    banner={locationBanner}
                    newName={locationName}
                    onNewNameChange={setLocationName}
                    onCreate={() => void submitCreateLocation()}
                    onRename={(locationId, name) =>
                      void submitRenameLocation(locationId, name)
                    }
                    onArchive={(locationId) => void submitArchiveLocation(locationId)}
                  />
                ) : clearing === "movements" ? (
                  <InventoryMovementsTable
                    movements={movements}
                    loading={movementsQuery.isPending}
                    hasMore={Boolean(movementsQuery.hasNextPage)}
                    fetchingMore={movementsQuery.isFetchingNextPage}
                    onLoadMore={loadMoreMovements}
                    canDelete={canDelete}
                    onDelete={(row) => {
                      setDeleteBanner(null)
                      setDeleteRow(row)
                    }}
                  />
                ) : clearing === "ledger" ? (
                  <InventoryLedgerSections popId={popId} tab={ledgerTab} />
                ) : clearing === "expiry" ? (
                  <InventoryExpiryClearing
                    popId={popId}
                    canWrite={canCreate || canUpdate}
                    canMerma={canCreate}
                    onEdit={(layer) => {
                      setExpiryBanner(null)
                      setExpiryLayer(layer)
                    }}
                    onMerma={(layer) => {
                      const qty = Math.max(
                        1,
                        Math.min(10000, Math.floor(layer.quantityRemaining)),
                      )
                      openCreate(
                        {
                          id: layer.articleId,
                          name: layer.articleName,
                          unitOfMeasure: layer.unitOfMeasure,
                        },
                        false,
                        {
                          qty: String(qty),
                          note: "Merma por vencimiento",
                          locationId: layer.locationId,
                        },
                      )
                    }}
                  />
                ) : (
                  <InventoryInfiniteArticleList
                    rows={articleRows}
                    loading={rowsLoading}
                    hasMore={Boolean(rowsQuery.hasNextPage)}
                    fetchingMore={rowsQuery.isFetchingNextPage}
                    onLoadMore={loadMoreRows}
                    empty={
                      clearing === "red"
                        ? "Nada en rojo. El stock está en orden."
                        : clearing === "overstock"
                          ? "Nadie está por encima del techo."
                          : clearing === "purchase"
                            ? "No hay nada para comprar ahora."
                            : clearing === "recommend"
                              ? "Los mínimos están al día, o todavía no hay ventas para sugerir."
                              : "No hay artículos activos en este punto."
                    }
                    onRowClick={
                      canCreate &&
                      (clearing === "red" ||
                        clearing === "pantry" ||
                        clearing === "overstock")
                        ? (row) =>
                            openCreate({
                              id: row.articleId,
                              name: row.name,
                              unitOfMeasure: row.unitOfMeasure,
                            })
                        : undefined
                    }
                    trailing={(row) => {
                      if (clearing === "purchase") {
                        return `Comprar ${formatInventoryQty(row.qtyToBuy)}`
                      }
                      if (clearing === "recommend" && row.suggestedMin != null) {
                        const maxLabel =
                          row.suggestedMax != null
                            ? ` · techo ${formatInventoryQty(row.suggestedMax)}`
                            : ""
                        return `Mín. ${row.minLevel != null ? formatInventoryQty(row.minLevel) : "—"} → ${formatInventoryQty(row.suggestedMin)}${maxLabel}`
                      }
                      if (row.qtyToBuy > 0) {
                        return `Comprar ${formatInventoryQty(row.qtyToBuy)}`
                      }
                      return null
                    }}
                  />
                )}
              </DataWorkspaceBlocksSection>
            </div>
          )}
        </div>
      </DataWorkspaceModuleLayout>

      <div className="inventory-purchase-print hidden print:block" aria-hidden>
        <h1 className={dataWorkspaceEntityCardTitleClass}>Lista de compra</h1>
        <p className="mt-1 mb-4 font-canopy text-xs text-[var(--rootsy-bruma-500)]">
          {popName || "Punto de venta"}
        </p>
        <table>
          <thead>
            <tr>
              <th>Artículo</th>
              <th>Hay</th>
              <th>Mínimo</th>
              <th>Comprar</th>
            </tr>
          </thead>
          <tbody>
            {articleRows
              .filter((row) => row.qtyToBuy > 0)
              .map((row) => (
                <tr key={row.articleId}>
                  <td>{row.name}</td>
                  <td>{formatInventoryQty(row.onHand)}</td>
                  <td>
                    {row.minLevel != null
                      ? formatInventoryQty(row.minLevel)
                      : "—"}
                  </td>
                  <td>{formatInventoryQty(row.qtyToBuy)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <InventoryAdjustmentDialog
        open={createOpen}
        popId={popId}
        onOpenChange={setCreateOpen}
        articleId={createArticleId}
        articleName={createArticleName}
        unitOfMeasure={createUnitOfMeasure}
        onArticleChange={(article) => {
          setCreateArticleId(article.id)
          setCreateArticleName(article.name)
          setCreateUnitOfMeasure(article.unitOfMeasure)
        }}
        addStock={createAddStock}
        onAddStockChange={setCreateAddStock}
        locations={locations}
        locationId={createLocationId || defaultLocationId}
        onLocationChange={setCreateLocationId}
        qty={createQty}
        onQtyChange={setCreateQty}
        note={createNote}
        onNoteChange={setCreateNote}
        expiresAt={createExpiresAt}
        onExpiresAtChange={setCreateExpiresAt}
        onHand={createOnHand}
        stockLoading={createStockLoading}
        stockError={createStockError}
        banner={createBanner}
        saving={createSaving}
        onSubmit={(e) => void submitCreate(e)}
      />

      <InventoryLayerExpiryDialog
        open={expiryLayer != null}
        layer={expiryLayer}
        banner={expiryBanner}
        saving={expirySaving}
        onOpenChange={(open) => {
          if (!open) setExpiryLayer(null)
        }}
        onSubmit={(input) => void submitExpiry(input)}
      />

      <InventoryTransferDialog
        open={transferOpen}
        popId={popId}
        locations={locations}
        onOpenChange={setTransferOpen}
        articleId={transferArticleId}
        articleName={transferArticleName}
        unitOfMeasure={transferUnit}
        onArticleChange={(article) => {
          setTransferArticleId(article.id)
          setTransferArticleName(article.name)
          setTransferUnit(article.unitOfMeasure)
        }}
        fromLocationId={transferFromId}
        toLocationId={transferToId}
        onFromLocationChange={setTransferFromId}
        onToLocationChange={setTransferToId}
        qty={transferQty}
        onQtyChange={setTransferQty}
        onHand={transferOnHand}
        stockLoading={transferStockLoading}
        stockError={transferStockError}
        banner={transferBanner}
        saving={transferSaving}
        onGoLocations={() => {
          setTransferOpen(false)
          goClearing("locations")
        }}
        onSubmit={(e) => void submitTransfer(e)}
      />

      <InventoryDeleteMovementDialog
        open={deleteRow !== null}
        banner={deleteBanner}
        busy={deleteBusy}
        onClose={() => {
          setDeleteRow(null)
          setDeleteBanner(null)
        }}
        onConfirm={() => void submitDelete()}
      />
    </>
  )
}

function InventoryInfiniteArticleList({
  rows,
  loading,
  hasMore,
  fetchingMore,
  onLoadMore,
  empty,
  trailing,
  onRowClick,
}: {
  rows: InventoryArticleRow[]
  loading: boolean
  hasMore: boolean
  fetchingMore: boolean
  onLoadMore: () => void
  empty: string
  trailing?: (row: InventoryArticleRow) => ReactNode
  onRowClick?: (row: InventoryArticleRow) => void
}) {
  const setSentinel = useInventoryInfiniteSentinel(
    hasMore && !fetchingMore,
    onLoadMore,
  )

  if (loading && rows.length === 0) {
    return <p className={dataWorkspaceBlocksEmptyStateClass}>Cargando…</p>
  }

  return (
    <div className="space-y-1">
      <InventoryArticleRowList
        rows={rows}
        empty={empty}
        trailing={trailing}
        onRowClick={onRowClick}
      />
      {rows.length > 0 ? (
        <>
          <div ref={setSentinel} className="h-px w-full" aria-hidden />
          <InventoryListStatus
            hasItems
            hasMore={hasMore}
            fetchingMore={fetchingMore}
          />
        </>
      ) : null}
    </div>
  )
}

function InventoryMovementsTable({
  movements,
  loading,
  hasMore,
  fetchingMore,
  onLoadMore,
  canDelete,
  onDelete,
}: {
  movements: InventoryMovementRow[]
  loading: boolean
  hasMore: boolean
  fetchingMore: boolean
  onLoadMore: () => void
  canDelete: boolean
  onDelete: (row: InventoryMovementRow) => void
}) {
  const setSentinel = useInventoryInfiniteSentinel(
    hasMore && !fetchingMore,
    onLoadMore,
  )

  if (loading && movements.length === 0) {
    return (
      <p className={dataWorkspaceBlocksEmptyStateClass}>Cargando…</p>
    )
  }

  if (movements.length === 0) {
    return (
      <p className={dataWorkspaceBlocksEmptyStateClass}>
        Todavía no hay movimientos de stock.
      </p>
    )
  }

  return (
    <div
      className={cn(
        dataWorkspaceEntityCardLosetaSurfaceClass,
        "overflow-x-auto",
      )}
    >
      <Table>
        <TableHeader>
          <TableRow className="border-[var(--rootsy-bruma-200)] hover:bg-transparent">
            <TableHead>Fecha</TableHead>
            <TableHead>Artículo</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-right">Cantidad</TableHead>
            <TableHead>Nota</TableHead>
            <TableHead>Usuario</TableHead>
            {canDelete ? <TableHead className="w-[72px]" /> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.map((movement) => (
            <TableRow
              key={movement.id}
              className="border-[var(--rootsy-bruma-200)] hover:bg-[var(--rootsy-bruma-50)]"
            >
              <TableCell className="whitespace-nowrap text-[var(--rootsy-bruma-500)]">
                {formatLocaleDateTime(movement.createdAt)}
              </TableCell>
              <TableCell className="font-medium text-[var(--rootsy-bruma-900)]">
                {movement.articleName}
              </TableCell>
              <TableCell className="text-[var(--rootsy-bruma-500)]">
                {INVENTORY_MOVEMENT_LABELS[movement.movementType] ??
                  movement.movementType}
              </TableCell>
              <TableCell
                className={cn(
                  "text-right font-numeric tabular-nums",
                  movement.quantityDelta < 0
                    ? "text-destructive"
                    : "text-[var(--rootsy-savia-800)]",
                )}
              >
                {movement.quantityDelta > 0 ? "+" : ""}
                {formatInventoryQty(movement.quantityDelta)}
              </TableCell>
              <TableCell
                className="max-w-[160px] truncate text-[var(--rootsy-bruma-500)]"
                title={movement.note}
              >
                {movement.note || "—"}
              </TableCell>
              <TableCell
                className="text-[var(--rootsy-bruma-500)]"
                title={movement.createdBy ?? undefined}
              >
                {shortInventoryUserId(movement.createdBy)}
              </TableCell>
              {canDelete ? (
                <TableCell className="text-right">
                  <DataWorkspaceTableIconAction
                    label="Eliminar movimiento"
                    icon={Trash2}
                    variant="destructive"
                    onClick={() => onDelete(movement)}
                  />
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div ref={setSentinel} className="h-px w-full" aria-hidden />
      <InventoryListStatus
        hasItems
        hasMore={hasMore}
        fetchingMore={fetchingMore}
      />
    </div>
  )
}

function InventoryLedgerSections({
  popId,
  tab,
}: {
  popId: string
  tab: LedgerTab
}) {
  const layersQuery = usePopInventoryLedgerLayers(popId, {
    enabled: tab === "layers",
  })
  const allocationsQuery = usePopInventoryLedgerAllocations(popId, {
    enabled: tab === "allocations",
  })
  const fetchMoreLayers = layersQuery.fetchNextPage
  const canFetchMoreLayers =
    Boolean(layersQuery.hasNextPage) && !layersQuery.isFetchingNextPage
  const loadMoreLayers = useCallback(() => {
    if (!canFetchMoreLayers) return
    void fetchMoreLayers()
  }, [canFetchMoreLayers, fetchMoreLayers])
  const fetchMoreAllocations = allocationsQuery.fetchNextPage
  const canFetchMoreAllocations =
    Boolean(allocationsQuery.hasNextPage) &&
    !allocationsQuery.isFetchingNextPage
  const loadMoreAllocations = useCallback(() => {
    if (!canFetchMoreAllocations) return
    void fetchMoreAllocations()
  }, [canFetchMoreAllocations, fetchMoreAllocations])
  const setLayersSentinel = useInventoryInfiniteSentinel(
    canFetchMoreLayers,
    loadMoreLayers,
  )
  const setAllocationsSentinel = useInventoryInfiniteSentinel(
    canFetchMoreAllocations,
    loadMoreAllocations,
  )
  const costLayers = layersQuery.costLayers
  const layerAllocations = allocationsQuery.layerAllocations
  const error =
    tab === "layers" ? layersQuery.errorMessage : allocationsQuery.errorMessage

  return (
    <div className="space-y-3">
      {error ? (
        <RootsBanner intent="danger" layout="message" message={error} />
      ) : null}
      {tab === "layers" ? (
      <div className="space-y-3">
        <p className="max-w-2xl font-canopy text-xs text-[var(--rootsy-bruma-500)]">
          Cada ingreso con costo deja una capa. Se consume primero lo que
          vence antes; si no hay fecha, el más antiguo.
        </p>
        <div
          className={cn(
            dataWorkspaceEntityCardLosetaSurfaceClass,
            "overflow-x-auto",
          )}
        >
          <Table>
            <TableHeader>
              <TableRow className="border-[var(--rootsy-bruma-200)] hover:bg-transparent">
                <TableHead>Artículo</TableHead>
                <TableHead className="text-right">Recibido</TableHead>
                <TableHead className="text-right">Restante</TableHead>
                <TableHead className="text-right">Costo unit.</TableHead>
                <TableHead>Ingreso</TableHead>
                <TableHead>Vence</TableHead>
                <TableHead>Origen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {costLayers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-10 text-center text-[var(--rootsy-bruma-500)]"
                  >
                    {layersQuery.isPending
                      ? "Cargando…"
                      : "Todavía no hay capas. Aparecen al ingresar compras con costo."}
                  </TableCell>
                </TableRow>
              ) : (
                costLayers.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-[var(--rootsy-bruma-200)] hover:bg-[var(--rootsy-bruma-50)]"
                  >
                    <TableCell className="font-medium text-[var(--rootsy-bruma-900)]">
                      {row.articleName}
                    </TableCell>
                    <TableCell className="text-right font-numeric tabular-nums">
                      {formatInventoryQty(row.quantityReceived)}
                    </TableCell>
                    <TableCell className="text-right font-numeric tabular-nums">
                      {formatInventoryQty(row.quantityRemaining)}
                    </TableCell>
                    <TableCell className="text-right font-numeric text-sm tabular-nums">
                      {formatInventoryMoney(row.unitCost)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-[var(--rootsy-bruma-500)]">
                      {formatLocaleDateTime(row.receivedAt)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-[var(--rootsy-bruma-500)]">
                      {row.expiresAt
                        ? formatInventoryExpiryDate(row.expiresAt)
                        : "—"}
                    </TableCell>
                    <TableCell className="text-xs text-[var(--rootsy-bruma-500)]">
                      {row.sourceMovementId
                        ? shortInventoryUuid(row.sourceMovementId)
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div ref={setLayersSentinel} className="h-px w-full" aria-hidden />
          <InventoryListStatus
            hasItems={costLayers.length > 0}
            hasMore={Boolean(layersQuery.hasNextPage)}
            fetchingMore={layersQuery.isFetchingNextPage}
          />
        </div>
      </div>
      ) : (
      <div className="space-y-3">
        <p className="max-w-2xl font-canopy text-xs text-[var(--rootsy-bruma-500)]">
          Porción tomada de una capa al registrar una salida.
        </p>
        <div
          className={cn(
            dataWorkspaceEntityCardLosetaSurfaceClass,
            "overflow-x-auto",
          )}
        >
          <Table>
            <TableHeader>
              <TableRow className="border-[var(--rootsy-bruma-200)] hover:bg-transparent">
                <TableHead>Fecha</TableHead>
                <TableHead>Artículo</TableHead>
                <TableHead className="text-right">Cant.</TableHead>
                <TableHead className="text-right">Costo unit.</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
                <TableHead>Capa</TableHead>
                <TableHead>Tipo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {layerAllocations.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-10 text-center text-[var(--rootsy-bruma-500)]"
                  >
                    {allocationsQuery.isPending
                      ? "Cargando…"
                      : "Sin imputaciones todavía."}
                  </TableCell>
                </TableRow>
              ) : (
                layerAllocations.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-[var(--rootsy-bruma-200)] hover:bg-[var(--rootsy-bruma-50)]"
                  >
                    <TableCell className="whitespace-nowrap text-sm text-[var(--rootsy-bruma-500)]">
                      {formatLocaleDateTime(row.createdAt)}
                    </TableCell>
                    <TableCell className="font-medium text-[var(--rootsy-bruma-900)]">
                      {row.articleName}
                    </TableCell>
                    <TableCell className="text-right font-numeric tabular-nums">
                      {formatInventoryQty(row.quantity)}
                    </TableCell>
                    <TableCell className="text-right font-numeric text-sm tabular-nums">
                      {formatInventoryMoney(row.unitCost)}
                    </TableCell>
                    <TableCell className="text-right font-numeric text-sm tabular-nums">
                      {formatInventoryMoney(row.lineCost)}
                    </TableCell>
                    <TableCell className="text-xs text-[var(--rootsy-bruma-500)]">
                      {shortInventoryUuid(row.layerId)}
                    </TableCell>
                    <TableCell className="text-sm text-[var(--rootsy-bruma-500)]">
                      {row.movementType
                        ? INVENTORY_MOVEMENT_LABELS[row.movementType] ??
                          row.movementType
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div ref={setAllocationsSentinel} className="h-px w-full" aria-hidden />
          <InventoryListStatus
            hasItems={layerAllocations.length > 0}
            hasMore={Boolean(allocationsQuery.hasNextPage)}
            fetchingMore={allocationsQuery.isFetchingNextPage}
          />
        </div>
      </div>
      )}
    </div>
  )
}
