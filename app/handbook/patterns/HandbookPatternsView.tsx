"use client"

import { CashRegistersGridSkeleton } from "@/app/[siteId]/[popId]/cash-registers/CashRegistersGridSkeleton"
import { getHandbookDesignSystemPage } from "@/app/handbook/handbookDesignSystem"
import { LibraryDoDontPair } from "@/app/library/libraryDocPrimitives"
import {
  libraryDocBodyClass,
  libraryDocPageDescriptionClass,
  libraryDocPageTitleClass,
  libraryDocSectionTitleClass,
  handbookDocChapterClass,
} from "@/app/library/libraryColorTheme"
import { ComponentView } from "@/components/ComponentView"
import { DataWorkspaceListActiveFiltersBar } from "@/components/data-workspace/DataWorkspaceListActiveFiltersBar"
import { DataWorkspaceListBulkToolbar } from "@/components/data-workspace/DataWorkspaceListBulkToolbar"
import { DataWorkspaceListFilterChip } from "@/components/data-workspace/DataWorkspaceListFilterChip"
import {
  DataWorkspaceListFiltersDialogTrigger,
  DataWorkspaceListSearchField,
} from "@/components/data-workspace/DataWorkspaceListFilterFields"
import {
  DataWorkspaceListTableFrame,
  DataWorkspaceTableIconAction,
  DataWorkspaceTableMoney,
  WorkspaceTableStatusBadge,
} from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import { DataWorkspaceTableInfinitePageDock } from "@/components/data-workspace/DataWorkspaceTableInfinitePageDock"
import {
  DataWorkspaceTableListFiltersBar,
  DataWorkspaceTableListNatureShell,
  DataWorkspaceTableListShell,
} from "@/components/data-workspace/DataWorkspaceTableListLayout"
import { DataWorkspaceBlocksSection } from "@/components/data-workspace/DataWorkspaceBlocksSection"
import {
  dataWorkspaceBlocksEmptyStateClass,
  dataWorkspaceBlocksPageContentClass,
  dataWorkspaceBlocksPageMainClass,
  dataWorkspaceEntityCardActionFooterClass,
  dataWorkspaceEntityCardEyebrowClass,
  dataWorkspaceEntityCardHeaderClass,
  dataWorkspaceEntityCardIsotypeClass,
  dataWorkspaceEntityCardLosetaClass,
  dataWorkspaceEntityCardSaldoSectionClass,
  dataWorkspaceEntityCardStatLabelClass,
  dataWorkspaceEntityCardStatValueClass,
  dataWorkspaceEntityCardStatValueLargeClass,
  dataWorkspaceEntityCardStatusClosedClass,
  dataWorkspaceEntityCardStatusInactiveClass,
  dataWorkspaceEntityCardStatusOpenClass,
  dataWorkspaceEntityCardTitleClass,
  dataWorkspaceEntityCardsGridClass,
  workspaceTableActionsBodyCellClass,
  workspaceTableLayoutClassName,
  workspaceTableNatureMoneyClass,
  workspaceTableNatureTextPrimaryClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  dataWorkspaceListFiltersGridClass,
  dataWorkspaceListFiltersPanelClass,
  dataWorkspaceListFiltersPanelLastClass,
  workspaceTableLayoutActionsBodyCellClass,
  workspaceTableLayoutBodyCellClass,
  workspaceTableLayoutHeaderHeadClass,
} from "@/components/data-workspace/dataWorkspaceTablesLayout"
import {
  WorkspaceTableBodyRow,
  WorkspaceTableHead,
  WorkspaceTableHeader,
  WorkspaceTableHeaderRow,
  WorkspaceTableSelectCell,
  WorkspaceTableSelectHead,
} from "@/components/data-workspace/WorkspaceTableHeader"
import { WorkspaceTableSortHead } from "@/components/data-workspace/WorkspaceTableSortHead"
import {
  WorkspaceTableSkeletonRows,
  type WorkspaceTableSkeletonColumn,
} from "@/components/data-workspace/WorkspaceTableSkeleton"
import { TableBody, TableCell } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { WorkspaceTableSortDisplayDirection } from "@/lib/workspaceTableSort"
import { Calculator, Pencil } from "lucide-react"
import { useId, useMemo, useState } from "react"

const BRUMA = "var(--rootsy-bruma-100)"
const BRUMA_50 = "var(--rootsy-bruma-50)"
const noop = () => {}

