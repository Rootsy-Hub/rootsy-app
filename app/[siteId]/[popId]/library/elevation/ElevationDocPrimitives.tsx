"use client"

import {
  ELEVATION_GUIDELINES,
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
import { LibraryManifestoHero } from "@/app/[siteId]/[popId]/library/libraryDocPrimitives"
import { cn } from "@/lib/utils"

export {
  LibraryDocLead as ElevationDocLead,
  LibraryDocSection as ElevationDocSection,
  LibraryPrinciplesGrid as ElevationPrinciplesGrid,
  LibraryRelatedLinks as ElevationRelatedLinks,
} from "@/app/[siteId]/[popId]/library/libraryDocPrimitives"

export function ElevationManifestoHero() {
  return (
    <LibraryManifestoHero
      eyebrow="Rootsy · Elevación"
      title="Capas del bosque"
      description="Claro · suelo · brote · dosel — profundidad con tinte canopy."
    />
  )
}

function ElevationLevelTile({ level }: { level: ElevationLevel }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
      <div className="flex min-h-30 items-center justify-center bg-muted/20 p-6">
        <div className={cn(level.cssClass, "w-full max-w-[220px] px-4 py-5")}>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
            {level.natureName}
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">{level.label}</p>
          <p className="mt-2 text-xs text-muted-foreground">{level.description}</p>
        </div>
      </div>
      <div className="space-y-2 border-t border-border/60 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-[10px] text-primary">
            {level.token}
          </span>
          {level.shadowToken ? (
            <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
              {level.shadowToken}
            </span>
          ) : null}
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">{level.usage}</p>
        {level.pairRule ? (
          <p className="font-mono text-[10px] text-muted-foreground">{level.pairRule}</p>
        ) : null}
      </div>
    </div>
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
    <div className="rootsy-elevation-stack-demo">
      <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        Suelo → claro hundido → brote
      </p>
      <div className="rootsy-elevation-stack-demo__sunken space-y-3">
        <p className="text-xs font-semibold text-foreground">Columna · sunken</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rootsy-elevation-default-bordered px-3 py-2 text-xs text-muted-foreground">
            Tarjeta plana
          </div>
          <div className="rootsy-elevation-raised px-3 py-2 text-xs text-foreground">
            Tarjeta raised
          </div>
        </div>
      </div>
      <div className="rootsy-elevation-overlay pointer-events-none absolute bottom-4 right-4 max-w-[180px] px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Dosel
        </p>
        <p className="mt-0.5 text-xs font-medium text-foreground">Modal / dropdown</p>
      </div>
    </div>
  )
}

