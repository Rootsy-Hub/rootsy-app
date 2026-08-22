"use client"

import type {
  NatureFamily,
  NatureGradient,
} from "@/app/library/color/rootsyNaturePalette"
import { LibraryDocLead } from "@/app/library/libraryDocPrimitives"
import type { ReactNode } from "react"

export function ColorDocLead({ children }: { children: ReactNode }) {
  return <LibraryDocLead className="font-canopy">{children}</LibraryDocLead>
}

export {
  LibraryDocSection as ColorDocSection,
  LibraryDoDontPair as GuidelinePair,
  LibraryRelatedLinks as ColorRelatedLinks,
} from "@/app/library/libraryDocPrimitives"

export function NatureGradientGallery({ items }: { items: NatureGradient[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((gradient) => (
        <div
          key={gradient.id}
          className="overflow-hidden rounded-xl border border-border/70 shadow-sm"
        >
          <div
            className="h-24"
            style={{
              background: gradient.via
                ? `linear-gradient(${gradient.angle ?? 135}deg, ${gradient.from}, ${gradient.via}, ${gradient.to})`
                : `linear-gradient(${gradient.angle ?? 135}deg, ${gradient.from}, ${gradient.to})`,
            }}
          />
          <div className="space-y-1 bg-card px-4 py-3">
            <p className="text-sm font-semibold text-foreground">
              {gradient.title}
            </p>
            <p className="text-xs text-muted-foreground">
              {gradient.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

export function NatureFamilyRamp({ family }: { family: NatureFamily }) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-semibold text-foreground">{family.title}</p>
        <p className="text-xs text-primary">{family.subtitle}</p>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          {family.description}
        </p>
      </div>
      <div className="overflow-hidden rounded-xl border border-border/70">
        <div className="flex h-16 sm:h-20">
          {family.steps.map((step) => (
            <div
              key={step.id}
              className="min-w-0 flex-1"
              style={{ backgroundColor: step.hex }}
              title={step.label}
            />
          ))}
        </div>
        <div
          className="grid gap-px bg-border/50"
          style={{
            gridTemplateColumns: `repeat(${family.steps.length}, minmax(0, 1fr))`,
          }}
        >
          {family.steps.map((step) => (
            <div key={step.id} className="bg-card px-1 py-2 text-center">
              <p className="text-[10px] font-medium text-foreground">
                {step.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
