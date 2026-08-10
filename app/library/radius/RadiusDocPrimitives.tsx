"use client"

import {
  RADIUS_GUIDELINES,
  ROOTSY_RADIUS_CONCEPT,
  ROOTSY_RADIUS_SEMANTIC,
  ROOTSY_RADIUS_THEME,
  ROOTSY_RADIUS_TOKENS,
} from "@/app/library/radius/rootsyRadiusSystem"
import { CONCEPT_TOKENS } from "@/app/library/concept/rootsyConceptSystem"
import { POP_IDENTITY_SPECIMEN } from "@/app/library/logos/rootsyLogoSystem"
import { LibraryDoDontPair } from "@/app/library/libraryDocPrimitives"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

export {
  LibraryDocLead as RadiusDocLead,
  LibraryDocSection as RadiusDocSection,
  LibraryPrinciplesGrid as RadiusPrinciplesGrid,
  LibraryDoDontPair as RadiusGuidelinePair,
  LibraryRelatedLinks as RadiusRelatedLinks,
} from "@/app/library/libraryDocPrimitives"

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
}: {
  caption?: string
  children: ReactNode
}) {
  return (
    <div
      className="overflow-hidden rounded-2xl border"
      style={{
        backgroundColor: CONCEPT_TOKENS.bruma100,
        borderColor: CONCEPT_TOKENS.bruma200,
      }}
    >
      <div className="p-5 sm:p-6">{children}</div>
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

export function RadiusSystemHero() {
  return (
    <SpecCard className="space-y-6">
      <div className="space-y-3">
        <p
          className="font-canopy text-[10px] font-bold uppercase tracking-[0.2em]"
          style={{ color: CONCEPT_TOKENS.bruma500 }}
        >
          Rootsy · Radio
        </p>
        <p
          className="font-canopy text-2xl font-bold tracking-tight sm:text-3xl"
          style={{ color: CONCEPT_TOKENS.bruma900 }}
        >
          {ROOTSY_RADIUS_CONCEPT.title}
        </p>
        <p
          className="max-w-2xl font-canopy text-sm leading-relaxed"
          style={{ color: CONCEPT_TOKENS.bruma900 }}
        >
          {ROOTSY_RADIUS_CONCEPT.lead}
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
          {ROOTSY_RADIUS_CONCEPT.why.map((line) => (
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

      <BrumaStage caption="La curva crece con el contenedor — controles compactos, cards amplias, modales copa.">
        <div className="flex flex-wrap items-end gap-3">
          {[
            { label: "large", className: "rootsy-radius-large", sub: "12px · inputs" },
            { label: "xlarge", className: "rootsy-radius-xlarge", sub: "16px · cards" },
            { label: "xxlarge", className: "rootsy-radius-xxlarge", sub: "22px · modales" },
          ].map((item) => (
            <div key={item.label} className="space-y-1.5 text-center">
              <div
                className={cn(
                  "flex h-12 w-16 items-center justify-center font-canopy text-[10px] font-semibold",
                  item.className,
                )}
                style={{
                  backgroundColor: CONCEPT_TOKENS.savia50,
                  color: CONCEPT_TOKENS.savia800,
                  border: `1px solid ${CONCEPT_TOKENS.savia600}33`,
                }}
              >
                {item.label}
              </div>
              <p className="font-canopy text-[10px] text-muted-foreground">{item.sub}</p>
            </div>
          ))}
        </div>
      </BrumaStage>

      <p
        className="border-t pt-4 font-stream text-sm leading-relaxed"
        style={{
          borderColor: CONCEPT_TOKENS.bruma200,
          color: CONCEPT_TOKENS.bruma500,
        }}
      >
        {ROOTSY_RADIUS_CONCEPT.closing}
      </p>
    </SpecCard>
  )
}

export function RadiusScaleGallery() {
  const cssMap: Record<string, string> = {
    xsmall: "rootsy-radius-xsmall",
    small: "rootsy-radius-small",
    medium: "rootsy-radius-medium",
    large: "rootsy-radius-large",
    xlarge: "rootsy-radius-xlarge",
    xxlarge: "rootsy-radius-xxlarge",
    full: "rootsy-radius-full",
    tile: "rootsy-radius-tile",
  }

  return (
    <div className="rootsy-radius-scale-row">
      {ROOTSY_RADIUS_TOKENS.map((token) => (
        <div key={token.id} className="space-y-2 text-center">
          <div className={cn("rootsy-radius-preview font-canopy", cssMap[token.id])}>
            {token.natureName}
          </div>
          <p className="font-mono text-[10px] text-primary">{token.value}</p>
        </div>
      ))}
    </div>
  )
}

export function RadiusFocusDemo() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="space-y-2">
        <p className="font-canopy text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          Input · large + focus
        </p>
        <div className="rootsy-radius-focus-demo">
          <div className="rootsy-radius-form-demo">
            <input type="text" defaultValue="Campo activo" aria-label="Demo foco" />
          </div>
          <span
            className="rootsy-radius-focus-demo__ring rootsy-radius-focus-demo__ring--large"
            aria-hidden
          />
        </div>
      </div>
      <div className="space-y-2">
        <p className="font-canopy text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          Card · xlarge + savia ring
        </p>
        <div className="rootsy-radius-focus-demo">
          <div
            className="border px-4 py-3 font-canopy text-sm"
            style={{
              borderRadius: "var(--radius-xlarge)",
              borderColor: CONCEPT_TOKENS.bruma200,
              backgroundColor: CONCEPT_TOKENS.white,
            }}
          >
            Elemento con foco
          </div>
          <span
            className="rootsy-radius-focus-demo__ring rootsy-radius-focus-demo__ring--xlarge"
            aria-hidden
          />
        </div>
      </div>
    </div>
  )
}

export function RadiusExamplesRow() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <SpecCard>
        <p className="font-canopy text-xs font-semibold text-foreground">Form · large</p>
        <div className="rootsy-radius-form-demo mt-3">
          <input type="text" placeholder="Nombre" aria-label="Demo input" />
        </div>
      </SpecCard>
      <SpecCard>
        <p className="font-canopy text-xs font-semibold text-foreground">Modal · xxlarge</p>
        <div className="rootsy-radius-modal-demo mt-3">
          <p className="font-canopy text-sm font-semibold">Dosel</p>
          <p className="mt-1 font-canopy text-xs text-muted-foreground">rounded-[1.375rem]</p>
        </div>
      </SpecCard>
      <SpecCard>
        <p className="font-canopy text-xs font-semibold text-foreground">Avatar · full</p>
        <div className="mt-3 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={POP_IDENTITY_SPECIMEN.imageUrl}
            alt=""
            className="rootsy-radius-avatar-demo object-cover"
          />
        </div>
      </SpecCard>
    </div>
  )
}

export function RadiusTechnicalDetails() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p
          className="font-canopy text-xs font-semibold uppercase tracking-wide"
          style={{ color: CONCEPT_TOKENS.bruma500 }}
        >
          Escala completa
        </p>
        <div className="overflow-x-auto rounded-2xl border border-border/70">
          <table className="w-full min-w-[640px] text-left font-canopy text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                <th className="px-4 py-3 font-semibold">Token</th>
                <th className="px-4 py-3 font-semibold">Valor</th>
                <th className="px-4 py-3 font-semibold">Focus</th>
                <th className="px-4 py-3 font-semibold">Uso</th>
              </tr>
            </thead>
            <tbody>
              {ROOTSY_RADIUS_TOKENS.map((row) => (
                <tr key={row.id} className="border-b border-border/40 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-primary">{row.token}</td>
                  <td className="px-4 py-3 font-mono text-[10px]">{row.value}</td>
                  <td className="px-4 py-3 font-mono text-[10px] text-muted-foreground">
                    {row.focusValue ?? "—"}
                  </td>
                  <td className="max-w-xs px-4 py-3 text-xs text-muted-foreground">{row.usage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <SpecCard>
        <p className="font-canopy text-sm font-semibold text-foreground">Theme CSS</p>
        <div className="mt-2 space-y-1 font-mono text-[11px] text-muted-foreground">
          <p>--radius: {ROOTSY_RADIUS_THEME.base}</p>
          <p>--radius-lg: {ROOTSY_RADIUS_THEME.lg}</p>
          <p>--radius-xl: {ROOTSY_RADIUS_THEME.xl}</p>
        </div>
      </SpecCard>

      <div className="space-y-3">
        <p
          className="font-canopy text-xs font-semibold uppercase tracking-wide"
          style={{ color: CONCEPT_TOKENS.bruma500 }}
        >
          Semántica
        </p>
        <div className="overflow-x-auto rounded-2xl border border-border/70">
          <table className="w-full min-w-[480px] text-left font-canopy text-sm">
            <tbody>
              {ROOTSY_RADIUS_SEMANTIC.map((row) => (
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

      <LibraryDoDontPair doText={RADIUS_GUIDELINES.do} dontText={RADIUS_GUIDELINES.dont} />
    </div>
  )
}

/** @deprecated Usar RadiusSystemHero */
export function RadiusManifestoHero() {
  return <RadiusSystemHero />
}

/** @deprecated */
export function RadiusTokensTable() {
  return null
}

/** @deprecated */
export function RadiusThemeNote() {
  return null
}

/** @deprecated */
export function RadiusSemanticTable() {
  return null
}

/** @deprecated */
export function RadiusGuidelinesGrid() {
  return null
}
