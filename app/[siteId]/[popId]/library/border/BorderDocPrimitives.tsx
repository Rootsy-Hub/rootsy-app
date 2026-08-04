"use client"

import {
  BORDER_GUIDELINES,
  ROOTSY_BORDER_COLOR_TOKENS,
  ROOTSY_BORDER_PAIRINGS,
  ROOTSY_BORDER_SEMANTIC,
  ROOTSY_BORDER_WIDTHS,
} from "@/app/[siteId]/[popId]/library/border/rootsyBorderSystem"
import { librarySectionHref } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"
import Link from "next/link"
import type { ReactNode } from "react"

const CANOPY = "#1E8F5A"
const CANOPY_DARK = "#16704A"
const CANOPY_LIGHT = "#A8EBC4"

export function BorderDocLead({ children }: { children: ReactNode }) {
  return (
    <p className="max-w-3xl text-base leading-relaxed text-muted-foreground">{children}</p>
  )
}

export function BorderDocSection({
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

export function BorderManifestoHero() {
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
            Rootsy · Border System
          </p>
          <p className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Vena · selección · foco
          </p>
          <p className="text-sm leading-relaxed text-white/85">
            Ancho y color siempre juntos — del divider sutil al ring canopy.
          </p>
        </div>
      </div>
    </div>
  )
}

export function BorderPrinciplesGrid({
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

export function BorderWidthTable() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border/70">
      <table className="w-full min-w-[520px] text-left text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-muted/30">
            <th className="px-4 py-3 font-semibold text-foreground">Token</th>
            <th className="px-4 py-3 font-semibold text-foreground">Nature</th>
            <th className="px-4 py-3 font-semibold text-foreground">Valor</th>
            <th className="px-4 py-3 font-semibold text-foreground">Par color</th>
          </tr>
        </thead>
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
  )
}

export function BorderColorTokensTable() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border/70">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-muted/30">
            <th className="px-4 py-3 font-semibold text-foreground">Token</th>
            <th className="px-4 py-3 font-semibold text-foreground">Tailwind / CSS</th>
            <th className="px-4 py-3 font-semibold text-foreground">Uso</th>
          </tr>
        </thead>
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
  )
}

export function BorderPairingGallery() {
  const demos = [
    { className: "rootsy-border-demo-default", label: "Default · 1px" },
    { className: "rootsy-border-demo-selected", label: "Selected · 2px" },
    { className: "rootsy-border-demo-focused", label: "Focused · ring 2px" },
    { className: "rootsy-border-demo-invalid", label: "Invalid · danger" },
    { className: "rootsy-border-demo-hairline", label: "Hairline · sutil" },
  ] as const

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {demos.map((demo) => (
        <div key={demo.className} className="space-y-2">
          <div className={demo.className + " px-4 py-6 text-center text-sm text-foreground"}>
            Preview
          </div>
          <p className="text-center text-[11px] font-medium text-muted-foreground">{demo.label}</p>
        </div>
      ))}
    </div>
  )
}

export function BorderSegmentDemo() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          Segment · fondo blanco activo
        </p>
        <div className="rootsy-border-segment-demo">
          <span className="rootsy-border-segment-demo__item rootsy-border-segment-demo__item--active">
            Mostrador
          </span>
          <span className="rootsy-border-segment-demo__item">Delivery</span>
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          Selected · border 2px canopy
        </p>
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

export function BorderPairingsTable() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border/70">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-muted/30">
            <th className="px-4 py-3 font-semibold text-foreground">Width</th>
            <th className="px-4 py-3 font-semibold text-foreground">Color</th>
            <th className="px-4 py-3 font-semibold text-foreground">CSS</th>
          </tr>
        </thead>
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
  )
}

export function BorderSemanticTable() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border/70">
      <table className="w-full min-w-[620px] text-left text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-muted/30">
            <th className="px-4 py-3 font-semibold text-foreground">Token</th>
            <th className="px-4 py-3 font-semibold text-foreground">Componente</th>
            <th className="px-4 py-3 font-semibold text-foreground">Fuente</th>
          </tr>
        </thead>
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
  )
}

export function BorderGuidelinesGrid() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Do</p>
        <ul className="mt-3 space-y-2">
          {BORDER_GUIDELINES.do.map((item) => (
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
          {BORDER_GUIDELINES.dont.map((item) => (
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

export function BorderRelatedLinks({
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
