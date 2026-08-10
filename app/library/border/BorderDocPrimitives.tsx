"use client"

import {
  BORDER_GUIDELINES,
  ROOTSY_BORDER_COLOR_TOKENS,
  ROOTSY_BORDER_CONCEPT,
  ROOTSY_BORDER_PAIRINGS,
  ROOTSY_BORDER_SEMANTIC,
  ROOTSY_BORDER_WIDTHS,
} from "@/app/library/border/rootsyBorderSystem"
import { CONCEPT_TOKENS } from "@/app/library/concept/rootsyConceptSystem"
import { LibraryDoDontPair } from "@/app/library/libraryDocPrimitives"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

export {
  LibraryDocLead as BorderDocLead,
  LibraryDocSection as BorderDocSection,
  LibraryPrinciplesGrid as BorderPrinciplesGrid,
  LibraryDoDontPair as BorderGuidelinePair,
  LibraryRelatedLinks as BorderRelatedLinks,
} from "@/app/library/libraryDocPrimitives"

function SpecCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("library-spec-card rounded-2xl border p-5 sm:p-6", className)}>
      {children}
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

function LightBorderDemo() {
  return (
    <div className="space-y-2">
      <ExampleLabel>Claro · ticket</ExampleLabel>
      <div
        className="rounded-xl border p-4"
        style={{
          backgroundColor: CONCEPT_TOKENS.bruma100,
          borderColor: CONCEPT_TOKENS.bruma200,
        }}
      >
        <div
          className="rounded-lg border px-3 py-2 font-canopy text-sm"
          style={{
            backgroundColor: CONCEPT_TOKENS.white,
            borderColor: CONCEPT_TOKENS.bruma200,
            color: CONCEPT_TOKENS.bruma900,
          }}
        >
          Hairline bruma 200
        </div>
      </div>
    </div>
  )
}

function DarkBorderDemo() {
  return (
    <div className="space-y-2">
      <ExampleLabel>Oscuro · catálogo</ExampleLabel>
      <div
        className="rounded-xl border p-4"
        style={{
          backgroundColor: CONCEPT_TOKENS.sombra600,
          borderColor: CONCEPT_TOKENS.sombra600,
        }}
      >
        <div
          className="rounded-lg border px-3 py-2 font-canopy text-sm"
          style={{
            backgroundColor: CONCEPT_TOKENS.sombra500,
            borderColor: CONCEPT_TOKENS.sombra600,
            color: CONCEPT_TOKENS.white,
          }}
        >
          Sombra-border
        </div>
      </div>
    </div>
  )
}