export function ElevationShadowTokensTable() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border/70">
      <table className="w-full min-w-[540px] text-left text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-muted/30">
            <th className="px-4 py-3 font-semibold text-foreground">Token</th>
            <th className="px-4 py-3 font-semibold text-foreground">Valor</th>
            <th className="px-4 py-3 font-semibold text-foreground">Par</th>
          </tr>
        </thead>
        <tbody>
          {ROOTSY_ELEVATION_SHADOW_TOKENS.map((row) => (
            <tr key={row.token} className="border-b border-border/40 last:border-0">
              <td className="px-4 py-3 font-mono text-xs text-primary">{row.token}</td>
              <td className="max-w-xs px-4 py-3 font-mono text-[10px] leading-relaxed text-muted-foreground">
                {row.value}
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground">{row.pairsWith}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function ElevationSurfacesCompare() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
        <p className="text-sm font-semibold text-foreground">Light · rootsy-app-light</p>
        <ul className="mt-3 space-y-2">
          {ROOTSY_ELEVATION_SURFACES_LIGHT.map((row) => (
            <li
              key={row.token}
              className="flex items-center justify-between gap-3 rounded-lg border border-border/50 px-3 py-2"
            >
              <span className="font-mono text-[10px] text-muted-foreground">{row.token}</span>
              <span className="font-mono text-[10px] text-foreground">{row.value}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rootsy-elevation-dark-preview">
        <p className="text-sm font-semibold text-white/90">Dark · app shell</p>
        <p className="mt-1 text-xs text-white/50">
          Superficies más claras al subir — sombras más profundas.
        </p>
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
      <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
        <p className="font-mono text-xs text-primary">elevation.surface.sunken</p>
        <p className="mt-2 text-sm text-muted-foreground">{SUNKEN_VS_NEUTRAL.sunken}</p>
        <div className="rootsy-elevation-sunken mt-4 px-4 py-6 text-center text-xs text-muted-foreground">
          Agrupa columnas kanban
        </div>
      </div>
      <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
        <p className="font-mono text-xs text-primary">color.background.neutral</p>
        <p className="mt-2 text-sm text-muted-foreground">{SUNKEN_VS_NEUTRAL.neutral}</p>
        <div
          className="mt-4 rounded-xl px-4 py-6 text-center text-xs text-muted-foreground"
          style={{ background: "oklch(0.55 0.14 155 / 0.08)" }}
        >
          Se adapta al padre
        </div>
      </div>
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
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
          Default bordered
        </p>
        <p className="mt-1 text-sm text-foreground">Hover / pressed · cambio de superficie</p>
      </button>
      <button
        type="button"
        className="rootsy-elevation-raised rootsy-elevation-interactive-demo px-4 py-6 text-left"
      >
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
          Raised
        </p>
        <p className="mt-1 text-sm text-foreground">Hover · sombra canopy un poco más amplia</p>
      </button>
    </div>
  )
}

export function ElevationInteractionTable() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border/70">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-muted/30">
            <th className="px-4 py-3 font-semibold text-foreground">Estado</th>
            <th className="px-4 py-3 font-semibold text-foreground">Token</th>
            <th className="px-4 py-3 font-semibold text-foreground">Notas</th>
          </tr>
        </thead>
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
  )
}

export function SemanticTokensTable() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border/70">
      <table className="w-full min-w-[620px] text-left text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-muted/30">
            <th className="px-4 py-3 font-semibold text-foreground">Token semántico</th>
            <th className="px-4 py-3 font-semibold text-foreground">Componente</th>
            <th className="px-4 py-3 font-semibold text-foreground">Nivel</th>
            <th className="px-4 py-3 font-semibold text-foreground">Fuente</th>
          </tr>
        </thead>
        <tbody>
          {ROOTSY_ELEVATION_SEMANTIC.map((row) => (
            <tr key={row.token} className="border-b border-border/40 last:border-0">
              <td className="px-4 py-3 font-mono text-xs text-primary">{row.token}</td>
              <td className="px-4 py-3 text-foreground">{row.component}</td>
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                {row.levelId}
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

export function ZIndexTable() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border/70">
      <table className="w-full min-w-[540px] text-left text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-muted/30">
            <th className="px-4 py-3 font-semibold text-foreground">z-index</th>
            <th className="px-4 py-3 font-semibold text-foreground">Uso</th>
            <th className="px-4 py-3 font-semibold text-foreground">Elevación</th>
            <th className="px-4 py-3 font-semibold text-foreground">Rootsy</th>
          </tr>
        </thead>
        <tbody>
          {ROOTSY_ELEVATION_Z_INDEX.map((row) => (
            <tr key={row.zIndex} className="border-b border-border/40 last:border-0">
              <td className="px-4 py-3 font-mono text-sm font-semibold text-foreground">
                {row.zIndex}
              </td>
              <td className="px-4 py-3 text-muted-foreground">{row.usage}</td>
              <td className="px-4 py-3 text-xs text-muted-foreground">{row.level}</td>
              <td className="px-4 py-3 text-xs text-foreground">{row.rootsyExample}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function ElevationGuidelinesGrid() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Hacer</p>
        <ul className="mt-3 space-y-2">
          {ELEVATION_GUIDELINES.do.map((item) => (
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
          {ELEVATION_GUIDELINES.dont.map((item) => (
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

export function ElevationModalPreview() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-muted/20 py-12">
      <div className="rootsy-elevation-overlay mx-auto max-w-xs px-5 py-4">
        <p className="text-[17px] font-semibold tracking-tight text-foreground">Modal · dosel</p>
        <p className="mt-1 text-[13px] text-muted-foreground">
          elevation.surface.overlay + elevation.shadow.overlay
        </p>
        <p className="mt-3 font-mono text-[10px] text-muted-foreground">
          articleDialogSurfaceClass
        </p>
      </div>
    </div>
  )
}

export function ElevationOverflowDemo() {
  return (
    <div className="rootsy-elevation-default-bordered rootsy-elevation-overflow-demo px-4 py-3">
      <div className="flex w-[140%] gap-2 font-mono text-[10px] text-muted-foreground">
        {["SKU", "Nombre", "Precio", "Stock", "Categoría", "Estado"].map((col) => (
          <span key={col} className="shrink-0 rounded bg-muted/50 px-2 py-1">
            {col}
          </span>
        ))}
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground">
        elevation.shadow.overflow · bruma en el borde derecho
      </p>
    </div>
  )
}

