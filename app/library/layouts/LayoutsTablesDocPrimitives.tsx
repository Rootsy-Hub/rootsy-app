"use client"

import { LayoutsModuleShellWithContent } from "@/app/library/layouts/LayoutsModuleDocPrimitives"
import { LayoutsTablesNightForestSurface } from "@/app/library/layouts/LayoutsTablesNightForestSurface"
import {
  getLayoutsTablesScreenComponentsByLayer,
  LAYOUTS_TABLES_SCREEN_COMPONENTS,
} from "@/app/library/layouts/layoutsTablesScreenComponents"
import {
  getLayoutsTablesBodyCanvasStyle,
  getLayoutsTablesBodyCellStyle,
  getLayoutsTablesCheckboxStyle,
  getLayoutsTablesChromeIconButtonStyle,
  getLayoutsTablesFooterGridStyle,
  getLayoutsTablesFooterNavButtonStyle,
  getLayoutsTablesFooterSelectStyle,
  getLayoutsTablesFooterShellStyle,
  getLayoutsTablesFooterTextStyle,
  getLayoutsTablesHeaderDividerStyle,
  getLayoutsTablesHeaderGridStyle,
  getLayoutsTablesHeaderShellStyle,
  getLayoutsTablesHeaderTitleStyle,
  getLayoutsTablesLinkCellStyle,
  getLayoutsTablesMetaCellStyle,
  getLayoutsTablesMoneyCellStyle,
  getLayoutsTablesPopLogoStyle,
  getLayoutsTablesPopNameStyle,
  getLayoutsTablesPrimaryCellStyle,
  getLayoutsTablesRoleStyle,
  getLayoutsTablesRowBackground,
  getLayoutsTablesSecondaryCellStyle,
  getLayoutsTablesShellStyle,
  getLayoutsTablesStatusBadgeStyle,
  getLayoutsTablesStructureCaptionBandStyle,
  getLayoutsTablesStructureCaptionStyle,
  getLayoutsTablesTableShellStyle,
  getLayoutsTablesTableStyle,
  getLayoutsTablesHeadCellStyle,
  getLayoutsTablesSortButtonStyle,
  getLayoutsTablesSortHeadInnerStyle,
  getLayoutsTablesSortHeadLabelStyle,
  getLayoutsTablesToolbarShellStyle,
  getLayoutsTablesUserNameStyle,
  getLayoutsTablesWireframeZoneStyle,
  getLayoutsTablesWireframeColumnDividerColor,
  LAYOUTS_TABLES_ANATOMY,
  type LayoutsTablesSortDirection,
  type LayoutsTablesStatusId,
} from "@/app/library/layouts/layoutsTablesHardcodedSpec"
import {
  ROOTSY_LAYOUTS_TABLES_CHROME,
  ROOTSY_LAYOUTS_TABLES_STATUS,
} from "@/app/library/layouts/rootsyLayoutsTablesSystem"
import { COLOR_TOKENS } from "@/app/library/color/rootsyColorSystem"
import { RootsFormToolbarListFilters } from "@/components/rootsy-form"
import {
  getIconButtonUiRowSurface,
  type IconButtonUiInteractionState,
} from "@/app/library/ui-components/buttonsUiHardcodedSpec"
import { cn } from "@/lib/utils"
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ArrowUpDown,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FolderTree,
  Maximize2,
  Plus,
} from "lucide-react"
import type { CSSProperties, ReactNode } from "react"

const DEMO_PAGE_TITLE = "Layout tablas"
const DEMO_USER_ROLE = "Administradora"
const DEMO_POP_NAME = "Rootsy Market"
const DEMO_POP_LOGO = "https://api.dicebear.com/7.x/shapes/svg?seed=demo-pop&backgroundColor=e8f5ef"
const DEMO_USER_NAME = "María González"
const DEMO_USER_AVATAR = "https://api.dicebear.com/7.x/avataaars/svg?seed=maria-gonzalez"

type LayoutsTablesDemoPartProps = {
  composed?: boolean
  hideLabels?: boolean
}

type DemoRow = {
  id: string
  title: string
  subtitle: string
  ref: string
  amount: string
  status: LayoutsTablesStatusId
}

const DEMO_ROWS: DemoRow[] = [
  {
    id: "1",
    title: "Yerba mate 1 kg cónico",
    subtitle: "SKU: YER-001",
    ref: "PRV-7781-1",
    amount: "$ 18.420",
    status: "activo",
  },
  {
    id: "2",
    title: "Aceite girasol 900 ml",
    subtitle: "SKU: ACE-014",
    ref: "PRV-9920-2",
    amount: "$ 4.890",
    status: "pendiente",
  },
  {
    id: "3",
    title: "Galletitas surtidas 400 g",
    subtitle: "SKU: GAL-221",
    ref: "PRV-4410-8",
    amount: "$ 2.150",
    status: "vencido",
  },
]

