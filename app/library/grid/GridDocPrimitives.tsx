"use client"

import {
  GRID_ALIGNMENT_GUIDELINES,
  GRID_ANATOMY_PARTS,
  GRID_LAYOUT_ANATOMY,
  GRID_SPAN_PRESETS,
  ROOTSY_GRID_BREAKPOINTS,
  ROOTSY_GRID_CONCEPT,
  ROOTSY_GRID_TYPES,
} from "@/app/library/grid/rootsyGridSystem"
import {
  CONCEPT_TOKENS,
  FoundationBrumaStage,
  FoundationConceptHero,
} from "@/app/library/libraryFoundationDocShared"
import { EARTH, LibraryGuidelineCards } from "@/app/library/libraryDocPrimitives"
import type { ReactNode } from "react"

export {
  LibraryDocLead as GridDocLead,
  LibraryDocSection as GridDocSection,
  LibraryPrinciplesGrid as GridPrinciplesGrid,
  LibraryRelatedLinks as GridRelatedLinks,
} from "@/app/library/libraryDocPrimitives"

function TechnicalSubheading({ children }: { children: ReactNode }) {
  return (
    <p
      className="font-canopy text-xs font-semibold uppercase tracking-wide"
      style={{ color: CONCEPT_TOKENS.bruma500 }}
    >
      {children}
    </p>
  )
}

function GridTwelveColSketch() {
  return (
    <div
      className="grid gap-1.5 rounded-xl p-3"
      style={{
        gridTemplateColumns: "repeat(12, 1fr)",
        backgroundColor: CONCEPT_TOKENS.bruma50,
      }}
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="min-h-10 rounded-sm"
          style={{
            backgroundColor: i === 0 || i === 11 ? CONCEPT_TOKENS.savia600 : CONCEPT_TOKENS.savia100,
            opacity: i === 0 || i === 11 ? 1 : 0.55 + (i % 3) * 0.12,
          }}
        />
      ))}
    </div>
  )
}

export function GridSystemHero() {
  return (
    <FoundationConceptHero
      eyebrow="Rootsy · Grilla"
      concept={ROOTSY_GRID_CONCEPT}
      stage={
        <FoundationBrumaStage caption="12 surcos en desktop · sendas entre columnas · orillas al borde del claro.">
          <GridTwelveColSketch />
        </FoundationBrumaStage>
      }
    />
  )
}

