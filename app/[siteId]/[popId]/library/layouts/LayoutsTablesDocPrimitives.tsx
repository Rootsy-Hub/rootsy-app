"use client"

import "@/app/[siteId]/[popId]/library/color/rootsyNaturePalette.css"
import { LayoutsTablesNightForestSurface } from "@/app/[siteId]/[popId]/library/layouts/LayoutsTablesNightForestSurface"
import { LAYOUTS_TABLES_SCREEN_COMPONENTS } from "@/app/[siteId]/[popId]/library/layouts/layoutsTablesScreenComponents"
import { Badge } from "@/components/ui/badge"
import {
  RootsFormField,
  RootsFormPrefixedInput,
  RootsFormSelectField,
  RootsFormSelectItem,
} from "@/components/rootsy-form"
import { DataWorkspaceTableListPaginationFooter } from "@/components/data-workspace/DataWorkspaceTableListLayout"
import {
  darkTableFooterClass,
  workspaceTableNatureBodyRowClassNames,
  workspaceTableNatureCheckboxClass,
  workspaceTableNatureLinkClass,
  workspaceTableNatureMoneyClass,
  workspaceTableNatureScopeClass,
  workspaceTableNatureStatusBadgeClass,
  workspaceTableNatureSurfaceClass,
  workspaceTableNatureTextPrimaryClass,
  workspaceTableNatureTextSecondaryClass,
  workspaceTableNatureTextTertiaryClass,
  workspaceTableLayoutClassName,
  workspaceTableSelectBodyCellClass,
  selectColumnInnerClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  dataWorkspaceListFiltersBarClass,
  dataWorkspaceListFiltersBarInnerClass,
  dataWorkspaceListFiltersBarRowClass,
  dataWorkspaceListFiltersDemoShellClass,
  dataWorkspaceListFiltersFieldClass,
  dataWorkspaceListFiltersGridClass,
  dataWorkspaceListFiltersPanelClass,
  dataWorkspaceListFiltersPanelLastClass,
  lightToolbarPanelClass,
  lightToolbarPanelLastClass,
  workspaceTableLayoutBodyCellClass,
  workspaceTableLayoutBodyRowClass,
  workspaceTableLayoutCellPrimaryTextClass,
  workspaceTableLayoutCellSecondaryTextClass,
  workspaceTableLayoutCellStackClass,
  workspaceTableLayoutHeaderHeadClass,
  workspaceTableNatureEarthOrganicClass,
} from "@/components/data-workspace/dataWorkspaceTablesLayout"
import { DataWorkspaceHeaderIconButton } from "@/components/layouts/DataWorkspaceHeaderIconButton"
import { DataWorkspaceHeaderTitle } from "@/components/layouts/DataWorkspaceHeaderTitle"
import {
  dataWorkspaceHeaderChromeButtonClass,
  dataWorkspaceHeaderDividerClass,
  dataWorkspaceHeaderPopRingClass,
  dataWorkspaceHeaderRoleLabelClass,
} from "@/components/layouts/dataWorkspaceHeaderStyles"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  WorkspaceTableHead,
  WorkspaceTableHeader,
  WorkspaceTableHeaderRow,
} from "@/components/data-workspace/WorkspaceTableHeader"
import { Checkbox } from "@/components/ui/checkbox"
import { TableBody, TableCell, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  BookOpen,
  CalendarRange,
  Filter,
  FolderTree,
  Maximize2,
  Plus,
  Search,
} from "lucide-react"
import { useId, useState } from "react"

const HEADER_VARIANT = "dark" as const
const DEMO_PAGE_TITLE = "Layout tablas"
const DEMO_USER_ROLE = "Administradora"

const DEMO_POP_NAME = "Rootsy Market"
const DEMO_POP_LOGO =
  "https://api.dicebear.com/7.x/shapes/svg?seed=demo-pop&backgroundColor=e8f5ef"
const DEMO_USER_NAME = "María González"
const DEMO_USER_AVATAR =
  "https://api.dicebear.com/7.x/avataaars/svg?seed=maria-gonzalez"
const DEMO_USER_INITIALS = "MG"