export function BorderSystemHero() {
  return (
    <SpecCard className="space-y-6">
      <div className="space-y-3">
        <p
          className="font-canopy text-[10px] font-bold uppercase tracking-[0.2em]"
          style={{ color: CONCEPT_TOKENS.bruma500 }}
        >
          Rootsy · Borde
        </p>
        <p
          className="font-canopy text-2xl font-bold tracking-tight sm:text-3xl"
          style={{ color: CONCEPT_TOKENS.bruma900 }}
        >
          {ROOTSY_BORDER_CONCEPT.title}
        </p>
        <p
          className="max-w-2xl font-canopy text-sm leading-relaxed"
          style={{ color: CONCEPT_TOKENS.bruma900 }}
        >
          {ROOTSY_BORDER_CONCEPT.lead}
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
          {ROOTSY_BORDER_CONCEPT.why.map((line) => (
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
        <LightBorderDemo />
        <DarkBorderDemo />
      </div>

      <p
        className="border-t pt-4 font-stream text-sm leading-relaxed"
        style={{
          borderColor: CONCEPT_TOKENS.bruma200,
          color: CONCEPT_TOKENS.bruma500,
        }}
      >
        {ROOTSY_BORDER_CONCEPT.closing}
      </p>
    </SpecCard>
  )
}

export function BorderPairingGallery() {
  const demos = [
    { className: "rootsy-border-demo-default", label: "Default · bruma" },
    { className: "rootsy-border-demo-dark", label: "POS · sombra" },
    { className: "rootsy-border-demo-selected", label: "Selected · savia 600" },
    { className: "rootsy-border-demo-focused", label: "Focus · savia 400" },
    { className: "rootsy-border-demo-hairline", label: "Hairline" },
    { className: "rootsy-border-demo-invalid", label: "Invalid" },
  ] as const

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {demos.map((demo) => (
        <div key={demo.className} className="space-y-2">
          <div className={cn(demo.className, "px-4 py-6 text-center font-canopy text-sm")}>
            Preview
          </div>
          <p className="text-center font-canopy text-[11px] text-muted-foreground">{demo.label}</p>
        </div>
      ))}
    </div>
  )
}

export function BorderSegmentDemo() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-2">
        <ExampleLabel>Segment · fondo activo</ExampleLabel>
        <div className="rootsy-border-segment-demo">
          <span className="rootsy-border-segment-demo__item rootsy-border-segment-demo__item--active">
            Mostrador
          </span>
          <span className="rootsy-border-segment-demo__item">Delivery</span>
        </div>
      </div>
      <div className="space-y-2">
        <ExampleLabel>Selected · borde 2px savia</ExampleLabel>
        <div className="rootsy-border-segment-demo">
          <span className="rootsy-border-segment-demo__item rootsy-border-segment-demo__item--selected-outline">
            Porcentaje
          </span>
          <span className="rootsy-border-segment-demo__item">Fijo</span>
        </div>
      </div>
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

export function BorderTechnicalDetails() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <TechnicalSubheading>Ancho</TechnicalSubheading>
        <div className="overflow-x-auto rounded-2xl border border-border/70">
          <table className="w-full min-w-[480px] text-left font-canopy text-sm">
            <tbody>
              {ROOTSY_BORDER_WIDTHS.map((row) => (
                <tr key={row.id} className="border-b border-border/40 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-primary">{row.token}</td>
                  <td className="px-4 py-3 text-foreground">{row.natureName}</td>
                  <td className="px-4 py-3 font-mono text-xs">{row.value}</td>
                  <td className="px-4 py-3 font-mono text-[10px] text-muted-foreground">
                    {row.pairWith}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3">
        <TechnicalSubheading>Color</TechnicalSubheading>
        <div className="overflow-x-auto rounded-2xl border border-border/70">
          <table className="w-full min-w-[520px] text-left font-canopy text-sm">
            <tbody>
              {ROOTSY_BORDER_COLOR_TOKENS.map((row) => (
                <tr key={row.token} className="border-b border-border/40 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-primary">{row.token}</td>
                  <td className="px-4 py-3 font-mono text-[10px] text-muted-foreground">
                    {row.tailwind}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{row.usage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3">
        <TechnicalSubheading>Pairings</TechnicalSubheading>
        <div className="overflow-x-auto rounded-2xl border border-border/70">
          <table className="w-full min-w-[520px] text-left font-canopy text-sm">
            <tbody>
              {ROOTSY_BORDER_PAIRINGS.map((row) => (
                <tr key={row.id} className="border-b border-border/40 last:border-0">
                  <td className="px-4 py-3 font-mono text-[10px] text-primary">{row.widthToken}</td>
                  <td className="px-4 py-3 font-mono text-[10px] text-primary">{row.colorToken}</td>
                  <td className="px-4 py-3 font-mono text-[10px] text-muted-foreground">
                    {row.cssExample}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3">
        <TechnicalSubheading>Semántica</TechnicalSubheading>
        <div className="overflow-x-auto rounded-2xl border border-border/70">
          <table className="w-full min-w-[520px] text-left font-canopy text-sm">
            <tbody>
              {ROOTSY_BORDER_SEMANTIC.map((row) => (
                <tr key={row.token} className="border-b border-border/40 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-primary">{row.token}</td>
                  <td className="px-4 py-3 text-foreground">{row.component}</td>
                  <td className="px-4 py-3 font-mono text-[10px] text-muted-foreground">
                    {row.source}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <LibraryDoDontPair doText={BORDER_GUIDELINES.do} dontText={BORDER_GUIDELINES.dont} />
    </div>
  )
}

/** @deprecated Usar BorderSystemHero */
export function BorderManifestoHero() {
  return <BorderSystemHero />
}

/** @deprecated */
export function BorderWidthTable() {
  return null
}

/** @deprecated */
export function BorderColorTokensTable() {
  return null
}

/** @deprecated */
export function BorderPairingsTable() {
  return null
}

/** @deprecated */
export function BorderSemanticTable() {
  return null
}

/** @deprecated */
export function BorderGuidelinesGrid() {
  return null
}
