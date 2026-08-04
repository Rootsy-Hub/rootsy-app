"use client"

import {
  RADIUS_GUIDELINES,
  ROOTSY_RADIUS_SEMANTIC,
  ROOTSY_RADIUS_THEME,
  ROOTSY_RADIUS_TOKENS,
} from "@/app/[siteId]/[popId]/library/radius/rootsyRadiusSystem"
import { POP_IDENTITY_SPECIMEN } from "@/app/[siteId]/[popId]/library/logos/rootsyLogoSystem"
import { librarySectionHref } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"
import Link from "next/link"
import type { ReactNode } from "react"

const CANOPY = "#1E8F5A"
const CANOPY_DARK = "#16704A"
const CANOPY_LIGHT = "#A8EBC4"

export function RadiusDocLead({ children }: { children: ReactNode }) {
  return (
    <p className="max-w-3xl text-base leading-relaxed text-muted-foreground">{children}</p>
  )
}

export function RadiusDocSection({
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
    <section
      id={id}
      className="scroll-mt-24 space-y-5 border-t border-border/60 pt-10 first:border-t-0 first:pt-0"
    >
      <div className="max-w-3xl space-y-2">
        <h3 className="text-xl font-semibold tracking-tight text-foreground">{title}</h3>
        {description ? (
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

export function RadiusManifestoHero() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 shadow-sm">
      <div
        className="relative px-6 py-10 sm:px-8"
        style={{
          background: `linear-gradient(165deg, ${CANOPY_DARK} 0%, #0F5739 40%, ${CANOPY} 70%, ${CANOPY_LIGHT} 100%)`,
        }}
      >
        <div className="relative max-w-2xl space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">
            Rootsy · Radius System
          </p>
          <p className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            De semilla a copa
          </p>
          <p className="text-sm leading-relaxed text-white/85">
            Escala orgánica · focus +2px · tile solo en logomark.
          </p>
        </div>
      </div>
    </div>
  )
}

export function RadiusPrinciplesGrid({
  principles,
}: {
  principles: ReadonlyArray<{ title: string; detail: string }>
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {principles.map((item) => (
        <div
          key={item.title}
          className="rounded-xl border border-border/70 bg-card p-4 shadow-sm"
        >
          <p className="text-sm font-semibold text-foreground">{item.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
        </div>
      ))}
    </div>
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
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Do</p>
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
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-700">Don&apos;t</p>
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

export function RadiusRelatedLinks({
  siteId,
  popId,
  excludeId,
  links,
}: {
  siteId: string
  popId: string
  excludeId: string
  links: readonly { sectionId: string; label: string; hint: string }[]
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {links
        .filter((link) => link.sectionId !== excludeId)
        .map((link) => (
          <Link
            key={link.sectionId}
            href={librarySectionHref(siteId, popId, link.sectionId)}
            className="rounded-xl border border-border/70 bg-card px-4 py-3 transition-colors hover:border-primary/30 hover:bg-primary/5"
          >
            <p className="text-sm font-medium text-foreground">{link.label}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{link.hint}</p>
          </Link>
        ))}
    </div>
  )
}
