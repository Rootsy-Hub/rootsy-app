"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  selectColumnInnerClass,
  tableChromeFooterClass,
  tableRowSelectCheckboxClass,
  thBase,
  toolbarBlockLabelClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { cn } from "@/lib/utils"
import { popScopedHref } from "@/lib/popRoutes"
import { layoutPreviewShellCard } from "./layoutPreviewDashboards"
import { buildPaginationItems } from "./layoutPreviewPagination"
import {
  LAYOUT_PREVIEW_PAGE_SIZE,
  LAYOUT_PREVIEW_PAGE_SIZE_OPTIONS,
  LAYOUT_PREVIEW_REF_TABLE_OPTIONS,
  LAYOUT_PREVIEW_TOTAL_COUNT,
  layoutPreviewRowAt,
  type LayoutPreviewListRow,
  type LayoutPreviewListStatus,
} from "./layoutPreviewListMock"
import {
  CalendarRange,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  Filter,
  MoreVertical,
  Paperclip,
  Pencil,
  Search,
  Trash2,
  X,
} from "lucide-react"
import {
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
  subDays,
} from "date-fns"
import { es as esLocale } from "date-fns/locale"
import Link from "next/link"
import type { DateRange } from "react-day-picker"
import { useEffect, useId, useMemo, useState } from "react"

/** Superficie siempre clara (isla light) para el bloque de fecha. */
const dateFilterCardClass =
  "rounded-2xl border border-zinc-200 bg-white text-zinc-900 shadow-sm"

const dateFilterToolbarLabelClass =
  "text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500"

const dateFilterTriggerClass =
  "mt-2 h-auto min-h-9 w-full max-w-full justify-between gap-2 border-zinc-200 bg-zinc-50 px-3 py-2 text-left text-sm font-normal text-zinc-900 shadow-sm hover:bg-zinc-100/90"

const datePopoverContentClass =
  "border border-zinc-200/90 bg-white p-0 text-zinc-900 shadow-xl shadow-zinc-900/8"

/** Calendario dentro del popover: isla clara; anula tokens dark del `Button` interno. */
const dateCalendarLightClass = cn(
  "rounded-xl border border-zinc-100 bg-white p-1.5 shadow-inner shadow-zinc-900/5",
  "[&_[data-slot=calendar]]:w-full [&_[data-slot=calendar]]:max-w-none",
  "[&_.rdp-root]:!w-full [&_.rdp-root]:max-w-none",
  "[&_.rdp-month]:w-full min-w-0",
  "[&_.rdp-month_grid]:w-full [&_.rdp-month_grid]:table-fixed",
  "[&_button[data-day]]:!text-zinc-800 dark:[&_button[data-day]]:!text-zinc-800",
  "[&_button[data-day]>span]:!opacity-100 [&_button[data-day]>span]:!text-inherit",
  "[&_button[data-day]:not([data-range-start=true]):not([data-range-end=true]):not([data-selected-single=true]):not([data-range-middle=true]):hover]:!bg-zinc-100",
  "[&_button[data-day]:not([data-range-start=true]):not([data-range-end=true]):not([data-selected-single=true]):not([data-range-middle=true]):hover]:!text-zinc-900",
  "[&_button[data-day][data-range-start=true]:hover]:!bg-emerald-700 [&_button[data-day][data-range-start=true]:hover]:!text-white",
  "[&_button[data-day][data-range-end=true]:hover]:!bg-emerald-700 [&_button[data-day][data-range-end=true]:hover]:!text-white",
  "[&_button[data-day][data-selected-single=true]:hover]:!bg-emerald-700 [&_button[data-day][data-selected-single=true]:hover]:!text-white",
  "[&_button[data-day][data-range-middle=true]:hover]:!bg-emerald-200 [&_button[data-day][data-range-middle=true]:hover]:!text-zinc-900",
  "[&_button[data-day][data-selected-single=true]]:!bg-emerald-600 [&_button[data-day][data-selected-single=true]]:!text-white",
  "[&_button[data-day][data-range-start=true]]:!bg-emerald-600 [&_button[data-day][data-range-start=true]]:!text-white",
  "[&_button[data-day][data-range-end=true]]:!bg-emerald-600 [&_button[data-day][data-range-end=true]]:!text-white",
  "[&_button[data-day][data-range-middle=true]]:!bg-emerald-100 [&_button[data-day][data-range-middle=true]]:!text-zinc-800",
  "[&_.rdp-button_previous]:!text-zinc-700 [&_.rdp-button_next]:!text-zinc-700",
  "[&_.rdp-weekday]:!text-zinc-500",
  "[&_.rdp-caption_label]:!text-zinc-900",
  "[&_td.rdp-outside_button[data-day]]:!text-zinc-400",
  "[&_td.rdp-disabled_button[data-day]]:!text-zinc-300",
)