type LayoutsTablesDemoPartProps = {
  /** Sin marco propio — para ensamblar el draft de página completa. */
  composed?: boolean
  /** Oculta labels de bloque en la toolbar (Período, Filtros, Buscar). */
  hideLabels?: boolean
}

function LayoutHeightBadge({ label }: { label: string }) {
  return (
    <span className="pointer-events-none absolute right-2 top-1.5 z-20 rounded-md bg-background/95 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground ring-1 ring-border/60">
      {label}
    </span>
  )
}

function useLayoutsTablesHeaderChromeButtonClass() {
  return dataWorkspaceHeaderChromeButtonClass(HEADER_VARIANT)
}

/** Botones chrome — volver y pantalla completa (izquierda del header). */
export function LayoutsTablesHeaderChromeButtons() {
  const chromeButtonClass = useLayoutsTablesHeaderChromeButtonClass()

  return (
    <>
      <button
        type="button"
        className={chromeButtonClass}
        aria-hidden
        tabIndex={-1}
      >
        <ArrowLeft className="size-5" aria-hidden />
      </button>
      <button type="button" className={chromeButtonClass} aria-hidden tabIndex={-1}>
        <Maximize2 className="size-5" aria-hidden />
      </button>
    </>
  )
}

/** Logo + nombre del POP. */
export function LayoutsTablesPopProfile() {
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

/** Título central del workspace. */
export function LayoutsTablesHeaderTitleBlock() {
  return (
    <DataWorkspaceHeaderTitle title={DEMO_PAGE_TITLE} headerVariant={HEADER_VARIANT} />
  )
}

/** Acciones primaria + secundaria (derecha del header). */
export function LayoutsTablesHeaderActionButtons() {
  return (
    <>
      <DataWorkspaceHeaderIconButton
        label="Nuevo"
        headerVariant={HEADER_VARIANT}
        primary
        tabIndex={-1}
        aria-hidden
      >
        <Plus className="size-5" aria-hidden />
      </DataWorkspaceHeaderIconButton>
      <DataWorkspaceHeaderIconButton
        label="Gestionar categorías"
        headerVariant={HEADER_VARIANT}
        tabIndex={-1}
        aria-hidden
      >
        <FolderTree className="size-5" aria-hidden />
      </DataWorkspaceHeaderIconButton>
    </>
  )
}

/** Nombre, rol y avatar del usuario. */
export function LayoutsTablesUserProfile() {
  const chromeButtonClass = useLayoutsTablesHeaderChromeButtonClass()

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

export function LayoutsTablesHeaderLeftZone({ className }: { className?: string }) {
  return (
    <div className={cn("flex min-w-0 items-center gap-2", className)}>
      <LayoutsTablesHeaderChromeButtons />
      <div
        className={cn("h-6 w-px", dataWorkspaceHeaderDividerClass(HEADER_VARIANT))}
        aria-hidden
      />
      <LayoutsTablesPopProfile />
    </div>
  )
}

export function LayoutsTablesHeaderCenterZone({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-2", className)}>
      <LayoutsTablesHeaderTitleBlock />
    </div>
  )
}

export function LayoutsTablesHeaderRightZone({ className }: { className?: string }) {
  return (
    <div className={cn("flex min-w-0 items-center justify-end gap-2", className)}>
      <div className="pointer-events-none flex items-center gap-1.5" aria-hidden>
        <LayoutsTablesHeaderActionButtons />
      </div>
      <div
        className={cn("h-6 w-px", dataWorkspaceHeaderDividerClass(HEADER_VARIANT))}
        aria-hidden
      />
      <div className="pointer-events-none flex min-w-0 items-center gap-3" aria-hidden>
        <LayoutsTablesUserProfile />
      </div>
    </div>
  )
}

export function LayoutsTablesHeaderDemo({ composed = false }: LayoutsTablesDemoPartProps) {
  return (
    <LayoutsTablesNightForestSurface
      className={cn(
        composed ? "h-17 shrink-0" : "overflow-hidden rounded-xl",
      )}
      contentClassName={composed ? "h-full" : undefined}
    >
      <div
        className={cn(
          "grid h-full grid-cols-3 items-center gap-4 px-4",
          !composed && "h-18",
        )}
      >
        <LayoutsTablesHeaderLeftZone />
        <LayoutsTablesHeaderCenterZone />
        <LayoutsTablesHeaderRightZone />
      </div>
    </LayoutsTablesNightForestSurface>
  )
}

/** 1 · Grid del layout — anatomía con alturas (wireframe escala de grises). */
export function LayoutsTablesLayoutGridDemo() {
  return (
    <div
      className={cn(
        "mx-auto flex h-[28rem] max-w-4xl flex-col overflow-hidden rounded-2xl border border-neutral-300",
        "shadow-[0_24px_48px_-28px_rgba(41,37,36,0.38)]",
        "ring-1 ring-black/[0.04]",
      )}
    >
      <div className="relative shrink-0">
        <LayoutHeightBadge label="h-17" />
        <LayoutsTablesNightForestSurface className="h-17" contentClassName="h-full">
          <div className="grid h-full grid-cols-3 divide-x divide-[#263530]/60">
            <div className="min-w-0" />
            <div className="min-w-0" />
            <div className="min-w-0" />
          </div>
        </LayoutsTablesNightForestSurface>
      </div>

      <div className="relative shrink-0">
        <LayoutHeightBadge label="h-23" />
        <div className="h-23 border-b border-neutral-200 bg-background">
          <div className="grid h-full grid-cols-3 divide-x divide-neutral-200">
            <div className="min-w-0" />
            <div className="min-w-0" />
            <div className="min-w-0" />
          </div>
        </div>
      </div>

      <div className="rootsy-nature-palette flex min-h-0 flex-1 flex-col">
        <div
          className={cn(
            workspaceTableNatureScopeClass,
            workspaceTableNatureEarthOrganicClass,
            workspaceTableNatureSurfaceClass,
            "flex min-h-0 flex-1 flex-col",
          )}
        >
          <div className="relative shrink-0">
            <LayoutHeightBadge label="h-11" />
            <div className="h-11 bg-[var(--wt-header-bg)]" />
          </div>

          <div className="relative min-h-0 flex-1 overflow-auto">
            <LayoutHeightBadge label="h-14 · flex-1 · scroll" />
            <div>
              {Array.from({ length: 12 }, (_, index) => (
                <div
                  key={index}
                  className={cn(
                    workspaceTableLayoutBodyRowClass,
                    workspaceTableNatureBodyRowClassNames(index, { noHover: true }),
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative shrink-0">
        <LayoutHeightBadge label="h-17" />
        <div className={cn(darkTableFooterClass, "h-17")}>
          <div className="grid h-full grid-cols-3 divide-x divide-[#263530]/70">
            <div className="min-w-0" />
            <div className="min-w-0" />
            <div className="min-w-0" />
          </div>
        </div>
      </div>
    </div>
  )
}

/** 1 · Degradado compartido header y footer. */
export function LayoutsTablesNightForestGradientDemo() {
  return <LayoutsTablesNightForestSurface bare className="h-18 w-full" />
}

/** 2 · Estructura del header — tres columnas iguales. */
export function LayoutsTablesHeaderStructureDemo() {
  return (
    <LayoutsTablesNightForestSurface className="overflow-hidden rounded-xl">
      <div className="grid grid-cols-3 divide-x divide-[#263530]/70">
        <div className="flex min-h-18 items-center px-4 py-3">
          <LayoutsTablesHeaderLeftZone />
        </div>
        <div className="flex min-h-18 items-center justify-center px-4 py-3">
          <LayoutsTablesHeaderCenterZone />
        </div>
        <div className="flex min-h-18 items-center justify-end px-4 py-3">
          <LayoutsTablesHeaderRightZone />
        </div>
      </div>
      <div className="grid grid-cols-3 border-t border-[#263530]/70 bg-[#060908]/50">
        <p className="px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-[#78716c]">
          Izquierda · botones + POP
        </p>
        <p className="px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-[#78716c]">
          Centro · título
        </p>
        <p className="px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-[#78716c]">
          Derecha · acciones + usuario
        </p>
      </div>
    </LayoutsTablesNightForestSurface>
  )
}

/** 3 · Footer oscuro completo — paginación en un solo bloque. */
export function LayoutsTablesFooterComponentsDemo() {
  return <LayoutsTablesFooterDemo />
}

/** Botones chrome izquierda — misma pieza que el header. */
export function LayoutsTablesChromeButtonsDemo() {
  return (
    <LayoutsTablesNightForestSurface
      className="inline-flex rounded-xl"
      contentClassName="inline-flex p-4"
    >
      <LayoutsTablesHeaderChromeButtons />
    </LayoutsTablesNightForestSurface>
  )
}

/** Botones oscuros secundarios (derecha). */
export function LayoutsTablesSecondaryIconButtonsDemo() {
  return (
    <LayoutsTablesNightForestSurface
      className="inline-flex rounded-xl"
      contentClassName="inline-flex p-4"
    >
      <div className="pointer-events-none flex items-center gap-1.5" aria-hidden>
        <DataWorkspaceHeaderIconButton
          label="Gestionar categorías"
          headerVariant={HEADER_VARIANT}
          tabIndex={-1}
        >
          <FolderTree className="size-5" aria-hidden />
        </DataWorkspaceHeaderIconButton>
      </div>
    </LayoutsTablesNightForestSurface>
  )
}

/** Botón primario de acción (derecha). */
export function LayoutsTablesPrimaryIconButtonsDemo() {
  return (
    <LayoutsTablesNightForestSurface
      className="inline-flex rounded-xl"
      contentClassName="inline-flex p-4"
    >
      <div className="pointer-events-none flex items-center gap-1.5" aria-hidden>
        <DataWorkspaceHeaderIconButton
          label="Nuevo"
          headerVariant={HEADER_VARIANT}
          primary
          tabIndex={-1}
        >
          <Plus className="size-5" aria-hidden />
        </DataWorkspaceHeaderIconButton>
      </div>
    </LayoutsTablesNightForestSurface>
  )
}

/** Perfil POP aislado. */
export function LayoutsTablesPopProfileDemo() {
  return (
    <LayoutsTablesNightForestSurface
      className="inline-flex rounded-xl"
      contentClassName="inline-flex p-4"
    >
      <LayoutsTablesPopProfile />
    </LayoutsTablesNightForestSurface>
  )
}

/** Perfil usuario aislado. */
export function LayoutsTablesUserProfileDemo() {
  return (
    <LayoutsTablesNightForestSurface
      className="inline-flex rounded-xl"
      contentClassName="inline-flex p-4"
    >
      <div className="pointer-events-none flex min-w-0 items-center gap-3" aria-hidden>
        <LayoutsTablesUserProfile />
      </div>
    </LayoutsTablesNightForestSurface>
  )
}

export function LayoutsTablesComponentsTable() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border/70">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-muted/30">
            <th className="px-4 py-3 font-semibold text-foreground">Capa</th>
            <th className="px-4 py-3 font-semibold text-foreground">Componente</th>
            <th className="px-4 py-3 font-semibold text-foreground">Token / API</th>
            <th className="px-4 py-3 font-semibold text-foreground">Fuente</th>
          </tr>
        </thead>
        <tbody>
          {LAYOUTS_TABLES_SCREEN_COMPONENTS.map((row) => (
            <tr
              key={`${row.layer}-${row.component}-${row.token}`}
              className="border-b border-border/40 last:border-0"
            >
              <td className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {row.layer}
              </td>
              <td className="px-4 py-3 text-foreground">{row.component}</td>
              <td className="px-4 py-3 font-mono text-[11px] text-primary">{row.token}</td>
              <td className="px-4 py-3 font-mono text-[10px] text-muted-foreground">
                {row.source}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function LayoutsTablesFiltersDemo({
  composed = false,
  hideLabels = false,
}: LayoutsTablesDemoPartProps) {
  const searchFieldId = useId()
  const [periodValue, setPeriodValue] = useState("all")
  const [filterValue, setFilterValue] = useState("")
  const [searchValue, setSearchValue] = useState("")

  const composedPanelClass = dataWorkspaceListFiltersPanelClass
  const fieldClass = dataWorkspaceListFiltersFieldClass(hideLabels)

  return (
    <div
      className={cn(
        "shrink-0",
        composed
          ? dataWorkspaceListFiltersBarClass
          : dataWorkspaceListFiltersDemoShellClass,
      )}
    >
      <div
        className={cn(
          composed
            ? cn(
                dataWorkspaceListFiltersBarInnerClass,
                dataWorkspaceListFiltersBarRowClass,
              )
            : "h-full",
        )}
      >
        <div
          className={cn(
            composed
              ? dataWorkspaceListFiltersGridClass
              : "grid h-full grid-cols-1 md:grid-cols-3",
          )}
        >
        <div className={composed ? composedPanelClass : lightToolbarPanelClass}>
          <RootsFormSelectField
            label="Período"
            value={periodValue}
            onValueChange={setPeriodValue}
            placeholder="Todas las fechas"
            prefix={<CalendarRange className="size-4" aria-hidden />}
            className={fieldClass}
          >
            <RootsFormSelectItem value="all">Todas las fechas</RootsFormSelectItem>
            <RootsFormSelectItem value="month">Este mes</RootsFormSelectItem>
            <RootsFormSelectItem value="week">Esta semana</RootsFormSelectItem>
          </RootsFormSelectField>
        </div>
        <div className={composed ? composedPanelClass : lightToolbarPanelClass}>
          <RootsFormSelectField
            label="Filtros"
            value={filterValue}
            onValueChange={setFilterValue}
            placeholder="Estado y tipo"
            prefix={<Filter className="size-4" aria-hidden />}
            className={fieldClass}
          >
            <RootsFormSelectItem value="activo">Activo</RootsFormSelectItem>
            <RootsFormSelectItem value="pendiente">Pendiente</RootsFormSelectItem>
            <RootsFormSelectItem value="vencido">Vencido</RootsFormSelectItem>
          </RootsFormSelectField>
        </div>
        <div className={composed ? dataWorkspaceListFiltersPanelLastClass : lightToolbarPanelLastClass}>
          <RootsFormField label="Buscar" htmlFor={searchFieldId} className={fieldClass}>
            <RootsFormPrefixedInput
              id={searchFieldId}
              prefix={<Search className="size-4" aria-hidden />}
              placeholder="Título o referencia…"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
            />
          </RootsFormField>
        </div>
        </div>
      </div>
    </div>
  )
}

const DEMO_ROWS = [
  {
    id: "1",
    title: "Yerba mate 1 kg cónico",
    subtitle: "SKU: YER-001",
    ref: "PRV-7781-1",
    amount: "$ 18.420",
    status: "activo" as const,
  },
  {
    id: "2",
    title: "Aceite girasol 900 ml",
    subtitle: "SKU: ACE-014",
    ref: "PRV-9920-2",
    amount: "$ 4.890",
    status: "pendiente" as const,
  },
  {
    id: "3",
    title: "Galletitas surtidas 400 g",
    subtitle: "SKU: GAL-221",
    ref: "PRV-4410-8",
    amount: "$ 2.150",
    status: "vencido" as const,
  },
]

function LayoutsTablesTableHeaderDemo() {
  return (
    <div className={cn(workspaceTableNatureScopeClass, workspaceTableNatureSurfaceClass)}>
      <table className={cn(workspaceTableLayoutClassName, "min-w-full")}>
        <WorkspaceTableHeader>
          <WorkspaceTableHeaderRow>
            <WorkspaceTableHead tone="nature" className="w-12 !px-0" srOnly>
              Selección
            </WorkspaceTableHead>
            <WorkspaceTableHead tone="nature">Artículo</WorkspaceTableHead>
            <WorkspaceTableHead tone="nature" className="w-36">
              Referencia
            </WorkspaceTableHead>
            <WorkspaceTableHead tone="nature" align="right" className="w-28">
              Monto
            </WorkspaceTableHead>
            <WorkspaceTableHead tone="nature" className="w-28">
              Estado
            </WorkspaceTableHead>
          </WorkspaceTableHeaderRow>
        </WorkspaceTableHeader>
      </table>
    </div>
  )
}

function LayoutsTablesTableRowsDemo({ composed = false }: LayoutsTablesDemoPartProps) {
  const rows = composed
    ? [...DEMO_ROWS, ...DEMO_ROWS, ...DEMO_ROWS, ...DEMO_ROWS]
    : DEMO_ROWS

  return (
    <div
      className={cn(
        workspaceTableNatureScopeClass,
        workspaceTableNatureSurfaceClass,
        composed ? "h-full min-h-0 overflow-auto" : "overflow-hidden rounded-xl border border-border/70",
      )}
    >
      <table className={cn(workspaceTableLayoutClassName, "min-w-full")}>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow
              key={`${row.id}-${index}`}
              className={workspaceTableNatureBodyRowClassNames(index)}
            >
              <TableCell className={workspaceTableSelectBodyCellClass}>
                <div className={selectColumnInnerClass}>
                  <Checkbox className={workspaceTableNatureCheckboxClass} aria-hidden />
                </div>
              </TableCell>
              <TableCell className="px-3 py-2.5 align-middle">
                <p className={cn("truncate font-medium", workspaceTableNatureTextPrimaryClass)}>
                  {row.title}
                </p>
                <p className={cn("truncate text-xs", workspaceTableNatureTextSecondaryClass)}>
                  {row.subtitle}
                </p>
              </TableCell>
              <TableCell className="px-3 py-2.5 align-middle">
                <span
                  className={cn(
                    "text-[10px] font-medium uppercase tracking-wide",
                    workspaceTableNatureTextTertiaryClass,
                  )}
                >
                  Proveedores
                </span>
                <p className={cn("text-xs", workspaceTableNatureLinkClass)}>{row.ref}</p>
              </TableCell>
              <TableCell className={cn("px-3 py-2.5 text-right align-middle", workspaceTableNatureMoneyClass)}>
                {row.amount}
              </TableCell>
              <TableCell className="px-3 py-2.5 align-middle">
                <Badge
                  variant="outline"
                  className={cn("font-medium", workspaceTableNatureStatusBadgeClass[row.status])}
                >
                  {row.status === "activo"
                    ? "Activo"
                    : row.status === "pendiente"
                      ? "Pendiente"
                      : "Vencido"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </table>
    </div>
  )
}

export function LayoutsTablesBodyDemo({ composed = false }: LayoutsTablesDemoPartProps) {
  const rows = composed
    ? [...DEMO_ROWS, ...DEMO_ROWS, ...DEMO_ROWS, ...DEMO_ROWS]
    : DEMO_ROWS
  const headSizeClass = composed ? workspaceTableLayoutHeaderHeadClass : undefined
  const cellClass = composed
    ? workspaceTableLayoutBodyCellClass
    : "px-3 py-2.5 align-middle"

  return (
    <div
      className={cn(
        workspaceTableNatureScopeClass,
        composed && workspaceTableNatureEarthOrganicClass,
        workspaceTableNatureSurfaceClass,
        composed ? "min-h-0 flex-1 overflow-auto" : "overflow-hidden rounded-xl border border-border/70",
      )}
    >
      <table className={cn(workspaceTableLayoutClassName, "min-w-full")}>
        <WorkspaceTableHeader>
          <WorkspaceTableHeaderRow>
            <WorkspaceTableHead tone="nature" className={cn("w-12 !px-0", headSizeClass)} srOnly>
              Selección
            </WorkspaceTableHead>
            <WorkspaceTableHead tone="nature" className={headSizeClass}>
              Artículo
            </WorkspaceTableHead>
            <WorkspaceTableHead tone="nature" className={cn("w-36", headSizeClass)}>
              Referencia
            </WorkspaceTableHead>
            <WorkspaceTableHead tone="nature" align="right" className={cn("w-28", headSizeClass)}>
              Monto
            </WorkspaceTableHead>
            <WorkspaceTableHead tone="nature" className={cn("w-28", headSizeClass)}>
              Estado
            </WorkspaceTableHead>
          </WorkspaceTableHeaderRow>
        </WorkspaceTableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow
              key={`${row.id}-${index}`}
              className={cn(
                composed && workspaceTableLayoutBodyRowClass,
                workspaceTableNatureBodyRowClassNames(index, { noHover: composed }),
              )}
            >
              <TableCell className={cn(workspaceTableSelectBodyCellClass, composed && "!py-0")}>
                <div className={selectColumnInnerClass}>
                  <Checkbox className={workspaceTableNatureCheckboxClass} aria-hidden />
                </div>
              </TableCell>
              <TableCell className={cellClass}>
                <div className={composed ? workspaceTableLayoutCellStackClass : undefined}>
                  <p
                    className={cn(
                      composed
                        ? cn(
                            workspaceTableLayoutCellPrimaryTextClass,
                            workspaceTableNatureTextPrimaryClass,
                          )
                        : "truncate font-medium",
                      !composed && workspaceTableNatureTextPrimaryClass,
                    )}
                  >
                    {row.title}
                  </p>
                  <p
                    className={cn(
                      composed
                        ? cn(
                            workspaceTableLayoutCellSecondaryTextClass,
                            workspaceTableNatureTextSecondaryClass,
                          )
                        : "truncate text-xs",
                      !composed && workspaceTableNatureTextSecondaryClass,
                    )}
                  >
                    {row.subtitle}
                  </p>
                </div>
              </TableCell>
              <TableCell className={cellClass}>
                <div className={composed ? workspaceTableLayoutCellStackClass : undefined}>
                  <span
                    className={cn(
                      composed
                        ? "truncate text-[10px] font-medium uppercase leading-4 tracking-wide"
                        : "text-[10px] font-medium uppercase tracking-wide",
                      workspaceTableNatureTextTertiaryClass,
                    )}
                  >
                    Proveedores
                  </span>
                  <p
                    className={cn(
                      composed ? "truncate text-xs leading-4" : "text-xs",
                      workspaceTableNatureLinkClass,
                    )}
                  >
                    {row.ref}
                  </p>
                </div>
              </TableCell>
              <TableCell className={cn(cellClass, "text-right", workspaceTableNatureMoneyClass)}>
                {row.amount}
              </TableCell>
              <TableCell className={cellClass}>
                <Badge
                  variant="outline"
                  className={cn("font-medium", workspaceTableNatureStatusBadgeClass[row.status])}
                >
                  {row.status === "activo"
                    ? "Activo"
                    : row.status === "pendiente"
                      ? "Pendiente"
                      : "Vencido"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </table>
    </div>
  )
}

export function LayoutsTablesFooterDemo({ composed = false }: LayoutsTablesDemoPartProps) {
  return (
    <div
      className={cn(
        "mx-auto h-17 w-full max-w-4xl shrink-0 overflow-hidden",
        !composed &&
          "rounded-2xl border border-border/80 shadow-[0_24px_48px_-28px_rgba(41,37,36,0.38)] ring-1 ring-black/[0.04]",
      )}
    >
      <DataWorkspaceTableListPaginationFooter
        listFetching={false}
        totalCount={1248}
        rangeStart={1}
        rangeEnd={20}
        currentPage={1}
        totalPages={63}
        pageSize={20}
        pageSizeOptions={[10, 20, 50, 100]}
        paginationItems={[1, 2, 3, "ellipsis", 63]}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
        pageSizeLabelId="layouts-tables-footer-demo"
      />
    </div>
  )
}

/** Draft ensamblado — header, filtros, tabla y footer como en el POP. */
export function LayoutsTablesFullPageDraft() {
  return (
    <div
      className={cn(
        "mx-auto flex h-[28rem] max-w-4xl flex-col overflow-hidden rounded-2xl border border-border/80",
        "shadow-[0_24px_48px_-28px_rgba(41,37,36,0.38)]",
        "ring-1 ring-black/[0.04]",
      )}
    >
      <LayoutsTablesHeaderDemo composed />
      <LayoutsTablesFiltersDemo composed />
      <div className="rootsy-nature-palette flex min-h-0 flex-1 flex-col">
        <LayoutsTablesBodyDemo composed />
        <LayoutsTablesFooterDemo composed />
      </div>
    </div>
  )
}

export function LayoutsTablesOverviewIntro() {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <BookOpen className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 space-y-2">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Patrones de listado
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Documentamos dos familias de pantalla operativa en el POP:{" "}
            <span className="font-medium text-foreground">Tablas</span> para listados
            densos con filtros y paginación, y{" "}
            <span className="font-medium text-foreground">Bloques</span> para grids de
            tarjetas como cuentas de tesorería y cajas registradoras. Empezá por el
            patrón que corresponda en el menú lateral.
          </p>
        </div>
      </div>
    </div>
  )
}
