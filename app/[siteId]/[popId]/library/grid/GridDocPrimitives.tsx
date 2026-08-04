"use client"

import {
  GRID_ALIGNMENT_GUIDELINES,
  GRID_ANATOMY_PARTS,
  GRID_LAYOUT_ANATOMY,
  GRID_SPAN_PRESETS,
  ROOTSY_GRID_BREAKPOINTS,
  ROOTSY_GRID_TYPES,
} from "@/app/[siteId]/[popId]/library/grid/rootsyGridSystem"
import { librarySectionHref } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"
import Link from "next/link"
import type { ReactNode } from "react"

const CANOPY = "#1E8F5A"
const CANOPY_LIGHT = "#A8EBC4"
const CANOPY_MIST = "#F0FBF4"
const CANOPY_DARK = "#16704A"
const EARTH = "#78716C"

export function GridDocLead({ children }: { children: ReactNode }) {
  return (
    <p className="max-w-3xl text-base leading-relaxed text-muted-foreground">
      {children}
    </p>
  )
}

export function GridDocSection({
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
        <h3 className="text-xl font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        {description ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

export function GridManifestoHero() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 shadow-sm">
      <div
        className="relative px-6 py-10 sm:px-8"
        style={{
          background: `linear-gradient(160deg, ${CANOPY_DARK} 0%, ${CANOPY} 45%, ${CANOPY_LIGHT} 100%)`,
        }}
      >
        <div className="relative max-w-2xl space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">
            Rootsy · Grid System
          </p>
          <p className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Surcos en el claro
          </p>
          <p className="text-sm leading-relaxed text-white/85">
            12 columnas · sendas y orillas · alineación sin rigidez innecesaria.
          </p>
        </div>
      </div>
    </div>
  )
}

