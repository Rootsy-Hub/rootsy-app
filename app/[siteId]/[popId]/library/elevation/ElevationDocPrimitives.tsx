"use client"

import {
  ELEVATION_GUIDELINES,
  ROOTSY_ELEVATION_CONCEPT,
  ROOTSY_ELEVATION_INTERACTION,
  ROOTSY_ELEVATION_LEVELS,
  ROOTSY_ELEVATION_SEMANTIC,
  ROOTSY_ELEVATION_SHADOW_TOKENS,
  ROOTSY_ELEVATION_SURFACES_DARK,
  ROOTSY_ELEVATION_SURFACES_LIGHT,
  ROOTSY_ELEVATION_Z_INDEX,
  SUNKEN_VS_NEUTRAL,
  type ElevationLevel,
} from "@/app/[siteId]/[popId]/library/elevation/rootsyElevationSystem"
import { CONCEPT_TOKENS } from "@/app/[siteId]/[popId]/library/concept/rootsyConceptSystem"
import {
  LibraryDoDontPair,
} from "@/app/[siteId]/[popId]/library/libraryDocPrimitives"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

export {
  LibraryDocLead as ElevationDocLead,
  LibraryDocSection as ElevationDocSection,
  LibraryPrinciplesGrid as ElevationPrinciplesGrid,
  LibraryDoDontPair as ElevationGuidelinePair,
  LibraryRelatedLinks as ElevationRelatedLinks,
} from "@/app/[siteId]/[popId]/library/libraryDocPrimitives"

function SpecCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("library-spec-card rounded-2xl border p-5 sm:p-6", className)}>
      {children}
    </div>
  )
}

function BrumaStage({
  caption,
  children,
  className,
}: {
  caption?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className="overflow-hidden rounded-2xl border"
      style={{
        backgroundColor: CONCEPT_TOKENS.bruma100,
        borderColor: CONCEPT_TOKENS.bruma200,
      }}
    >
      <div className={cn("p-5 sm:p-6", className)}>{children}</div>
      {caption ? (
        <p
          className="border-t px-4 py-3 font-canopy text-[11px] leading-relaxed"
          style={{
            borderColor: CONCEPT_TOKENS.bruma200,
            color: CONCEPT_TOKENS.bruma500,
          }}
        >
          {caption}
        </p>
      ) : null}
    </div>
  )
}

function ExampleLabel({ children }: { children: ReactNode }) {
  return (
    <p className="font-canopy text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
      {children}
    </p>
  )
}

function LightStackDemo() {
  return (
    <div className="space-y-2">
      <ExampleLabel>Workspace · bruma</ExampleLabel>
      <div
        className="space-y-3 rounded-xl border p-4"
        style={{
          backgroundColor: CONCEPT_TOKENS.bruma100,
          borderColor: CONCEPT_TOKENS.bruma200,
        }}
      >
        <div
          className="rounded-lg border px-3 py-2 font-canopy text-sm"
          style={{
            backgroundColor: CONCEPT_TOKENS.bruma50,
            borderColor: CONCEPT_TOKENS.bruma200,
            color: CONCEPT_TOKENS.bruma900,
          }}
        >
          Sunken · bruma 50
        </div>
        <div
          className="rounded-lg border px-3 py-2 font-canopy text-sm shadow-sm"
          style={{
            backgroundColor: CONCEPT_TOKENS.white,
            borderColor: CONCEPT_TOKENS.bruma200,
            color: CONCEPT_TOKENS.bruma900,
          }}
        >
          Raised · card blanca
        </div>
      </div>
    </div>
  )
}

