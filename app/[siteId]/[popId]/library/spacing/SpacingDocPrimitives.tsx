"use client"

import {
  LAYOUT_PRIMITIVES,
  NATURE_RHYTHM_TIERS,
  ROOTSY_NEGATIVE_SPACING_TOKENS,
  ROOTSY_SPACING_BASE_PX,
  ROOTSY_SPACING_SEMANTIC_ROLES,
  ROOTSY_SPACING_TOKENS,
  SPACING_LAYOUT_GUIDELINES,
  SPACING_RANGE_META,
  type SpacingToken,
} from "@/app/[siteId]/[popId]/library/spacing/rootsySpacingScale"
import {
  CANOPY,
  CANOPY_DARK,
  CANOPY_LIGHT,
  CANOPY_MIST,
  LibraryGuidelineCards,
  LibraryManifestoHero,
} from "@/app/[siteId]/[popId]/library/libraryDocPrimitives"
import type { CSSProperties } from "react"

export {
  LibraryDocLead as SpacingDocLead,
  LibraryDocSection as SpacingDocSection,
  LibraryPrinciplesGrid as SpacingPrinciplesGrid,
  LibraryRelatedLinks as SpacingRelatedLinks,
} from "@/app/[siteId]/[popId]/library/libraryDocPrimitives"

export function SpacingManifestoHero() {
  return (
    <LibraryManifestoHero
      eyebrow="Rootsy · Espaciado"
      title="El bosque tiene ritmo"
      description="Rocío, hoja, rama, tronco, claro y horizonte — seis capas de distancia sobre una base de 8px."
    />
  )
}

function SpacingBar({ token }: { token: SpacingToken }) {
  const width = Math.max(token.px, 2)
  const isBase = token.token === "space.100"

  return (
    <div className="flex items-center gap-3">
      <div
        className="shrink-0 rounded-sm"
        style={{
          width,
          height: 24,
          backgroundColor: isBase ? CANOPY : CANOPY_LIGHT,
          outline: isBase ? `2px solid ${CANOPY}` : undefined,
        }}
      />
      <span className="w-12 shrink-0 text-right font-mono text-xs text-muted-foreground">
        {token.px}px
      </span>
    </div>
  )
}

export function SpacingScaleTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70">
      <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-x-3 border-b border-border/60 bg-muted/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        <span>Token</span>
        <span>Nature</span>
        <span className="text-right">× base</span>
        <span className="text-right">rem</span>
        <span className="text-right">px</span>
        <span className="min-w-[72px]">Visual</span>
      </div>
      <div className="divide-y divide-border/50">
        {ROOTSY_SPACING_TOKENS.map((token) => {
          const isBase = token.token === "space.100"
          return (
            <div
              key={token.id}
              className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] items-center gap-x-3 px-4 py-2.5"
              style={isBase ? { backgroundColor: CANOPY_MIST } : undefined}
            >
              <span className="font-mono text-sm text-foreground">
                {token.token}
                {isBase ? (
                  <span
                    className="ml-2 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase"
                    style={{ backgroundColor: CANOPY, color: "#fff" }}
                  >
                    base
                  </span>
                ) : null}
              </span>
              <span className="text-xs text-muted-foreground">{token.natureName}</span>
              <span className="text-right font-mono text-xs text-muted-foreground">
                {token.multiplier}
              </span>
              <span className="text-right font-mono text-xs text-muted-foreground">
                {token.rem}
              </span>
              <span className="text-right font-mono text-xs font-medium text-foreground">
                {token.px}px
              </span>
              <SpacingBar token={token} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function NatureRhythmTiersGrid() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {NATURE_RHYTHM_TIERS.map((tier, index) => (
        <div
          key={tier.id}
          className="rounded-xl border border-border/70 bg-card p-4 shadow-sm"
          style={{
            borderLeftWidth: 3,
            borderLeftColor: `color-mix(in srgb, ${CANOPY} ${40 + index * 10}%, ${CANOPY_LIGHT})`,
          }}
        >
          <p className="text-sm font-semibold text-foreground">{tier.title}</p>
          <p className="text-xs font-medium" style={{ color: CANOPY_DARK }}>
            {tier.subtitle} · {tier.pxRange}
          </p>
          <p className="mt-2 font-mono text-[10px] text-muted-foreground">
            {tier.tokenRange}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{tier.description}</p>
        </div>
      ))}
    </div>
  )
}

export function SpacingSemanticRolesTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70">
      <div className="grid grid-cols-[1fr_auto_auto_1.5fr] gap-x-4 border-b border-border/60 bg-muted/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        <span>Rol</span>
        <span>Token</span>
        <span className="text-right">px</span>
        <span>Uso</span>
      </div>
      {ROOTSY_SPACING_SEMANTIC_ROLES.map((row) => (
        <div
          key={row.id}
          className="grid grid-cols-[1fr_auto_auto_1.5fr] items-start gap-x-4 border-b border-border/40 px-4 py-3 last:border-b-0"
        >
          <span className="text-sm font-medium text-foreground">{row.role}</span>
          <span className="font-mono text-xs text-primary">{row.token}</span>
          <span className="text-right font-mono text-xs text-muted-foreground">
            {row.px}px
          </span>
          <span className="text-sm text-muted-foreground">{row.usage}</span>
        </div>
      ))}
    </div>
  )
}

