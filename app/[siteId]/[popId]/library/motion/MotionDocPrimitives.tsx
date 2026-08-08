"use client"

import {
  MOTION_APPLYING_GUIDELINES,
  MOTION_DURATION_RANGES,
  MOTION_KEYFRAMES,
  ROOTSY_MOTION_CONCEPT,
  ROOTSY_MOTION_DURATIONS,
  ROOTSY_MOTION_EASINGS,
  ROOTSY_MOTION_PROPERTIES,
  ROOTSY_MOTION_SEMANTIC,
} from "@/app/[siteId]/[popId]/library/motion/rootsyMotionSystem"
import {
  CONCEPT_TOKENS,
  FoundationBrumaStage,
  FoundationSpecCard,
} from "@/app/[siteId]/[popId]/library/libraryFoundationDocShared"
import { LibraryGuidelineCards } from "@/app/[siteId]/[popId]/library/libraryDocPrimitives"
import { useState } from "react"
import type { ReactNode } from "react"

export {
  LibraryDocLead as MotionDocLead,
  LibraryDocSection as MotionDocSection,
  LibraryPrinciplesGrid as MotionPrinciplesGrid,
  LibraryRelatedLinks as MotionRelatedLinks,
} from "@/app/[siteId]/[popId]/library/libraryDocPrimitives"

function MotionHeroEasingDemo({
  easing,
}: {
  easing: (typeof ROOTSY_MOTION_EASINGS)[number]
}) {
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
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="font-canopy text-sm font-semibold" style={{ color: CONCEPT_TOKENS.bruma900 }}>
            {easing.natureName}
          </p>
          <p className="font-mono text-[10px]" style={{ color: CONCEPT_TOKENS.bruma500 }}>
            {easing.cubicBezier}
          </p>
        </div>
        <button
          type="button"
          onClick={play}
          className="shrink-0 rounded-lg px-3 py-1 font-canopy text-xs font-medium text-white"
          style={{ backgroundColor: CONCEPT_TOKENS.savia600 }}
        >
          Play
        </button>
      </div>
      <div
        className="relative h-10 overflow-hidden rounded-lg"
        style={{ backgroundColor: CONCEPT_TOKENS.bruma50 }}
      >
        <div
          key={key}
          className="motion-demo-animated absolute top-1 h-8 w-8 rounded-md"
          style={{
            left: atEnd ? "calc(100% - 36px)" : "4px",
            backgroundColor: CONCEPT_TOKENS.savia600,
            transition: `left 800ms ${easing.cubicBezier}`,
          }}
        />
      </div>
    </div>
  )
}

