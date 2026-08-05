"use client"

import { LayoutsTablesNightForestSurface } from "@/app/[siteId]/[popId]/library/layouts/LayoutsTablesNightForestSurface"
import { LAYOUTS_TABLES_SCREEN_COMPONENTS } from "@/app/[siteId]/[popId]/library/layouts/layoutsTablesScreenComponents"
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
  getLayoutsTablesToolbarShellStyle,
  getLayoutsTablesUserNameStyle,
  getLayoutsTablesWireframeZoneStyle,
  LAYOUTS_TABLES_ANATOMY,
  type LayoutsTablesStatusId,
} from "@/app/[siteId]/[popId]/library/layouts/layoutsTablesHardcodedSpec"
import { ROOTSY_LAYOUTS_TABLES_CHROME } from "@/app/[siteId]/[popId]/library/layouts/rootsyLayoutsTablesSystem"
import { COLOR_TOKENS } from "@/app/[siteId]/[popId]/library/color/rootsyColorSystem"
import { RootsFormToolbarListFilters } from "@/components/rootsy-form"
import { getIconButtonUiRowSurface } from "@/app/[siteId]/[popId]/library/ui-components/buttonsUiHardcodedSpec"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
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
import type { CSSProperties } from "react"

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

function WireframeColumnGrid({ heightPx, kind }: { heightPx: number; kind: Parameters<typeof getLayoutsTablesWireframeZoneStyle>[0] }) {
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
              borderRight: index < 2 ? `1px solid ${LAYOUTS_TABLES_ANATOMY.columnDividerColor}` : undefined,
            }}
          />
        ))}
      </div>
    </div>
  )
}

export function LayoutsTablesLayoutGridDemo() {
  return (
    <div
      className="mx-auto flex max-w-4xl flex-col overflow-hidden"
      style={{
        height: "28rem",
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

      <div style={{ ...getLayoutsTablesBodyCanvasStyle(), position: "relative" }}>
        <div className="relative shrink-0">
          <LayoutHeightBadge label="table.head · 40px" />
          <div style={{ ...getLayoutsTablesWireframeZoneStyle("head"), height: LAYOUTS_TABLES_ANATOMY.tableHeadHeightPx }} />
        </div>
        <div className="relative min-h-0 flex-1 overflow-auto">
          <LayoutHeightBadge label="table.row · 56px · scroll" />
          <div>
            {Array.from({ length: 12 }, (_, index) => (
              <div
                key={index}
                style={{
                  height: LAYOUTS_TABLES_ANATOMY.tableRowHeightPx,
                  backgroundColor: getLayoutsTablesRowBackground(index, { noHover: true }),
                  borderBottom: `1px solid ${LAYOUTS_TABLES_ANATOMY.toolbarDividerColor}`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="relative shrink-0">
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

export function LayoutsTablesComponentsTable() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border/70">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-muted/30">
            <th className="px-4 py-3 font-semibold text-foreground">Capa</th>
            <th className="px-4 py-3 font-semibold text-foreground">Componente</th>
            <th className="px-4 py-3 font-semibold text-foreground">Token</th>
            <th className="px-4 py-3 font-semibold text-foreground">Fuente</th>
          </tr>
        </thead>
        <tbody>
          {LAYOUTS_TABLES_SCREEN_COMPONENTS.map((row) => (
            <tr key={`${row.layer}-${row.component}-${row.token}`} className="border-b border-border/40 last:border-0">
              <td className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{row.layer}</td>
              <td className="px-4 py-3 text-foreground">{row.component}</td>
              <td className="px-4 py-3 font-mono text-[11px] text-primary">{row.token}</td>
              <td className="px-4 py-3 font-mono text-[10px] text-muted-foreground">{row.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function LayoutsTablesTableContent({ rows, composed = false }: { rows: DemoRow[]; composed?: boolean }) {
  const headStyle = getLayoutsTablesHeadCellStyle()
  const cellStyle = getLayoutsTablesBodyCellStyle()
  const checkboxStyle = getLayoutsTablesCheckboxStyle()

  return (
    <table style={getLayoutsTablesTableStyle()}>
      <thead>
        <tr>
          <th style={{ ...headStyle, width: 48, paddingLeft: 0, paddingRight: 0 }} scope="col">
            <span className="sr-only">Selección</span>
          </th>
          <th style={headStyle}>Artículo</th>
          <th style={{ ...headStyle, width: 144 }}>Referencia</th>
          <th style={{ ...headStyle, width: 112, textAlign: "right" }}>Monto</th>
          <th style={{ ...headStyle, width: 112 }}>Estado</th>
        </tr>
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
              <span style={getLayoutsTablesStatusBadgeStyle(row.status)}>{row.status === "activo" ? "Activo" : row.status === "pendiente" ? "Pendiente" : "Vencido"}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
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

export function LayoutsTablesFullPageDraft() {
  return (
    <div
      className="mx-auto flex max-w-4xl flex-col"
      style={{
        height: "28rem",
        ...getLayoutsTablesShellStyle(false),
      }}
    >
      <LayoutsTablesHeaderDemo composed />
      <LayoutsTablesFiltersDemo composed />
      <div style={getLayoutsTablesBodyCanvasStyle()}>
        <LayoutsTablesBodyDemo composed />
        <LayoutsTablesFooterDemo composed />
      </div>
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
