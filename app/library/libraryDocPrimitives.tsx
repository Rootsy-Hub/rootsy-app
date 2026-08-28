"use client"

import { librarySectionHref } from "@/app/library/layoutLibraryShared"
import {
  libraryDocBodyClass,
  libraryDocMetaLabelClass,
  libraryDocPanelClass,
  libraryDocSectionDescriptionClass,
  libraryDocSectionTitleClass,
  libraryRelatedLinksSectionClass,
  libraryDoPanelClass,
  libraryDontPanelClass,
  librarySpecCardClass,
} from "@/app/library/libraryColorTheme"
import { cn } from "@/lib/utils"
import Link from "next/link"
import type { ReactNode } from "react"

/**
 * Primitivas de documentación compartidas por toda la librería.
 * Única fuente de la familia visual: héroe, secciones, principios,
 * guías hacer/evitar y enlaces relacionados. Los `*DocPrimitives`
 * de cada fundamento re-exportan desde acá para no duplicar estilos.
 */

/* ——— Constantes de marca para demos (espejo de --rootsy-savia-*) ——— */

export const CANOPY = "#059669"
export const CANOPY_DARK = "#047857"
export const CANOPY_DEEP = "#065F46"
export const CANOPY_NIGHT = "#022C22"
export const CANOPY_SOFT = "#34D399"
export const CANOPY_LIGHT = "#A7F3D0"
export const CANOPY_MIST = "#ECFDF5"
/** @deprecated Usar var(--rootsy-bruma-500) en documentación nueva. */
export const EARTH = "#64748B"

/**
 * Receta única del héroe de manifiesto — sombra a savia.
 * Todas las secciones comparten ángulo y paradas para leerse como familia.
 */
const HERO_GRADIENTS = {
  forest: `linear-gradient(160deg, ${CANOPY_NIGHT} 0%, ${CANOPY_DEEP} 35%, ${CANOPY} 70%, ${CANOPY_SOFT} 100%)`,
  spectrum: `linear-gradient(160deg, #050807 0%, ${CANOPY_DARK} 40%, ${CANOPY_SOFT} 72%, #E8B10F 100%)`,
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
    <p className={cn(libraryDocBodyClass, className)}>
      {children}
    </p>
  )
}

/** El handbook fija el criterio. La librería especifica tokens y uso. */
export function LibraryHandbookSource({
  href,
  label,
}: {
  href: string
  label: string
}) {
  return (
    <p className={cn(libraryDocBodyClass, "rounded-xl border px-4 py-3")}>
      El criterio vive en el{" "}
      <Link href={href} className="font-semibold text-[var(--rootsy-savia-700)] underline-offset-2 hover:underline">
        Handbook · {label}
      </Link>
      . Acá están las rampas, los tokens y los ejemplos vivos.
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
      className={cn(
        "library-doc-section scroll-mt-24 space-y-5 border-t border-[var(--rootsy-bruma-200)] pt-10 first:border-t-0 first:pt-0",
      )}
    >
      <div className="max-w-3xl space-y-2">
        <h3 className={cn(libraryDocSectionTitleClass, titleClassName)}>
          {title}
        </h3>
        {description ? (
          <p className={cn(libraryDocSectionDescriptionClass, descriptionClassName)}>
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

/** Subheading técnico — misma tinta bruma-500 que descripciones de sección. */
export function LibraryDocMetaLabel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <p className={cn(libraryDocMetaLabelClass, className)}>{children}</p>
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
    <div className={cn(libraryDocPanelClass, "overflow-hidden rounded-2xl")}>
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
        <div key={item.title} className={cn(librarySpecCardClass, "rounded-xl border p-4")}>
          <p className={cn(libraryDocSectionTitleClass, titleClassName)}>
            {item.title}
          </p>
          <p className={cn("mt-1", libraryDocBodyClass, detailClassName)}>
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
        <div key={g.id} className={cn(librarySpecCardClass, "rounded-xl border p-4")}>
          <p className={cn("text-sm font-semibold text-[var(--rootsy-bruma-900)]", titleClassName)}>
            {g.title}
          </p>
          <div className={cn("mt-3 grid gap-2", split && "sm:grid-cols-2")}>
            <div className={cn("rounded-lg p-3 text-xs", libraryDoPanelClass, textClassName)}>
              <span className="font-semibold">✓ </span>
              {g.doText}
            </div>
            <div
              className={cn("rounded-lg p-3 text-xs", libraryDontPanelClass, textClassName)}
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
      <div className={cn("rounded-xl border p-4", libraryDoPanelClass)}>
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--rootsy-savia-800)]">
          Hacer
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--rootsy-savia-900)]">{doText}</p>
      </div>
      <div className={cn("rounded-xl border p-4", libraryDontPanelClass)}>
        <p className="text-xs font-bold uppercase tracking-wide">Evitar</p>
        <p className="mt-2 text-sm leading-relaxed">{dontText}</p>
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
            className={cn(
              librarySpecCardClass,
              "rounded-xl border p-4 transition-colors hover:border-[color-mix(in_srgb,var(--rootsy-savia-600)_25%,var(--rootsy-bruma-200))] hover:bg-[color-mix(in_srgb,var(--rootsy-savia-600)_6%,white)]",
            )}
          >
            <p className={libraryDocSectionTitleClass}>{link.label}</p>
            <p className={cn("mt-1", libraryDocSectionDescriptionClass)}>{link.hint}</p>
          </Link>
        ))}
    </div>
  )
}

export function LibraryRelatedLinksSection({
  excludeId,
  links,
}: {
  excludeId?: string
  links: ReadonlyArray<{ sectionId: string; label: string; hint: string }>
}) {
  return (
    <div className={libraryRelatedLinksSectionClass}>
      <p className={libraryDocSectionTitleClass}>Relacionado</p>
      <LibraryRelatedLinks excludeId={excludeId} links={links} />
    </div>
  )
}
