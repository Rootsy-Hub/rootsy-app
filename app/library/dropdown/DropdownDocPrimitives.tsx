"use client"

import {
  ROOTSY_DROPDOWN_ELEVATION,
  ROOTSY_DROPDOWN_GUIDELINES,
  ROOTSY_DROPDOWN_RELATED_LINKS,
  ROOTSY_DROPDOWN_SURFACES,
} from "@/app/library/dropdown/rootsyDropdownLegacyCatalog"
import {
  LibraryManifestoHero,
  LibraryRelatedLinks,
} from "@/app/library/libraryDocPrimitives"
import { SpecCard } from "@/app/library/layoutLibraryShared"
import {
  lightToolbarDropdownContentClass,
  lightToolbarDropdownItemClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  dataWorkspaceLightDropdownContentClass,
  dataWorkspaceLightDropdownItemClass,
  dataWorkspaceLightDropdownLogoutItemClass,
  dataWorkspaceLightDropdownSeparatorClass,
  nightForestSurfaceClass,
} from "@/components/layouts/dataWorkspaceHeaderStyles"
import { DataWorkspaceSectionMenu } from "@/components/layouts/DataWorkspaceSectionMenu"
import {
  RootsDefaultButton,
  RootsIconButton,
} from "@/components/rootsy-button"
import {
  RootsFormSelectField,
  RootsFormSelectItem,
} from "@/components/rootsy-form"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import {
  Copy,
  LayoutGrid,
  LogOut,
  MoreVertical,
  Pencil,
  Settings,
  Trash2,
  User,
} from "lucide-react"
import { useState } from "react"

export {
  LibraryDocLead as DropdownDocLead,
  LibraryDocSection as DropdownDocSection,
  LibraryPrinciplesGrid as DropdownPrinciplesGrid,
} from "@/app/library/libraryDocPrimitives"

export function DropdownManifestoHero() {
  return (
    <LibraryManifestoHero
      eyebrow="Rootsy · Dropdown"
      title="Acciones secundarias · superficies alineadas"
      description="Radix DropdownMenu + tokens light toolbar, header nocturno y acciones de fila."
    />
  )
}

