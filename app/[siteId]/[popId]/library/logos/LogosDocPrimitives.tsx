"use client"

import {
  LOGO_ANATOMY,
  LOGO_CLEARANCE,
  LOGO_GUIDELINES,
  POP_HOME_ACCENTS,
  POP_IDENTITY_SPECIMEN,
  POP_IDENTITY_VARIANTS,
  POP_TICKET_LOGO_SPECIMEN,
  ROOTSY_LOGO_LOCKUPS,
  ROOTSY_LOGOMARKS,
  type PopIdentityVariantId,
} from "@/app/[siteId]/[popId]/library/logos/rootsyLogoSystem"
import { librarySectionHref } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Link from "next/link"
import type { ReactNode } from "react"

type PreviewBg = "light" | "canopy" | "dark" | "neutral"

const PREVIEW_BG_CLASS: Record<PreviewBg, string> = {
  light: "logo-preview-surface--light",
  canopy: "logo-preview-surface--canopy",
  dark: "logo-preview-surface--dark",
  neutral: "logo-preview-surface--neutral",
}

export function LogosDocLead({ children }: { children: ReactNode }) {
  return (
    <p className="max-w-3xl text-base leading-relaxed text-muted-foreground">{children}</p>
  )
}

export function LogosDocSection({
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

export function LogosAnatomyGrid() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {LOGO_ANATOMY.map((item) => (
        <div
          key={item.term}
          className="rounded-xl border border-border/70 bg-card px-4 py-3 shadow-sm"
        >
          <p className="text-sm font-semibold text-foreground">{item.term}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {item.definition}
          </p>
        </div>
      ))}
    </div>
  )
}

export function LogosPrinciplesGrid({
  principles,
}: {
  principles: readonly { title: string; body: string }[]
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {principles.map((item) => (
        <div
          key={item.title}
          className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3"
        >
          <p className="text-sm font-semibold text-foreground">{item.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
        </div>
      ))}
    </div>
  )
}

function LogoPreviewSurface({
  bg,
  children,
  className,
}: {
  bg: PreviewBg
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("logo-preview-surface", PREVIEW_BG_CLASS[bg], className)}>
      {children}
    </div>
  )
}

function LogoAssetCard({
  label,
  src,
  alt,
  previewBg,
  usage,
  assetPath,
  variantTag,
}: {
  label: string
  src: string
  alt: string
  previewBg: PreviewBg
  usage: string
  assetPath?: string
  variantTag?: string
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
      <LogoPreviewSurface bg={previewBg}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="h-7 w-auto max-w-full object-contain" />
      </LogoPreviewSurface>
      <div className="space-y-2 border-t border-border/60 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-foreground">{label}</p>
          {variantTag ? (
            <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-primary">
              {variantTag}
            </span>
          ) : null}
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">{usage}</p>
        {assetPath ? (
          <p className="truncate font-mono text-[10px] text-muted-foreground">{assetPath}</p>
        ) : null}
      </div>
    </div>
  )
}

export function RootsyLogoVariantsGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ROOTSY_LOGO_LOCKUPS.map((logo) => (
        <LogoAssetCard
          key={logo.id}
          label={logo.label}
          src={logo.src}
          alt={logo.alt}
          previewBg={logo.previewBg}
          usage={logo.usage}
          assetPath={logo.src}
          variantTag={logo.variant}
        />
      ))}
    </div>
  )
}

export function RootsyLogomarksGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {ROOTSY_LOGOMARKS.map((logo) => (
        <LogoAssetCard
          key={logo.id}
          label={logo.label}
          src={logo.src}
          alt={logo.alt}
          previewBg={logo.previewBg}
          usage={logo.usage}
          assetPath={logo.src}
          variantTag={logo.variant}
        />
      ))}
    </div>
  )
}

export function PopIdentityVariantsShowcase() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {POP_IDENTITY_VARIANTS.map((variant) => (
        <PopIdentityVariantCard key={variant.id} variantId={variant.id} meta={variant} />
      ))}
    </div>
  )
}