export function MotionSystemHero() {
  const heroEasings = ROOTSY_MOTION_EASINGS.filter((e) =>
    ["out-practical", "out-bold"].includes(e.id),
  )

  return (
    <FoundationSpecCard className="space-y-6">
      <div className="space-y-3">
        <p
          className="font-canopy text-[10px] font-bold uppercase tracking-[0.2em]"
          style={{ color: CONCEPT_TOKENS.bruma500 }}
        >
          Rootsy · Movimiento
        </p>
        <p
          className="font-canopy text-2xl font-bold tracking-tight sm:text-3xl"
          style={{ color: CONCEPT_TOKENS.bruma900 }}
        >
          {ROOTSY_MOTION_CONCEPT.title}
        </p>
        <p
          className="max-w-2xl font-canopy text-sm leading-relaxed"
          style={{ color: CONCEPT_TOKENS.bruma900 }}
        >
          {ROOTSY_MOTION_CONCEPT.lead}
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
          {ROOTSY_MOTION_CONCEPT.why.map((line) => (
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

      <FoundationBrumaStage caption="Brisa suave en hover · aterrizaje en modal — cada curva con nombre de bosque.">
        <div className="grid gap-6 sm:grid-cols-2">
          {heroEasings.map((easing) => (
            <MotionHeroEasingDemo key={easing.id} easing={easing} />
          ))}
        </div>
      </FoundationBrumaStage>

      <p
        className="border-t pt-4 font-stream text-sm leading-relaxed"
        style={{
          borderColor: CONCEPT_TOKENS.bruma200,
          color: CONCEPT_TOKENS.bruma500,
        }}
      >
        {ROOTSY_MOTION_CONCEPT.closing}
      </p>
    </FoundationSpecCard>
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

export function DurationTable() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border/70">
      <table className="w-full min-w-[560px] text-left font-canopy text-sm">
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
            <p className="font-canopy text-sm font-semibold text-foreground">{meta.label}</p>
            <p className="mt-1 font-canopy text-xs text-muted-foreground">{meta.description}</p>
            <div className="mt-3 flex flex-wrap gap-1">
              {items.map((d) => (
                <span
                  key={d.id}
                  className="rounded-md px-2 py-0.5 font-mono text-[10px]"
                  style={{ backgroundColor: CONCEPT_TOKENS.savia50, color: CONCEPT_TOKENS.savia800 }}
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
          <p className="font-canopy text-sm font-semibold text-foreground">{easing.natureName}</p>
          <p className="mt-1 font-mono text-[10px] text-muted-foreground">{easing.cubicBezier}</p>
        </div>
        <button
          type="button"
          onClick={play}
          className="shrink-0 rounded-lg px-3 py-1 font-canopy text-xs font-medium text-white"
          style={{ backgroundColor: CONCEPT_TOKENS.savia600 }}
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
            backgroundColor: CONCEPT_TOKENS.savia600,
            transition: `left 800ms ${easing.cubicBezier}`,
          }}
        />
      </div>
      <p className="mt-2 font-canopy text-xs text-muted-foreground">{easing.bestFor}</p>
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
          backgroundColor: CONCEPT_TOKENS.savia600,
          transform: active ? "scale(1)" : "scale(0.85)",
          transitionTimingFunction: "var(--motion-easing-inout-bold)",
        }}
      />
    ),
    fade: (
      <div
        className="motion-demo-animated mx-auto size-16 rounded-xl transition-opacity duration-300"
        style={{
          backgroundColor: CONCEPT_TOKENS.savia600,
          opacity: active ? 1 : 0.2,
          transitionTimingFunction: "var(--motion-easing-out-practical)",
        }}
      />
    ),
    slide: (
      <div
        className="motion-demo-animated h-16 w-16 rounded-xl transition-transform duration-300"
        style={{
          backgroundColor: CONCEPT_TOKENS.savia600,
          transform: active ? "translateX(120px)" : "translateX(0)",
          transitionTimingFunction: "var(--motion-easing-out-bold)",
        }}
      />
    ),
    color: (
      <div
        className="motion-demo-animated mx-auto size-16 rounded-xl transition-colors duration-150"
        style={{
          backgroundColor: active ? CONCEPT_TOKENS.savia600 : CONCEPT_TOKENS.savia50,
          transitionTimingFunction: "var(--motion-easing-out-practical)",
        }}
      />
    ),
  }

  return (
    <div className="rounded-xl border border-border/70 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-canopy text-sm font-semibold">{property.title}</p>
          <p className="font-canopy text-xs" style={{ color: CONCEPT_TOKENS.savia800 }}>
            {property.natureMetaphor}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setActive((a) => !a)}
          className="rounded-lg border px-2 py-1 font-canopy text-xs"
          style={{ borderColor: CONCEPT_TOKENS.bruma200 }}
        >
          Toggle
        </button>
      </div>
      <div className="mt-4 flex h-20 items-center overflow-hidden rounded-lg bg-muted/30 px-2">
        {demos[property.id]}
      </div>
      <p className="mt-2 font-canopy text-xs text-muted-foreground">{property.description}</p>
      {property.gpuSafe ? (
        <p className="mt-1 font-mono text-[10px]" style={{ color: CONCEPT_TOKENS.savia800 }}>
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
        <p className="font-canopy text-sm font-medium">{label}</p>
        <button
          type="button"
          onClick={play}
          className="rounded-lg px-3 py-1 font-canopy text-xs font-medium text-white"
          style={{ backgroundColor: CONCEPT_TOKENS.savia600 }}
        >
          Play · {durationMs}ms
        </button>
      </div>
      <div className="relative mt-3 flex h-24 items-end justify-center overflow-hidden rounded-lg bg-muted/40 p-4">
        <div
          key={key}
          className="motion-demo-animated w-full max-w-[200px] rounded-lg px-3 py-2 text-center font-canopy text-xs text-white"
          style={{
            backgroundColor: CONCEPT_TOKENS.savia600,
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
      <table className="w-full min-w-[720px] text-left font-canopy text-sm">
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
          <span className="font-canopy text-xs text-muted-foreground">{k.usage}</span>
        </div>
      ))}
    </div>
  )
}

export function ApplyingGuidelineCards() {
  return <LibraryGuidelineCards items={MOTION_APPLYING_GUIDELINES} split={false} />
}

export function ReducedMotionNote() {
  return (
    <div
      className="rounded-xl border p-4"
      style={{ borderColor: CONCEPT_TOKENS.bruma200, backgroundColor: CONCEPT_TOKENS.savia50 }}
    >
      <p className="font-canopy text-sm font-semibold" style={{ color: CONCEPT_TOKENS.savia800 }}>
        prefers-reduced-motion: reduce
      </p>
      <p className="mt-1 font-canopy text-sm text-muted-foreground">
        Cuando está activo, las animaciones de Rootsy se reducen a instant o se desactivan.
        La interfaz debe seguir siendo 100% usable sin motion.
      </p>
    </div>
  )
}

export function MotionTechnicalDetails() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <TechnicalSubheading>Duración</TechnicalSubheading>
        <DurationTable />
      </div>

      <div className="space-y-3">
        <TechnicalSubheading>Easing</TechnicalSubheading>
        <div className="overflow-x-auto rounded-2xl border border-border/70">
          <table className="w-full min-w-[560px] text-left font-canopy text-sm">
            <tbody>
              {ROOTSY_MOTION_EASINGS.map((row) => (
                <tr key={row.id} className="border-b border-border/40 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-primary">{row.token}</td>
                  <td className="px-4 py-3 text-foreground">{row.natureName}</td>
                  <td className="px-4 py-3 font-mono text-[10px] text-muted-foreground">
                    {row.cubicBezier}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{row.bestFor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3">
        <TechnicalSubheading>Tokens semánticos</TechnicalSubheading>
        <SemanticTokensTable />
      </div>

      <div className="space-y-3">
        <TechnicalSubheading>Keyframes</TechnicalSubheading>
        <KeyframesTable />
      </div>

      <div className="space-y-3">
        <TechnicalSubheading>Guías de aplicación</TechnicalSubheading>
        <ApplyingGuidelineCards />
      </div>
    </div>
  )
}
