"use client"

import {
  MOTION_APPLYING_GUIDELINES,
  MOTION_DURATION_RANGES,
  MOTION_KEYFRAMES,
  ROOTSY_MOTION_DURATIONS,
  ROOTSY_MOTION_EASINGS,
  ROOTSY_MOTION_PROPERTIES,
  ROOTSY_MOTION_SEMANTIC,
} from "@/app/[siteId]/[popId]/library/motion/rootsyMotionSystem"
import { librarySectionHref } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"
import Link from "next/link"
import { useState } from "react"
import type { ReactNode } from "react"

const CANOPY = "#1E8F5A"
const CANOPY_LIGHT = "#A8EBC4"
const CANOPY_MIST = "#F0FBF4"
const CANOPY_DARK = "#16704A"

export function MotionDocLead({ children }: { children: ReactNode }) {
  return (
    <p className="max-w-3xl text-base leading-relaxed text-muted-foreground">{children}</p>
  )
}

export function MotionDocSection({
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

export function MotionManifestoHero() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 shadow-sm">
      <div
        className="relative px-6 py-10 sm:px-8"
        style={{
          background: `linear-gradient(160deg, ${CANOPY_DARK} 0%, #0F5739 40%, ${CANOPY} 70%, ${CANOPY_LIGHT} 100%)`,
        }}
      >
        <div className="relative max-w-2xl space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">
            Rootsy · Motion System
          </p>
          <p className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Viento con intención
          </p>
          <p className="text-sm leading-relaxed text-white/85">
            Brisa en hover · ráfaga en modal · despegue en salida — nunca ruido.
          </p>
        </div>
      </div>
    </div>
  )
}