export function GridPrinciplesGrid({
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

function GridColumn({
  filled = false,
  label,
}: {
  filled?: boolean
  label?: string
}) {
  return (
    <div
      className="relative min-h-[48px] rounded-sm"
      style={{
        backgroundColor: filled ? CANOPY : `${CANOPY_LIGHT}66`,
        border: `1px dashed ${filled ? CANOPY_DARK : CANOPY_LIGHT}`,
      }}
    >
      {label ? (
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white/90">
          {label}
        </span>
      ) : null}
    </div>
  )
}

export function GridAnatomyDiagram() {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-border/70">
        <div
          className="px-4 py-3 text-xs font-bold uppercase tracking-wider"
          style={{ backgroundColor: CANOPY_MIST, color: CANOPY_DARK }}
        >
          Claro · área principal con grilla
        </div>
        <div className="p-4" style={{ backgroundColor: "#FAFAF7" }}>
          {/* Margin indicators */}
          <div className="relative">
            <div
              className="absolute inset-y-0 left-0 w-4 rounded-sm opacity-40"
              style={{ backgroundColor: EARTH }}
              title="Orilla · margin"
            />
            <div
              className="absolute inset-y-0 right-0 w-4 rounded-sm opacity-40"
              style={{ backgroundColor: EARTH }}
            />
            <div
              className="grid gap-2 px-4"
              style={{ gridTemplateColumns: "repeat(12, 1fr)" }}
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <GridColumn key={i} />
              ))}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded-sm opacity-40" style={{ backgroundColor: EARTH }} />
              Orilla (margin)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded-sm" style={{ backgroundColor: `${CANOPY_LIGHT}66`, border: `1px dashed ${CANOPY_LIGHT}` }} />
              Surco (columna)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-muted-foreground/30" />
              Senda (gutter · gap)
            </span>
          </div>
        </div>
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        {GRID_ANATOMY_PARTS.map((part) => (
          <div
            key={part.id}
            className="rounded-xl border border-border/70 bg-card p-4 shadow-sm"
          >
            <p className="text-sm font-semibold text-foreground">{part.term}</p>
            <p className="text-xs font-medium" style={{ color: CANOPY_DARK }}>
              {part.natureMetaphor}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{part.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function LayoutShellDiagram() {
  const regions = [
    { key: "topNav", span: "col-span-12", height: "h-8", label: GRID_LAYOUT_ANATOMY.topNav },
    { key: "sideNav", span: "col-span-2", height: "h-32", label: GRID_LAYOUT_ANATOMY.sideNav },
    { key: "main", span: "col-span-7", height: "h-32", label: GRID_LAYOUT_ANATOMY.main, highlight: true },
    { key: "panel", span: "col-span-3", height: "h-32", label: GRID_LAYOUT_ANATOMY.panel },
  ]

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 p-4">
      <div className="grid grid-cols-12 gap-2">
        {regions.map((r) => (
          <div
            key={r.key}
            className={`${r.span} ${r.height} flex items-center justify-center rounded-lg px-2 text-center text-[10px] font-medium`}
            style={{
              backgroundColor: r.highlight ? CANOPY_MIST : "var(--muted)",
              color: r.highlight ? CANOPY_DARK : undefined,
              outline: r.highlight ? `2px solid ${CANOPY}` : undefined,
            }}
          >
            {r.label}
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        La grilla vive solo en el claro (main) — nav y panel usan layout propio.
      </p>
    </div>
  )
}

function SpanRow({ span, label }: { span: number; label: string }) {
  return (
    <div className="space-y-1">
      <p className="font-mono text-[10px] text-muted-foreground">
        {span}/12 · {label}
      </p>
      <div className="grid grid-cols-12 gap-1.5">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i}>
            {i < span ? (
              <GridColumn filled label={i === 0 ? `${span}` : undefined} />
            ) : (
              <div className="min-h-[40px]" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export function GridSpanGallery() {
  return (
    <div className="space-y-5 rounded-2xl border border-border/70 bg-card p-4">
      {GRID_SPAN_PRESETS.map((preset) => (
        <SpanRow key={preset.span} span={preset.span} label={preset.label} />
      ))}
    </div>
  )
}

export function GridCenteredSpanDemo() {
  return (
    <div className="space-y-4">
      {[8, 10].map((span) => {
        const offset = Math.floor((12 - span) / 2)
        return (
          <div key={span} className="space-y-1">
            <p className="font-mono text-[10px] text-muted-foreground">
              {span}/12 centrado
            </p>
            <div className="grid grid-cols-12 gap-1.5">
              {Array.from({ length: 12 }).map((_, i) => {
                const inSpan = i >= offset && i < offset + span
                return inSpan ? (
                  <GridColumn key={i} filled />
                ) : (
                  <div key={i} className="min-h-[36px]" />
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function GridAlignmentDemo() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-xl border-2 p-4" style={{ borderColor: CANOPY }}>
        <p className="mb-3 text-xs font-bold uppercase tracking-wider" style={{ color: CANOPY_DARK }}>
          ✓ Contenedor a la grilla
        </p>
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-4 rounded-lg p-3 text-xs" style={{ backgroundColor: CANOPY_MIST }}>
            Card · 4 surcos
          </div>
          <div className="col-span-4 rounded-lg p-3 text-xs" style={{ backgroundColor: CANOPY_MIST }}>
            Card · 4 surcos
          </div>
          <div className="col-span-4 rounded-lg p-3 text-xs" style={{ backgroundColor: CANOPY_MIST }}>
            Card · 4 surcos
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <button type="button" className="rounded-md px-3 py-1 text-xs" style={{ backgroundColor: CANOPY, color: "#fff" }}>
            Botón
          </button>
          <span className="text-[10px] text-muted-foreground self-center">← space tokens, no surcos</span>
        </div>
      </div>
      <div className="rounded-xl border border-border/70 p-4 opacity-75">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          ✗ Desborde en senda
        </p>
        <div className="grid grid-cols-12 gap-2">
          <div
            className="col-span-6 rounded-lg p-3 text-xs"
            style={{ backgroundColor: CANOPY_MIST, marginRight: -8 }}
          >
            Card invade gutter
          </div>
          <div className="col-span-6 rounded-lg p-3 text-xs" style={{ backgroundColor: CANOPY_MIST }}>
            Card vecina
          </div>
        </div>
      </div>
    </div>
  )
}

export function NestedGridDemo() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70">
      <div className="grid grid-cols-12 gap-3 p-4" style={{ backgroundColor: "#FAFAF7" }}>
        <div className="col-span-8 rounded-xl border border-border/70 bg-card p-4 shadow-sm">
          <p className="text-sm font-semibold">Card · 8 surcos (grilla principal)</p>
          <div className="mt-3 grid grid-cols-6 gap-2 rounded-lg p-2" style={{ backgroundColor: CANOPY_MIST }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="col-span-2 rounded-md py-4 text-center text-[10px] font-medium"
                style={{ backgroundColor: "#fff", color: CANOPY_DARK }}
              >
                Interno · space
              </div>
            ))}
          </div>
          <p className="mt-2 font-mono text-[10px] text-muted-foreground">
            Adentro: space tokens · grilla interna opcional
          </p>
        </div>
        <div className="col-span-4 rounded-xl border border-border/70 bg-card p-4 shadow-sm">
          <p className="text-sm font-semibold">Panel · 4 surcos</p>
          <p className="mt-2 text-xs text-muted-foreground">Stack + gap space.200</p>
        </div>
      </div>
    </div>
  )
}

export function GridGuidelineCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {GRID_ALIGNMENT_GUIDELINES.map((g) => (
        <div key={g.id} className="rounded-xl border border-border/70 bg-card p-4">
          <p className="text-sm font-semibold text-foreground">{g.title}</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <div
              className="rounded-lg p-3 text-xs"
              style={{ backgroundColor: CANOPY_MIST, color: CANOPY_DARK }}
            >
              <span className="font-semibold">✓ </span>
              {g.doText}
            </div>
            <div className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
              <span className="font-semibold">✗ </span>
              {g.dontText}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function GridBreakpointTable() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border/70">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-muted/30 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            <th className="px-4 py-2">Breakpoint</th>
            <th className="px-4 py-2">Viewport</th>
            <th className="px-4 py-2 text-center">Surcos</th>
            <th className="px-4 py-2">Senda</th>
            <th className="px-4 py-2">Orilla</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {ROOTSY_GRID_BREAKPOINTS.map((bp) => (
            <tr key={bp.id} className="hover:bg-muted/20">
              <td className="px-4 py-2.5">
                <span className="font-mono font-medium text-foreground">{bp.id}</span>
                <span className="ml-2 text-xs text-muted-foreground">{bp.device}</span>
              </td>
              <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                {bp.viewport}
              </td>
              <td className="px-4 py-2.5 text-center font-mono font-medium">{bp.columns}</td>
              <td className="px-4 py-2.5 font-mono text-xs">
                {bp.gutterToken}{" "}
                <span className="text-muted-foreground">({bp.gutterPx}px)</span>
              </td>
              <td className="px-4 py-2.5 font-mono text-xs">
                {bp.marginToken}{" "}
                <span className="text-muted-foreground">({bp.marginPx}px)</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function GridBreakpointVisualizer() {
  const samples = [
    { id: "xxs", cols: 2, label: "Mobile · 2 surcos" },
    { id: "s", cols: 6, label: "Tablet · 6 surcos" },
    { id: "m", cols: 12, label: "Desktop · 12 surcos" },
  ]

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {samples.map((sample) => (
        <div key={sample.id} className="rounded-xl border border-border/70 bg-card p-4">
          <p className="mb-2 text-xs font-semibold text-foreground">{sample.label}</p>
          <div
            className="grid gap-1.5 rounded-lg p-3"
            style={{
              gridTemplateColumns: `repeat(${sample.cols}, 1fr)`,
              backgroundColor: CANOPY_MIST,
            }}
          >
            {Array.from({ length: sample.cols }).map((_, i) => (
              <div
                key={i}
                className="h-8 rounded-sm"
                style={{ backgroundColor: CANOPY, opacity: 0.35 + (i % 3) * 0.15 }}
              />
            ))}
          </div>
          <p className="mt-2 font-mono text-[10px] text-muted-foreground">breakpoint · {sample.id}</p>
        </div>
      ))}
    </div>
  )
}

export function GridTypesComparison() {
  return (
    <div className="space-y-4">
      {ROOTSY_GRID_TYPES.map((type) => (
        <div
          key={type.id}
          className="rounded-xl border border-border/70 bg-card p-5 shadow-sm"
          style={type.isDefault ? { borderLeftWidth: 3, borderLeftColor: CANOPY } : undefined}
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-lg font-semibold text-foreground">
                {type.title}
                {type.isDefault ? (
                  <span
                    className="ml-2 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase text-white"
                    style={{ backgroundColor: CANOPY }}
                  >
                    default
                  </span>
                ) : null}
              </p>
              <p className="text-sm font-medium" style={{ color: CANOPY_DARK }}>
                {type.natureName}
                {type.maxWidthPx ? ` · max ${type.maxWidthPx}px` : " · sin máximo"}
              </p>
            </div>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{type.useWhen}</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <p className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Ejemplos: </span>
              {type.examples}
            </p>
            <p className="rounded-lg px-3 py-2 text-xs" style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}>
              <span className="font-semibold">Evitar: </span>
              {type.dontUseFor}
            </p>
          </div>
          {type.maxWidthPx ? (
            <div className="mt-4 flex justify-center rounded-lg p-4" style={{ backgroundColor: "#FAFAF7" }}>
              <div
                className="h-3 w-full max-w-full rounded-full"
                style={{
                  maxWidth: type.maxWidthPx / 4,
                  backgroundColor: CANOPY,
                  opacity: type.isDefault ? 1 : 0.6,
                }}
              />
            </div>
          ) : (
            <div className="mt-4 h-3 w-full rounded-full" style={{ background: `linear-gradient(90deg, ${CANOPY}, ${CANOPY_LIGHT})` }} />
          )}
        </div>
      ))}
    </div>
  )
}

export function FixedVsFluidDemo() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-border/70 p-4">
        <p className="text-sm font-semibold">Fixed-wide · centrado</p>
        <div className="mt-3 rounded-lg p-2" style={{ backgroundColor: EARTH + "22" }}>
          <div
            className="mx-auto rounded-md px-2 py-6 text-center text-xs text-white"
            style={{ maxWidth: 280, backgroundColor: CANOPY }}
          >
            max 1296px
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-border/70 p-4">
        <p className="text-sm font-semibold">Fluid · llena el claro</p>
        <div className="mt-3 rounded-lg p-2" style={{ backgroundColor: EARTH + "22" }}>
          <div
            className="w-full rounded-md py-6 text-center text-xs text-white"
            style={{ backgroundColor: CANOPY }}
          >
            100% del main
          </div>
        </div>
      </div>
    </div>
  )
}

export function GridRelatedLinks({
  siteId,
  popId,
  excludeId,
  links,
}: {
  siteId: string
  popId: string
  excludeId?: string
  links: ReadonlyArray<{ sectionId: string; label: string; hint: string }>
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {links
        .filter((link) => link.sectionId !== excludeId)
        .map((link) => (
          <Link
            key={link.sectionId}
            href={librarySectionHref(siteId, popId, link.sectionId)}
            className="rounded-xl border border-border/70 bg-card p-4 shadow-sm transition-colors hover:border-[#A8EBC4] hover:bg-[#F0FBF4]"
          >
            <p className="text-sm font-semibold text-foreground">{link.label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{link.hint}</p>
          </Link>
        ))}
    </div>
  )
}
