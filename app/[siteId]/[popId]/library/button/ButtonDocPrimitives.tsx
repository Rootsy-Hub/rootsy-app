"use client"

import {
  BUTTON_GUIDELINES,
  BUTTON_RELATED_LINKS,
  ROOTSY_BUTTON_APPEARANCES,
  ROOTSY_BUTTON_SEMANTIC,
  ROOTSY_BUTTON_SIZES,
  ROOTSY_BUTTON_STATES,
} from "@/app/[siteId]/[popId]/library/button/rootsyButtonSystem"
import {
  LibraryManifestoHero,
  LibraryRelatedLinks,
} from "@/app/[siteId]/[popId]/library/libraryDocPrimitives"
import {
  RootsIconButton,
  RootsProgressButton,
  rootsButtonClassForVariant,
  rootsButtonVariant,
  type RootsIconButtonSize,
  type RootsIconButtonSurface,
  type RootsIconButtonTone,
} from "@/components/rootsy-button"
import { nightForestSurfaceClass } from "@/components/layouts/dataWorkspaceHeaderStyles"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Bold,
  Eye,
  Home,
  Italic,
  Pencil,
  Plus,
  Save,
  Trash2,
  Underline,
} from "lucide-react"
import { useState, type ReactNode } from "react"

export {
  LibraryDocLead as ButtonDocLead,
  LibraryDocSection as ButtonDocSection,
  LibraryPrinciplesGrid as ButtonPrinciplesGrid,
} from "@/app/[siteId]/[popId]/library/libraryDocPrimitives"

export function ButtonManifestoHero() {
  return (
    <LibraryManifestoHero
      eyebrow="Rootsy · Botones"
      title="Acción clara · jerarquía canopy"
      description="default · primary · subtle · danger — alineado a Atlassian, implementado en shadcn."
    />
  )
}

function appearanceVariant(appearance: string) {
  switch (appearance) {
    case "primary":
      return rootsButtonVariant.primary
    case "subtle":
      return rootsButtonVariant.tertiary
    case "danger":
      return rootsButtonVariant.destructive
    case "link":
      return rootsButtonVariant.link
    default:
      return rootsButtonVariant.secondary
  }
}

function appearanceClass(appearance: string, extra?: string) {
  switch (appearance) {
    case "primary":
      return rootsButtonClassForVariant("primary", extra)
    case "subtle":
      return rootsButtonClassForVariant("tertiary", extra)
    case "default":
      return rootsButtonClassForVariant("secondary", extra)
    case "danger":
      return rootsButtonClassForVariant("destructive", extra)
    case "link":
      return rootsButtonClassForVariant("link", extra)
    default:
      return extra
  }
}

function appearanceLabel(appearance: string) {
  switch (appearance) {
    case "default":
      return "Exportar"
    case "primary":
      return "Guardar"
    case "subtle":
      return "Cancelar"
    case "danger":
      return "Eliminar"
    default:
      return "Ver detalle"
  }
}