/** Tipografía tabular/mono solo para importes y, si hubiera, porcentajes en cifra. */
const amountFigureClass = "font-mono tabular-nums"

const ALL_STATUSES: LayoutPreviewListStatus[] = [
  "activo",
  "pendiente",
  "vencido",
]

const STATUS_LABEL: Record<LayoutPreviewListStatus, string> = {
  activo: "Activo",
  pendiente: "Pendiente",
  vencido: "Vencido",
}

function initStatusSet() {
  return new Set<LayoutPreviewListStatus>(ALL_STATUSES)
}

function initRefTableSet() {
  return new Set<string>(LAYOUT_PREVIEW_REF_TABLE_OPTIONS)
}

function formatIsoDateShort(iso: string) {
  const [y, m, d] = iso.split("-").map(Number)
  if (!y || !m || !d) return iso
  return new Date(y, m - 1, d).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export type LayoutPreviewDatePreset =
  | "all"
  | "this_week"
  | "this_month"
  | "last_7"
  | "last_30"
  | "custom"

function toISODateLocal(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function computeDateBounds(
  preset: LayoutPreviewDatePreset,
  custom: DateRange | undefined,
): { from: string | null; to: string | null } {
  const today = new Date()
  switch (preset) {
    case "all":
      return { from: null, to: null }
    case "this_week": {
      const from = startOfWeek(today, { weekStartsOn: 1 })
      const to = endOfWeek(today, { weekStartsOn: 1 })
      return { from: toISODateLocal(from), to: toISODateLocal(to) }
    }
    case "this_month": {
      const from = startOfMonth(today)
      const to = endOfMonth(today)
      return { from: toISODateLocal(from), to: toISODateLocal(to) }
    }
    case "last_7": {
      const from = subDays(today, 6)
      return { from: toISODateLocal(from), to: toISODateLocal(today) }
    }
    case "last_30": {
      const from = subDays(today, 29)
      return { from: toISODateLocal(from), to: toISODateLocal(today) }
    }
    case "custom": {
      if (!custom?.from || !custom?.to) return { from: null, to: null }
      let a = custom.from
      let b = custom.to
      if (a > b) [a, b] = [b, a]
      return { from: toISODateLocal(a), to: toISODateLocal(b) }
    }
  }
}

const DATE_QUICK_PRESETS: {
  id: Exclude<LayoutPreviewDatePreset, "all" | "custom">
  label: string
}[] = [
  { id: "this_week", label: "Esta semana" },
  { id: "this_month", label: "Este mes" },
  { id: "last_7", label: "Últimos 7 días" },
  { id: "last_30", label: "Últimos 30 días" },
]

function productImageSrc(seed: string) {
  return `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(seed)}&backgroundColor=e8f5ef`
}

function formatArs(n: number) {
  return n.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })
}

function StatusBadge({ status }: { status: LayoutPreviewListStatus }) {
  const map: Record<LayoutPreviewListStatus, string> = {
    activo: "border-emerald-500/35 bg-emerald-500/10 text-emerald-900",
    pendiente: "border-amber-500/35 bg-amber-500/10 text-amber-900",
    vencido: "border-red-500/35 bg-red-500/10 text-red-900",
  }
  const label: Record<LayoutPreviewListStatus, string> = {
    activo: "Activo",
    pendiente: "Pendiente",
    vencido: "Vencido",
  }
  return (
    <Badge variant="outline" className={cn("font-medium", map[status])}>
      {label[status]}
    </Badge>
  )
}

