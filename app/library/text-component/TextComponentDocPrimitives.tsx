"use client"

import {
  FoundationBrumaStage,
  FoundationExampleLabel,
  FoundationSpecCard,
  CONCEPT_TOKENS,
} from "@/app/library/libraryFoundationDocShared"
import {
  LibraryDocLead,
  LibraryDocSection,
  LibraryDoDontPair,
  LibraryPrinciplesGrid,
  LibraryRelatedLinks,
} from "@/app/library/libraryDocPrimitives"
import {
  TEXT_COMPONENT_LABEL_ROLES,
  TEXT_COMPONENT_META_ROLES,
  ROOTSY_TEXT_COMPONENT_MANIFESTO,
  ROOTSY_TEXT_COMPONENT_PRINCIPLES,
} from "@/app/library/text-component/rootsyTextComponentSystem"
import { TEXT_COMPONENT_RELATED_LINKS } from "@/app/library/text-component/textComponentLibraryNav"
import {
  ROOTSY_BODY_STYLES,
  ROOTSY_CODE_STYLE,
  ROOTSY_HEADING_STYLES,
  ROOTSY_METRIC_STYLES,
  type TypographyStyle,
} from "@/app/library/typography/rootsyTypographySystem"
import { CheckoutSectionLabel } from "@/components/checkout/CheckoutFormFields"
import { cn } from "@/lib/utils"
import type { CSSProperties, ReactNode } from "react"

export {
  LibraryDocLead as TextComponentDocLead,
  LibraryDocSection as TextComponentDocSection,
}

const FONT_CLASS = {
  ui: "font-canopy",
  reading: "font-stream",
  numeric: "font-ledger",
  code: "font-code",
} as const

function fontClassFor(style: TypographyStyle) {
  if (style.fontFamily === "numeric") return FONT_CLASS.numeric
  if (style.fontFamily === "reading") return FONT_CLASS.reading
  if (style.fontFamily === "code") return FONT_CLASS.code
  return FONT_CLASS.ui
}

function styleToCss(style: TypographyStyle): CSSProperties {
  return {
    fontWeight: style.fontWeight,
    fontSize: style.fontSizeRem,
    lineHeight: style.lineHeightRem,
    color: CONCEPT_TOKENS.bruma900,
  }
}

function StyleTokenRow({ style }: { style: TypographyStyle }) {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 border-b py-3 last:border-b-0"
      style={{ borderColor: CONCEPT_TOKENS.bruma200 }}
    >
      <span
        className={cn(fontClassFor(style), style.fontFamily === "numeric" && "tabular-nums")}
        style={styleToCss(style)}
      >
        {style.preview === "Aa" ? "Ventas de hoy" : style.preview}
      </span>
      <div className="text-right">
        <p className="font-mono text-[10px]" style={{ color: CONCEPT_TOKENS.bruma500 }}>
          {style.token}
        </p>
        <p className="text-[11px]" style={{ color: CONCEPT_TOKENS.bruma500 }}>
          {style.fontSizePx}px · {style.fontWeightLabel}
        </p>
      </div>
    </div>
  )
}

export function TextComponentStyleTable({ styles }: { styles: TypographyStyle[] }) {
  return (
    <FoundationSpecCard>
      {styles.map((style) => (
        <StyleTokenRow key={style.id} style={style} />
      ))}
    </FoundationSpecCard>
  )
}

export function TextComponentManifestoHero() {
  return (
    <FoundationSpecCard className="space-y-4">
      <FoundationExampleLabel>Componente</FoundationExampleLabel>
      <p
        className="font-canopy text-xl font-bold tracking-tight"
        style={{ color: CONCEPT_TOKENS.bruma900 }}
      >
        Texto
      </p>
      <p className="font-canopy text-sm leading-relaxed" style={{ color: CONCEPT_TOKENS.bruma600 }}>
        {ROOTSY_TEXT_COMPONENT_MANIFESTO}
      </p>
    </FoundationSpecCard>
  )
}

export function TextComponentPrinciplesGrid() {
  return <LibraryPrinciplesGrid principles={ROOTSY_TEXT_COMPONENT_PRINCIPLES} />
}