function DarkStackDemo() {
  return (
    <div className="space-y-2">
      <ExampleLabel>POS · sombra</ExampleLabel>
      <div
        className="space-y-3 rounded-xl border p-4"
        style={{
          backgroundColor: CONCEPT_TOKENS.sombra600,
          borderColor: CONCEPT_TOKENS.sombra600,
        }}
      >
        <div
          className="rounded-lg border px-3 py-2 font-canopy text-sm"
          style={{
            backgroundColor: CONCEPT_TOKENS.sombra700,
            borderColor: CONCEPT_TOKENS.sombra600,
            color: CONCEPT_TOKENS.white,
          }}
        >
          Sunken · sombra 700
        </div>
        <div
          className="rounded-lg border px-3 py-2 font-canopy text-sm"
          style={{
            backgroundColor: CONCEPT_TOKENS.sombra600,
            borderColor: CONCEPT_TOKENS.sombra600,
            color: CONCEPT_TOKENS.white,
            boxShadow: "0 4px 14px rgb(5 8 7 / 0.25)",
          }}
        >
          Raised · card catálogo
        </div>
      </div>
    </div>
  )
}

export function ElevationSystemHero() {
  return (
    <SpecCard className="space-y-6">
      <div className="space-y-3">
        <p
          className="font-canopy text-[10px] font-bold uppercase tracking-[0.2em]"
          style={{ color: CONCEPT_TOKENS.bruma500 }}
        >
          Rootsy · Elevación
        </p>
        <p
          className="font-canopy text-2xl font-bold tracking-tight sm:text-3xl"
          style={{ color: CONCEPT_TOKENS.bruma900 }}
        >
          {ROOTSY_ELEVATION_CONCEPT.title}
        </p>
        <p
          className="max-w-2xl font-canopy text-sm leading-relaxed"
          style={{ color: CONCEPT_TOKENS.bruma900 }}
        >
          {ROOTSY_ELEVATION_CONCEPT.lead}
        </p>
      </div>

      <div className="space-y-2">
        <p
          className="font-canopy text-xs font-semibold uppercase tracking-wide"
          style={{ color: CONCEPT_TOKENS.bruma500 }}
        >
          Por qué
        </p>
        <ul className="max-w-2xl space-y-2">
          {ROOTSY_ELEVATION_CONCEPT.why.map((line) => (
            <li
              key={line}
              className="font-canopy text-sm leading-relaxed"
              style={{ color: CONCEPT_TOKENS.bruma600 }}
            >
              {line}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <LightStackDemo />
        <DarkStackDemo />
      </div>

      <p
        className="border-t pt-4 font-stream text-sm leading-relaxed"
        style={{
          borderColor: CONCEPT_TOKENS.bruma200,
          color: CONCEPT_TOKENS.bruma500,
        }}
      >
        {ROOTSY_ELEVATION_CONCEPT.closing}
      </p>
    </SpecCard>
  )
}

function ElevationLevelTile({ level }: { level: ElevationLevel }) {
  return (
    <SpecCard className="space-y-3 p-0 overflow-hidden">
      <div className="flex min-h-28 items-center justify-center bg-muted/20 p-5">
        <div className={cn(level.cssClass, "w-full max-w-[200px] px-3 py-4")}>
          <p
            className="font-canopy text-[10px] font-bold uppercase tracking-wide"
            style={{ color: CONCEPT_TOKENS.bruma500 }}
          >
            {level.natureName}
          </p>
          <p
            className="mt-1 font-canopy text-sm font-semibold"
            style={{ color: CONCEPT_TOKENS.bruma900 }}
          >
            {level.label}
          </p>
        </div>
      </div>
      <div className="space-y-2 px-4 pb-4">
        <p className="font-canopy text-xs leading-relaxed text-muted-foreground">
          {level.description}
        </p>
        <p className="font-mono text-[10px] text-primary">{level.token}</p>
      </div>
    </SpecCard>
  )
}

export function ElevationLevelsGallery() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ROOTSY_ELEVATION_LEVELS.map((level) => (
        <ElevationLevelTile key={level.id} level={level} />
      ))}
    </div>
  )
}