export function MotionPrinciplesGrid({
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

export function DurationTable() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border/70">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-muted/30 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            <th className="px-4 py-2">Token</th>
            <th className="px-4 py-2">Nature</th>
            <th className="px-4 py-2 text-right">ms</th>
            <th className="px-4 py-2">Uso</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {ROOTSY_MOTION_DURATIONS.map((d) => (
            <tr key={d.id} className="hover:bg-muted/20">
              <td className="px-4 py-2.5 font-mono text-xs text-primary">{d.token}</td>
              <td className="px-4 py-2.5 text-xs text-muted-foreground">{d.natureName}</td>
              <td className="px-4 py-2.5 text-right font-mono font-medium">{d.ms}</td>
              <td className="px-4 py-2.5 text-xs text-muted-foreground">{d.usage}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function DurationRangeOverview() {
  const tiers = ["interaction", "transition", "expressive"] as const
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      {tiers.map((tier) => {
        const meta = MOTION_DURATION_RANGES[tier]
        const items = ROOTSY_MOTION_DURATIONS.filter((d) => d.tier === tier)
        return (
          <div key={tier} className="rounded-xl border border-border/70 bg-card p-4">
            <p className="text-sm font-semibold text-foreground">{meta.label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{meta.description}</p>
            <div className="mt-3 flex flex-wrap gap-1">
              {items.map((d) => (
                <span
                  key={d.id}
                  className="rounded-md px-2 py-0.5 font-mono text-[10px]"
                  style={{ backgroundColor: CANOPY_MIST, color: CANOPY_DARK }}
                >
                  {d.ms}ms
                </span>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function EasingDemo({ easing }: { easing: (typeof ROOTSY_MOTION_EASINGS)[number] }) {
  const [atEnd, setAtEnd] = useState(false)
  const [key, setKey] = useState(0)

  const play = () => {
    setAtEnd(false)
    setKey((k) => k + 1)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setAtEnd(true))
    })
  }

  return (
    <div className="rounded-xl border border-border/70 bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-mono text-xs text-primary">{easing.token}</p>
          <p className="text-sm font-semibold text-foreground">{easing.natureName}</p>
          <p className="mt-1 font-mono text-[10px] text-muted-foreground">{easing.cubicBezier}</p>
        </div>
        <button
          type="button"
          onClick={play}
          className="shrink-0 rounded-lg px-3 py-1 text-xs font-medium text-white"
          style={{ backgroundColor: CANOPY }}
        >
          Play
        </button>
      </div>
      <div className="relative mt-4 h-10 overflow-hidden rounded-lg bg-muted/50">
        <div
          key={key}
          className="motion-demo-animated absolute top-1 h-8 w-8 rounded-md"
          style={{
            left: atEnd ? "calc(100% - 36px)" : "4px",
            backgroundColor: CANOPY,
            transition: `left 800ms ${easing.cubicBezier}`,
          }}
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{easing.bestFor}</p>
    </div>
  )
}

export function EasingGallery() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {ROOTSY_MOTION_EASINGS.map((e) => (
        <EasingDemo key={e.id} easing={e} />
      ))}
    </div>
  )
}

function PropertyDemo({ property }: { property: (typeof ROOTSY_MOTION_PROPERTIES)[number] }) {
  const [active, setActive] = useState(false)

  const demos: Record<string, ReactNode> = {
    scale: (
      <div
        className="motion-demo-animated mx-auto size-16 rounded-xl transition-transform duration-300"
        style={{
          backgroundColor: CANOPY,
          transform: active ? "scale(1)" : "scale(0.85)",
          transitionTimingFunction: "var(--motion-easing-inout-bold)",
        }}
      />
    ),
    fade: (
      <div
        className="motion-demo-animated mx-auto size-16 rounded-xl transition-opacity duration-300"
        style={{
          backgroundColor: CANOPY,
          opacity: active ? 1 : 0.2,
          transitionTimingFunction: "var(--motion-easing-out-practical)",
        }}
      />
    ),
    slide: (
      <div
        className="motion-demo-animated h-16 w-16 rounded-xl transition-transform duration-300"
        style={{
          backgroundColor: CANOPY,
          transform: active ? "translateX(120px)" : "translateX(0)",
          transitionTimingFunction: "var(--motion-easing-out-bold)",
        }}
      />
    ),
    color: (
      <div
        className="motion-demo-animated mx-auto size-16 rounded-xl transition-colors duration-150"
        style={{
          backgroundColor: active ? CANOPY : CANOPY_MIST,
          transitionTimingFunction: "var(--motion-easing-out-practical)",
        }}
      />
    ),
  }

  return (
    <div className="rounded-xl border border-border/70 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">{property.title}</p>
          <p className="text-xs" style={{ color: CANOPY_DARK }}>
            {property.natureMetaphor}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setActive((a) => !a)}
          className="rounded-lg border px-2 py-1 text-xs"
          style={{ borderColor: CANOPY_LIGHT }}
        >
          Toggle
        </button>
      </div>
      <div className="mt-4 flex h-20 items-center overflow-hidden rounded-lg bg-muted/30 px-2">
        {demos[property.id]}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{property.description}</p>
      {property.gpuSafe ? (
        <p className="mt-1 font-mono text-[10px]" style={{ color: CANOPY_DARK }}>
          GPU-safe ✓
        </p>
      ) : null}
    </div>
  )
}

export function PropertiesGallery() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {ROOTSY_MOTION_PROPERTIES.map((p) => (
        <PropertyDemo key={p.id} property={p} />
      ))}
    </div>
  )
}

function TransitionDemo({
  label,
  durationMs,
  easing,
  enter,
}: {
  label: string
  durationMs: number
  easing: string
  enter: boolean
}) {
  const [visible, setVisible] = useState(false)
  const [key, setKey] = useState(0)

  const play = () => {
    setVisible(false)
    setKey((k) => k + 1)
    requestAnimationFrame(() => setVisible(true))
  }

  return (
    <div className="rounded-xl border border-border/70 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{label}</p>
        <button
          type="button"
          onClick={play}
          className="rounded-lg px-3 py-1 text-xs font-medium text-white"
          style={{ backgroundColor: CANOPY }}
        >
          Play · {durationMs}ms
        </button>
      </div>
      <div className="relative mt-3 flex h-24 items-end justify-center overflow-hidden rounded-lg bg-muted/40 p-4">
        <div
          key={key}
          className="motion-demo-animated w-full max-w-[200px] rounded-lg px-3 py-2 text-center text-xs text-white"
          style={{
            backgroundColor: CANOPY,
            opacity: visible ? 1 : 0,
            transform: visible
              ? enter
                ? "translateY(0) scale(1)"
                : "translateY(0)"
              : enter
                ? "translateY(12px) scale(0.95)"
                : "translateY(-8px)",
            transition: `opacity ${durationMs}ms ${easing}, transform ${durationMs}ms ${easing}`,
          }}
        >
          {enter ? "Entrada" : "Salida"}
        </div>
      </div>
    </div>
  )
}

export function InteractionVsTransitionDemo() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <TransitionDemo
        label="Interacción · hover 50ms"
        durationMs={50}
        easing="var(--motion-easing-out-practical)"
        enter
      />
      <TransitionDemo
        label="Transición · modal enter 250ms"
        durationMs={250}
        easing="var(--motion-easing-inout-bold)"
        enter
      />
    </div>
  )
}

export function SemanticTokensTable() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border/70">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-muted/30 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            <th className="px-4 py-2">Token</th>
            <th className="px-4 py-2">Componente</th>
            <th className="px-4 py-2">Duración</th>
            <th className="px-4 py-2">Easing</th>
            <th className="px-4 py-2">Props</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {ROOTSY_MOTION_SEMANTIC.map((row) => (
            <tr key={row.token} className="hover:bg-muted/20">
              <td className="px-4 py-2.5 font-mono text-[11px] text-primary">{row.token}</td>
              <td className="px-4 py-2.5 text-xs">{row.component}</td>
              <td className="px-4 py-2.5 font-mono text-[10px] text-muted-foreground">
                {row.durationToken.replace("motion.duration.", "")}
              </td>
              <td className="px-4 py-2.5 font-mono text-[10px] text-muted-foreground">
                {row.easingToken.replace("motion.easing.", "")}
              </td>
              <td className="px-4 py-2.5 text-xs text-muted-foreground">
                {row.properties.join(" + ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function KeyframesTable() {
  return (
    <div className="space-y-2">
      {MOTION_KEYFRAMES.map((k) => (
        <div
          key={k.token}
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 px-4 py-2"
        >
          <span className="font-mono text-xs text-primary">{k.token}</span>
          <span className="font-mono text-[10px] text-muted-foreground">{k.value}</span>
          <span className="text-xs text-muted-foreground">{k.usage}</span>
        </div>
      ))}
    </div>
  )
}

export function ApplyingGuidelineCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {MOTION_APPLYING_GUIDELINES.map((g) => (
        <div key={g.id} className="rounded-xl border border-border/70 bg-card p-4">
          <p className="text-sm font-semibold text-foreground">{g.title}</p>
          <div className="mt-3 grid gap-2">
            <div
              className="rounded-lg p-3 text-xs"
              style={{ backgroundColor: CANOPY_MIST, color: CANOPY_DARK }}
            >
              <span className="font-semibold">✓ </span>
              {g.doText}
            </div>
            <div className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
              <span className="font-semibold">✗ </span>
              {g.dontText}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function ReducedMotionNote() {
  return (
    <div
      className="rounded-xl border p-4"
      style={{ borderColor: CANOPY_LIGHT, backgroundColor: CANOPY_MIST }}
    >
      <p className="text-sm font-semibold" style={{ color: CANOPY_DARK }}>
        prefers-reduced-motion: reduce
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Cuando está activo, las animaciones de Rootsy se reducen a instant o se desactivan.
        La interfaz debe seguir siendo 100% usable sin motion.
      </p>
    </div>
  )
}

export function MotionRelatedLinks({
  siteId,
  popId,
  excludeId,
  links,
}: {
  siteId: string
  popId: string
  excludeId?: string
  links: ReadonlyArray<{ sectionId: string; label: string; hint: string }>
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {links
        .filter((link) => link.sectionId !== excludeId)
        .map((link) => (
          <Link
            key={link.sectionId}
            href={librarySectionHref(siteId, popId, link.sectionId)}
            className="rounded-xl border border-border/70 bg-card p-4 shadow-sm transition-colors hover:border-[#A8EBC4] hover:bg-[#F0FBF4]"
          >
            <p className="text-sm font-semibold text-foreground">{link.label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{link.hint}</p>
          </Link>
        ))}
    </div>
  )
}