export function TextComponentOverviewScale() {
  const samples = [
    { role: "Título de página", token: "font.heading.large", className: "text-2xl font-bold" },
    { role: "Sección", token: "font.heading.medium", className: "text-xl font-bold" },
    { role: "Cuerpo", token: "font.body", className: "text-sm" },
    { role: "Metadato", token: "font.body.small", className: "text-xs text-muted-foreground" },
    { role: "Métrica", token: "font.metric.large", className: "font-ledger text-[1.75rem] font-bold tabular-nums" },
  ] as const

  return (
    <FoundationBrumaStage caption="Seis roles — un token cada uno. La tipografía base vive en Fundamentos → Tipografía.">
      <FoundationSpecCard className="divide-y p-0 sm:p-0">
        {samples.map((sample) => (
          <div
            key={sample.token}
            className="flex flex-wrap items-baseline justify-between gap-3 px-5 py-4"
            style={{ borderColor: CONCEPT_TOKENS.bruma200 }}
          >
            <span
              className={cn("font-canopy min-w-0 flex-1", sample.className)}
              style={{ color: CONCEPT_TOKENS.bruma900 }}
            >
              {sample.role === "Métrica" ? "$ 124.580" : sample.role}
            </span>
            <span className="font-mono text-[10px]" style={{ color: CONCEPT_TOKENS.bruma500 }}>
              {sample.token}
            </span>
          </div>
        ))}
      </FoundationSpecCard>
    </FoundationBrumaStage>
  )
}

export function TextComponentHeadingsContextDemo() {
  return (
    <FoundationBrumaStage caption="heading.large en página · heading.medium en modal · heading.small en card compacta.">
      <div className="grid gap-4 lg:grid-cols-2">
        <FoundationSpecCard className="space-y-3">
          <p className="font-mono text-[10px]" style={{ color: CONCEPT_TOKENS.bruma500 }}>
            font.heading.large
          </p>
          <p
            className="font-canopy text-2xl font-bold tracking-tight"
            style={{ color: CONCEPT_TOKENS.bruma900 }}
          >
            Artículos
          </p>
          <p className="font-canopy text-sm" style={{ color: CONCEPT_TOKENS.bruma500 }}>
            Gestioná el catálogo del punto de venta.
          </p>
        </FoundationSpecCard>

        <FoundationSpecCard className="space-y-4">
          <p className="font-mono text-[10px]" style={{ color: CONCEPT_TOKENS.bruma500 }}>
            font.heading.medium
          </p>
          <p
            className="font-canopy text-xl font-bold"
            style={{ color: CONCEPT_TOKENS.bruma900 }}
          >
            Eliminar artículo
          </p>
          <p className="font-canopy text-sm" style={{ color: CONCEPT_TOKENS.bruma600 }}>
            Esta acción no se puede deshacer.
          </p>
        </FoundationSpecCard>

        <FoundationSpecCard className="space-y-2 lg:col-span-2">
          <p className="font-mono text-[10px]" style={{ color: CONCEPT_TOKENS.bruma500 }}>
            font.heading.small · font.heading.xsmall
          </p>
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="font-canopy text-base font-bold" style={{ color: CONCEPT_TOKENS.bruma900 }}>
                Medialuna clásica
              </p>
              <p className="text-xs" style={{ color: CONCEPT_TOKENS.bruma500 }}>
                Card de producto
              </p>
            </div>
            <div>
              <p className="font-canopy text-sm font-bold" style={{ color: CONCEPT_TOKENS.bruma900 }}>
                Subtotal
              </p>
              <p className="text-xs" style={{ color: CONCEPT_TOKENS.bruma500 }}>
                Fila de resumen
              </p>
            </div>
          </div>
        </FoundationSpecCard>
      </div>
    </FoundationBrumaStage>
  )
}