const PATTERN_ROWS = [
  {
    id: "1",
    name: "Yerba mate orgánica",
    status: "activo",
    amount: "$ 4.250",
  },
  {
    id: "2",
    name: "Miel de monte",
    status: "pendiente",
    amount: "$ 2.800",
    signal: "warning",
  },
  {
    id: "3",
    name: "Aceite de oliva",
    status: "inactivo",
    amount: "$ 0",
    muted: true,
  },
  {
    id: "4",
    name: "Café de especialidad",
    status: "vencido",
    amount: "$ 6.100",
    signal: "danger",
  },
  {
    id: "5",
    name: "Pan de masa madre",
    status: "activo",
    amount: "$ 1.200",
  },
] as const

const LOADING_COLUMNS: WorkspaceTableSkeletonColumn[] = [
  { kind: "select" },
  { kind: "text", className: "min-w-0" },
  { kind: "pill", className: "w-28" },
  { kind: "money", className: "w-28" },
  { kind: "actions", className: "w-[4.5rem]", actionCount: 1 },
]

const LOADED_PAGES = new Set([1])

function TablesPatternSpecimen({ extra }: { extra: string }) {
  const searchId = useId()
  const filtersId = useId()
  const isFilters = extra === "Filtros"
  const isSelection = extra === "Selección"
  const isEmpty = extra === "Vacío"
  const isLoading = extra === "Cargando"
  const [search, setSearch] = useState(isFilters ? "yerba" : "")
  const [sortDirection, setSortDirection] =
    useState<WorkspaceTableSortDisplayDirection>("asc")
  const [selected, setSelected] = useState<Set<string>>(
    () => (isSelection ? new Set(["1", "2"]) : new Set()),
  )

  const rows = isEmpty ? [] : [...PATTERN_ROWS]
  const visibleIds = rows.map((row) => row.id)
  const selectedVisible = visibleIds.filter((id) => selected.has(id))
  const allVisibleSelected =
    visibleIds.length > 0 && selectedVisible.length === visibleIds.length
  const someVisibleSelected =
    selectedVisible.length > 0 && !allVisibleSelected
  const loadedCount = isEmpty ? 0 : rows.length
  const totalCount = isEmpty ? 0 : 48

  const activeFiltersBar = useMemo(() => {
    if (!isFilters) return undefined
    return (
      <DataWorkspaceListActiveFiltersBar activeCount={2} onClearAll={noop}>
        <DataWorkspaceListFilterChip
          label="Buscar: «yerba»"
          onRemove={noop}
          removeAriaLabel="Quitar búsqueda"
        />
        <DataWorkspaceListFilterChip
          label="Activos"
          onRemove={noop}
          removeAriaLabel="Quitar filtro activos"
        />
      </DataWorkspaceListActiveFiltersBar>
    )
  }, [isFilters])

  const bulkToolbar =
    isSelection && selected.size > 0 ? (
      <DataWorkspaceListBulkToolbar
        selectedCount={selected.size}
        onClear={() => setSelected(new Set())}
        placement={isFilters ? "stacked" : "standalone"}
        actions={[
          {
            label: "Eliminar selección",
            onClick: noop,
            semantic: "destructive",
          },
          { label: "Exportar CSV", onClick: noop },
        ]}
      />
    ) : undefined

  return (
    <div className="flex h-[32rem] w-full min-w-0 overflow-hidden rounded-xl">
      <DataWorkspaceTableListNatureShell className="h-full w-full">
        <DataWorkspaceTableListFiltersBar>
          <div className={dataWorkspaceListFiltersGridClass}>
            <div className={dataWorkspaceListFiltersPanelClass}>
              <DataWorkspaceListFiltersDialogTrigger
                id={filtersId}
                placeholder="Estado y tipo"
                activeCount={isFilters ? 2 : 0}
                onClick={noop}
              />
            </div>
            <div className={dataWorkspaceListFiltersPanelLastClass}>
              <DataWorkspaceListSearchField
                id={searchId}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onClear={() => setSearch("")}
                placeholder="Nombre, descripción…"
              />
            </div>
          </div>
        </DataWorkspaceTableListFiltersBar>

        <DataWorkspaceTableListShell
          lockScroll={isLoading}
          activeFiltersBar={activeFiltersBar}
          bulkToolbar={bulkToolbar}
          footerFloating
          footerFloatingCentered
          footer={
            <DataWorkspaceTableInfinitePageDock
              listFetching={isLoading}
              loadedCount={loadedCount}
              totalCount={totalCount}
              startPage={1}
              totalPages={isEmpty ? 1 : 4}
              loadedPages={LOADED_PAGES}
              onPageJump={noop}
            />
          }
        >
          <DataWorkspaceListTableFrame>
            <table
              className={workspaceTableLayoutClassName}
              aria-busy={isLoading}
            >
              <WorkspaceTableHeader>
                <WorkspaceTableHeaderRow>
                  <WorkspaceTableSelectHead
                    tone="nature"
                    className={workspaceTableLayoutHeaderHeadClass}
                    checked={
                      allVisibleSelected
                        ? true
                        : someVisibleSelected
                          ? "indeterminate"
                          : false
                    }
                    onCheckedChange={(checked) => {
                      setSelected(() => {
                        if (checked === true) return new Set(visibleIds)
                        return new Set()
                      })
                    }}
                    disabled={isLoading || isEmpty}
                    ariaLabel="Seleccionar filas visibles"
                  />
                  <WorkspaceTableSortHead
                    tone="nature"
                    label="Nombre"
                    direction={sortDirection}
                    onSort={() =>
                      setSortDirection((current) =>
                        current === "asc" ? "desc" : "asc",
                      )
                    }
                    className={cn(
                      "min-w-0 px-3",
                      workspaceTableLayoutHeaderHeadClass,
                    )}
                  />
                  <WorkspaceTableHead
                    tone="nature"
                    className={cn(
                      "w-28 px-3",
                      workspaceTableLayoutHeaderHeadClass,
                    )}
                  >
                    Estado
                  </WorkspaceTableHead>
                  <WorkspaceTableHead
                    tone="nature"
                    align="right"
                    className={cn(
                      "w-28 px-3",
                      workspaceTableLayoutHeaderHeadClass,
                    )}
                  >
                    Monto
                  </WorkspaceTableHead>
                  <WorkspaceTableHead
                    tone="nature"
                    align="right"
                    srOnly
                    className={cn(
                      "w-[4.5rem] px-3",
                      workspaceTableLayoutHeaderHeadClass,
                    )}
                  >
                    Acciones
                  </WorkspaceTableHead>
                </WorkspaceTableHeaderRow>
              </WorkspaceTableHeader>
              <TableBody>
                {isLoading ? (
                  <WorkspaceTableSkeletonRows
                    rowCount={6}
                    rowKeyPrefix="handbook-tables-sk"
                    columns={LOADING_COLUMNS}
                    tone="nature"
                  />
                ) : (
                  rows.map((row, index) => (
                    <WorkspaceTableBodyRow
                      key={row.id}
                      index={index}
                      selected={selected.has(row.id)}
                      inactive={row.status === "inactivo"}
                      signal={"signal" in row ? row.signal : undefined}
                    >
                      <WorkspaceTableSelectCell
                        tone="nature"
                        checked={selected.has(row.id)}
                        onCheckedChange={(checked) => {
                          setSelected((current) => {
                            const next = new Set(current)
                            if (checked === true) next.add(row.id)
                            else next.delete(row.id)
                            return next
                          })
                        }}
                        ariaLabel={`Seleccionar ${row.name}`}
                      />
                      <TableCell
                        className={cn(
                          workspaceTableLayoutBodyCellClass,
                          workspaceTableNatureTextPrimaryClass,
                        )}
                      >
                        <span className="block truncate font-medium">
                          {row.name}
                        </span>
                      </TableCell>
                      <TableCell className={workspaceTableLayoutBodyCellClass}>
                        <WorkspaceTableStatusBadge status={row.status}>
                          {row.status === "activo"
                            ? "Activo"
                            : row.status === "inactivo"
                              ? "Inactivo"
                              : row.status === "pendiente"
                                ? "Pendiente"
                                : "Vencido"}
                        </WorkspaceTableStatusBadge>
                      </TableCell>
                      <TableCell
                        className={cn(
                          workspaceTableLayoutBodyCellClass,
                          "text-right",
                        )}
                      >
                        <DataWorkspaceTableMoney
                          muted={"muted" in row && row.muted}
                          className={
                            "muted" in row && row.muted
                              ? undefined
                              : workspaceTableNatureMoneyClass
                          }
                        >
                          {row.amount}
                        </DataWorkspaceTableMoney>
                      </TableCell>
                      <TableCell
                        className={cn(
                          workspaceTableLayoutActionsBodyCellClass,
                          workspaceTableActionsBodyCellClass,
                        )}
                      >
                        <div className="flex items-center justify-end">
                          <DataWorkspaceTableIconAction
                            label={`Editar ${row.name}`}
                            icon={Pencil}
                            onClick={noop}
                          />
                        </div>
                      </TableCell>
                    </WorkspaceTableBodyRow>
                  ))
                )}
              </TableBody>
            </table>
            {isEmpty ? (
              <div className="min-h-[12rem] flex-1" aria-hidden />
            ) : null}
          </DataWorkspaceListTableFrame>
        </DataWorkspaceTableListShell>
      </DataWorkspaceTableListNatureShell>
    </div>
  )
}