function PopIdentityVariantCard({
  variantId,
  meta,
}: {
  variantId: PopIdentityVariantId
  meta: (typeof POP_IDENTITY_VARIANTS)[number]
}) {
  const preview =
    variantId === "ticket-logo" ? (
      <div className="logo-preview-surface logo-preview-surface--home-dark min-h-34 px-4 py-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={POP_TICKET_LOGO_SPECIMEN}
          alt={POP_IDENTITY_SPECIMEN.name}
          className="h-20 w-auto max-w-full object-contain"
        />
      </div>
    ) : variantId.startsWith("home-picker") ? (
      <div className="logo-preview-surface logo-preview-surface--home-dark min-h-[14rem] px-4 py-8">
        <PopHomePickerDemo variantId={variantId} />
      </div>
    ) : (
      <LogoPreviewSurface bg="light" className="min-h-[8.5rem] px-4">
        <PopIdentityInlineDemo variantId={variantId} />
      </LogoPreviewSurface>
    )

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
      {preview}
      <div className="space-y-2 border-t border-border/60 px-4 py-3">
        <p className="text-sm font-semibold text-foreground">{meta.label}</p>
        <p className="text-xs leading-relaxed text-muted-foreground">{meta.usage}</p>
        <p className="truncate font-mono text-[10px] text-muted-foreground">{meta.source}</p>
        <div className="flex flex-wrap gap-1 pt-0.5">
          {meta.fields.map((field) => (
            <span
              key={field}
              className="rounded-md bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
            >
              {field}
            </span>
          ))}
          {variantId === "ticket-logo" ? (
            <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
              {POP_IDENTITY_SPECIMEN.ticketLogoUrl}
            </span>
          ) : variantId !== "home-picker-initials" ? (
            <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
              {POP_IDENTITY_SPECIMEN.imageUrl}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function PopAvatar({
  imageUrl,
  initials,
  size = "xl",
  shape = "circle",
  className,
}: {
  imageUrl?: string | null
  initials: string
  size?: "xl" | "md" | "sm"
  shape?: "circle" | "rounded-square"
  className?: string
}) {
  const sizeClass =
    size === "xl" ? "size-28" : size === "md" ? "size-12" : "size-8"
  const radiusClass = shape === "circle" ? "rounded-full" : "rounded-lg"
  const hasImage = Boolean(imageUrl?.trim())

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden",
        sizeClass,
        radiusClass,
        !hasImage && cn("bg-linear-to-br", POP_HOME_ACCENTS.accent),
        shape === "rounded-square" && "ring-1 ring-border",
        className,
      )}
    >
      {hasImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl!} alt="" className="size-full object-cover" />
      ) : (
        <span
          className={cn(
            "font-black tracking-tight text-white drop-shadow",
            size === "xl" ? "text-[1.72rem]" : size === "md" ? "text-sm" : "text-[10px]",
          )}
        >
          {initials}
        </span>
      )}
    </div>
  )
}

function PopHomePickerDemo({ variantId }: { variantId: PopIdentityVariantId }) {
  const specimen = POP_IDENTITY_SPECIMEN
  const showAddress = variantId === "home-picker-address"
  const useInitials = variantId === "home-picker-initials"

  return (
    <div className="group mx-auto flex w-full max-w-40 flex-col items-center">
      <div className="relative">
        <div
          className={cn(
            "absolute inset-0 rounded-full opacity-70 blur-xl",
            POP_HOME_ACCENTS.glow,
          )}
          aria-hidden
        />
        <PopAvatar
          imageUrl={useInitials ? null : specimen.imageUrl}
          initials={specimen.initials}
          size="xl"
          shape="circle"
          className="relative shadow-xl ring-2 ring-white/14"
        />
        <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 border-0 bg-black/70 text-[10px] uppercase tracking-wider text-emerald-200">
          Activo
        </Badge>
      </div>
      <span className="mt-4 text-center text-[0.92rem] font-semibold text-white/78">
        {specimen.name}
      </span>
      {showAddress ? (
        <span className="mt-1 line-clamp-2 max-w-40 text-center text-[10px] leading-snug text-white/50">
          {specimen.address}
        </span>
      ) : null}
    </div>
  )
}

function PopIdentityInlineDemo({ variantId }: { variantId: PopIdentityVariantId }) {
  const specimen = POP_IDENTITY_SPECIMEN

  if (variantId === "header-compact") {
    return (
      <div className="logo-header-demo w-full max-w-sm">
        <PopAvatar
          imageUrl={specimen.imageUrl}
          initials={specimen.initials}
          size="sm"
          shape="rounded-square"
        />
        <span className="truncate text-sm font-semibold text-foreground/90">
          {specimen.name}
        </span>
      </div>
    )
  }

  if (variantId === "horizontal-address") {
    return (
      <div className="flex w-full max-w-md items-center gap-3">
        <PopAvatar
          imageUrl={specimen.imageUrl}
          initials={specimen.initials}
          size="md"
          shape="rounded-square"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{specimen.name}</p>
          <p className="truncate text-xs text-muted-foreground">{specimen.address}</p>
        </div>
      </div>
    )
  }

  return null
}

