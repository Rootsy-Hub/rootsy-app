"use client"

import { LibraryDocMetaLabel } from "@/app/library/libraryDocPrimitives"
import { CONCEPT_TOKENS } from "@/app/library/concept/rootsyConceptSystem"
import {
  ROOTSY_BODY_STYLES,
  ROOTSY_FONT_WEIGHTS,
  ROOTSY_HEADING_STYLES,
  ROOTSY_METRIC_STYLES,
  ROOTSY_TYPEFACE_SPECS,
  TYPE_SCALE_NOTES,
  TYPE_SCALE_STEPS,
  TYPOGRAPHY_TECHNICAL_A11Y,
  TYPOGRAPHY_TECHNICAL_GUIDELINES,
  type RootsyTypefaceSpec,
  type TypographyStyle,
} from "@/app/library/typography/rootsyTypographySystem"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

const FONT_CLASS = {
  ui: "font-canopy",
  reading: "font-stream",
  numeric: "font-ledger",
  code: "font-code",
} as const

function TechnicalCard({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("library-spec-card overflow-hidden rounded-2xl border", className)}>
      {children}
    </div>
  )
}

function TechnicalSubheading({ children }: { children: ReactNode }) {
  return <LibraryDocMetaLabel className="mb-3">{children}</LibraryDocMetaLabel>
}

function specFontClass(id: RootsyTypefaceSpec["id"]) {
  if (id === "numeric") return FONT_CLASS.numeric
  if (id === "reading") return FONT_CLASS.reading
  return FONT_CLASS.ui
}

function styleFontClass(family: TypographyStyle["fontFamily"]) {
  return FONT_CLASS[family]
}

function TechnicalStyleRow({ style }: { style: TypographyStyle }) {
  return (
    <div
      className="grid grid-cols-1 gap-2 border-b px-4 py-3 last:border-b-0 sm:grid-cols-[1fr_auto_auto]"
      style={{ borderColor: CONCEPT_TOKENS.bruma200 }}
    >
      <div className="min-w-0">
        <span
          className={cn(
            styleFontClass(style.fontFamily),
            style.fontFamily === "numeric" && "tabular-nums",
          )}
          style={{
            fontWeight: style.fontWeight,
            fontSize: style.fontSizeRem,
            lineHeight: style.lineHeightRem,
            color: CONCEPT_TOKENS.bruma900,
          }}
        >
          {style.preview}
        </span>
        <p className="mt-1 font-mono text-[10px]" style={{ color: CONCEPT_TOKENS.bruma500 }}>
          {style.token}
        </p>
      </div>
      <p className="font-mono text-[11px] sm:text-right" style={{ color: CONCEPT_TOKENS.bruma500 }}>
        {style.fontWeightLabel}
        <br />
        {style.fontSizePx}px / {style.lineHeightPx}px
      </p>
      <p className="text-[11px] sm:max-w-[200px] sm:text-right" style={{ color: CONCEPT_TOKENS.bruma500 }}>
        {style.usage}
      </p>
    </div>
  )
}

function TechnicalStylesTable({
  title,
  styles,
}: {
  title: string
  styles: TypographyStyle[]
}) {
  return (
    <TechnicalCard>
      <div
        className="border-b px-4 py-2.5 text-sm font-semibold"
        style={{
          borderColor: CONCEPT_TOKENS.bruma200,
          backgroundColor: CONCEPT_TOKENS.bruma50,
          color: CONCEPT_TOKENS.bruma900,
        }}
      >
        {title}
      </div>
      {styles.map((style) => (
        <TechnicalStyleRow key={style.id} style={style} />
      ))}
    </TechnicalCard>
  )
}

function TypefaceSpecCard({ face }: { face: RootsyTypefaceSpec }) {
  return (
    <TechnicalCard className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold" style={{ color: CONCEPT_TOKENS.bruma900 }}>
            {face.label}
          </p>
          <p className="text-xs" style={{ color: CONCEPT_TOKENS.bruma500 }}>
            {face.family}
          </p>
        </div>
        <p className="font-mono text-[10px]" style={{ color: CONCEPT_TOKENS.bruma500 }}>
          {face.tokenRole}
        </p>
      </div>
      <p className="font-mono text-[10px]" style={{ color: CONCEPT_TOKENS.savia800 }}>
        {face.cssVar}
      </p>
      <p
        className={cn(
          "mt-3",
          specFontClass(face.id),
          face.id === "numeric" && "text-xl font-bold tabular-nums",
          face.id === "reading" && "text-base leading-relaxed",
          face.id === "code" && "text-sm",
        )}
        style={{ color: CONCEPT_TOKENS.bruma900 }}
      >
        {face.sample}
      </p>
      <p className="mt-2 text-xs leading-relaxed" style={{ color: CONCEPT_TOKENS.bruma600 }}>
        {face.role}
      </p>
      <div className="mt-3 flex flex-wrap gap-1">
        {face.weights.map((weight) => (
          <span
            key={weight}
            className="rounded-md px-2 py-0.5 font-mono text-[10px]"
            style={{
              backgroundColor: CONCEPT_TOKENS.bruma50,
              color: CONCEPT_TOKENS.bruma500,
            }}
          >
            {weight}
          </span>
        ))}
      </div>
      <ul className="mt-3 space-y-0.5">
        {face.features.map((feature) => (
          <li key={feature} className="text-[11px]" style={{ color: CONCEPT_TOKENS.bruma500 }}>
            · {feature}
          </li>
        ))}
      </ul>
    </TechnicalCard>
  )
}

