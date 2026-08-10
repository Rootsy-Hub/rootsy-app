"use client"

import { librarySectionHref } from "@/app/library/layoutLibraryShared"
import { cn } from "@/lib/utils"
import Link from "next/link"
import type { ReactNode } from "react"

/**
 * Primitivas de documentación compartidas por toda la librería.
 * Única fuente de la familia visual: héroe, secciones, principios,
 * guías hacer/evitar y enlaces relacionados. Los `*DocPrimitives`
 * de cada fundamento re-exportan desde acá para no duplicar estilos.
 */

/* ——— Constantes de marca para demos (espejo de rootsyNaturePalette.css) ——— */

export const CANOPY = "#1E8F5A"
export const CANOPY_DARK = "#16704A"
export const CANOPY_DEEP = "#0F5739"
export const CANOPY_NIGHT = "#052E1F"
export const CANOPY_SOFT = "#3FC87E"
export const CANOPY_LIGHT = "#A8EBC4"
export const CANOPY_MIST = "#F0FBF4"
export const EARTH = "#78716C"

/**
 * Receta única del héroe de manifiesto — bosque de noche a brote.
 * Todas las secciones comparten ángulo y paradas para leerse como familia.
 */
const HERO_GRADIENTS = {
  forest: `linear-gradient(160deg, ${CANOPY_NIGHT} 0%, ${CANOPY_DEEP} 35%, ${CANOPY} 70%, ${CANOPY_SOFT} 100%)`,
  /** Solo para la sección de color — muestra el espectro completo de la paleta. */
  spectrum: `linear-gradient(160deg, ${CANOPY_NIGHT} 0%, ${CANOPY_DARK} 35%, ${CANOPY_SOFT} 60%, #F59E0B 82%, #8B5CF6 100%)`,
} as const

export type LibraryHeroTone = keyof typeof HERO_GRADIENTS

export function LibraryDocLead({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <p
      className={cn(
        "max-w-3xl text-base leading-relaxed text-muted-foreground",
        className,
      )}
    >
      {children}
    </p>
  )
}

export function LibraryDocSection({
  id,
  title,
  description,
  children,
  titleClassName,
  descriptionClassName,
}: {
  id: string
  title: string
  description?: string
  children: ReactNode
  titleClassName?: string
  descriptionClassName?: string
}) {
  return (
    <section
      id={id}
      className="library-doc-section scroll-mt-24 space-y-5 border-t border-border/60 pt-10 first:border-t-0 first:pt-0"
    >
      <div className="max-w-3xl space-y-2">
        <h3
          className={cn(
            "text-xl font-semibold tracking-tight text-foreground",
            titleClassName,
          )}
        >
          {title}
        </h3>
        {description ? (
          <p
            className={cn(
              "text-sm leading-relaxed text-muted-foreground",
              descriptionClassName,
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

export function LibraryManifestoHero({
  eyebrow,
  title,
  description,
  tone = "forest",
  aside,
  eyebrowClassName,
  titleClassName,
  descriptionClassName,
}: {
  eyebrow: string
  title: string
  description: string
  tone?: LibraryHeroTone
  aside?: ReactNode
  eyebrowClassName?: string
  titleClassName?: string
  descriptionClassName?: string
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 shadow-sm">
      <div
        className="relative px-6 py-10 sm:px-8"
        style={{ background: HERO_GRADIENTS[tone] }}
      >
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <p
              className={cn(
                "text-xs font-bold uppercase tracking-[0.2em] text-white/80",
                eyebrowClassName,
              )}
            >
              {eyebrow}
            </p>
            <p
              className={cn(
                "text-2xl font-semibold tracking-tight text-white sm:text-3xl",
                titleClassName,
              )}
            >
              {title}
            </p>
            <p
              className={cn(
                "text-sm leading-relaxed text-white/85",
                descriptionClassName,
              )}
            >
              {description}
            </p>
          </div>
          {aside ? <div className="shrink-0">{aside}</div> : null}
        </div>
      </div>
    </div>
  )
}

export function LibraryPrinciplesGrid({
  principles,
  titleClassName,
  detailClassName,
}: {
  principles: ReadonlyArray<{ title: string; detail: string }>
  titleClassName?: string
  detailClassName?: string
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {principles.map((item) => (
        <div
          key={item.title}
          className="rounded-xl border border-border/70 bg-card p-4 shadow-sm"
        >
          <p className={cn("text-sm font-semibold text-foreground", titleClassName)}>
            {item.title}
          </p>
          <p className={cn("mt-1 text-sm text-muted-foreground", detailClassName)}>
            {item.detail}
          </p>
        </div>
      ))}
    </div>
  )
}

/**
 * Tarjetas hacer/evitar con título — usadas por espaciado, grilla,
 * movimiento y tipografía. `split` pone el par lado a lado.
 */
export function LibraryGuidelineCards({
  items,
  split = true,
  titleClassName,
  textClassName,
}: {
  items: ReadonlyArray<{ id: string; title: string; doText: string; dontText: string }>
  split?: boolean
  titleClassName?: string
  textClassName?: string
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((g) => (
        <div key={g.id} className="rounded-xl border border-border/70 bg-card p-4">
          <p className={cn("text-sm font-semibold text-foreground", titleClassName)}>
            {g.title}
          </p>
          <div className={cn("mt-3 grid gap-2", split && "sm:grid-cols-2")}>
            <div
              className={cn("rounded-lg p-3 text-xs", textClassName)}
              style={{ backgroundColor: CANOPY_MIST, color: CANOPY_DARK }}
            >
              <span className="font-semibold">✓ </span>
              {g.doText}
            </div>
            <div
              className={cn(
                "rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground",
                textClassName,
              )}
            >
              <span className="font-semibold">✗ </span>
              {g.dontText}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/** Par hacer/evitar en bloque — sin título, énfasis alto (verde/rojo). */
export function LibraryDoDontPair({
  doText,
  dontText,
}: {
  doText: string
  dontText: string
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div
        className="rounded-xl border p-4"
        style={{ borderColor: CANOPY_LIGHT, backgroundColor: CANOPY_MIST }}
      >
        <p
          className="text-xs font-bold uppercase tracking-wide"
          style={{ color: CANOPY_DARK }}
        >
          Hacer
        </p>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: CANOPY_DEEP }}>
          {doText}
        </p>
      </div>
      <div
        className="rounded-xl border p-4"
        style={{ borderColor: "#FECACA", backgroundColor: "#FEF2F2" }}
      >
        <p
          className="text-xs font-bold uppercase tracking-wide"
          style={{ color: "#DC2626" }}
        >
          Evitar
        </p>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: "#B91C1C" }}>
          {dontText}
        </p>
      </div>
    </div>
  )
}

export function LibraryRelatedLinks({
  excludeId,
  links,
}: {
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
            href={librarySectionHref(link.sectionId)}
            className="rounded-xl border border-border/70 bg-card p-4 shadow-sm transition-colors hover:border-[#A8EBC4] hover:bg-[#F0FBF4]"
          >
            <p className="text-sm font-semibold text-foreground">{link.label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{link.hint}</p>
          </Link>
        ))}
    </div>
  )
}