const BLOCK_CARDS = [
  {
    id: "mostrador",
    name: "Caja mostrador",
    amount: "$ 48.320",
    cash: "$ 12.450",
    status: "open",
  },
  {
    id: "patio",
    name: "Caja patio",
    amount: "$ 0",
    cash: "$ 0",
    status: "closed",
  },
  {
    id: "terraza",
    name: "Caja terraza",
    amount: "—",
    cash: "—",
    status: "inactive",
  },
] as const

function BlocksEntityCard({
  name,
  amount,
  cash,
  status,
}: (typeof BLOCK_CARDS)[number]) {
  return (
    <article className={dataWorkspaceEntityCardLosetaClass}>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className={cn(dataWorkspaceEntityCardHeaderClass, "pr-4")}>
          <div className="flex min-w-0 items-start gap-3">
            <span className={dataWorkspaceEntityCardIsotypeClass} aria-hidden>
              <Calculator className="size-5" strokeWidth={1.75} />
            </span>
            <div className="relative min-w-0 flex-1">
              {status === "open" ? (
                <span className={cn(dataWorkspaceEntityCardStatusOpenClass, "absolute right-0 top-0")}>
                  Abierta
                </span>
              ) : status === "closed" ? (
                <span className={cn(dataWorkspaceEntityCardStatusClosedClass, "absolute right-0 top-0")}>
                  Cerrada
                </span>
              ) : (
                <span className={cn(dataWorkspaceEntityCardStatusInactiveClass, "absolute right-0 top-0")}>
                  Inactiva
                </span>
              )}
              <p className={cn(dataWorkspaceEntityCardEyebrowClass, "truncate pr-24")}>
                Caja
              </p>
              <h3 className={cn("mt-0.5 truncate pr-24", dataWorkspaceEntityCardTitleClass)}>
                {name}
              </h3>
            </div>
          </div>
        </div>
        <div className={dataWorkspaceEntityCardSaldoSectionClass}>
          <p className={dataWorkspaceEntityCardStatLabelClass}>Cobrado en el turno</p>
          <p className={cn("mt-1.5", dataWorkspaceEntityCardStatValueLargeClass)}>
            {amount}
          </p>
        </div>
        <div className={dataWorkspaceEntityCardActionFooterClass}>
          <div>
            <p className={dataWorkspaceEntityCardStatLabelClass}>Efectivo en caja</p>
            <p className={cn("mt-1", dataWorkspaceEntityCardStatValueClass)}>{cash}</p>
          </div>
        </div>
      </div>
    </article>
  )
}