export function TextComponentBodyContextDemo() {
  const items = [
    { name: "Medialuna clásica", detail: "Masa madre, manteca y miel." },
    { name: "Café con leche", detail: "Doble shot, leche entera." },
  ] as const

  return (
    <FoundationBrumaStage caption="font.body en nombre y descripción · font-medium en la fila principal.">
      <FoundationSpecCard className="overflow-hidden p-0">
        <ul>
          {items.map((item, index) => (
            <li
              key={item.name}
              className="px-4 py-3"
              style={{
                borderBottom:
                  index < items.length - 1
                    ? `1px solid ${CONCEPT_TOKENS.bruma200}`
                    : undefined,
              }}
            >
              <p
                className="font-canopy text-sm font-medium"
                style={{ color: CONCEPT_TOKENS.bruma900 }}
              >
                {item.name}
              </p>
              <p className="mt-0.5 font-canopy text-sm" style={{ color: CONCEPT_TOKENS.bruma600 }}>
                {item.detail}
              </p>
            </li>
          ))}
        </ul>
      </FoundationSpecCard>
    </FoundationBrumaStage>
  )
}

export function TextComponentLabelsDemo() {
  return (
    <FoundationBrumaStage caption="Cuatro patrones de label — cada uno con tracking y peso propio.">
      <div className="grid gap-4 lg:grid-cols-2">
        {TEXT_COMPONENT_LABEL_ROLES.map((role) => (
          <FoundationSpecCard key={role.id} className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold" style={{ color: CONCEPT_TOKENS.bruma900 }}>
                {role.label}
              </p>
              <span className="font-mono text-[10px]" style={{ color: CONCEPT_TOKENS.bruma500 }}>
                {role.token}
              </span>
            </div>
            <LabelPreview roleId={role.id} preview={role.preview} />
            <p className="text-xs leading-relaxed" style={{ color: CONCEPT_TOKENS.bruma500 }}>
              {role.specs}
            </p>
            <p className="text-xs leading-relaxed" style={{ color: CONCEPT_TOKENS.bruma600 }}>
              {role.usage}
            </p>
          </FoundationSpecCard>
        ))}
      </div>
    </FoundationBrumaStage>
  )
}

function LabelPreview({ roleId, preview }: { roleId: string; preview: string }) {
  if (roleId === "section") {
    return <CheckoutSectionLabel>{preview}</CheckoutSectionLabel>
  }
  if (roleId === "field") {
    return (
      <span className="font-canopy text-sm font-medium" style={{ color: CONCEPT_TOKENS.bruma900 }}>
        {preview}
      </span>
    )
  }
  if (roleId === "eyebrow") {
    return (
      <p className="font-canopy text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
        {preview}
      </p>
    )
  }
  return (
    <p
      className="font-canopy text-xs font-semibold uppercase tracking-wide"
      style={{ color: CONCEPT_TOKENS.bruma500 }}
    >
      {preview}
    </p>
  )
}

export function TextComponentMetaDemo() {
  return (
    <FoundationBrumaStage caption="font.body.small + color muted — siempre secundario al contenido principal.">
      <FoundationSpecCard className="space-y-4">
        {TEXT_COMPONENT_META_ROLES.map((role) => (
          <div
            key={role.id}
            className="flex flex-wrap items-baseline justify-between gap-3 border-b pb-4 last:border-b-0 last:pb-0"
            style={{ borderColor: CONCEPT_TOKENS.bruma200 }}
          >
            <div>
              <p className="text-sm font-medium" style={{ color: CONCEPT_TOKENS.bruma900 }}>
                {role.label}
              </p>
              <p className="mt-1 font-canopy text-xs text-muted-foreground">{role.preview}</p>
            </div>
            <span className="font-mono text-[10px]" style={{ color: CONCEPT_TOKENS.bruma500 }}>
              {role.token}
            </span>
          </div>
        ))}
      </FoundationSpecCard>
    </FoundationBrumaStage>
  )
}

