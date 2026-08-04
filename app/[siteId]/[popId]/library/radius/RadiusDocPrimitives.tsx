"use client"

import {
  RADIUS_GUIDELINES,
  ROOTSY_RADIUS_SEMANTIC,
  ROOTSY_RADIUS_THEME,
  ROOTSY_RADIUS_TOKENS,
} from "@/app/[siteId]/[popId]/library/radius/rootsyRadiusSystem"
import { POP_IDENTITY_SPECIMEN } from "@/app/[siteId]/[popId]/library/logos/rootsyLogoSystem"
import { LibraryManifestoHero } from "@/app/[siteId]/[popId]/library/libraryDocPrimitives"

export {
  LibraryDocLead as RadiusDocLead,
  LibraryDocSection as RadiusDocSection,
  LibraryPrinciplesGrid as RadiusPrinciplesGrid,
  LibraryRelatedLinks as RadiusRelatedLinks,
} from "@/app/[siteId]/[popId]/library/libraryDocPrimitives"

export function RadiusManifestoHero() {
  return (
    <LibraryManifestoHero
      eyebrow="Rootsy · Radio"
      title="De semilla a copa"
      description="Escala orgánica · focus +2px · tile solo en logomark."
    />
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
          <div className={`rootsy-radius-preview ${cssMap[token.id]}`}>{token.natureName}</div>
          <p className="font-mono text-[10px] text-primary">{token.token}</p>
          <p className="text-[10px] text-muted-foreground">{token.value}</p>
        </div>
      ))}
    </div>
  )
}

export function RadiusTokensTable() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border/70">
      <table className="w-full min-w-[680px] text-left text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-muted/30">
            <th className="px-4 py-3 font-semibold text-foreground">Token</th>
            <th className="px-4 py-3 font-semibold text-foreground">Nature</th>
            <th className="px-4 py-3 font-semibold text-foreground">Valor</th>
            <th className="px-4 py-3 font-semibold text-foreground">Focus</th>
            <th className="px-4 py-3 font-semibold text-foreground">Uso</th>
          </tr>
        </thead>
        <tbody>
          {ROOTSY_RADIUS_TOKENS.map((row) => (
            <tr key={row.id} className="border-b border-border/40 last:border-0">
              <td className="px-4 py-3 font-mono text-xs text-primary">{row.token}</td>
              <td className="px-4 py-3 text-foreground">{row.natureName}</td>
              <td className="px-4 py-3 font-mono text-[10px]">{row.value}</td>
              <td className="px-4 py-3 font-mono text-[10px] text-muted-foreground">
                {row.focusToken ? `${row.focusToken} (${row.focusValue})` : "—"}
              </td>
              <td className="max-w-xs px-4 py-3 text-xs text-muted-foreground">{row.usage}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function RadiusFocusDemo() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          Input · radius.large + focus.large
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
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          Card · radius.xlarge + focus.xlarge
        </p>
        <div className="rootsy-radius-focus-demo">
          <div
            className="rounded-xl border border-border/70 bg-card px-4 py-3 text-sm"
            style={{ borderRadius: "var(--radius-xlarge)" }}
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
      <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
        <p className="text-xs font-semibold text-foreground">Form · radius.large</p>
        <div className="rootsy-radius-form-demo mt-3">
          <input type="text" placeholder="Nombre" aria-label="Demo input" />
        </div>
      </div>
      <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
        <p className="text-xs font-semibold text-foreground">Modal · radius.xxlarge</p>
        <div className="rootsy-radius-modal-demo mt-3">
          <p className="text-sm font-semibold">Dosel</p>
          <p className="mt-1 text-xs text-muted-foreground">rounded-[1.375rem]</p>
        </div>
      </div>
      <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
        <p className="text-xs font-semibold text-foreground">Avatar · radius.full</p>
        <div className="mt-3 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={POP_IDENTITY_SPECIMEN.imageUrl}
            alt=""
            className="rootsy-radius-avatar-demo object-cover"
          />
        </div>
      </div>
    </div>
  )
}

export function RadiusThemeNote() {
  return (
    <div className="rounded-xl border border-border/70 bg-muted/20 p-4 font-mono text-[11px] leading-relaxed text-muted-foreground">
      <p className="font-semibold text-foreground">Theme CSS · app/globals.css</p>
      <p className="mt-2">--radius: {ROOTSY_RADIUS_THEME.base}</p>
      <p>--radius-sm: {ROOTSY_RADIUS_THEME.sm}</p>
      <p>--radius-md: {ROOTSY_RADIUS_THEME.md}</p>
      <p>--radius-lg: {ROOTSY_RADIUS_THEME.lg}</p>
      <p>--radius-xl: {ROOTSY_RADIUS_THEME.xl}</p>
    </div>
  )
}

export function RadiusSemanticTable() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border/70">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-muted/30">
            <th className="px-4 py-3 font-semibold text-foreground">Token</th>
            <th className="px-4 py-3 font-semibold text-foreground">Componente</th>
            <th className="px-4 py-3 font-semibold text-foreground">Fuente</th>
          </tr>
        </thead>
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
  )
}

export function RadiusGuidelinesGrid() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Hacer</p>
        <ul className="mt-3 space-y-2">
          {RADIUS_GUIDELINES.do.map((item) => (
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
          {RADIUS_GUIDELINES.dont.map((item) => (
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