export function PopHomeScreenDemo() {
  const specimen = POP_IDENTITY_SPECIMEN

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 shadow-sm">
      <div className="logo-preview-surface logo-preview-surface--home-dark px-4 py-10">
        <p className="text-center text-sm text-white/70">
          A qué punto de venta querés ingresar?
        </p>
        <ul className="mx-auto mt-8 flex max-w-lg list-none flex-wrap justify-center gap-x-3 gap-y-7">
          <li className="basis-[9.1rem]">
            <PopHomePickerDemo variantId="home-picker" />
          </li>
          <li className="basis-[9.1rem]">
            <div className="mx-auto flex w-full max-w-40 flex-col items-center opacity-85">
              <PopAvatar
                imageUrl={null}
                initials="CF"
                size="xl"
                shape="circle"
                className="shadow-xl ring-2 ring-white/14"
              />
              <span className="mt-4 text-center text-[0.92rem] font-semibold text-white/65">
                Café del Parque
              </span>
            </div>
          </li>
          <li className="basis-[9.1rem]">
            <div className="mx-auto flex w-full max-w-40 flex-col items-center">
              <PopAvatar
                imageUrl={specimen.imageUrl}
                initials={specimen.initials}
                size="xl"
                shape="circle"
                className="shadow-xl ring-2 ring-white/14"
              />
              <span className="mt-4 text-center text-[0.92rem] font-semibold text-white/78">
                {specimen.name}
              </span>
              <span className="mt-1 line-clamp-2 max-w-40 text-center text-[10px] leading-snug text-white/50">
                {specimen.address}
              </span>
            </div>
          </li>
        </ul>
      </div>
      <p className="border-t border-border/60 bg-card px-4 py-3 font-mono text-[11px] text-muted-foreground">
        app/home/page.tsx · espécimen Narciso — {POP_IDENTITY_SPECIMEN.imageUrl}
      </p>
    </div>
  )
}

export function PopHeaderLogoDemo() {
  return (
    <div className="space-y-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        Header workspace · avatar cuadrado + nombre
      </p>
      <PopIdentityInlineDemo variantId="header-compact" />
      <p className="font-mono text-[11px] text-muted-foreground">
        size-8 · rounded-lg · ring-1 · truncate — DataWorkspaceLayout
      </p>
    </div>
  )
}

export function LogoClearanceDemo() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
        <p className="text-sm font-semibold text-foreground">Rootsy · clearance</p>
        <p className="mt-1 text-xs text-muted-foreground">{LOGO_CLEARANCE.rootsy.ideal}</p>
        <div className="mt-4 flex justify-center rounded-xl bg-[#16704a] py-6">
          <div className="logo-clearance-demo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/rootsy-logo.svg" alt="Rootsy" className="h-7 w-auto" />
          </div>
        </div>
        <p className="mt-3 font-mono text-[10px] text-muted-foreground">
          Mínimo: {LOGO_CLEARANCE.rootsy.minimum}
        </p>
      </div>
      <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
        <p className="text-sm font-semibold text-foreground">POP · clearance</p>
        <p className="mt-1 text-xs text-muted-foreground">{LOGO_CLEARANCE.pop.ideal}</p>
        <div className="mt-4 flex justify-center rounded-xl bg-[#070a09] py-8">
          <div className="logo-clearance-demo rounded-full border-dashed p-3">
            <PopAvatar
              imageUrl={POP_IDENTITY_SPECIMEN.imageUrl}
              initials={POP_IDENTITY_SPECIMEN.initials}
              size="md"
              shape="circle"
              className="ring-2 ring-white/14"
            />
          </div>
        </div>
        <p className="mt-3 font-mono text-[10px] text-muted-foreground">
          Mínimo: {LOGO_CLEARANCE.pop.minimum}
        </p>
      </div>
    </div>
  )
}

export function LogoGuidelinesGrid() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Do</p>
        <ul className="mt-3 space-y-2">
          {LOGO_GUIDELINES.do.map((item) => (
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
          {LOGO_GUIDELINES.dont.map((item) => (
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

export function LogoAttributionDemo() {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        Attribution · marketing externo
      </p>
      <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/rootsy-logo.svg" alt="Rootsy" className="h-6 w-auto opacity-90" />
        <span className="hidden text-muted-foreground sm:inline" aria-hidden>
          +
        </span>
        <div className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-muted/20 px-3 py-2">
          <PopAvatar
            imageUrl={POP_IDENTITY_SPECIMEN.imageUrl}
            initials={POP_IDENTITY_SPECIMEN.initials}
            size="sm"
            shape="rounded-square"
          />
          <span className="text-sm font-semibold text-foreground">
            {POP_IDENTITY_SPECIMEN.name}
          </span>
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        Usar cuando el contexto Rootsy no es obvio — p. ej. anuncios, partners o material impreso
        del negocio.
      </p>
    </div>
  )
}

export function LogosRelatedLinks({
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