function BlocksPatternSpecimen({ extra }: { extra: string }) {
  const isEmpty = extra === "Vacío"
  const isLoading = extra === "Cargando"

  return (
    <div className="flex h-[32rem] w-full min-w-0 overflow-hidden rounded-xl">
      <div className={cn(dataWorkspaceBlocksPageMainClass, "h-full w-full")}>
        <div className={dataWorkspaceBlocksPageContentClass}>
          <DataWorkspaceBlocksSection>
            {isLoading ? (
              <CashRegistersGridSkeleton count={3} />
            ) : isEmpty ? (
              <p className={dataWorkspaceBlocksEmptyStateClass}>
                Todavía no hay cajas. Creá la primera.
              </p>
            ) : (
              <div className={dataWorkspaceEntityCardsGridClass}>
                {BLOCK_CARDS.map((card) => (
                  <BlocksEntityCard key={card.id} {...card} />
                ))}
              </div>
            )}
          </DataWorkspaceBlocksSection>
        </div>
      </div>
    </div>
  )
}

function HandbookFormingNote() {
  return (
    <p className={cn(libraryDocPageDescriptionClass, "mt-3 max-w-md italic")}>
      Esta parte todavía se está formando.
    </p>
  )
}

export function HandbookPatternsView() {
  const page = getHandbookDesignSystemPage("patrones")
  if (!page) return null

  return (
    <article className="w-full">
      <h1 className={cn(libraryDocPageTitleClass, "text-2xl")}>{page.label}</h1>
      <p className={cn(libraryDocBodyClass, "mt-4 max-w-3xl")}>
        Los flujos que se repiten en el producto. Un listado, un alta o una
        operación se arman con el mismo layout — no con una solución por módulo.
      </p>

      <div className="mt-10">
        {page.topics.map((topic) => {
          const isTables = topic.id === "tablas-y-filtros"
          const isBlocks = topic.id === "gestion-de-datos"

          return (
            <section
              key={topic.id}
              id={topic.id}
              className={cn(handbookDocChapterClass, "first:border-t-0 first:pt-0")}
            >
              <h2 className={libraryDocSectionTitleClass}>{topic.title}</h2>
              {isTables ? (
                <>
                  <p className={cn(libraryDocBodyClass, "mt-4 max-w-3xl")}>
                    Filtros y tabla en bruma. Pie en sombra. El mismo shell cubre
                    artículos, clientes, proveedores y el resto de listados del
                    workspace.
                  </p>
                  <div className="mt-6">
                    <ComponentView
                      background={BRUMA}
                      defaultOpen
                      componentName="DataWorkspaceTableListLayout"
                      componentProperties={[
                        {
                          name: "NatureShell",
                          values: ["bruma — filtros + tabla"],
                        },
                        {
                          name: "FiltersBar",
                          values: [
                            "SearchField",
                            "FiltersDialogTrigger",
                            "ActiveFiltersBar",
                          ],
                        },
                        {
                          name: "TableShell",
                          values: [
                            "flush",
                            "footerFloating",
                            "footerFloatingCentered",
                          ],
                        },
                        {
                          name: "InfinitePageDock",
                          values: ["sombra"],
                        },
                        {
                          name: "bulkToolbar",
                          values: ["ReactNode", "undefined"],
                        },
                      ]}
                      variants={[{ name: "Listado" }]}
                      extras={[
                        {
                          items: [
                            { name: "Reposo" },
                            { name: "Filtros" },
                            { name: "Selección" },
                            { name: "Vacío" },
                            { name: "Cargando" },
                          ],
                        },
                      ]}
                      render={(_variant, extras) => (
                        <TablesPatternSpecimen
                          key={extras[0] ?? "Reposo"}
                          extra={extras[0] ?? "Reposo"}
                        />
                      )}
                    />
                  </div>
                  <div className="mt-8">
                    <LibraryDoDontPair
                      doText="Usar el shell de tablas en cada listado: filtros y tabla en bruma, pie en sombra."
                      dontText="Inventar un listado por módulo o pintar el pie con suelo o savia."
                    />
                  </div>
                </>
              ) : isBlocks ? (
                <>
                  <p className={cn(libraryDocBodyClass, "mt-4 max-w-3xl")}>
                    Cuando el dato es una entidad que se elige, va en losetas sobre el
                    lienzo de bloques. El mismo valle cubre cajas, cuentas, personas y
                    reportes.
                  </p>
                  <div className="mt-6">
                    <ComponentView
                      background={BRUMA_50}
                      defaultOpen
                      componentName="DataWorkspaceBlocksLayout"
                      componentProperties={[
                        {
                          name: "atmosphere",
                          values: ["data-workspace-blocks-atmosphere"],
                        },
                        {
                          name: "BlocksSection",
                          values: ["title", "description", "action"],
                        },
                        {
                          name: "EntityCardsGrid",
                          values: ["auto-fill", "minmax(18rem, 1fr)"],
                        },
                        {
                          name: "Loseta",
                          values: ["raised", "header", "saldo", "footer"],
                        },
                      ]}
                      variants={[{ name: "Losetas" }]}
                      extras={[
                        {
                          items: [
                            { name: "Reposo" },
                            { name: "Vacío" },
                            { name: "Cargando" },
                          ],
                        },
                      ]}
                      render={(_variant, extras) => (
                        <BlocksPatternSpecimen
                          key={extras[0] ?? "Reposo"}
                          extra={extras[0] ?? "Reposo"}
                        />
                      )}
                    />
                  </div>
                  <div className="mt-8">
                    <LibraryDoDontPair
                      doText="Losetas sobre el lienzo de bloques cuando el dato se recorre o se elige."
                      dontText="No conviertas un listado denso en cards. No uses el Card de shadcn."
                    />
                  </div>
                </>
              ) : (
                <HandbookFormingNote />
              )}
            </section>
          )
        })}
      </div>
    </article>
  )
}
