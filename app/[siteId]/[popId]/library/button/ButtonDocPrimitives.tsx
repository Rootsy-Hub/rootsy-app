"use client"

import {
  BUTTON_GUIDELINES,
  BUTTON_RELATED_LINKS,
  ROOTSY_BUTTON_APPEARANCES,
  ROOTSY_BUTTON_SEMANTIC,
  ROOTSY_BUTTON_SIZES,
  ROOTSY_BUTTON_STATES,
} from "@/app/[siteId]/[popId]/library/button/rootsyButtonSystem"
import { librarySectionHref } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"
import {
  RootsProgressButton,
  rootsButtonClassForVariant,
  rootsButtonVariant,
} from "@/components/rootsy-button"
import { saleOpDialogDestructiveBtn } from "@/components/sale-operation/saleOperationStyles"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { cn } from "@/lib/utils"
import {
  ArrowRight,
  Bold,
  Italic,
  Plus,
  Save,
  Trash2,
  Underline,
} from "lucide-react"
import Link from "next/link"
import { useState, type ReactNode } from "react"

const CANOPY = "#1E8F5A"
const CANOPY_DARK = "#16704A"
const CANOPY_LIGHT = "#A8EBC4"

export function ButtonDocLead({ children }: { children: ReactNode }) {
  return (
    <p className="max-w-3xl text-base leading-relaxed text-muted-foreground">{children}</p>
  )
}

export function ButtonDocSection({
  id,
  title,
  description,
  children,
}: {
  id: string
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 space-y-5 border-t border-border/60 pt-10 first:border-t-0 first:pt-0"
    >
      <div className="max-w-3xl space-y-2">
        <h3 className="text-xl font-semibold tracking-tight text-foreground">{title}</h3>
        {description ? (
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

export function ButtonManifestoHero() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 shadow-sm">
      <div
        className="relative px-6 py-10 sm:px-8"
        style={{
          background: `linear-gradient(165deg, ${CANOPY_DARK} 0%, #0F5739 40%, ${CANOPY} 70%, ${CANOPY_LIGHT} 100%)`,
        }}
      >
        <div className="relative max-w-2xl space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">
            Rootsy · Button System
          </p>
          <p className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Acción clara · jerarquía canopy
          </p>
          <p className="text-sm leading-relaxed text-white/85">
            default · primary · subtle · danger — alineado a Atlassian, implementado en shadcn.
          </p>
        </div>
      </div>
    </div>
  )
}

export function ButtonPrinciplesGrid({
  principles,
}: {
  principles: ReadonlyArray<{ title: string; detail: string }>
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {principles.map((item) => (
        <div
          key={item.title}
          className="rounded-xl border border-border/70 bg-card p-4 shadow-sm"
        >
          <p className="text-sm font-semibold text-foreground">{item.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
        </div>
      ))}
    </div>
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
      return cn(saleOpDialogDestructiveBtn, extra)
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
            className={rootsButtonClassForVariant("primary")}
          >
            Large
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
        <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          IconButton · compact / default / large
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" size="icon-sm" variant="outline" aria-label="Agregar">
            <Plus className="size-4" aria-hidden />
          </Button>
          <Button type="button" size="icon" variant="outline" aria-label="Agregar">
            <Plus className="size-4" aria-hidden />
          </Button>
          <Button type="button" size="icon-lg" variant="outline" aria-label="Agregar">
            <Plus className="size-4" aria-hidden />
          </Button>
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
          <Button type="button" variant="destructive" className={saleOpDialogDestructiveBtn}>
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
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Do</p>
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
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-700">Don&apos;t</p>
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
    <div className="flex flex-wrap gap-2">
      {BUTTON_RELATED_LINKS.map((link) => (
        <Link
          key={link.sectionId}
          href={librarySectionHref(siteId, popId, link.sectionId)}
          className="rounded-lg border border-border/70 bg-card px-3 py-2 text-sm shadow-sm transition-colors hover:bg-muted/50"
        >
          <span className="font-medium text-foreground">{link.label}</span>
          <span className="mt-0.5 block text-[11px] text-muted-foreground">{link.hint}</span>
        </Link>
      ))}
    </div>
  )
}
