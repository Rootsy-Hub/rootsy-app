"use client"

import {
  ROOTSY_BODY_STYLES,
  ROOTSY_CODE_STYLE,
  ROOTSY_FONT_WEIGHTS,
  ROOTSY_HEADING_STYLES,
  ROOTSY_METRIC_STYLES,
  ROOTSY_TYPEFACES,
  TYPE_SCALE_NOTES,
  TYPOGRAPHY_ACCESSIBILITY_NOTES,
  TYPOGRAPHY_APPLYING_GUIDELINES,
  type RootsyTypeface,
  type TypographyStyle,
} from "@/app/[siteId]/[popId]/library/typography/rootsyTypographySystem"
import {
  CANOPY,
  CANOPY_DARK,
  CANOPY_MIST,
  LibraryDocLead,
  LibraryDocSection,
  LibraryGuidelineCards,
  LibraryManifestoHero,
  LibraryPrinciplesGrid,
} from "@/app/[siteId]/[popId]/library/libraryDocPrimitives"
import type { ReactNode } from "react"

export {
  LibraryRelatedLinks as TypographyRelatedLinks,
} from "@/app/[siteId]/[popId]/library/libraryDocPrimitives"

const FONT_CLASS: Record<TypographyStyle["fontFamily"], string> = {
  canopy: "font-canopy",
  stream: "font-stream",
  ledger: "font-ledger",
  code: "font-code",
}

export function TypographyDocLead({ children }: { children: ReactNode }) {
  return <LibraryDocLead className="font-stream">{children}</LibraryDocLead>
}

export function TypographyDocSection({
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
    <LibraryDocSection
      id={id}
      title={title}
      description={description}
      titleClassName="font-canopy"
      descriptionClassName="font-stream"
    >
      {children}
    </LibraryDocSection>
  )
}

export function TypographyManifestoHero() {
  return (
    <LibraryManifestoHero
      eyebrow="Rootsy · Tipografía"
      title="Canopy · Stream · Ledger"
      description="Tres voces nature — UI cálida, lectura fluida, números precisos."
      eyebrowClassName="font-canopy"
      titleClassName="font-canopy font-bold"
      descriptionClassName="font-stream"
    />
  )
}

export function TypographyPrinciplesGrid({
  principles,
}: {
  principles: ReadonlyArray<{ title: string; detail: string }>
}) {
  return (
    <LibraryPrinciplesGrid
      principles={principles}
      titleClassName="font-canopy"
      detailClassName="font-stream"
    />
  )
}