export function NegativeSpacingTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70">
      <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 border-b border-border/60 bg-muted/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        <span>Token</span>
        <span className="text-right">rem</span>
        <span className="text-right">px</span>
      </div>
      {ROOTSY_NEGATIVE_SPACING_TOKENS.map((row) => (
        <div
          key={row.token}
          className="grid grid-cols-[1fr_auto_auto] gap-x-4 border-b border-border/40 px-4 py-2.5 last:border-b-0"
        >
          <span className="font-mono text-sm text-foreground">{row.token}</span>
          <span className="text-right font-mono text-xs text-muted-foreground">
            {row.rem}
          </span>
          <span className="text-right font-mono text-xs font-medium text-foreground">
            {row.px}px
          </span>
        </div>
      ))}
    </div>
  )
}

export function BaseUnitDemo() {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-6">
      <div className="flex flex-wrap items-end gap-6">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Unidad base</p>
          <div
            className="rounded-md"
            style={{
              width: ROOTSY_SPACING_BASE_PX,
              height: ROOTSY_SPACING_BASE_PX * 4,
              backgroundColor: CANOPY,
            }}
          />
          <p className="font-mono text-xs text-foreground">8 × 32px</p>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">space.100</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Todo token es múltiplo de esta unidad. El sufijo numérico indica el
            porcentaje: <code className="font-mono text-xs">space.200</code> = 200%
            = 16px.
          </p>
        </div>
      </div>
    </div>
  )
}