function LayoutHeightBadge({ label }: { label: string }) {
  return (
    <span
      className="pointer-events-none absolute right-2 top-1.5 z-20 rounded-md px-1.5 py-0.5 font-mono text-[10px] ring-1"
      style={{
        backgroundColor: COLOR_TOKENS.white,
        color: COLOR_TOKENS.bruma500,
        border: `1px solid ${COLOR_TOKENS.bruma200}`,
      }}
    >
      {label}
    </span>
  )
}

/** Sub-sección doc — vista / wireframe / componentes dentro de una zona. */
export function LayoutsTablesDocZone({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold tracking-tight text-[var(--rootsy-bruma-900)]">{title}</h4>
        {description ? (
          <p className="mt-1 max-w-3xl text-xs leading-relaxed text-[var(--rootsy-bruma-500)]">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </div>
  )
}

export function LayoutsTablesFiltersDemo({ composed = false, hideLabels = false }: LayoutsTablesDemoPartProps) {
  const shellStyle = getLayoutsTablesToolbarShellStyle()

  return (
    <div
      style={{
        ...shellStyle,
        ...(composed
          ? {}
          : {
              borderRadius: LAYOUTS_TABLES_ANATOMY.shellRadiusPx,
              overflow: "hidden",
            }),
      }}
    >
      <RootsFormToolbarListFilters hideLabels={hideLabels} />
    </div>
  )
}

export function LayoutsTablesHeaderChromeButtons() {
  const ghost = getLayoutsTablesChromeIconButtonStyle("ghost")

  return (
    <>
      <button type="button" style={ghost} aria-hidden tabIndex={-1}>
        <ArrowLeft size={20} aria-hidden />
      </button>
      <button type="button" style={ghost} aria-hidden tabIndex={-1}>
        <Maximize2 size={20} aria-hidden />
      </button>
    </>
  )
}

export function LayoutsTablesPopProfile() {
  const logoStyle = getLayoutsTablesPopLogoStyle()

  return (
    <div style={{ display: "flex", minWidth: 0, alignItems: "center", gap: 10 }}>
      <div style={logoStyle}>
        <img src={DEMO_POP_LOGO} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <span style={{ ...getLayoutsTablesPopNameStyle(), overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {DEMO_POP_NAME}
      </span>
    </div>
  )
}

export function LayoutsTablesHeaderTitleBlock() {
  return <h1 style={{ ...getLayoutsTablesHeaderTitleStyle(), margin: 0 }}>{DEMO_PAGE_TITLE}</h1>
}

export function LayoutsTablesHeaderActionButtons() {
  const primary = getLayoutsTablesChromeIconButtonStyle("primary")
  const secondary = getLayoutsTablesChromeIconButtonStyle("outlined")

  return (
    <>
      <button type="button" style={primary} aria-hidden tabIndex={-1}>
        <Plus size={20} aria-hidden />
      </button>
      <button type="button" style={secondary} aria-hidden tabIndex={-1}>
        <FolderTree size={20} aria-hidden />
      </button>
    </>
  )
}

export function LayoutsTablesUserProfile() {
  const avatarButton = getLayoutsTablesChromeIconButtonStyle("ghost")

  return (
    <>
      <div style={{ display: "none", minWidth: 0, flexDirection: "column", lineHeight: 1.25 }} className="sm:!flex">
        <span style={{ ...getLayoutsTablesUserNameStyle(), overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {DEMO_USER_NAME}
        </span>
        <span style={getLayoutsTablesRoleStyle()}>{DEMO_USER_ROLE}</span>
      </div>
      <button type="button" style={{ ...avatarButton, position: "relative", overflow: "hidden", padding: 0 }} aria-hidden tabIndex={-1}>
        <img src={DEMO_USER_AVATAR} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <span
          aria-hidden
          style={{
            position: "absolute",
            bottom: 4,
            right: 4,
            width: 10,
            height: 10,
            borderRadius: 9999,
            backgroundColor: ROOTSY_LAYOUTS_TABLES_CHROME.onlineDotColor,
            boxShadow: `0 0 0 2px ${ROOTSY_LAYOUTS_TABLES_CHROME.onlineDotRing}`,
          }}
        />
      </button>
    </>
  )
}

export function LayoutsTablesHeaderLeftZone({ className }: { className?: string }) {
  return (
    <div className={cn("flex min-w-0 items-center gap-2", className)}>
      <LayoutsTablesHeaderChromeButtons />
      <div style={getLayoutsTablesHeaderDividerStyle()} aria-hidden />
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
      <div style={getLayoutsTablesHeaderDividerStyle()} aria-hidden />
      <div className="pointer-events-none flex min-w-0 items-center gap-3" aria-hidden>
        <LayoutsTablesUserProfile />
      </div>
    </div>
  )
}

export function LayoutsTablesHeaderDemo({ composed = false }: LayoutsTablesDemoPartProps) {
  return (
    <LayoutsTablesNightForestSurface
      style={getLayoutsTablesHeaderShellStyle()}
      contentStyle={{ height: "100%" }}
      className={composed ? "shrink-0" : undefined}
    >
      <div style={getLayoutsTablesHeaderGridStyle()}>
        <LayoutsTablesHeaderLeftZone />
        <LayoutsTablesHeaderCenterZone />
        <LayoutsTablesHeaderRightZone />
      </div>
    </LayoutsTablesNightForestSurface>
  )
}

function WireframeColumnGrid({
  heightPx,
  kind,
}: {
  heightPx: number
  kind: "chrome" | "toolbar" | "footer"
}) {
  const columnDivider = getLayoutsTablesWireframeColumnDividerColor(kind)

  return (
    <div style={{ ...getLayoutsTablesWireframeZoneStyle(kind), height: heightPx }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          height: "100%",
        }}
      >
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            style={{
              borderRight: index < 2 ? `1px solid ${columnDivider}` : undefined,
            }}
          />
        ))}
      </div>
    </div>
  )
}

function LayoutsTablesContentGridBody({
  scrollRows = 8,
  showFooter = true,
}: {
  scrollRows?: number
  showFooter?: boolean
}) {
  return (
    <>
      <div className="relative shrink-0">
        <LayoutHeightBadge label={`layout.toolbar · ${LAYOUTS_TABLES_ANATOMY.toolbarHeightPx}px`} />
        <WireframeColumnGrid heightPx={LAYOUTS_TABLES_ANATOMY.toolbarHeightPx} kind="toolbar" />
      </div>

      <div
        style={{
          ...getLayoutsTablesBodyCanvasStyle(),
          position: "relative",
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="relative shrink-0">
          <LayoutHeightBadge label={`table.head · ${LAYOUTS_TABLES_ANATOMY.tableHeadHeightPx}px`} />
          <div
            style={{
              ...getLayoutsTablesWireframeZoneStyle("head"),
              height: LAYOUTS_TABLES_ANATOMY.tableHeadHeightPx,
            }}
          />
        </div>
        <div className="relative min-h-0 flex-1 overflow-auto">
          <LayoutHeightBadge
            label={`table.body · ${LAYOUTS_TABLES_ANATOMY.tableRowHeightPx}px/fila · scroll`}
          />
          <div>
            {Array.from({ length: scrollRows }, (_, index) => (
              <div
                key={index}
                style={{
                  height: LAYOUTS_TABLES_ANATOMY.tableRowHeightPx,
                  backgroundColor: getLayoutsTablesRowBackground(index, { noHover: true }),
                  borderBottom: `1px solid ${LAYOUTS_TABLES_ANATOMY.contentBorderColor}`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {showFooter ? (
        <div className="relative shrink-0">
          <LayoutHeightBadge label={`layout.footer · ${LAYOUTS_TABLES_ANATOMY.footerHeightPx}px`} />
          <WireframeColumnGrid heightPx={LAYOUTS_TABLES_ANATOMY.footerHeightPx} kind="footer" />
        </div>
      ) : null}
    </>
  )
}

export function LayoutsTablesDocSubsection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-[var(--rootsy-bruma-900)]">{title}</h4>
      {children}
    </div>
  )
}

/** Vista previa — tablas dentro del shell módulo (fondo POP + header glass + bruma). */
export function LayoutsTablesModulePreviewDemo() {
  return (
    <LayoutsModuleShellWithContent
      height="26rem"
      contentLabel="layout.module.content · tablas"
    >
      <LayoutsTablesFullPageDraft composed />
    </LayoutsModuleShellWithContent>
  )
}

/** 1 · Grid del contenido — toolbar · tabla scroll · footer. */
export function LayoutsTablesContentGridWireframeDemo() {
  return (
    <div
      className="mx-auto flex max-w-4xl flex-col library-doc-table-shell overflow-hidden rounded-2xl"
      style={{ height: "22rem" }}
    >
      <LayoutsTablesContentGridBody scrollRows={10} />
    </div>
  )
}

export function LayoutsTablesLayoutGridDemo({ contentOnly = false }: { contentOnly?: boolean }) {
  const body = <LayoutsTablesContentGridBody scrollRows={contentOnly ? 6 : 12} showFooter={!contentOnly} />

  if (contentOnly) {
    return <div className="flex h-64 flex-col overflow-hidden">{body}</div>
  }

  return (
    <div
      className="mx-auto flex max-w-4xl flex-col overflow-hidden"
      style={{
        height: "28rem",
        ...getLayoutsTablesShellStyle(false),
      }}
    >
      <div className="relative shrink-0">
        <LayoutHeightBadge label={`layout.header · ${LAYOUTS_TABLES_ANATOMY.headerHeightPx}px`} />
        <WireframeColumnGrid heightPx={LAYOUTS_TABLES_ANATOMY.headerHeightPx} kind="chrome" />
      </div>
      {body}
    </div>
  )
}

/** Vista ensamblada — header + toolbar + tabla (sin footer). */
export function LayoutsTablesHeaderBodyFullDemo() {
  return (
    <div
      className="mx-auto flex max-w-4xl flex-col overflow-hidden"
      style={{
        height: "24rem",
        ...getLayoutsTablesShellStyle(false),
      }}
    >
      <LayoutsTablesHeaderDemo composed />
      <LayoutsTablesFiltersDemo composed />
      <div style={{ ...getLayoutsTablesBodyCanvasStyle(), flex: 1, minHeight: 0 }}>
        <LayoutsTablesBodyDemo composed />
      </div>
    </div>
  )
}

/** Wireframe — header + toolbar + cuerpo scrollable (sin footer). */
export function LayoutsTablesHeaderBodyWireframeDemo() {
  return (
    <div
      className="mx-auto flex max-w-4xl flex-col overflow-hidden"
      style={{
        height: "22rem",
        ...getLayoutsTablesShellStyle(false),
      }}
    >
      <div className="relative shrink-0">
        <LayoutHeightBadge label="layout.header · 68px" />
        <WireframeColumnGrid heightPx={LAYOUTS_TABLES_ANATOMY.headerHeightPx} kind="chrome" />
      </div>

      <div className="relative shrink-0">
        <LayoutHeightBadge label="layout.toolbar · 92px" />
        <WireframeColumnGrid heightPx={LAYOUTS_TABLES_ANATOMY.toolbarHeightPx} kind="toolbar" />
      </div>

      <div style={{ ...getLayoutsTablesBodyCanvasStyle(), position: "relative", flex: 1, minHeight: 0 }}>
        <div className="relative shrink-0">
          <LayoutHeightBadge label="table.head · 40px" />
          <div style={{ ...getLayoutsTablesWireframeZoneStyle("head"), height: LAYOUTS_TABLES_ANATOMY.tableHeadHeightPx }} />
        </div>
        <div className="relative min-h-0 flex-1 overflow-auto">
          <LayoutHeightBadge label="table.row · 56px · scroll" />
          <div>
            {Array.from({ length: 8 }, (_, index) => (
              <div
                key={index}
                style={{
                  height: LAYOUTS_TABLES_ANATOMY.tableRowHeightPx,
                  backgroundColor: getLayoutsTablesRowBackground(index, { noHover: true }),
                  borderBottom: `1px solid ${LAYOUTS_TABLES_ANATOMY.contentBorderColor}`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/** Wireframe — solo footer de paginación. */
export function LayoutsTablesFooterWireframeDemo() {
  return (
    <div
      className="mx-auto max-w-4xl overflow-hidden"
      style={{
        ...getLayoutsTablesShellStyle(false),
      }}
    >
      <div className="relative">
        <LayoutHeightBadge label="layout.footer · 68px" />
        <WireframeColumnGrid heightPx={LAYOUTS_TABLES_ANATOMY.footerHeightPx} kind="footer" />
      </div>
    </div>
  )
}

export function LayoutsTablesNightForestGradientDemo() {
  return <LayoutsTablesNightForestSurface bare style={{ height: LAYOUTS_TABLES_ANATOMY.headerHeightPx, width: "100%" }} />
}

export function LayoutsTablesHeaderStructureDemo() {
  return (
    <LayoutsTablesNightForestSurface style={{ borderRadius: LAYOUTS_TABLES_ANATOMY.shellRadiusPx, overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
        <div style={{ display: "flex", alignItems: "center", minHeight: LAYOUTS_TABLES_ANATOMY.headerHeightPx, padding: "12px 16px", borderRight: `1px solid ${LAYOUTS_TABLES_ANATOMY.columnDividerColor}` }}>
          <LayoutsTablesHeaderLeftZone />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: LAYOUTS_TABLES_ANATOMY.headerHeightPx, padding: "12px 16px", borderRight: `1px solid ${LAYOUTS_TABLES_ANATOMY.columnDividerColor}` }}>
          <LayoutsTablesHeaderCenterZone />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", minHeight: LAYOUTS_TABLES_ANATOMY.headerHeightPx, padding: "12px 16px" }}>
          <LayoutsTablesHeaderRightZone />
        </div>
      </div>
      <div style={getLayoutsTablesStructureCaptionBandStyle()}>
        <p style={getLayoutsTablesStructureCaptionStyle()}>Izquierda · chrome + POP</p>
        <p style={getLayoutsTablesStructureCaptionStyle()}>Centro · título</p>
        <p style={getLayoutsTablesStructureCaptionStyle()}>Derecha · acciones + usuario</p>
      </div>
    </LayoutsTablesNightForestSurface>
  )
}

export function LayoutsTablesFooterComponentsDemo() {
  return <LayoutsTablesFooterDemo />
}

export function LayoutsTablesChromeButtonsDemo() {
  return (
    <LayoutsTablesNightForestSurface style={{ display: "inline-flex", borderRadius: LAYOUTS_TABLES_ANATOMY.shellRadiusPx }} contentStyle={{ display: "inline-flex", padding: 16 }}>
      <LayoutsTablesHeaderChromeButtons />
    </LayoutsTablesNightForestSurface>
  )
}

export function LayoutsTablesSecondaryIconButtonsDemo() {
  return (
    <LayoutsTablesNightForestSurface style={{ display: "inline-flex", borderRadius: LAYOUTS_TABLES_ANATOMY.shellRadiusPx }} contentStyle={{ display: "inline-flex", padding: 16 }}>
      <button type="button" style={getLayoutsTablesChromeIconButtonStyle("outlined")} aria-hidden tabIndex={-1}>
        <FolderTree size={20} aria-hidden />
      </button>
    </LayoutsTablesNightForestSurface>
  )
}

export function LayoutsTablesPrimaryIconButtonsDemo() {
  return (
    <LayoutsTablesNightForestSurface style={{ display: "inline-flex", borderRadius: LAYOUTS_TABLES_ANATOMY.shellRadiusPx }} contentStyle={{ display: "inline-flex", padding: 16 }}>
      <button type="button" style={getLayoutsTablesChromeIconButtonStyle("primary")} aria-hidden tabIndex={-1}>
        <Plus size={20} aria-hidden />
      </button>
    </LayoutsTablesNightForestSurface>
  )
}

export function LayoutsTablesPopProfileDemo() {
  return (
    <LayoutsTablesNightForestSurface style={{ display: "inline-flex", borderRadius: LAYOUTS_TABLES_ANATOMY.shellRadiusPx }} contentStyle={{ display: "inline-flex", padding: 16 }}>
      <LayoutsTablesPopProfile />
    </LayoutsTablesNightForestSurface>
  )
}

export function LayoutsTablesUserProfileDemo() {
  return (
    <LayoutsTablesNightForestSurface style={{ display: "inline-flex", borderRadius: LAYOUTS_TABLES_ANATOMY.shellRadiusPx }} contentStyle={{ display: "inline-flex", padding: 16 }}>
      <div className="pointer-events-none flex min-w-0 items-center gap-3" aria-hidden>
        <LayoutsTablesUserProfile />
      </div>
    </LayoutsTablesNightForestSurface>
  )
}

export function LayoutsTablesComponentsTable({
  rows = LAYOUTS_TABLES_SCREEN_COMPONENTS,
  caption,
}: {
  rows?: typeof LAYOUTS_TABLES_SCREEN_COMPONENTS
  caption?: string
}) {
  return (
    <div className="space-y-2">
      {caption ? (
        <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--rootsy-bruma-500)]">
          {caption}
        </p>
      ) : null}
      <div className="library-doc-table-shell overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-bruma-50)]">
              <th className="px-4 py-3 font-semibold text-[var(--rootsy-bruma-900)]">Capa</th>
              <th className="px-4 py-3 font-semibold text-[var(--rootsy-bruma-900)]">Componente</th>
              <th className="px-4 py-3 font-semibold text-[var(--rootsy-bruma-900)]">Token</th>
              <th className="px-4 py-3 font-semibold text-[var(--rootsy-bruma-900)]">Fuente</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.layer}-${row.component}-${row.token}`} className="border-b border-[var(--rootsy-bruma-200)] last:border-0">
                <td className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--rootsy-bruma-500)]">{row.layer}</td>
                <td className="px-4 py-3 text-[var(--rootsy-bruma-900)]">{row.component}</td>
                <td className="px-4 py-3 font-mono text-[11px] text-[var(--rootsy-savia-600)]">{row.token}</td>
                <td className="px-4 py-3 font-mono text-[10px] text-[var(--rootsy-bruma-500)]">{row.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function LayoutsTablesHeaderComponentsPanel() {
  return (
    <div className="space-y-6">
      <LayoutsTablesDocZone
        title="Ensamblado"
        description="Tres columnas — izquierda chrome + POP, centro título, derecha acciones + usuario."
      >
        <LayoutsTablesHeaderStructureDemo />
      </LayoutsTablesDocZone>

      <LayoutsTablesDocZone
        title="Piezas sueltas"
        description="Cada control del header sobre chrome sombra."
      >
        <div className="flex flex-wrap items-start gap-4">
          <LayoutsTablesChromeButtonsDemo />
          <LayoutsTablesSecondaryIconButtonsDemo />
          <LayoutsTablesPrimaryIconButtonsDemo />
          <LayoutsTablesPopProfileDemo />
          <LayoutsTablesUserProfileDemo />
        </div>
      </LayoutsTablesDocZone>

      <LayoutsTablesComponentsTable
        rows={getLayoutsTablesScreenComponentsByLayer("Header")}
        caption="Inventario · header"
      />
    </div>
  )
}

export function LayoutsTablesBodyComponentsPanel() {
  return (
    <LayoutsTablesComponentsTable
      rows={getLayoutsTablesScreenComponentsByLayer("Toolbar", "Tabla")}
      caption="Inventario · toolbar + tabla"
    />
  )
}

export function LayoutsTablesFooterComponentsPanel() {
  return (
    <LayoutsTablesComponentsTable
      rows={getLayoutsTablesScreenComponentsByLayer("Footer")}
      caption="Inventario · footer"
    />
  )
}

function LayoutsTablesSortButton({
  direction = "none",
  label,
  interaction = "default",
}: {
  direction?: LayoutsTablesSortDirection
  label: string
  interaction?: IconButtonUiInteractionState
}) {
  const SortIcon =
    direction === "asc" ? ArrowUp : direction === "desc" ? ArrowDown : ArrowUpDown
  const sortLabel =
    direction === "asc"
      ? `${label}, orden ascendente`
      : direction === "desc"
        ? `${label}, orden descendente`
        : `Ordenar ${label}`

  return (
    <button
      type="button"
      style={getLayoutsTablesSortButtonStyle(direction, interaction)}
      aria-label={sortLabel}
      tabIndex={-1}
    >
      <SortIcon size={16} aria-hidden />
    </button>
  )
}

function LayoutsTablesSortHeadCell({
  label,
  direction = "none",
  align = "left",
  width,
  interaction = "default",
}: {
  label: string
  direction?: LayoutsTablesSortDirection
  align?: "left" | "right"
  width?: number
  interaction?: IconButtonUiInteractionState
}) {
  const headStyle = getLayoutsTablesHeadCellStyle()

  return (
    <th
      style={{
        ...headStyle,
        width,
        textAlign: align === "right" ? "right" : "left",
      }}
      scope="col"
      aria-sort={
        direction === "asc"
          ? "ascending"
          : direction === "desc"
            ? "descending"
            : "none"
      }
    >
      <div style={getLayoutsTablesSortHeadInnerStyle(align)}>
        {align === "right" ? (
          <>
            <LayoutsTablesSortButton
              direction={direction}
              label={label}
              interaction={interaction}
            />
            <span style={getLayoutsTablesSortHeadLabelStyle(direction)}>{label}</span>
          </>
        ) : (
          <>
            <span style={getLayoutsTablesSortHeadLabelStyle(direction)}>{label}</span>
            <LayoutsTablesSortButton
              direction={direction}
              label={label}
              interaction={interaction}
            />
          </>
        )}
      </div>
    </th>
  )
}

function LayoutsTablesTableHeadRow() {
  const headStyle = getLayoutsTablesHeadCellStyle()
  const checkboxStyle = getLayoutsTablesCheckboxStyle()

  return (
    <tr>
      <th style={{ ...headStyle, width: 48, paddingLeft: 0, paddingRight: 0 }} scope="col">
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={checkboxStyle} aria-hidden />
        </div>
      </th>
      <LayoutsTablesSortHeadCell label="Artículo" direction="asc" />
      <LayoutsTablesSortHeadCell label="Referencia" direction="none" width={144} />
      <LayoutsTablesSortHeadCell label="Monto" direction="desc" align="right" width={112} />
      <th style={{ ...headStyle, width: 112 }} scope="col">
        Estado
      </th>
    </tr>
  )
}

function LayoutsTablesTableContent({ rows, composed = false }: { rows: DemoRow[]; composed?: boolean }) {
  const cellStyle = getLayoutsTablesBodyCellStyle()
  const checkboxStyle = getLayoutsTablesCheckboxStyle()

  return (
    <table style={getLayoutsTablesTableStyle()}>
      <thead>
        <LayoutsTablesTableHeadRow />
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={`${row.id}-${index}`} style={{ backgroundColor: getLayoutsTablesRowBackground(index, { noHover: composed }) }}>
            <td style={{ ...cellStyle, width: 48, textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <div style={checkboxStyle} aria-hidden />
              </div>
            </td>
            <td style={cellStyle}>
              <p style={getLayoutsTablesPrimaryCellStyle()}>{row.title}</p>
              <p style={{ ...getLayoutsTablesSecondaryCellStyle(), marginTop: 2 }}>{row.subtitle}</p>
            </td>
            <td style={cellStyle}>
              <p style={getLayoutsTablesMetaCellStyle()}>Proveedores</p>
              <p style={getLayoutsTablesLinkCellStyle()}>{row.ref}</p>
            </td>
            <td style={cellStyle}>
              <p style={getLayoutsTablesMoneyCellStyle()}>{row.amount}</p>
            </td>
            <td style={cellStyle}>
              <span style={getLayoutsTablesStatusBadgeStyle(row.status)}>{ROOTSY_LAYOUTS_TABLES_STATUS[row.status].label}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function LayoutsTablesFiltersSectionDemo() {
  return (
    <div
      className="mx-auto max-w-4xl library-doc-table-shell overflow-hidden rounded-2xl"
      style={getLayoutsTablesShellStyle(false)}
    >
      <div className="relative">
        <LayoutHeightBadge label={`layout.toolbar · ${LAYOUTS_TABLES_ANATOMY.toolbarHeightPx}px`} />
        <LayoutsTablesFiltersDemo composed hideLabels={false} />
      </div>
    </div>
  )
}

/** 3 · Head de tabla — selección + columnas ordenables. */
export function LayoutsTablesTableHeadDemo() {
  return (
    <div
      className="relative mx-auto max-w-4xl library-doc-table-shell overflow-hidden rounded-2xl"
      style={getLayoutsTablesShellStyle(false)}
    >
      <LayoutHeightBadge label={`table.head · ${LAYOUTS_TABLES_ANATOMY.tableHeadHeightPx}px`} />
      <div style={getLayoutsTablesTableShellStyle(false)}>
        <table style={getLayoutsTablesTableStyle()}>
          <thead>
            <LayoutsTablesTableHeadRow />
          </thead>
        </table>
      </div>
    </div>
  )
}

/** 3.2 · Botón de orden en header — estados. */
export function LayoutsTablesSortHeadSectionDemo() {
  const headStyle = getLayoutsTablesHeadCellStyle()
  const previewRows: Array<{
    caption: string
    label: string
    direction: LayoutsTablesSortDirection
    interaction?: IconButtonUiInteractionState
  }> = [
    { caption: "Reposo · sin orden", label: "Referencia", direction: "none" },
    { caption: "Reposo · ascendente", label: "Artículo", direction: "asc" },
    { caption: "Reposo · descendente", label: "Monto", direction: "desc" },
    {
      caption: "Hover · sin orden",
      label: "Referencia",
      direction: "none",
      interaction: "hover",
    },
    {
      caption: "Hover · ascendente",
      label: "Artículo",
      direction: "asc",
      interaction: "hover",
    },
  ]

  return (
    <div className="space-y-6">
      <LayoutsTablesDocZone
        title="Columna ordenable"
        description="Label body.small medium + icon-button row · neutral (reposo) · edit (activo) · space.400."
      >
        <div
          className="relative mx-auto max-w-4xl library-doc-table-shell overflow-hidden rounded-2xl"
          style={getLayoutsTablesShellStyle(false)}
        >
          <LayoutHeightBadge label={`table.head.sort · ${LAYOUTS_TABLES_ANATOMY.tableHeadHeightPx}px`} />
          <div style={getLayoutsTablesTableShellStyle(false)}>
            <table style={getLayoutsTablesTableStyle()}>
              <thead>
                <LayoutsTablesTableHeadRow />
              </thead>
            </table>
          </div>
        </div>
      </LayoutsTablesDocZone>

      <LayoutsTablesDocZone
        title="Estados del botón"
        description="Ciclo none → asc → desc · ícono ArrowUpDown / ArrowUp / ArrowDown."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {previewRows.map((row) => (
            <div
              key={row.caption}
              className="library-doc-table-shell overflow-hidden rounded-2xl"
              style={getLayoutsTablesTableShellStyle(false)}
            >
              <p className="border-b border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-bruma-50)] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--rootsy-bruma-500)]">
                {row.caption}
              </p>
              <table style={getLayoutsTablesTableStyle()}>
                <thead>
                  <tr>
                    <th style={headStyle} scope="col">
                      <div style={getLayoutsTablesSortHeadInnerStyle("left")}>
                        <span style={getLayoutsTablesSortHeadLabelStyle(row.direction)}>
                          {row.label}
                        </span>
                        <LayoutsTablesSortButton
                          direction={row.direction}
                          label={row.label}
                          interaction={row.interaction}
                        />
                      </div>
                    </th>
                  </tr>
                </thead>
              </table>
            </div>
          ))}
        </div>
      </LayoutsTablesDocZone>
    </div>
  )
}

/** 4 · Body de tabla — filas alternadas + scroll. */
export function LayoutsTablesTableBodySectionDemo() {
  return (
    <div
      className="relative mx-auto flex max-w-4xl flex-col library-doc-table-shell overflow-hidden rounded-2xl"
      style={{ height: "16rem", ...getLayoutsTablesShellStyle(false) }}
    >
      <LayoutHeightBadge
        label={`table.body · ${LAYOUTS_TABLES_ANATOMY.tableRowHeightPx}px/fila · scroll`}
      />
      <div style={{ ...getLayoutsTablesBodyCanvasStyle(), flex: 1, minHeight: 0, overflow: "auto" }}>
        <LayoutsTablesBodyDemo composed />
      </div>
    </div>
  )
}

/** 5 · Footer de tabla — paginación. */
export function LayoutsTablesTableFooterSectionDemo() {
  return (
    <div className="relative mx-auto max-w-4xl library-doc-table-shell overflow-hidden rounded-2xl">
      <LayoutHeightBadge label={`layout.footer · ${LAYOUTS_TABLES_ANATOMY.footerHeightPx}px`} />
      <LayoutsTablesFooterDemo composed />
    </div>
  )
}

export function LayoutsTablesBodyDemo({ composed = false }: LayoutsTablesDemoPartProps) {
  const rows = composed ? [...DEMO_ROWS, ...DEMO_ROWS, ...DEMO_ROWS, ...DEMO_ROWS] : DEMO_ROWS

  return (
    <div style={getLayoutsTablesTableShellStyle(composed)}>
      <LayoutsTablesTableContent rows={rows} composed={composed} />
    </div>
  )
}

export function LayoutsTablesFooterDemo({ composed = false }: LayoutsTablesDemoPartProps) {
  const nav = getLayoutsTablesFooterNavButtonStyle()
  const shellStyle: CSSProperties = {
    ...getLayoutsTablesFooterShellStyle(composed),
    ...(composed ? {} : { maxWidth: "56rem", margin: "0 auto", width: "100%", ...getLayoutsTablesShellStyle(false) }),
  }

  return (
    <div style={shellStyle}>
      <div style={getLayoutsTablesFooterGridStyle()}>
        <p style={{ ...getLayoutsTablesFooterTextStyle(true), margin: 0 }}>
          Mostrando <strong style={{ color: ROOTSY_LAYOUTS_TABLES_CHROME.titleColor }}>1–20</strong> de{" "}
          <strong style={{ color: ROOTSY_LAYOUTS_TABLES_CHROME.titleColor }}>1.248</strong>
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button type="button" style={nav} aria-hidden tabIndex={-1}>
            <ChevronsLeft size={16} aria-hidden />
          </button>
          <button type="button" style={nav} aria-hidden tabIndex={-1}>
            <ChevronLeft size={16} aria-hidden />
          </button>
          <span style={{ ...getLayoutsTablesFooterTextStyle(), padding: "0 4px" }}>1 / 63</span>
          <button type="button" style={nav} aria-hidden tabIndex={-1}>
            <ChevronRight size={16} aria-hidden />
          </button>
          <button type="button" style={nav} aria-hidden tabIndex={-1}>
            <ChevronsRight size={16} aria-hidden />
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
          <span style={getLayoutsTablesFooterTextStyle(true)}>Por página</span>
          <div style={getLayoutsTablesFooterSelectStyle()}>
            20
            <ChevronDown size={14} aria-hidden />
          </div>
        </div>
      </div>
    </div>
  )
}

export function LayoutsTablesFullPageDraft({ composed = false }: LayoutsTablesDemoPartProps) {
  const inner = (
    <>
      <LayoutsTablesFiltersDemo composed />
      <div style={{ ...getLayoutsTablesBodyCanvasStyle(), flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <LayoutsTablesBodyDemo composed />
        <LayoutsTablesFooterDemo composed />
      </div>
    </>
  )

  if (composed) {
    return <div className="flex min-h-0 flex-1 flex-col">{inner}</div>
  }

  return (
    <div
      className="mx-auto flex max-w-4xl flex-col"
      style={{
        height: "28rem",
        ...getLayoutsTablesShellStyle(false),
      }}
    >
      <LayoutsTablesHeaderDemo composed />
      {inner}
    </div>
  )
}

export function LayoutsTablesOverviewIntro() {
  return (
    <div
      className="rounded-2xl border p-6"
      style={{
        backgroundColor: COLOR_TOKENS.white,
        borderColor: COLOR_TOKENS.bruma200,
        boxShadow: "0 1px 2px rgb(15 23 42 / 0.06)",
      }}
    >
      <div className="flex items-start gap-3">
        <span
          className="inline-flex size-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: COLOR_TOKENS.savia100, color: COLOR_TOKENS.savia600 }}
        >
          <BookOpen className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 space-y-2">
          <h2 className="text-lg font-semibold tracking-tight" style={{ color: COLOR_TOKENS.bruma900 }}>
            Patrones de listado
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed" style={{ color: COLOR_TOKENS.bruma500 }}>
            Documentamos dos familias de pantalla operativa en el POP:{" "}
            <span className="font-medium" style={{ color: COLOR_TOKENS.bruma900 }}>
              Tablas
            </span>{" "}
            para listados densos con filtros y paginación, y{" "}
            <span className="font-medium" style={{ color: COLOR_TOKENS.bruma900 }}>
              Bloques
            </span>{" "}
            para grids de tarjetas. Misma raíz sombra/bruma — distinta densidad.
          </p>
        </div>
      </div>
    </div>
  )
}

function LayoutsTablesRowActionsMenu() {
  const trigger = getIconButtonUiRowSurface("neutral")

  return (
    <button
      type="button"
      aria-label="Acciones"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 32,
        height: 32,
        backgroundColor: trigger.backgroundColor,
        color: trigger.iconColor,
        border: trigger.border,
        borderRadius: trigger.borderRadiusPx,
        padding: 0,
      }}
    >
      ⋮
    </button>
  )
}

export function LayoutsTablesRowActionsPreview() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <LayoutsTablesRowActionsMenu />
    </div>
  )
}
