"use client"

import { LibraryDoDontPair } from "@/app/library/libraryDocPrimitives"
import {
  libraryDocBodyClass,
  libraryDocBorderClass,
  libraryDocMetaLabelClass,
  libraryDocMutedTextClass,
  libraryDocPageTitleClass,
  libraryDocSectionTitleClass,
  libraryDocSurfaceMutedClass,
  libraryDocTokenAccentClass,
} from "@/app/library/libraryColorTheme"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

export function HandbookComponentPage({
  title,
  lead,
  principles,
  children,
}: {
  title: string
  lead: string
  principles: ReadonlyArray<{ title: string; detail: string }>
  children: ReactNode
}) {
  return (
    <article className="max-w-5xl">
      <h1 className={libraryDocPageTitleClass}>{title}</h1>
      <p className={cn(libraryDocBodyClass, "mt-4")}>{lead}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {principles.map((item) => (
          <div
            key={item.title}
            className={cn("rounded-2xl border px-4 py-4", libraryDocBorderClass)}
          >
            <p className={cn(libraryDocSectionTitleClass, "text-sm")}>{item.title}</p>
            <p className={cn("mt-2 font-stream text-sm leading-relaxed", libraryDocMutedTextClass)}>
              {item.detail}
            </p>
          </div>
        ))}
      </div>
      {children}
    </article>
  )
}

export function HandbookComponentSection({
  id,
  title,
  description,
  token,
  doText,
  dontText,
  children,
}: {
  id: string
  title: string
  description: string
  token: string
  doText: string
  dontText: string
  children: ReactNode
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 border-t border-[var(--color-borde)] py-10"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className={libraryDocSectionTitleClass}>{title}</h2>
        {token !== "—" ? (
          <code className={cn("text-[0.75rem] font-medium", libraryDocTokenAccentClass)}>
            {token}
          </code>
        ) : null}
      </div>
      <p className={cn(libraryDocBodyClass, "mt-4")}>{description}</p>
      <div className="mt-6">{children}</div>
      <div className="mt-8">
        <LibraryDoDontPair doText={doText} dontText={dontText} />
      </div>
    </section>
  )
}

export function HandbookSpecimen({
  label,
  children,
  dark = false,
  className,
}: {
  label?: string
  children: ReactNode
  dark?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border",
        libraryDocBorderClass,
        className,
      )}
    >
      {label ? (
        <p
          className={cn(
            libraryDocMetaLabelClass,
            "border-b px-4 py-2.5",
            libraryDocBorderClass,
          )}
        >
          {label}
        </p>
      ) : null}
      <div
        className={cn(
          "px-4 py-5",
          dark ? "bg-[var(--rootsy-sombra-800)]" : libraryDocSurfaceMutedClass,
        )}
      >
        {children}
      </div>
    </div>
  )
}

export function HandbookAbsentNote({ children }: { children: ReactNode }) {
  return (
    <p
      className={cn(
        "rounded-2xl border px-4 py-4 font-stream text-sm leading-relaxed italic",
        libraryDocBorderClass,
        libraryDocMutedTextClass,
      )}
    >
      {children}
    </p>
  )
}

const KIND_CLASS: Record<string, string> = {
  libreria:
    "bg-[color-mix(in_srgb,var(--rootsy-savia-400)_16%,transparent)] text-[var(--rootsy-savia-800)]",
  paralelo:
    "bg-[color-mix(in_srgb,var(--rootsy-aviso)_14%,transparent)] text-[var(--color-texto)]",
  shadcn: "bg-[var(--color-elevada)] text-[var(--color-texto-muted)]",
  pieza: "bg-[var(--color-elevada)] text-[var(--color-texto-muted)]",
}

export function HandbookCatalogKindBadge({
  label,
  kind,
}: {
  label: string
  kind: string
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[0.6875rem] font-medium tracking-wide",
        KIND_CLASS[kind] ?? KIND_CLASS.pieza,
      )}
    >
      {label}
    </span>
  )
}

export function HandbookCatalogCard({
  name,
  source,
  kindLabel,
  kind,
  variants,
  usedIn,
  note,
  children,
}: {
  name: string
  source: string
  kindLabel: string
  kind: string
  variants?: readonly string[]
  usedIn: readonly string[]
  note?: string
  children: ReactNode
}) {
  return (
    <article
      className={cn("overflow-hidden rounded-2xl border", libraryDocBorderClass)}
    >
      <header className={cn("space-y-2 border-b px-4 py-3", libraryDocBorderClass)}>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className={cn(libraryDocSectionTitleClass, "text-base")}>{name}</h3>
          <HandbookCatalogKindBadge label={kindLabel} kind={kind} />
        </div>
        <code className={cn("block text-[0.6875rem]", libraryDocTokenAccentClass)}>
          {source}
        </code>
        {variants && variants.length > 0 ? (
          <p className={cn(libraryDocMetaLabelClass, "leading-relaxed")}>
            Variantes: {variants.join(" · ")}
          </p>
        ) : null}
        {note ? (
          <p className={cn("font-stream text-sm leading-relaxed", libraryDocMutedTextClass)}>
            {note}
          </p>
        ) : null}
      </header>
      <div className={cn("px-4 py-5", libraryDocSurfaceMutedClass)}>{children}</div>
      <footer className={cn("border-t px-4 py-3", libraryDocBorderClass)}>
        <p className={libraryDocMetaLabelClass}>Se usa en</p>
        {usedIn.length === 0 ? (
          <p className={cn("mt-1 font-stream text-sm", libraryDocMutedTextClass)}>
            Nadie lo monta todavía.
          </p>
        ) : (
          <ul className="mt-1.5 space-y-1">
            {usedIn.map((place) => (
              <li
                key={place}
                className={cn("font-stream text-sm leading-relaxed", libraryDocBodyClass)}
              >
                {place}
              </li>
            ))}
          </ul>
        )}
      </footer>
    </article>
  )
}