export function SpacingRangeOverview() {
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-border/70 p-6">
        <div className="mb-4 flex justify-between text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          <span>0px</span>
          <span>80px</span>
        </div>
        <div className="relative h-8 overflow-hidden rounded-full bg-muted/50">
          <div
            className="absolute inset-y-0 left-0 rounded-l-full"
            style={{ width: "10%", backgroundColor: CANOPY_LIGHT }}
          />
          <div
            className="absolute inset-y-0"
            style={{ left: "10%", width: "17.5%", backgroundColor: "#6DD99E" }}
          />
          <div
            className="absolute inset-y-0 rounded-r-full"
            style={{ left: "27.5%", width: "72.5%", backgroundColor: CANOPY }}
          />
          <div
            className="absolute inset-y-0 w-0.5 bg-white/80"
            style={{ left: "10%" }}
          />
          <div
            className="absolute inset-y-0 w-0.5 bg-white/80"
            style={{ left: "27.5%" }}
          />
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {(["small", "medium", "large"] as const).map((range) => (
            <div key={range} className="text-center">
              <p className="text-xs font-semibold text-foreground">
                {SPACING_RANGE_META[range].label}
              </p>
              <p className="font-mono text-[10px] text-muted-foreground">
                {SPACING_RANGE_META[range].tokenRange}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {(["small", "medium", "large"] as const).map((range) => {
          const meta = SPACING_RANGE_META[range]
          return (
            <div
              key={range}
              className="rounded-xl border border-border/70 bg-card p-4 shadow-sm"
            >
              <p className="text-sm font-semibold text-foreground">{meta.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{meta.description}</p>
              <ul className="mt-3 space-y-1">
                {meta.examples.map((ex) => (
                  <li key={ex} className="text-xs text-muted-foreground">
                    · {ex}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function SpacingGuidelineCards() {
  return <LibraryGuidelineCards items={SPACING_LAYOUT_GUIDELINES} />
}

export function SimilarityDemo() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-xl border-2 p-4" style={{ borderColor: CANOPY }}>
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-primary">
          ✓ Hacer
        </p>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-lg px-3 py-2"
              style={{ backgroundColor: CANOPY_MIST }}
            >
              <div
                className="size-8 shrink-0 rounded-md"
                style={{ backgroundColor: CANOPY_LIGHT }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Ítem {i}</p>
                <p className="text-xs text-muted-foreground">gap 8px uniforme</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-border/70 p-4 opacity-80">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          ✗ Evitar
        </p>
        <div>
          {[8, 16, 4].map((gap, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-lg px-3 py-2"
              style={{
                backgroundColor: CANOPY_MIST,
                marginBottom: gap,
              }}
            >
              <div
                className="size-8 shrink-0 rounded-md"
                style={{ backgroundColor: CANOPY_LIGHT }}
              />
              <p className="text-sm">Ítem {i + 1} · gap {gap}px</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ProximityDemo() {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-6">
      <div className="max-w-md">
        <p className="text-lg font-semibold">Título de sección</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Descripción cercana al título (8px)
        </p>
        <div className="mt-6 flex gap-2">
          <button
            type="button"
            className="rounded-lg px-4 py-2 text-sm font-medium text-white"
            style={{ backgroundColor: CANOPY }}
          >
            Acción principal
          </button>
          <button
            type="button"
            className="rounded-lg border px-4 py-2 text-sm"
            style={{ borderColor: CANOPY_LIGHT }}
          >
            Secundaria
          </button>
        </div>
        <p className="mt-8 text-xs text-muted-foreground">
          Bloque de acciones separado 24px — grupo distinto
        </p>
      </div>
    </div>
  )
}

/* ——— Layout primitives (library demos) ——— */

function DemoCard({ label }: { label: string }) {
  return (
    <div
      className="flex min-h-[72px] min-w-[100px] flex-1 items-center justify-center rounded-lg border text-xs font-medium"
      style={{ borderColor: CANOPY_LIGHT, backgroundColor: "#fff", color: CANOPY_DARK }}
    >
      {label}
    </div>
  )
}

export function BoxPrimitiveDemo() {
  return (
    <div className="space-y-4">
      <div
        className="rounded-2xl border border-dashed border-border/70"
        style={{
          padding: 24,
          backgroundColor: CANOPY_MIST,
        }}
      >
        <p className="mb-4 text-xs font-mono text-muted-foreground">
          Box · padding space.300 (24px) · bg canopy-50
        </p>
        <div className="flex flex-wrap gap-4">
          <DemoCard label="Card A" />
          <DemoCard label="Card B" />
          <DemoCard label="Card C" />
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        Box envuelve el grupo y aplica margen, padding y fondo. Cada card puede ser
        otro Box anidado.
      </p>
    </div>
  )
}

export function InlinePrimitiveDemo() {
  return (
    <div className="space-y-4">
      <div
        className="flex flex-wrap rounded-2xl border border-border/70 bg-card p-4"
        style={{ gap: 16 }}
      >
        <DemoCard label="Chip 1" />
        <DemoCard label="Chip 2" />
        <DemoCard label="Chip 3" />
      </div>
      <p className="font-mono text-xs text-muted-foreground">
        Inline · gap space.200 (16px)
      </p>
    </div>
  )
}

export function StackPrimitiveDemo() {
  return (
    <div className="space-y-4">
      <div
        className="flex flex-col rounded-2xl border border-border/70 bg-card p-4"
        style={{ gap: 24 }}
      >
        <p className="text-lg font-semibold">Encabezado</p>
        <DemoCard label="Contenido" />
        <DemoCard label="Contenido" />
      </div>
      <p className="font-mono text-xs text-muted-foreground">
        Stack · gap space.300 (24px) entre bloques
      </p>
    </div>
  )
}

export function CombinedPrimitivesDemo() {
  return (
    <div
      className="rounded-2xl border border-border/70 p-6"
      style={{ backgroundColor: CANOPY_MIST }}
    >
      <div className="flex flex-col" style={{ gap: 32 }}>
        <div>
          <p className="text-xl font-semibold">Página ejemplo</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Stack externo · space.400 entre header y cuerpo
          </p>
        </div>
        <div className="flex flex-wrap" style={{ gap: 16 }}>
          <DemoCard label="Inline row" />
          <DemoCard label="Inline row" />
        </div>
      </div>
    </div>
  )
}

export function FigmaAutoLayoutComparison() {
  const rows = [
    { primitive: "Box", figma: "Frame + padding H/V + fill" },
    { primitive: "Inline", figma: "Auto layout horizontal + gap" },
    { primitive: "Stack", figma: "Auto layout vertical + gap" },
  ]

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70">
      <div className="grid grid-cols-2 border-b border-border/60 bg-muted/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        <span>Primitivo (código)</span>
        <span>Figma Auto Layout</span>
      </div>
      {rows.map((row) => (
        <div
          key={row.primitive}
          className="grid grid-cols-2 border-b border-border/40 px-4 py-3 last:border-b-0"
        >
          <span className="font-mono text-sm text-foreground">{row.primitive}</span>
          <span className="text-sm text-muted-foreground">{row.figma}</span>
        </div>
      ))}
    </div>
  )
}

export function PrimitiveMetaCards() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {LAYOUT_PRIMITIVES.map((p) => (
        <div
          key={p.id}
          className="rounded-xl border border-border/70 bg-card p-4 shadow-sm"
        >
          <p className="text-lg font-semibold text-foreground">{p.title}</p>
          <p className="text-xs font-medium text-primary">{p.subtitle}</p>
          <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
          <p className="mt-3 rounded-lg bg-muted/50 px-2 py-1.5 font-mono text-[10px] text-muted-foreground">
            Figma: {p.figmaHint}
          </p>
        </div>
      ))}
    </div>
  )
}

export function NegativeSpacingDemo() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/70 p-8">
      <div
        className="absolute inset-4 rounded-xl border-2 border-dashed"
        style={{ borderColor: CANOPY_LIGHT }}
      />
      <div
        className="relative rounded-xl p-4 text-sm"
        style={{
          backgroundColor: "#fff",
          margin: -8,
          boxShadow: "0 4px 12px rgba(30, 143, 90, 0.12)",
        }}
      >
        <p className="font-medium" style={{ color: CANOPY_DARK }}>
          Bleed / negative space.100 (−8px)
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Rompe el padding del contenedor — útil para imágenes edge-to-edge o
          superposición controlada.
        </p>
      </div>
    </div>
  )
}

export function TokenUsageStrip({ gapPx }: { gapPx: number }) {
  const style: CSSProperties = { gap: gapPx }
  return (
    <div className="flex items-center" style={style}>
      <div className="size-6 rounded bg-primary/20" />
      <span className="text-sm">Texto</span>
    </div>
  )
}