function TypefaceCard({ face }: { face: RootsyTypeface }) {
  return (
    <div className="rounded-xl border border-border/70 bg-card p-5 shadow-sm">
      <p
        className={`text-3xl font-bold tracking-tight ${face.id === "canopy" ? "font-canopy" : face.id === "stream" ? "font-stream" : face.id === "ledger" ? "font-ledger" : "font-code"}`}
        style={{ color: CANOPY_DARK }}
      >
        {face.natureName}
      </p>
      <p className="mt-1 text-lg font-semibold text-foreground font-canopy">{face.family}</p>
      <p className="font-mono text-[10px] text-primary">{face.role}</p>
      <p className="mt-2 text-sm text-muted-foreground font-stream">{face.description}</p>
      <div className="mt-3 flex flex-wrap gap-1">
        {face.weights.map((w) => (
          <span
            key={w}
            className="rounded-md bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
          >
            {w}
          </span>
        ))}
      </div>
      {face.features ? (
        <ul className="mt-3 space-y-0.5">
          {face.features.map((f) => (
            <li key={f} className="text-xs text-muted-foreground font-stream">
              · {f}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

export function TypefacesGallery() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {ROOTSY_TYPEFACES.map((face) => (
        <TypefaceCard key={face.id} face={face} />
      ))}
    </div>
  )
}

function StylePreviewRow({ style }: { style: TypographyStyle }) {
  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-4 border-b border-border/40 px-4 py-3 last:border-b-0">
      <div className="min-w-0">
        <span
          className={FONT_CLASS[style.fontFamily]}
          style={{
            fontWeight: style.fontWeight,
            fontSize: style.fontSizeRem,
            lineHeight: style.lineHeightRem,
          }}
        >
          {style.preview}
        </span>
        <p className="mt-1 font-mono text-[10px] text-primary">{style.token}</p>
      </div>
      <span className="text-right font-mono text-xs text-muted-foreground">
        {style.fontWeightLabel}
      </span>
      <span className="text-right font-mono text-xs text-muted-foreground">
        {style.fontSizePx}px / {style.lineHeightPx}px
      </span>
      <span className="hidden max-w-[200px] text-right text-xs text-muted-foreground sm:block font-stream">
        {style.usage}
      </span>
    </div>
  )
}

export function TypographyStylesTable({
  title,
  styles,
}: {
  title: string
  styles: TypographyStyle[]
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70">
      <div
        className="border-b border-border/60 px-4 py-2 text-sm font-semibold font-canopy"
        style={{ backgroundColor: CANOPY_MIST, color: CANOPY_DARK }}
      >
        {title}
      </div>
      <div className="hidden grid-cols-[1fr_auto_auto_auto] gap-x-4 border-b border-border/60 bg-muted/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground sm:grid">
        <span>Preview · token</span>
        <span className="text-right">Peso</span>
        <span className="text-right">Size / LH</span>
        <span className="text-right">Uso</span>
      </div>
      {styles.map((style) => (
        <StylePreviewRow key={style.id} style={style} />
      ))}
    </div>
  )
}

export function VoiceComparisonDemo() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="rounded-xl border border-border/70 p-4" style={{ backgroundColor: CANOPY_MIST }}>
        <p className="text-xs font-bold uppercase tracking-wider font-canopy" style={{ color: CANOPY_DARK }}>
          Canopy · UI
        </p>
        <p className="mt-2 font-canopy text-lg font-bold text-foreground">
          Nuevo artículo
        </p>
        <p className="mt-1 font-canopy text-sm text-muted-foreground">
          Completá los datos del producto.
        </p>
      </div>
      <div className="rounded-xl border border-border/70 bg-card p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-canopy">
          Stream · lectura
        </p>
        <p className="mt-2 font-stream text-base leading-relaxed text-foreground">
          Rootsy conecta inventario, ventas y tesorería en un solo ecosistema digital.
        </p>
      </div>
      <div className="rounded-xl border border-border/70 bg-card p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-canopy">
          Ledger · números
        </p>
        <p className="mt-2 font-ledger text-2xl font-bold tabular-nums text-foreground">
          $ 124.580,00
        </p>
        <p className="font-ledger text-sm tabular-nums text-muted-foreground">Stock: 1.248 uds.</p>
      </div>
    </div>
  )
}

export function MetricDemo() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-xl border-2 p-5 text-center" style={{ borderColor: CANOPY }}>
        <p className="font-ledger text-3xl font-bold tabular-nums" style={{ color: CANOPY_DARK }}>
          45%
        </p>
        <p className="mt-1 font-canopy text-xs text-muted-foreground">capacidad · body.small</p>
        <p className="mt-3 text-[10px] font-canopy" style={{ color: CANOPY_DARK }}>
          ✓ metric en el número
        </p>
      </div>
      <div className="rounded-xl border border-border/70 p-5 text-center opacity-80">
        <p className="font-ledger text-3xl font-bold tabular-nums text-foreground">45%</p>
        <p className="mt-1 font-ledger text-xs font-bold tabular-nums text-muted-foreground">
          capacidad
        </p>
        <p className="mt-3 text-[10px] text-muted-foreground font-canopy">
          ✗ metric también en subtexto
        </p>
      </div>
    </div>
  )
}

export function CodeBlockDemo() {
  return (
    <pre
      className="overflow-x-auto rounded-xl border border-border/70 p-4 font-code text-xs leading-relaxed"
      style={{ backgroundColor: "#052E1F", color: "#A8EBC4" }}
    >
      {`const token = "font.code"
// Bark · JetBrains Mono
export const canopy = "#1E8F5A"`}
    </pre>
  )
}