export function ElevationStackDemo() {
  return (
    <BrumaStage caption="Suelo bruma → hondonada → brote raised · dosel overlay en esquina.">
      <div className="rootsy-elevation-stack-demo">
        <div className="rootsy-elevation-stack-demo__sunken space-y-3">
          <p className="font-canopy text-xs font-semibold text-foreground">Columna · sunken</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rootsy-elevation-default-bordered px-3 py-2 font-canopy text-xs text-muted-foreground">
              Loseta · borde
            </div>
            <div className="rootsy-elevation-raised px-3 py-2 font-canopy text-xs text-foreground">
              Brote · raised
            </div>
          </div>
        </div>
        <div className="rootsy-elevation-overlay pointer-events-none absolute bottom-4 right-4 max-w-[160px] px-3 py-2">
          <p className="font-canopy text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            Dosel
          </p>
          <p className="font-canopy text-xs font-medium text-foreground">Modal</p>
        </div>
      </div>
    </BrumaStage>
  )
}

export function ElevationModalPreview() {
  return (
    <BrumaStage caption="Overlay + shadow.overlay — rounded xxlarge como modales de producto.">
      <div className="relative py-10">
        <div className="rootsy-elevation-overlay mx-auto max-w-xs px-5 py-4">
          <p className="font-canopy text-base font-semibold text-foreground">Confirmar venta</p>
          <p className="mt-1 font-canopy text-xs text-muted-foreground">
            elevation.surface.overlay
          </p>
        </div>
      </div>
    </BrumaStage>
  )
}

export function ElevationOverflowDemo() {
  return (
    <div className="rootsy-elevation-default-bordered rootsy-elevation-overflow-demo px-4 py-3">
      <div className="flex w-[140%] gap-2 font-mono text-[10px] text-muted-foreground">
        {["SKU", "Nombre", "Precio", "Stock", "Categoría"].map((col) => (
          <span key={col} className="shrink-0 rounded bg-muted/50 px-2 py-1">
            {col}
          </span>
        ))}
      </div>
    </div>
  )
}

export function ElevationSurfacesCompare() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <SpecCard>
        <p className="font-canopy text-sm font-semibold text-foreground">Claro · workspace</p>
        <ul className="mt-3 space-y-2">
          {ROOTSY_ELEVATION_SURFACES_LIGHT.map((row) => (
            <li
              key={row.token}
              className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
              style={{ borderColor: CONCEPT_TOKENS.bruma200 }}
            >
              <span className="font-mono text-[10px] text-muted-foreground">{row.token}</span>
              <span className="font-mono text-[10px] text-foreground">{row.value}</span>
            </li>
          ))}
        </ul>
      </SpecCard>
      <div className="rootsy-elevation-dark-preview">
        <p className="font-canopy text-sm font-semibold text-white/90">Oscuro · POS</p>
        <ul className="mt-3 space-y-2">
          {ROOTSY_ELEVATION_SURFACES_DARK.map((row) => (
            <li
              key={row.token}
              className="flex items-center justify-between gap-3 rounded-lg border border-white/10 px-3 py-2"
            >
              <span className="font-mono text-[10px] text-white/45">{row.token}</span>
              <span className="font-mono text-[10px] text-white/80">{row.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function SunkenVsNeutralCard() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <SpecCard>
        <p className="font-mono text-xs text-primary">elevation.surface.sunken</p>
        <p className="mt-2 font-canopy text-sm text-muted-foreground">{SUNKEN_VS_NEUTRAL.sunken}</p>
        <div className="rootsy-elevation-sunken mt-4 px-4 py-6 text-center font-canopy text-xs text-muted-foreground">
          Agrupa columnas
        </div>
      </SpecCard>
      <SpecCard>
        <p className="font-mono text-xs text-primary">transparente</p>
        <p className="mt-2 font-canopy text-sm text-muted-foreground">{SUNKEN_VS_NEUTRAL.neutral}</p>
        <div
          className="mt-4 rounded-xl px-4 py-6 text-center font-canopy text-xs text-muted-foreground"
          style={{ backgroundColor: `${CONCEPT_TOKENS.savia600}14` }}
        >
          Hereda del padre
        </div>
      </SpecCard>
    </div>
  )
}

export function ElevationInteractionDemo() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <button
        type="button"
        className="rootsy-elevation-default-bordered rootsy-elevation-interactive-demo px-4 py-6 text-left"
      >
        <p className="font-canopy text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Loseta
        </p>
        <p className="mt-1 font-canopy text-sm text-foreground">Hover · bruma 50</p>
      </button>
      <button
        type="button"
        className="rootsy-elevation-raised rootsy-elevation-interactive-demo px-4 py-6 text-left"
      >
        <p className="font-canopy text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Raised
        </p>
        <p className="mt-1 font-canopy text-sm text-foreground">Hover · sombra más amplia</p>
      </button>
    </div>
  )
}

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