export function TypographyTechnicalDetails() {
  return (
    <div className="space-y-8 border-t pt-10" style={{ borderColor: CONCEPT_TOKENS.bruma200 }}>
      <div className="space-y-4">
        <TechnicalSubheading>Familias y variables CSS</TechnicalSubheading>
        <div className="grid gap-4 lg:grid-cols-3">
          {ROOTSY_TYPEFACE_SPECS.map((face) => (
            <TypefaceSpecCard key={face.id} face={face} />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <TechnicalSubheading>Escala minor third</TechnicalSubheading>
        <TechnicalCard className="space-y-4 p-5">
          <p className="text-sm leading-relaxed" style={{ color: CONCEPT_TOKENS.bruma600 }}>
            Base {TYPE_SCALE_NOTES.basePx}px · ratio {TYPE_SCALE_NOTES.ratio}. {TYPE_SCALE_NOTES.rule}{" "}
            {TYPE_SCALE_NOTES.units}
          </p>
          <div className="space-y-2">
            {TYPE_SCALE_STEPS.map((step, index) => (
              <div key={step.label} className="flex items-center gap-3">
                <div
                  className="rounded-sm"
                  style={{
                    width: 20 + index * 10,
                    height: 16,
                    backgroundColor: CONCEPT_TOKENS.bruma500,
                    opacity: 0.25 + index * 0.08,
                  }}
                />
                <span className="w-10 font-mono text-xs" style={{ color: CONCEPT_TOKENS.bruma900 }}>
                  {step.label}
                </span>
                <span className="text-xs" style={{ color: CONCEPT_TOKENS.bruma500 }}>
                  {step.token}
                </span>
              </div>
            ))}
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <p
              className="rounded-lg px-3 py-2 text-xs"
              style={{ backgroundColor: CONCEPT_TOKENS.bruma50, color: CONCEPT_TOKENS.bruma600 }}
            >
              Headings: {TYPE_SCALE_NOTES.lineHeightHeading}
            </p>
            <p
              className="rounded-lg px-3 py-2 text-xs"
              style={{ backgroundColor: CONCEPT_TOKENS.bruma50, color: CONCEPT_TOKENS.bruma600 }}
            >
              Body: {TYPE_SCALE_NOTES.lineHeightBody}
            </p>
          </div>
        </TechnicalCard>
      </div>

      <div className="space-y-4">
        <TechnicalSubheading>Tokens de estilo</TechnicalSubheading>
        <div className="space-y-4">
          <TechnicalStylesTable title="Heading" styles={ROOTSY_HEADING_STYLES} />
          <TechnicalStylesTable title="Body" styles={ROOTSY_BODY_STYLES} />
          <TechnicalStylesTable title="Metric" styles={ROOTSY_METRIC_STYLES} />
        </div>
      </div>

      <div className="space-y-4">
        <TechnicalSubheading>Pesos</TechnicalSubheading>
        <TechnicalCard>
          {ROOTSY_FONT_WEIGHTS.map((weight) => (
            <div
              key={weight.token}
              className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 last:border-b-0"
              style={{ borderColor: CONCEPT_TOKENS.bruma200 }}
            >
              <span
                className="font-canopy text-base"
                style={{ fontWeight: weight.value, color: CONCEPT_TOKENS.bruma900 }}
              >
                {weight.label} ({weight.value})
              </span>
              <div className="text-right">
                <p className="font-mono text-[10px]" style={{ color: CONCEPT_TOKENS.bruma500 }}>
                  {weight.token}
                </p>
                <p className="text-[11px]" style={{ color: CONCEPT_TOKENS.bruma500 }}>
                  {weight.usage}
                </p>
              </div>
            </div>
          ))}
        </TechnicalCard>
      </div>

      <div className="space-y-4">
        <TechnicalSubheading>Guías de implementación</TechnicalSubheading>
        <div className="grid gap-3 sm:grid-cols-2">
          {TYPOGRAPHY_TECHNICAL_GUIDELINES.map((item) => (
            <TechnicalCard key={item.id} className="p-4">
              <p className="text-sm font-semibold" style={{ color: CONCEPT_TOKENS.bruma900 }}>
                {item.title}
              </p>
              <p className="mt-2 text-xs leading-relaxed" style={{ color: CONCEPT_TOKENS.savia800 }}>
                ✓ {item.doText}
              </p>
              <p className="mt-1 text-xs leading-relaxed" style={{ color: CONCEPT_TOKENS.bruma500 }}>
                ✗ {item.dontText}
              </p>
            </TechnicalCard>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <TechnicalSubheading>Accesibilidad</TechnicalSubheading>
        <TechnicalCard className="p-5">
          <ul className="space-y-2">
            {TYPOGRAPHY_TECHNICAL_A11Y.map((note) => (
              <li
                key={note}
                className="flex gap-2 text-sm leading-relaxed"
                style={{ color: CONCEPT_TOKENS.bruma600 }}
              >
                <span style={{ color: CONCEPT_TOKENS.savia600 }}>·</span>
                {note}
              </li>
            ))}
          </ul>
        </TechnicalCard>
      </div>

    </div>
  )
}