function RowMoreMenu({ rowId }: { rowId: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
          aria-label={`Más opciones fila ${rowId}`}
        >
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem className="gap-2">
          <Copy className="size-4" aria-hidden />
          Duplicar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function LayoutPreviewListTable({
  siteId,
  popId,
}: {
  siteId: string
  popId: string
}) {
  const pageSizeLabelId = useId()
  const searchInputId = useId()
  const [pageSize, setPageSize] = useState(LAYOUT_PREVIEW_PAGE_SIZE)
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Set<string>>(() => new Set())

  const [searchQuery, setSearchQuery] = useState("")
  const [datePreset, setDatePreset] =
    useState<LayoutPreviewDatePreset>("all")
  const [customDateRange, setCustomDateRange] = useState<
    DateRange | undefined
  >(undefined)
  const [datePopoverOpen, setDatePopoverOpen] = useState(false)
  const [includedStatuses, setIncludedStatuses] = useState(initStatusSet)
  const [includedRefTables, setIncludedRefTables] = useState(initRefTableSet)

  const [filtersModalOpen, setFiltersModalOpen] = useState(false)
  const [draftStatuses, setDraftStatuses] = useState(initStatusSet)
  const [draftRefTables, setDraftRefTables] = useState(initRefTableSet)

  const dateBounds = useMemo(
    () => computeDateBounds(datePreset, customDateRange),
    [datePreset, customDateRange],
  )

  const filteredIndices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    const out: number[] = []
    const df = dateBounds.from
    const dt = dateBounds.to
    for (let i = 0; i < LAYOUT_PREVIEW_TOTAL_COUNT; i++) {
      const row = layoutPreviewRowAt(i)
      if (
        q &&
        !row.title.toLowerCase().includes(q) &&
        !row.refCode.toLowerCase().includes(q)
      ) {
        continue
      }
      if (!includedStatuses.has(row.status)) continue
      if (!includedRefTables.has(row.refTable)) continue
      if (df && row.issuedAt < df) continue
      if (dt && row.issuedAt > dt) continue
      out.push(i)
    }
    return out
  }, [searchQuery, includedStatuses, includedRefTables, dateBounds])

  const filteredTotal = filteredIndices.length

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredTotal / pageSize)),
    [filteredTotal, pageSize],
  )

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages))
  }, [totalPages])

  useEffect(() => {
    setPage(1)
  }, [
    searchQuery,
    includedStatuses,
    includedRefTables,
    dateBounds.from,
    dateBounds.to,
    pageSize,
  ])

  const currentPage = Math.min(Math.max(1, page), totalPages)

  const pageRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    const slice = filteredIndices.slice(start, start + pageSize)
    return slice.map((i) => layoutPreviewRowAt(i))
  }, [filteredIndices, currentPage, pageSize])

  const visibleIds = useMemo(() => pageRows.map((r) => r.id), [pageRows])

  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selected.has(id))
  const someVisibleSelected = visibleIds.some((id) => selected.has(id))

  const rangeLabel = useMemo(() => {
    if (filteredTotal === 0) return { start: 0, end: 0 }
    const start = (currentPage - 1) * pageSize + 1
    const end = Math.min(currentPage * pageSize, filteredTotal)
    return { start, end }
  }, [currentPage, pageSize, filteredTotal])

  const paginationItems = useMemo(
    () => buildPaginationItems(totalPages, currentPage),
    [totalPages, currentPage],
  )

  const totalCountLabel = filteredTotal.toLocaleString("es-AR")

  const statusFilterNarrow =
    includedStatuses.size < ALL_STATUSES.length
  const refFilterNarrow =
    includedRefTables.size < LAYOUT_PREVIEW_REF_TABLE_OPTIONS.length

  const hasFilterChips =
    searchQuery.trim().length > 0 ||
    statusFilterNarrow ||
    refFilterNarrow ||
    datePreset !== "all"

  const dateFilterSummary = useMemo(() => {
    if (datePreset === "all") return "Todas las fechas"
    if (datePreset === "this_week") return "Esta semana"
    if (datePreset === "this_month") return "Este mes"
    if (datePreset === "last_7") return "Últimos 7 días"
    if (datePreset === "last_30") return "Últimos 30 días"
    if (
      datePreset === "custom" &&
      dateBounds.from &&
      dateBounds.to
    ) {
      return `${formatIsoDateShort(dateBounds.from)} – ${formatIsoDateShort(dateBounds.to)}`
    }
    return "Rango personalizado (elegí inicio y fin)"
  }, [datePreset, dateBounds.from, dateBounds.to])

  const applyFiltersFromModal = () => {
    setIncludedStatuses(new Set(draftStatuses))
    setIncludedRefTables(new Set(draftRefTables))
    setFiltersModalOpen(false)
  }

  const resetModalDraft = () => {
    setDraftStatuses(initStatusSet())
    setDraftRefTables(initRefTableSet())
  }

  const toggleDraftStatus = (s: LayoutPreviewListStatus) => {
    setDraftStatuses((prev) => {
      const next = new Set(prev)
      if (next.has(s)) {
        if (next.size <= 1) return prev
        next.delete(s)
      } else {
        next.add(s)
      }
      return next
    })
  }

  const toggleDraftRef = (t: string) => {
    setDraftRefTables((prev) => {
      const next = new Set(prev)
      if (next.has(t)) {
        if (next.size <= 1) return prev
        next.delete(t)
      } else {
        next.add(t)
      }
      return next
    })
  }

  const removeStatusChip = (s: LayoutPreviewListStatus) => {
    setIncludedStatuses((prev) => {
      const next = new Set(prev)
      if (next.size <= 1) return prev
      next.delete(s)
      return next
    })
  }

  const removeRefChip = (t: string) => {
    setIncludedRefTables((prev) => {
      const next = new Set(prev)
      if (next.size <= 1) return prev
      next.delete(t)
      return next
    })
  }

  const clearDateFilter = () => {
    setDatePreset("all")
    setCustomDateRange(undefined)
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col gap-6">
      <div className="flex shrink-0 flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-12">
        <div
          className={cn(
            dateFilterCardClass,
            "w-full min-w-0 px-4 py-3 md:col-span-1 xl:col-span-3",
          )}
        >
          <p className={dateFilterToolbarLabelClass}>Fecha</p>
          <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  dateFilterTriggerClass,
                  "min-w-0 max-w-full shadow-xs",
                )}
                aria-expanded={datePopoverOpen}
                aria-label="Filtro por fecha"
                title={dateFilterSummary}
              >
                <span className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                  <CalendarRange
                    className="size-4 shrink-0 text-zinc-500"
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 truncate text-left text-sm text-zinc-900">
                    {dateFilterSummary}
                  </span>
                </span>
                <ChevronDown className="size-4 shrink-0 text-zinc-500" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              sideOffset={6}
              className={cn(
                "z-50 overflow-hidden rounded-xl p-0",
                "w-[min(21.5rem,calc(100vw-1.5rem))] max-w-[calc(100vw-1.5rem)]",
                datePopoverContentClass,
              )}
            >
              <div className="overflow-x-hidden">
                <div className="border-b border-zinc-100 px-2 py-2">
                  <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                    Atajos
                  </p>
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        clearDateFilter()
                        setDatePopoverOpen(false)
                      }}
                      className={cn(
                        "w-full rounded-lg px-2.5 py-2 text-left text-sm text-zinc-800 transition-colors",
                        "hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-emerald-600/40",
                        datePreset === "all" &&
                          "bg-zinc-100 font-medium text-zinc-950",
                      )}
                    >
                      Todas las fechas
                    </button>
                    {DATE_QUICK_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setDatePreset(p.id)
                          setCustomDateRange(undefined)
                          setDatePopoverOpen(false)
                        }}
                        className={cn(
                          "w-full rounded-lg px-2.5 py-2 text-left text-sm text-zinc-800 transition-colors",
                          "hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-emerald-600/40",
                          datePreset === p.id &&
                            "bg-zinc-100 font-medium text-zinc-950",
                        )}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="min-w-0 px-2.5 pb-3 pt-2">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                    Rango personalizado
                  </p>
                  <div className={dateCalendarLightClass}>
                    <Calendar
                      locale={esLocale}
                      mode="range"
                      numberOfMonths={1}
                      className="w-full min-w-0 bg-transparent p-0 [--cell-size:2.125rem]"
                      selected={
                        datePreset === "custom"
                          ? customDateRange
                          : undefined
                      }
                      onSelect={(range) => {
                        setDatePreset("custom")
                        setCustomDateRange(range)
                      }}
                      defaultMonth={
                        customDateRange?.from ??
                        customDateRange?.to ??
                        new Date()
                      }
                    />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div
          className={cn(
            layoutPreviewShellCard,
            "flex flex-col px-4 py-3 md:col-span-1 xl:col-span-3",
          )}
        >
          <p className={toolbarBlockLabelClass}>Filtros</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2 h-9 w-full gap-2 border-border/60 bg-muted/20 shadow-sm dark:bg-background/30"
            onClick={() => setFiltersModalOpen(true)}
          >
            <Filter className="size-4" aria-hidden />
            Configurar
          </Button>
        </div>

        <div
          className={cn(
            layoutPreviewShellCard,
            "min-w-0 px-4 py-3 md:col-span-2 xl:col-span-6",
          )}
        >
          <p className={toolbarBlockLabelClass}>Buscar</p>
          <div className="relative mt-2 min-w-0">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              id={searchInputId}
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Título o referencia…"
              className="h-9 border-border/60 bg-muted/25 pl-9 shadow-none dark:bg-background/40"
              aria-label="Buscar en el listado"
            />
          </div>
        </div>
      </div>

      {hasFilterChips ? (
        <div className={cn(layoutPreviewShellCard, "px-4 py-3")}>
          <p className={toolbarBlockLabelClass}>Filtros aplicados</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {searchQuery.trim() ? (
              <Badge
                variant="secondary"
                className="max-w-full gap-1 border-border/50 py-0 pr-0.5 font-normal"
              >
                <span className="truncate">Buscar: «{searchQuery.trim()}»</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-6 shrink-0"
                  onClick={() => setSearchQuery("")}
                  aria-label="Quitar búsqueda"
                >
                  <X className="size-3" />
                </Button>
              </Badge>
            ) : null}
            {statusFilterNarrow
              ? ALL_STATUSES.filter((s) => includedStatuses.has(s)).map(
                  (s) => (
                    <Badge
                      key={s}
                      variant="secondary"
                      className="gap-1 border-border/50 py-0 pr-0.5 font-normal"
                    >
                      {STATUS_LABEL[s]}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-6 shrink-0"
                        onClick={() => removeStatusChip(s)}
                        aria-label={`Quitar estado ${STATUS_LABEL[s]}`}
                      >
                        <X className="size-3" />
                      </Button>
                    </Badge>
                  ),
                )
              : null}
            {refFilterNarrow
              ? LAYOUT_PREVIEW_REF_TABLE_OPTIONS.filter((t) =>
                  includedRefTables.has(t),
                ).map((t) => (
                  <Badge
                    key={t}
                    variant="secondary"
                    className="max-w-[12rem] gap-1 border-border/50 py-0 pr-0.5 font-normal"
                  >
                    <span className="truncate">{t}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-6 shrink-0"
                      onClick={() => removeRefChip(t)}
                      aria-label={`Quitar filtro ${t}`}
                    >
                      <X className="size-3" />
                    </Button>
                  </Badge>
                ))
              : null}
            {datePreset !== "all" ? (
              <Badge
                variant="secondary"
                className="max-w-full gap-1 border-border/50 py-0 pr-0.5 font-normal"
              >
                <span className="truncate">Fecha: {dateFilterSummary}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-6 shrink-0"
                  onClick={clearDateFilter}
                  aria-label="Quitar filtro de fecha"
                >
                  <X className="size-3" />
                </Button>
              </Badge>
            ) : null}
          </div>
        </div>
      ) : null}
      </div>

      <Dialog
        open={filtersModalOpen}
        onOpenChange={(open) => {
          if (open) {
            setDraftStatuses(new Set(includedStatuses))
            setDraftRefTables(new Set(includedRefTables))
          }
          setFiltersModalOpen(open)
        }}
      >
        <DialogContent className="gap-0 sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle>Filtros</DialogTitle>
            <DialogDescription>
              Elegí estados y tipo de referencia. Los cambios se aplican al
              confirmar.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="grid gap-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Estado
              </Label>
              <div className="flex flex-col gap-2">
                {ALL_STATUSES.map((s) => (
                  <label
                    key={s}
                    className="flex cursor-pointer items-center gap-2 rounded-md border border-transparent px-1 py-0.5 hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={draftStatuses.has(s)}
                      onCheckedChange={() => toggleDraftStatus(s)}
                      aria-label={STATUS_LABEL[s]}
                    />
                    <span className="text-sm">{STATUS_LABEL[s]}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Referencia (entidad)
              </Label>
              <div className="flex flex-col gap-2">
                {LAYOUT_PREVIEW_REF_TABLE_OPTIONS.map((t) => (
                  <label
                    key={t}
                    className="flex cursor-pointer items-center gap-2 rounded-md border border-transparent px-1 py-0.5 hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={draftRefTables.has(t)}
                      onCheckedChange={() => toggleDraftRef(t)}
                      aria-label={t}
                    />
                    <span className="text-sm">{t}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={resetModalDraft}
            >
              Restablecer
            </Button>
            <Button type="button" onClick={applyFiltersFromModal}>
              Aplicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div
        className={cn(
          "relative flex min-h-0 flex-1 flex-col overflow-hidden",
          layoutPreviewShellCard,
        )}
      >
        <div
          className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-primary/10 blur-3xl"
          aria-hidden
        />
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      {selected.size > 0 ? (
        <div
          className="flex flex-wrap items-center gap-2 border-b border-border/80 bg-muted/35 px-3 py-2.5 sm:px-4"
          role="region"
          aria-label="Acciones sobre selección"
        >
          <span className="text-sm text-foreground">
            <span className="font-semibold">
              {selected.size}
            </span>{" "}
            <span className="text-muted-foreground">seleccionados</span>
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" size="sm" variant="outline" className="h-8">
              Eliminar selección
            </Button>
            <Button type="button" size="sm" variant="outline" className="h-8">
              Exportar CSV
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 text-muted-foreground"
              onClick={() => setSelected(new Set())}
            >
              Limpiar
            </Button>
          </div>
        </div>
      ) : null}

      <div className="rootsy-scroll-minimal min-h-0 flex-1 overflow-auto">
        <table
          className={cn(
            "relative w-full min-w-[56rem] table-fixed caption-bottom text-sm",
          )}
        >
          <TableHeader>
            <TableRow className="border-0 hover:bg-transparent">
              <TableHead
                className={cn(thBase, "w-12 !px-0 text-center")}
              >
                <div
                  className={cn(selectColumnInnerClass, "min-h-10")}
                >
                  <Checkbox
                    className={tableRowSelectCheckboxClass}
                    checked={
                      allVisibleSelected
                        ? true
                        : someVisibleSelected
                          ? "indeterminate"
                          : false
                    }
                    onCheckedChange={(c) => {
                      setSelected((prev) => {
                        const next = new Set(prev)
                        if (c === true) {
                          visibleIds.forEach((id) => next.add(id))
                        } else {
                          visibleIds.forEach((id) => next.delete(id))
                        }
                        return next
                      })
                    }}
                    aria-label="Seleccionar todas las filas visibles"
                  />
                </div>
              </TableHead>
              <TableHead className={cn(thBase, "w-14")}>
                <span className="sr-only">Imagen</span>
              </TableHead>
              <TableHead className={cn(thBase, "min-w-48 text-left")}>
                Artículo
              </TableHead>
              <TableHead className={cn(thBase, "w-44 text-left")}>
                Referencia
              </TableHead>
              <TableHead className={cn(thBase, "w-34 text-right")}>
                Monto
              </TableHead>
              <TableHead className={cn(thBase, "w-20 text-center")}>
                Adj.
              </TableHead>
              <TableHead className={cn(thBase, "w-32 text-left")}>
                Estado
              </TableHead>
              <TableHead className={cn(thBase, "w-[7.25rem] text-right")}>
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.map((row: LayoutPreviewListRow, i) => (
              <TableRow
                key={row.id}
                className={cn(
                  "border-border/50 transition-colors",
                  i % 2 === 0
                    ? "bg-white/30"
                    : "bg-muted/25 dark:bg-muted/15",
                  "hover:bg-primary/10",
                )}
              >
                <TableCell className="w-12 !px-0 py-2 align-middle">
                  <div className={selectColumnInnerClass}>
                    <Checkbox
                      className={tableRowSelectCheckboxClass}
                      checked={selected.has(row.id)}
                      onCheckedChange={(c) => {
                        setSelected((prev) => {
                          const next = new Set(prev)
                          if (c === true) next.add(row.id)
                          else next.delete(row.id)
                          return next
                        })
                      }}
                      aria-label={`Seleccionar ${row.title}`}
                    />
                  </div>
                </TableCell>
                <TableCell className="w-14 px-2 py-2 align-middle">
                  <div className="size-11 overflow-hidden rounded-lg ring-1 ring-border">
                    <img
                      src={productImageSrc(row.imageSeed)}
                      alt=""
                      className="size-full object-cover"
                      width={44}
                      height={44}
                    />
                  </div>
                </TableCell>
                <TableCell className="min-w-0 px-3 py-2.5 align-middle">
                  <p className="truncate font-medium text-foreground">
                    {row.title}
                  </p>
                  {row.subtitle ? (
                    <p className="truncate text-xs text-muted-foreground">
                      {row.subtitle}
                    </p>
                  ) : null}
                </TableCell>
                <TableCell className="px-3 py-2.5 align-middle">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      {row.refTable}
                    </span>
                    <Link
                      href={popScopedHref(siteId, popId, row.refHref)}
                      className="group inline-flex min-w-0 items-center gap-1 text-xs font-medium text-primary underline-offset-2 hover:underline"
                    >
                      <span className="truncate">{row.refCode}</span>
                      <ExternalLink
                        className="size-3 shrink-0 opacity-60 group-hover:opacity-100"
                        aria-hidden
                      />
                    </Link>
                  </div>
                </TableCell>
                <TableCell
                  className={cn(
                    "px-3 py-2.5 text-right align-middle text-sm font-medium",
                    amountFigureClass,
                    row.amountArs < 0 ? "text-amber-800" : "text-foreground",
                  )}
                >
                  {formatArs(row.amountArs)}
                </TableCell>
                <TableCell className="px-2 py-2.5 text-center align-middle">
                  {row.attachments > 0 ? (
                    <span className="inline-flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <Paperclip
                        className="size-3.5 shrink-0 text-muted-foreground/80"
                        aria-hidden
                      />
                      {row.attachments}
                    </span>
                  ) : (
                    <span className="text-muted-foreground/50">—</span>
                  )}
                </TableCell>
                <TableCell className="px-3 py-2.5 align-middle">
                  <StatusBadge status={row.status} />
                </TableCell>
                <TableCell className="px-1 py-1.5 align-middle">
                  <div className="flex items-center justify-end gap-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-foreground"
                      aria-label={`Editar ${row.title}`}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive"
                      aria-label={`Eliminar ${row.title}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                    <RowMoreMenu rowId={row.id} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </table>
      </div>

      <div
        className={cn(
          "flex shrink-0 flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4",
          tableChromeFooterClass,
        )}
      >
        <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground dark:text-muted-foreground/90">
            <span className="text-foreground/80 dark:text-foreground/85">
              {rangeLabel.start.toLocaleString("es-AR")}
            </span>
            <span className="text-muted-foreground/60">–</span>
            <span className="text-foreground/80">
              {rangeLabel.end.toLocaleString("es-AR")}
            </span>
            <span className="normal-case"> de </span>
            <span className="font-medium text-primary dark:text-primary/90">
              {totalCountLabel}
            </span>
          </p>
          <div className="flex items-center gap-2">
            <span
              id={pageSizeLabelId}
              className="whitespace-nowrap text-[11px] font-medium uppercase tracking-wider text-muted-foreground dark:text-muted-foreground/90"
            >
              Por página
            </span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                setPageSize(Number(v))
                setPage(1)
              }}
            >
              <SelectTrigger
                size="sm"
                className="h-8 w-[4.25rem] border-border/80 bg-background/80 text-xs shadow-sm dark:border-border/60 dark:bg-background/50 dark:text-foreground/90"
                aria-labelledby={pageSizeLabelId}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="start">
                {LAYOUT_PREVIEW_PAGE_SIZE_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-1 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8 border-border/80 bg-background/80 shadow-sm dark:border-border/55 dark:bg-card/50 dark:hover:bg-accent/60"
            disabled={currentPage <= 1}
            aria-label="Página anterior"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <div
            className="flex items-center gap-1"
            role="navigation"
            aria-label="Paginación por número"
          >
            {paginationItems.map((item, idx) =>
              item === "ellipsis" ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="flex min-w-8 items-center justify-center px-1 text-xs text-muted-foreground dark:text-muted-foreground/80"
                  aria-hidden
                >
                  …
                </span>
              ) : (
                <Button
                  key={item}
                  type="button"
                  variant={currentPage === item ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "h-8 min-w-8 px-2 text-xs",
                    currentPage === item
                      ? "shadow-sm"
                      : "dark:border-border/55 dark:bg-card/40 dark:hover:bg-accent/50",
                  )}
                  aria-label={`Ir a página ${item}`}
                  aria-current={currentPage === item ? "page" : undefined}
                  onClick={() => setPage(item)}
                >
                  {item.toLocaleString("es-AR")}
                </Button>
              ),
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8 border-border/80 bg-background/80 shadow-sm dark:border-border/55 dark:bg-card/50 dark:hover:bg-accent/60"
            disabled={currentPage >= totalPages}
            aria-label="Página siguiente"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
        </div>
      </div>
    </div>
  )
}