export function ButtonAppearancesTable() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border/70">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-muted/30">
            <th className="px-4 py-3 font-semibold text-foreground">Appearance</th>
            <th className="px-4 py-3 font-semibold text-foreground">Rootsy</th>
            <th className="px-4 py-3 font-semibold text-foreground">Uso</th>
            <th className="px-4 py-3 font-semibold text-foreground">Regla</th>
          </tr>
        </thead>
        <tbody>
          {ROOTSY_BUTTON_APPEARANCES.map((row) => (
            <tr key={row.id} className="border-b border-border/40 last:border-0">
              <td className="px-4 py-3 font-mono text-xs text-primary">{row.appearance}</td>
              <td className="px-4 py-3 font-mono text-[10px] text-muted-foreground">
                variant={row.rootsyVariant}
              </td>
              <td className="px-4 py-3 text-foreground">{row.usage}</td>
              <td className="px-4 py-3 text-muted-foreground">{row.atlassianRule}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function ButtonAppearancesGallery() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ROOTSY_BUTTON_APPEARANCES.map((item) => (
        <div
          key={item.id}
          className="rounded-xl border border-border/70 bg-card p-4 shadow-sm"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="font-mono text-xs text-primary">{item.appearance}</span>
            <span className="text-[10px] text-muted-foreground">{item.natureName}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant={appearanceVariant(item.appearance) as "default"}
              className={appearanceClass(item.appearance)}
            >
              {appearanceLabel(item.appearance)}
            </Button>
            <Button
              type="button"
              variant={appearanceVariant(item.appearance) as "default"}
              className={appearanceClass(item.appearance)}
              disabled
            >
              Deshabilitado
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

const ICON_BUTTON_DOC_SIZES: RootsIconButtonSize[] = ["compact", "default", "large"]

const ICON_BUTTON_SIZE_LABELS: Record<RootsIconButtonSize, string> = {
  compact: "32px",
  default: "40px",
  large: "48px",
}

type IconButtonDocTone = Exclude<RootsIconButtonTone, "action">

function IconButtonDocSizeRow({
  tone,
  surface = "light",
  icon,
  label,
  darkPanel = false,
}: {
  tone: IconButtonDocTone
  surface?: RootsIconButtonSurface
  icon: ReactNode
  label: string
  darkPanel?: boolean
}) {
  return (
    <div className="flex flex-wrap items-end gap-5">
      {ICON_BUTTON_DOC_SIZES.map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <RootsIconButton
            tone={tone}
            surface={surface}
            size={size}
            label={label}
          >
            {icon}
          </RootsIconButton>
          <span
            className={cn(
              "font-mono text-[10px] uppercase tracking-[0.14em]",
              darkPanel ? "text-[#57534e]" : "text-muted-foreground",
            )}
          >
            {size} · {ICON_BUTTON_SIZE_LABELS[size]}
          </span>
        </div>
      ))}
    </div>
  )
}

function IconButtonDocToneSection({
  title,
  hint,
  darkPanel = false,
  children,
}: {
  title: string
  hint?: string
  darkPanel?: boolean
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        "space-y-3 border-t pt-5 first:border-t-0 first:pt-0",
        darkPanel ? "border-[#263530]/80" : "border-border/60",
      )}
    >
      <div>
        <p
          className={cn(
            "font-mono text-[11px] font-medium uppercase tracking-[0.12em]",
            darkPanel ? "text-[#78716c]" : "text-muted-foreground",
          )}
        >
          {title}
        </p>
        {hint ? (
          <p
            className={cn(
              "mt-1 text-xs leading-relaxed",
              darkPanel ? "text-[#57534e]" : "text-muted-foreground",
            )}
          >
            {hint}
          </p>
        ) : null}
      </div>
      {children}
    </div>
  )
}

function IconButtonDocSurfacePanel({
  surface,
  title,
  description,
  children,
}: {
  surface: "light" | "dark"
  title: string
  description: string
  children: ReactNode
}) {
  const isDark = surface === "dark"

  if (isDark) {
    return (
      <div className="overflow-hidden rounded-xl border border-border/70">
        <div className={cn(nightForestSurfaceClass, "space-y-5 p-5")}>
          <div>
            <p className="text-sm font-semibold text-zinc-100">{title}</p>
            <p className="mt-1 text-xs leading-relaxed text-[#78716c]">
              {description}
            </p>
          </div>
          <div className="space-y-5">{children}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 rounded-xl border border-border/70 bg-card p-5 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  )
}

export function ButtonSizesDemo() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
        <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          Con texto · default vs compact vs large
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <Button type="button" size="sm" variant="outline">
            Compact
          </Button>
          <Button
            type="button"
            variant={rootsButtonVariant.primary}
            className={rootsButtonClassForVariant("primary")}
          >
            Default
          </Button>
          <Button
            type="button"
            size="lg"
            variant={rootsButtonVariant.primary}
            className={rootsButtonClassForVariant("primary", undefined, "large")}
          >
            Large
          </Button>
        </div>
      </div>

      <IconButtonDocSurfacePanel
        surface="light"
        title="IconButton · light"
        description="Superficies claras — workspace, detalle de cuentas/cajas y menú sobre fondo claro."
      >
        <IconButtonDocToneSection
          title="tone=light"
          hint="Outline neutro — toolbar y acciones secundarias."
        >
          <IconButtonDocSizeRow
            tone="light"
            icon={<Plus aria-hidden />}
            label="Agregar"
          />
        </IconButtonDocToneSection>

        <IconButtonDocToneSection
          title="tone=secondary · surface=light"
          hint="Chrome con borde — menú Home, header workspace claro."
        >
          <IconButtonDocSizeRow
            tone="secondary"
            surface="light"
            icon={<Home aria-hidden />}
            label="Inicio"
          />
        </IconButtonDocToneSection>

        <IconButtonDocToneSection
          title="tone=ghost · surface=light"
          hint="Sin borde — volver en detalle (cuentas/cajas), campana y ajustes del menú."
        >
          <IconButtonDocSizeRow
            tone="ghost"
            surface="light"
            icon={<ArrowLeft aria-hidden />}
            label="Volver"
          />
        </IconButtonDocToneSection>
      </IconButtonDocSurfacePanel>

      <IconButtonDocSurfacePanel
        surface="dark"
        title="IconButton · dark"
        description="Bosque nocturno — header workspace, menú Nature y cristal POP."
      >
        <IconButtonDocToneSection
          darkPanel
          title="tone=dark"
          hint="Chrome con borde — volver al menú y acciones del header nocturno."
        >
          <IconButtonDocSizeRow
            darkPanel
            tone="dark"
            icon={<ArrowLeft aria-hidden />}
            label="Volver"
          />
        </IconButtonDocToneSection>

        <IconButtonDocToneSection
          darkPanel
          title="tone=secondary · surface=dark"
          hint="Mismo chrome que tone=dark — navegación principal sobre fondo oscuro."
        >
          <IconButtonDocSizeRow
            darkPanel
            tone="secondary"
            surface="dark"
            icon={<Home aria-hidden />}
            label="Inicio"
          />
        </IconButtonDocToneSection>

        <IconButtonDocToneSection
          darkPanel
          title="tone=ghost · surface=dark"
          hint="Sin borde — campana, ajustes y utilidades sobre fondo oscuro."
        >
          <IconButtonDocSizeRow
            darkPanel
            tone="ghost"
            surface="dark"
            icon={<Bell aria-hidden />}
            label="Notificaciones"
          />
        </IconButtonDocToneSection>
      </IconButtonDocSurfacePanel>

      <div className="rounded-xl border border-border/70 bg-card p-5 shadow-sm">
        <div className="mb-4">
          <p className="text-sm font-semibold text-foreground">
            IconButton · action · light
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Acciones de fila en tablas — solo tamaño compact en producción.
          </p>
        </div>
        <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          tone=action · intent neutral / edit / destructive
        </p>
        <div className="inline-flex flex-wrap items-center gap-0.5 rounded-lg border border-border/60 bg-white px-3 py-2">
          <RootsIconButton
            tone="action"
            intent="neutral"
            size="compact"
            label="Ver detalle"
          >
            <Eye aria-hidden />
          </RootsIconButton>
          <RootsIconButton tone="action" intent="edit" size="compact" label="Editar">
            <Pencil aria-hidden />
          </RootsIconButton>
          <RootsIconButton
            tone="action"
            intent="destructive"
            size="compact"
            label="Eliminar"
          >
            <Trash2 aria-hidden />
          </RootsIconButton>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border/70">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-muted/30">
              <th className="px-4 py-3 font-semibold">Token</th>
              <th className="px-4 py-3 font-semibold">Tailwind</th>
              <th className="px-4 py-3 font-semibold">Uso</th>
            </tr>
          </thead>
          <tbody>
            {ROOTSY_BUTTON_SIZES.map((row) => (
              <tr key={row.id} className="border-b border-border/40 last:border-0">
                <td className="px-4 py-3 font-mono text-xs">{row.token}</td>
                <td className="px-4 py-3 font-mono text-[10px] text-muted-foreground">
                  {row.tailwind}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{row.usage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function ButtonIconsDemo() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
        <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          iconBefore · gap-2 · size-4
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={rootsButtonVariant.primary}
            className={rootsButtonClassForVariant("primary")}
          >
            <Save className="size-4" aria-hidden />
            Guardar cambios
          </Button>
          <Button type="button" variant="outline">
            <Plus className="size-4" aria-hidden />
            Nuevo artículo
          </Button>
        </div>
      </div>
      <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
        <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          iconAfter · trailing
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={rootsButtonVariant.primary}
            className={rootsButtonClassForVariant("primary")}
          >
            Continuar
            <ArrowRight className="size-4" aria-hidden />
          </Button>
          <Button
            type="button"
            variant="destructive"
            className={rootsButtonClassForVariant("destructive")}
          >
            <Trash2 className="size-4" aria-hidden />
            Eliminar definitivamente
          </Button>
        </div>
      </div>
    </div>
  )
}

export function ButtonStatesDemo() {
  const [progressBusy, setProgressBusy] = useState(false)
  const [toggleBold, setToggleBold] = useState(false)

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
        <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          Loading · isLoading — spinner sin layout shift
        </p>
        <div className="flex flex-wrap gap-2">
          <RootsProgressButton
            type="button"
            variant={rootsButtonVariant.primary}
            className={rootsButtonClassForVariant("primary")}
            loading
            loadingLabel="Guardando…"
          >
            Guardar
          </RootsProgressButton>
          <RootsProgressButton
            type="button"
            variant="outline"
            className={rootsButtonClassForVariant("secondary")}
            loading
            loadingLabel="Creando…"
          >
            Crear
          </RootsProgressButton>
          <RootsProgressButton
            type="button"
            variant={rootsButtonVariant.primary}
            className={cn(rootsButtonClassForVariant("primary"), "min-w-[9.5rem]")}
            loading={progressBusy}
            loadingLabel="Guardando…"
            icon={Save}
            onClick={() => {
              setProgressBusy(true)
              window.setTimeout(() => setProgressBusy(false), 1800)
            }}
          >
            Guardar
          </RootsProgressButton>
        </div>
      </div>

      <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
        <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          Selected · aria-pressed en toggle
        </p>
        <ButtonGroup>
          <Button
            type="button"
            size="icon-sm"
            variant={toggleBold ? "default" : "outline"}
            aria-pressed={toggleBold}
            aria-label="Negrita"
            className={toggleBold ? rootsButtonClassForVariant("primary", "size-8") : undefined}
            onClick={() => setToggleBold((v) => !v)}
          >
            <Bold className="size-4" aria-hidden />
          </Button>
          <Button type="button" size="icon-sm" variant="outline" aria-label="Cursiva">
            <Italic className="size-4" aria-hidden />
          </Button>
          <Button type="button" size="icon-sm" variant="outline" aria-label="Subrayado">
            <Underline className="size-4" aria-hidden />
          </Button>
        </ButtonGroup>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border/70">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-muted/30">
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold">Comportamiento</th>
            </tr>
          </thead>
          <tbody>
            {ROOTSY_BUTTON_STATES.map((row) => (
              <tr key={row.state} className="border-b border-border/40 last:border-0">
                <td className="px-4 py-3 font-medium">{row.state}</td>
                <td className="px-4 py-3 text-muted-foreground">{row.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function ButtonGroupDemo() {
  return (
    <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
      <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        Button group · una variación por grupo — no mezclar appearances
      </p>
      <ButtonGroup>
        <Button type="button" variant="outline" size="sm">
          Izquierda
        </Button>
        <Button type="button" variant="outline" size="sm">
          Centro
        </Button>
        <Button type="button" variant="outline" size="sm">
          Derecha
        </Button>
      </ButtonGroup>
    </div>
  )
}

export function ButtonModalFooterDemo() {
  return (
    <div className="overflow-hidden rounded-xl border border-border/70 shadow-sm">
      <div className="border-b border-border/50 bg-muted/25 px-4 py-3">
        <p className="text-sm font-semibold text-foreground">Editar artículo</p>
        <p className="text-xs text-muted-foreground">Footer pattern · Atlassian modal</p>
      </div>
      <div className="flex flex-col-reverse gap-2 border-t border-border/50 bg-muted/15 px-4 py-3 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant={rootsButtonVariant.tertiary}
          className={rootsButtonClassForVariant("tertiary")}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          variant={rootsButtonVariant.primary}
          className={rootsButtonClassForVariant("primary")}
        >
          Guardar cambios
        </Button>
      </div>
    </div>
  )
}

export function ButtonSemanticTable() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border/70">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-muted/30">
            <th className="px-4 py-3 font-semibold">Appearance</th>
            <th className="px-4 py-3 font-semibold">Contexto</th>
            <th className="px-4 py-3 font-semibold">Implementación</th>
            <th className="px-4 py-3 font-semibold">Fuente</th>
          </tr>
        </thead>
        <tbody>
          {ROOTSY_BUTTON_SEMANTIC.map((row) => (
            <tr key={`${row.appearance}-${row.context}`} className="border-b border-border/40 last:border-0">
              <td className="px-4 py-3 font-mono text-xs text-primary">{row.appearance}</td>
              <td className="px-4 py-3">{row.context}</td>
              <td className="px-4 py-3 font-mono text-[10px] text-muted-foreground">
                {row.component}
              </td>
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

export function ButtonGuidelinesGrid() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Hacer</p>
        <ul className="mt-3 space-y-2">
          {BUTTON_GUIDELINES.do.map((item) => (
            <li key={item} className="flex gap-2 text-sm text-foreground">
              <span className="text-emerald-600" aria-hidden>
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-700">Evitar</p>
        <ul className="mt-3 space-y-2">
          {BUTTON_GUIDELINES.dont.map((item) => (
            <li key={item} className="flex gap-2 text-sm text-foreground">
              <span className="text-red-600" aria-hidden>
                ✕
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function ButtonRelatedLinks({
  siteId,
  popId,
}: {
  siteId: string
  popId: string
}) {
  return (
    <LibraryRelatedLinks siteId={siteId} popId={popId} links={BUTTON_RELATED_LINKS} />
  )
}