export function DropdownSurfacesTable() {
  return (
    <div className="library-doc-table-shell overflow-x-auto rounded-2xl">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-bruma-50)]">
            <th className="px-4 py-3 font-semibold text-[var(--rootsy-bruma-900)]">Superficie</th>
            <th className="px-4 py-3 font-semibold text-[var(--rootsy-bruma-900)]">Content</th>
            <th className="px-4 py-3 font-semibold text-[var(--rootsy-bruma-900)]">Uso</th>
            <th className="px-4 py-3 font-semibold text-[var(--rootsy-bruma-900)]">Fuente</th>
          </tr>
        </thead>
        <tbody>
          {ROOTSY_DROPDOWN_SURFACES.map((row) => (
            <tr key={row.id} className="border-b border-[var(--rootsy-bruma-200)] last:border-0">
              <td className="px-4 py-3 font-medium text-[var(--rootsy-bruma-900)]">{row.name}</td>
              <td className="px-4 py-3 font-mono text-[10px] text-[var(--rootsy-savia-600)]">
                {row.contentClass}
              </td>
              <td className="px-4 py-3 text-[var(--rootsy-bruma-500)]">{row.usage}</td>
              <td className="px-4 py-3 font-mono text-[10px] text-[var(--rootsy-bruma-500)]">
                {row.source}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function DropdownElevationTable() {
  const { level, semanticToken, light, dark } = ROOTSY_DROPDOWN_ELEVATION

  return (
    <div className="library-doc-table-shell overflow-x-auto rounded-2xl">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-bruma-50)]">
            <th className="px-4 py-3 font-semibold text-[var(--rootsy-bruma-900)]">Shell</th>
            <th className="px-4 py-3 font-semibold text-[var(--rootsy-bruma-900)]">Nivel</th>
            <th className="px-4 py-3 font-semibold text-[var(--rootsy-bruma-900)]">Superficie</th>
            <th className="px-4 py-3 font-semibold text-[var(--rootsy-bruma-900)]">Borde / radio</th>
            <th className="px-4 py-3 font-semibold text-[var(--rootsy-bruma-900)]">Sombra</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-[var(--rootsy-bruma-200)]">
            <td className="px-4 py-3 font-medium text-[var(--rootsy-bruma-900)]">Light</td>
            <td className="px-4 py-3 font-mono text-[10px] text-[var(--rootsy-savia-600)]" rowSpan={2}>
              {level}
              <br />
              {semanticToken}
            </td>
            <td className="px-4 py-3 text-[var(--rootsy-bruma-500)]">{light.surface}</td>
            <td className="px-4 py-3 font-mono text-[10px] text-[var(--rootsy-bruma-500)]">
              {light.border}
              <br />
              {light.radius}
              <br />
              {light.itemRadius}
            </td>
            <td className="px-4 py-3 font-mono text-[10px] text-[var(--rootsy-bruma-500)]">
              {light.shadow}
            </td>
          </tr>
          <tr>
            <td className="px-4 py-3 font-medium text-[var(--rootsy-bruma-900)]">Dark</td>
            <td className="px-4 py-3 text-[var(--rootsy-bruma-500)]">{dark.surface}</td>
            <td className="px-4 py-3 font-mono text-[10px] text-[var(--rootsy-bruma-500)]">
              {dark.border}
              <br />
              {dark.radius}
              <br />
              {dark.itemRadius}
            </td>
            <td className="px-4 py-3 font-mono text-[10px] text-[var(--rootsy-bruma-500)]">
              {dark.shadow}
            </td>
          </tr>
        </tbody>
      </table>
      <p className="border-t border-[var(--rootsy-bruma-200)] px-4 py-3 text-xs text-[var(--rootsy-bruma-500)]">
        Fuente:{" "}
        <span className="font-mono text-[var(--rootsy-bruma-900)]">
          components/rootsy-dropdown/rootsDropdownStyles.ts
        </span>{" "}
        — panel <span className="font-mono text-[var(--rootsy-bruma-900)]">radius.xlarge (16px)</span> · ítems{" "}
        <span className="font-mono text-[var(--rootsy-bruma-900)]">space.050 (4px)</span>.
      </p>
    </div>
  )
}

export function DropdownTriggersDemo() {
  const viewItems = [
    { id: "table", label: "Tabla", icon: LayoutGrid },
    { id: "board", label: "Tablero", icon: LayoutGrid },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <RootsIconButton
              label="Más opciones"
              tone="action"
              intent="neutral"
              size="compact"
            >
              <MoreVertical className="size-4" aria-hidden />
            </RootsIconButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className={cn(lightToolbarDropdownContentClass, "w-44")}
          >
            <DropdownMenuItem className={lightToolbarDropdownItemClass}>
              <Copy className="size-4" aria-hidden />
              Duplicar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DataWorkspaceSectionMenu
          viewItems={viewItems}
          activeId="table"
          onSelect={() => undefined}
          headerVariant="default"
        />
      </div>

      <p className="max-w-2xl text-sm text-[var(--rootsy-bruma-500)]">
        Filtros con valor visible (ej. «Todos») no son dropdown — usá{" "}
        <span className="font-mono text-xs text-[var(--rootsy-bruma-900)]">RootsFormSelectField</span>{" "}
        de la sección Select.
      </p>
    </div>
  )
}

export function DropdownSelectFilterDemo() {
  const [value, setValue] = useState("all")

  return (
    <SpecCard
      title="Filtro toolbar → Select"
      source="RootsFormSelectField · sección Select"
      tokens={["rootsFormPrefixedSelectTriggerClass", "check verde"]}
    >
      <div className="max-w-xs">
        <RootsFormSelectField
          label="Tipo"
          value={value}
          onValueChange={setValue}
          prefix={<LayoutGrid className="size-4" aria-hidden />}
        >
          <RootsFormSelectItem value="all">Todos</RootsFormSelectItem>
          <RootsFormSelectItem value="product">Producto</RootsFormSelectItem>
          <RootsFormSelectItem value="service">Servicio</RootsFormSelectItem>
        </RootsFormSelectField>
      </div>
    </SpecCard>
  )
}

export function DropdownLightHeaderDemo() {
  return (
    <SpecCard
      title="Menú tarjeta / header claro"
      source="CashRegisterCard · TreasuryAccountCard"
      tokens={[
        "dataWorkspaceLightDropdownContentClass",
        "dataWorkspaceLightDropdownSeparatorClass",
        "dataWorkspaceLightDropdownLogoutItemClass",
      ]}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <RootsDefaultButton type="button" className="h-10 gap-2">
            <User className="size-4" aria-hidden />
            Cuenta
          </RootsDefaultButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className={dataWorkspaceLightDropdownContentClass}
        >
          <DropdownMenuItem className={dataWorkspaceLightDropdownItemClass}>
            <User className="size-4" aria-hidden />
            Perfil
          </DropdownMenuItem>
          <DropdownMenuItem className={dataWorkspaceLightDropdownItemClass}>
            <Settings className="size-4" aria-hidden />
            Configuración
          </DropdownMenuItem>
          <DropdownMenuSeparator
            className={dataWorkspaceLightDropdownSeparatorClass}
          />
          <DropdownMenuItem
            className={dataWorkspaceLightDropdownLogoutItemClass}
          >
            <LogOut className="size-4" aria-hidden />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SpecCard>
  )
}

export function DropdownNightHeaderDemo() {
  const [activeId, setActiveId] = useState("table")
  const views = [
    { id: "table", label: "Tabla", icon: LayoutGrid },
    { id: "board", label: "Tablero", icon: LayoutGrid },
  ]

  return (
    <SpecCard
      title="Selector header nocturno"
      source="DataWorkspaceSectionMenu"
      tokens={[
        "dataWorkspaceNightHeaderDropdownContentClass",
        "dataWorkspaceNightHeaderDropdownLabelClass",
        "dataWorkspaceNightHeaderDropdownSeparatorClass",
      ]}
      className={cn(nightForestSurfaceClass, "border-[#263530]/90 bg-[#0c1210]")}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-[#a8a29e]">
          Trigger compuesto del header — labels uppercase, separador #263530.
        </p>
        <DataWorkspaceSectionMenu
          viewItems={views}
          activeId={activeId}
          onSelect={setActiveId}
          creationItems={[
            { id: "create", label: "Crear artículo", icon: LayoutGrid },
          ]}
          headerVariant="default"
        />
      </div>
    </SpecCard>
  )
}

export function DropdownRowActionsDemo() {
  return (
    <SpecCard
      title="Acciones de fila (tabla layout)"
      source="LayoutPreviewListTable · RowMoreMenu"
      tokens={["lightToolbarDropdownContentClass", "RootsIconButton"]}
    >
      <div className="flex items-center gap-3 rounded-lg border border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-bruma-50)] px-3 py-2">
        <span className="min-w-0 flex-1 truncate text-sm text-[var(--rootsy-bruma-900)]">
          Cola 500 ml · fila demo
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <RootsIconButton
              label="Más opciones fila demo"
              tone="action"
              intent="neutral"
              size="compact"
            >
              <MoreVertical className="size-4" aria-hidden />
            </RootsIconButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className={cn(lightToolbarDropdownContentClass, "w-44")}
          >
            <DropdownMenuItem className={lightToolbarDropdownItemClass}>
              <Copy className="size-4" aria-hidden />
              Duplicar
            </DropdownMenuItem>
            <DropdownMenuItem className={lightToolbarDropdownItemClass}>
              <Pencil className="size-4" aria-hidden />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/60" />
            <DropdownMenuItem
              variant="destructive"
              className={lightToolbarDropdownItemClass}
            >
              <Trash2 className="size-4" aria-hidden />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </SpecCard>
  )
}

export function DropdownGuidelinesGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {ROOTSY_DROPDOWN_GUIDELINES.map((row, index) => (
        <div
          key={index}
          className="space-y-3 library-doc-card rounded-2xl p-4"
        >
          <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
              Hacer
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--rootsy-bruma-900)]">
              {row.do}
            </p>
          </div>
          <div className="rounded-xl border border-red-200 bg-red-50 p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-red-700">
              Evitar
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-red-900/90">
              {row.dont}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

export function DropdownRelatedLinks() {
  return (
    <LibraryRelatedLinks
      excludeId="dropdown"
      links={[...ROOTSY_DROPDOWN_RELATED_LINKS]}
    />
  )
}