export function TypeScaleDiagram() {
  const steps = [
    { label: "12px", token: "xxsmall / body.small" },
    { label: "14px", token: "body · xsmall" },
    { label: "16px", token: "body.large · small heading" },
    { label: "20px", token: "heading.medium" },
    { label: "24px", token: "heading.large" },
    { label: "28px", token: "heading.xlarge · metric.large" },
    { label: "32px", token: "heading.xxlarge" },
  ]

  return (
    <div className="space-y-4 rounded-2xl border border-border/70 p-6">
      <p className="text-sm font-stream text-muted-foreground">
        Base {TYPE_SCALE_NOTES.basePx}px · ratio {TYPE_SCALE_NOTES.ratio} (minor third) ·{" "}
        {TYPE_SCALE_NOTES.rule}
      </p>
      <div className="space-y-2">
        {steps.map((step, i) => (
          <div key={step.label} className="flex items-center gap-3">
            <div
              className="rounded-sm"
              style={{
                width: 24 + i * 12,
                height: 20,
                backgroundColor: CANOPY,
                opacity: 0.35 + i * 0.08,
              }}
            />
            <span className="font-mono text-xs text-foreground">{step.label}</span>
            <span className="text-xs text-muted-foreground font-stream">{step.token}</span>
          </div>
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs font-stream">
          Headings: {TYPE_SCALE_NOTES.lineHeightHeading}
        </p>
        <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs font-stream">
          Body: {TYPE_SCALE_NOTES.lineHeightBody}
        </p>
      </div>
    </div>
  )
}

export function FontWeightsTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70">
      {ROOTSY_FONT_WEIGHTS.map((w) => (
        <div
          key={w.token}
          className="flex items-center justify-between border-b border-border/40 px-4 py-3 last:border-b-0"
        >
          <span
            className="font-canopy text-base"
            style={{ fontWeight: w.value }}
          >
            Canopy {w.value}
          </span>
          <div className="text-right">
            <p className="font-mono text-xs text-primary">{w.token}</p>
            <p className="text-xs text-muted-foreground font-stream">{w.usage}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export function ApplyingGuidelineCards() {
  return (
    <LibraryGuidelineCards
      items={TYPOGRAPHY_APPLYING_GUIDELINES}
      split={false}
      titleClassName="font-canopy"
      textClassName="font-stream"
    />
  )
}

export function AccessibilityNotesList() {
  return (
    <ul className="space-y-2 rounded-xl border border-border/70 bg-card p-4">
      {TYPOGRAPHY_ACCESSIBILITY_NOTES.map((note) => (
        <li key={note} className="flex gap-2 text-sm text-muted-foreground font-stream">
          <span style={{ color: CANOPY }}>·</span>
          {note}
        </li>
      ))}
    </ul>
  )
}

export function HierarchyDemo() {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-6">
      <p className="font-canopy text-2xl font-bold text-foreground">Título de página</p>
      <p className="mt-1 font-canopy text-sm font-medium text-muted-foreground">
        Subtítulo · heading.xsmall / medium
      </p>
      <p className="mt-4 font-canopy text-sm leading-relaxed text-foreground">
        Body default — descripción del módulo con font.body y line-height optimizado para
        componentes.
      </p>
      <p className="mt-2 font-ledger text-xl font-bold tabular-nums" style={{ color: CANOPY_DARK }}>
        $ 42.300,00
      </p>
    </div>
  )
}

export function AllTypographyStyles() {
  return (
    <div className="space-y-6">
      <TypographyStylesTable title="Heading" styles={ROOTSY_HEADING_STYLES} />
      <TypographyStylesTable title="Body" styles={ROOTSY_BODY_STYLES} />
      <TypographyStylesTable title="Metric" styles={ROOTSY_METRIC_STYLES} />
      <TypographyStylesTable title="Code" styles={[ROOTSY_CODE_STYLE]} />
    </div>
  )
}