export function TextComponentMetricDemo() {
  const tiles = [
    { label: "Ventas hoy", value: "$ 48.320", token: "font.metric.large" },
    { label: "Ticket promedio", value: "$ 2.140", token: "font.metric.medium" },
    { label: "Unidades", value: "127", token: "font.metric.small" },
  ] as const

  const valueClass = {
    "font.metric.large": "font-ledger text-[1.75rem] font-bold tabular-nums leading-8",
    "font.metric.medium": "font-ledger text-2xl font-bold tabular-nums leading-7",
    "font.metric.small": "font-ledger text-base font-bold tabular-nums",
  } as const

  return (
    <FoundationBrumaStage caption="El número destaca en Inter — la etiqueta va debajo en body.small muted.">
      <div className="grid gap-4 sm:grid-cols-3">
        {tiles.map((tile) => (
          <FoundationSpecCard key={tile.token} className="space-y-1 text-center">
            <p
              className={valueClass[tile.token]}
              style={{ color: CONCEPT_TOKENS.bruma900 }}
            >
              {tile.value}
            </p>
            <p className="font-canopy text-xs text-muted-foreground">{tile.label}</p>
            <p className="font-mono text-[10px]" style={{ color: CONCEPT_TOKENS.bruma500 }}>
              {tile.token}
            </p>
          </FoundationSpecCard>
        ))}
      </div>
    </FoundationBrumaStage>
  )
}

export function TextComponentReadingDemo() {
  return (
    <FoundationBrumaStage caption="font.secondary (Source Sans 3) — solo cuando hay prosa, no en botones ni labels.">
      <FoundationSpecCard>
        <p
          className="font-stream text-base leading-relaxed"
          style={{ color: CONCEPT_TOKENS.bruma900 }}
        >
          Rootsy conecta inventario, ventas y tesorería en un solo lugar. La tipografía de lectura
          entra cuando hay párrafos largos — descripciones de artículos, ayuda extendida o copy
          explicativo en onboarding. En pantallas de trabajo, la UI lleva casi todo.
        </p>
        <p className="mt-3 font-canopy text-xs text-muted-foreground">
          font.body.large · Source Sans 3 · 16px / 1.5
        </p>
      </FoundationSpecCard>
    </FoundationBrumaStage>
  )
}

export function TextComponentCodeDemo() {
  return (
    <FoundationBrumaStage caption="font.code — documentación y snippets; no en UI general.">
      <FoundationSpecCard className="space-y-3">
        <pre
          className="overflow-x-auto rounded-lg border px-4 py-3 font-code text-xs leading-5"
          style={{
            borderColor: CONCEPT_TOKENS.bruma200,
            backgroundColor: CONCEPT_TOKENS.bruma50,
            color: CONCEPT_TOKENS.bruma900,
          }}
        >
          {`const titleStyle = rootsyTextVar("heading.large")
// → var(--rootsy-text-heading-large-size)`}
        </pre>
        <p className="font-mono text-[10px]" style={{ color: CONCEPT_TOKENS.bruma500 }}>
          {ROOTSY_CODE_STYLE.token} · {ROOTSY_CODE_STYLE.fontSizePx}px · JetBrains Mono
        </p>
      </FoundationSpecCard>
    </FoundationBrumaStage>
  )
}

export function TextComponentGuidelinesGrid({
  guidelines,
}: {
  guidelines: ReadonlyArray<{ doText: string; dontText: string }>
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {guidelines.map((item, index) => (
        <LibraryDoDontPair key={index} doText={item.doText} dontText={item.dontText} />
      ))}
    </div>
  )
}

export function TextComponentRelatedLinks({
  excludeId,
}: {
  excludeId?: string
}) {
  return (
    <LibraryRelatedLinks
      excludeId={excludeId}
      links={TEXT_COMPONENT_RELATED_LINKS}
    />
  )
}

export function TextComponentHeadingsTokens() {
  return <TextComponentStyleTable styles={ROOTSY_HEADING_STYLES} />
}

export function TextComponentBodyTokens() {
  return <TextComponentStyleTable styles={ROOTSY_BODY_STYLES} />
}

export function TextComponentMetricTokens() {
  return <TextComponentStyleTable styles={ROOTSY_METRIC_STYLES} />
}

export function TextComponentSectionLabelNote() {
  return (
    <FoundationSpecCard>
      <p className="text-sm leading-relaxed" style={{ color: CONCEPT_TOKENS.bruma600 }}>
        El patrón de sección usa{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-code text-xs">
          rootsFormFieldLabelClass
        </code>{" "}
        — 10px semibold uppercase. Ver Formulario → Labels para el control asociado.
      </p>
    </FoundationSpecCard>
  )
}