export function ElevationTechnicalDetails() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <TechnicalSubheading>Sombras</TechnicalSubheading>
        <div className="overflow-x-auto rounded-2xl border border-border/70">
          <table className="w-full min-w-[480px] text-left font-canopy text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                <th className="px-4 py-3 font-semibold">Token</th>
                <th className="px-4 py-3 font-semibold">Par</th>
              </tr>
            </thead>
            <tbody>
              {ROOTSY_ELEVATION_SHADOW_TOKENS.map((row) => (
                <tr key={row.token} className="border-b border-border/40 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-primary">{row.token}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{row.pairsWith}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3">
        <TechnicalSubheading>Estados hover / pressed</TechnicalSubheading>
        <div className="overflow-x-auto rounded-2xl border border-border/70">
          <table className="w-full min-w-[480px] text-left font-canopy text-sm">
            <tbody>
              {ROOTSY_ELEVATION_INTERACTION.map((row) => (
                <tr key={row.id} className="border-b border-border/40 last:border-0">
                  <td className="px-4 py-3 capitalize text-foreground">{row.state}</td>
                  <td className="px-4 py-3 font-mono text-xs text-primary">{row.surfaceToken}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <SemanticTokensTable />
      <ZIndexTable />

      <LibraryDoDontPair
        doText={ELEVATION_GUIDELINES.do}
        dontText={ELEVATION_GUIDELINES.dont}
      />
    </div>
  )
}

export function SemanticTokensTable() {
  return (
    <div className="space-y-3">
      <TechnicalSubheading>Tokens semánticos</TechnicalSubheading>
      <div className="overflow-x-auto rounded-2xl border border-border/70">
        <table className="w-full min-w-[560px] text-left font-canopy text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-muted/30">
              <th className="px-4 py-3 font-semibold">Token</th>
              <th className="px-4 py-3 font-semibold">Componente</th>
              <th className="px-4 py-3 font-semibold">Nivel</th>
            </tr>
          </thead>
          <tbody>
            {ROOTSY_ELEVATION_SEMANTIC.map((row) => (
              <tr key={row.token} className="border-b border-border/40 last:border-0">
                <td className="px-4 py-3 font-mono text-xs text-primary">{row.token}</td>
                <td className="px-4 py-3 text-foreground">{row.component}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{row.levelId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function ZIndexTable() {
  return (
    <div className="space-y-3">
      <TechnicalSubheading>Z-index</TechnicalSubheading>
      <div className="overflow-x-auto rounded-2xl border border-border/70">
        <table className="w-full min-w-[480px] text-left font-canopy text-sm">
          <tbody>
            {ROOTSY_ELEVATION_Z_INDEX.map((row) => (
              <tr key={row.zIndex} className="border-b border-border/40 last:border-0">
                <td className="px-4 py-3 font-mono font-semibold">{row.zIndex}</td>
                <td className="px-4 py-3 text-muted-foreground">{row.usage}</td>
                <td className="px-4 py-3 text-xs text-foreground">{row.rootsyExample}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/** @deprecated Usar ElevationSystemHero */
export function ElevationManifestoHero() {
  return <ElevationSystemHero />
}

/** @deprecated Usar ElevationGuidelinePair en technical details */
export function ElevationGuidelinesGrid() {
  return null
}

export function ElevationShadowTokensTable() {
  return null
}

export function ElevationInteractionTable() {
  return null
}