/** @deprecated Usar GridSystemHero */
export function GridManifestoHero() {
  return <GridSystemHero />
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
        backgroundColor: filled ? CONCEPT_TOKENS.savia600 : `${CONCEPT_TOKENS.savia100}66`,
        border: `1px dashed ${filled ? CONCEPT_TOKENS.savia800 : CONCEPT_TOKENS.savia100}`,
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
          style={{ backgroundColor: CONCEPT_TOKENS.bruma50, color: CONCEPT_TOKENS.savia800 }}
        >
          Claro · área principal con grilla
        </div>
        <div className="p-4" style={{ backgroundColor: CONCEPT_TOKENS.bruma50 }}>
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
              <span className="size-3 rounded-sm" style={{ backgroundColor: `${CONCEPT_TOKENS.savia100}66`, border: `1px dashed ${CONCEPT_TOKENS.savia100}` }} />
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
            <p className="text-xs font-medium" style={{ color: CONCEPT_TOKENS.savia800 }}>
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
              backgroundColor: r.highlight ? CONCEPT_TOKENS.bruma50 : "var(--muted)",
              color: r.highlight ? CONCEPT_TOKENS.savia800 : undefined,
              outline: r.highlight ? `2px solid ${CONCEPT_TOKENS.savia600}` : undefined,
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
      <div className="rounded-xl border-2 p-4" style={{ borderColor: CONCEPT_TOKENS.savia600 }}>
        <p className="mb-3 text-xs font-bold uppercase tracking-wider" style={{ color: CONCEPT_TOKENS.savia800 }}>
          ✓ Contenedor a la grilla
        </p>
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-4 rounded-lg p-3 text-xs" style={{ backgroundColor: CONCEPT_TOKENS.bruma50 }}>
            Card · 4 surcos
          </div>
          <div className="col-span-4 rounded-lg p-3 text-xs" style={{ backgroundColor: CONCEPT_TOKENS.bruma50 }}>
            Card · 4 surcos
          </div>
          <div className="col-span-4 rounded-lg p-3 text-xs" style={{ backgroundColor: CONCEPT_TOKENS.bruma50 }}>
            Card · 4 surcos
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <button type="button" className="rounded-md px-3 py-1 text-xs" style={{ backgroundColor: CONCEPT_TOKENS.savia600, color: CONCEPT_TOKENS.white }}>
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
            style={{ backgroundColor: CONCEPT_TOKENS.bruma50, marginRight: -8 }}
          >
            Card invade gutter
          </div>
          <div className="col-span-6 rounded-lg p-3 text-xs" style={{ backgroundColor: CONCEPT_TOKENS.bruma50 }}>
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
      <div className="grid grid-cols-12 gap-3 p-4" style={{ backgroundColor: CONCEPT_TOKENS.bruma50 }}>
        <div className="col-span-8 rounded-xl border border-border/70 bg-card p-4 shadow-sm">
          <p className="text-sm font-semibold">Card · 8 surcos (grilla principal)</p>
          <div className="mt-3 grid grid-cols-6 gap-2 rounded-lg p-2" style={{ backgroundColor: CONCEPT_TOKENS.bruma50 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="col-span-2 rounded-md py-4 text-center text-[10px] font-medium"
                style={{ backgroundColor: CONCEPT_TOKENS.white, color: CONCEPT_TOKENS.savia800 }}
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
  return <LibraryGuidelineCards items={GRID_ALIGNMENT_GUIDELINES} />
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
              backgroundColor: CONCEPT_TOKENS.bruma50,
            }}
          >
            {Array.from({ length: sample.cols }).map((_, i) => (
              <div
                key={i}
                className="h-8 rounded-sm"
                style={{ backgroundColor: CONCEPT_TOKENS.savia600, opacity: 0.35 + (i % 3) * 0.15 }}
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
          style={type.isDefault ? { borderLeftWidth: 3, borderLeftColor: CONCEPT_TOKENS.savia600 } : undefined}
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-lg font-semibold text-foreground">
                {type.title}
                {type.isDefault ? (
                  <span
                    className="ml-2 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase text-white"
                    style={{ backgroundColor: CONCEPT_TOKENS.savia600 }}
                  >
                    default
                  </span>
                ) : null}
              </p>
              <p className="text-sm font-medium" style={{ color: CONCEPT_TOKENS.savia800 }}>
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
            <div className="mt-4 flex justify-center rounded-lg p-4" style={{ backgroundColor: CONCEPT_TOKENS.bruma50 }}>
              <div
                className="h-3 w-full max-w-full rounded-full"
                style={{
                  maxWidth: type.maxWidthPx / 4,
                  backgroundColor: CONCEPT_TOKENS.savia600,
                  opacity: type.isDefault ? 1 : 0.6,
                }}
              />
            </div>
          ) : (
            <div className="mt-4 h-3 w-full rounded-full" style={{ background: `linear-gradient(90deg, ${CONCEPT_TOKENS.savia600}, ${CONCEPT_TOKENS.savia100})` }} />
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
            style={{ maxWidth: 280, backgroundColor: CONCEPT_TOKENS.savia600 }}
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
            style={{ backgroundColor: CONCEPT_TOKENS.savia600 }}
          >
            100% del main
          </div>
        </div>
      </div>
    </div>
  )
}

export function GridTechnicalDetails() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <TechnicalSubheading>Anatomía</TechnicalSubheading>
        <div className="overflow-x-auto rounded-2xl border border-border/70">
          <table className="w-full min-w-[480px] text-left font-canopy text-sm">
            <tbody>
              {GRID_ANATOMY_PARTS.map((part) => (
                <tr key={part.id} className="border-b border-border/40 last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{part.term}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{part.natureMetaphor}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{part.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3">
        <TechnicalSubheading>Spans frecuentes</TechnicalSubheading>
        <div className="overflow-x-auto rounded-2xl border border-border/70">
          <table className="w-full min-w-[480px] text-left font-canopy text-sm">
            <tbody>
              {GRID_SPAN_PRESETS.map((preset) => (
                <tr key={preset.span} className="border-b border-border/40 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-primary">{preset.span}/12</td>
                  <td className="px-4 py-3 text-foreground">{preset.label}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{preset.usage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3">
        <TechnicalSubheading>Breakpoints</TechnicalSubheading>
        <GridBreakpointTable />
      </div>

      <div className="space-y-3">
        <TechnicalSubheading>Guías de alineación</TechnicalSubheading>
        <GridGuidelineCards />
      </div>
    </div>
  )
}

