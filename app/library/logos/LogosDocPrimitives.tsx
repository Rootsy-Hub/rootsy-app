"use client"

import {
  LOGO_ANATOMY,
  LOGO_CLEARANCE,
  LOGO_GUIDELINES,
  POP_HOME_ACCENTS,
  POP_IDENTITY_SPECIMEN,
  POP_IDENTITY_VARIANTS,
  POP_TICKET_LOGO_SPECIMEN,
  ROOTSY_LOGO_CONCEPT,
  ROOTSY_LOGO_LOCKUPS,
  ROOTSY_LOGOMARKS,
  USER_PROFILE_ANATOMY,
  USER_PROFILE_CONCEPT,
  USER_PROFILE_GUIDELINES,
  USER_PROFILE_MEASURES,
  USER_PROFILE_PRINCIPLES,
  USER_PROFILE_SPECIMEN,
  USER_PROFILE_VARIANTS,
  type LogoPreviewBg,
  type PopIdentityVariantId,
  type UserProfileVariantId,
} from "@/app/library/logos/rootsyLogoSystem"
import {
  FoundationBrumaStage,
  FoundationConceptHero,
} from "@/app/library/libraryFoundationDocShared"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

const PREVIEW_BG_CLASS: Record<LogoPreviewBg, string> = {
  light: "logo-preview-surface--light",
  sombra: "logo-preview-surface--sombra",
  savia: "logo-preview-surface--savia",
  dark: "logo-preview-surface--dark",
  neutral: "logo-preview-surface--neutral",
}

export {
  LibraryDocLead as LogosDocLead,
  LibraryDocSection as LogosDocSection,
  LibraryPrinciplesGrid as LogosPrinciplesGrid,
  LibraryRelatedLinks as LogosRelatedLinks,
} from "@/app/library/libraryDocPrimitives"

export function LogosSystemHero() {
  return (
    <div className="space-y-4">
      <FoundationConceptHero eyebrow="Rootsy · Logotipos" concept={ROOTSY_LOGO_CONCEPT} />
      <FoundationBrumaStage caption="Lockups en savia y sombra — inverse para hero, brand para ticket.">
        <div className="flex flex-wrap items-center justify-center gap-4">
          {ROOTSY_LOGO_LOCKUPS.slice(0, 2).map((logo) => (
            <div
              key={logo.id}
              className={cn(
                "logo-preview-surface min-h-0 px-6 py-4",
                PREVIEW_BG_CLASS[logo.previewBg],
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logo.src} alt={logo.alt} className="h-7 w-auto object-contain" />
            </div>
          ))}
        </div>
      </FoundationBrumaStage>
    </div>
  )
}

/** @deprecated Usar LogosSystemHero */
export function LogosManifestoHero() {
  return <LogosSystemHero />
}

export function LogosAnatomyGrid() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {LOGO_ANATOMY.map((item) => (
        <div
          key={item.term}
          className="library-doc-card rounded-xl px-4 py-3"
        >
          <p className="text-sm font-semibold text-[var(--rootsy-bruma-900)]">{item.term}</p>
          <p className="mt-1 text-sm leading-relaxed text-[var(--rootsy-bruma-500)]">
            {item.definition}
          </p>
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
  bg: LogoPreviewBg
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
  previewBg: LogoPreviewBg
  usage: string
  assetPath?: string
  variantTag?: string
}) {
  return (
    <div className="library-doc-panel overflow-hidden rounded-2xl">
      <LogoPreviewSurface bg={previewBg}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="h-7 w-auto max-w-full object-contain" />
      </LogoPreviewSurface>
      <div className="space-y-2 border-t border-[var(--rootsy-bruma-200)] px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-[var(--rootsy-bruma-900)]">{label}</p>
          {variantTag ? (
            <span className="rounded-md bg-[color-mix(in_srgb,var(--rootsy-savia-600)_10%,transparent)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-[var(--rootsy-savia-600)]">
              {variantTag}
            </span>
          ) : null}
        </div>
        <p className="text-xs leading-relaxed text-[var(--rootsy-bruma-500)]">{usage}</p>
        {assetPath ? (
          <p className="truncate font-mono text-[10px] text-[var(--rootsy-bruma-500)]">{assetPath}</p>
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
    <div className="library-doc-panel overflow-hidden rounded-2xl">
      {preview}
      <div className="space-y-2 border-t border-[var(--rootsy-bruma-200)] px-4 py-3">
        <p className="text-sm font-semibold text-[var(--rootsy-bruma-900)]">{meta.label}</p>
        <p className="text-xs leading-relaxed text-[var(--rootsy-bruma-500)]">{meta.usage}</p>
        <p className="truncate font-mono text-[10px] text-[var(--rootsy-bruma-500)]">{meta.source}</p>
        <div className="flex flex-wrap gap-1 pt-0.5">
          {meta.fields.map((field) => (
            <span
              key={field}
              className="rounded-md bg-[var(--rootsy-bruma-50)] px-2 py-0.5 font-mono text-[10px] text-[var(--rootsy-bruma-500)]"
            >
              {field}
            </span>
          ))}
          {variantId === "ticket-logo" ? (
            <span className="rounded-md bg-[var(--rootsy-bruma-50)] px-2 py-0.5 font-mono text-[10px] text-[var(--rootsy-bruma-500)]">
              {POP_IDENTITY_SPECIMEN.ticketLogoUrl}
            </span>
          ) : variantId !== "home-picker-initials" ? (
            <span className="rounded-md bg-[var(--rootsy-bruma-50)] px-2 py-0.5 font-mono text-[10px] text-[var(--rootsy-bruma-500)]">
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
            "font-bold tracking-tight text-white drop-shadow",
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
        <span className="truncate text-sm font-semibold text-[var(--rootsy-bruma-900)]/90">
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
          <p className="truncate text-sm font-semibold text-[var(--rootsy-bruma-900)]">{specimen.name}</p>
          <p className="truncate text-xs text-[var(--rootsy-bruma-500)]">{specimen.address}</p>
        </div>
      </div>
    )
  }

  return null
}

export function PopHomeScreenDemo() {
  const specimen = POP_IDENTITY_SPECIMEN

  return (
    <div className="library-doc-panel overflow-hidden rounded-2xl">
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
      <p className="border-t border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-white)] px-4 py-3 font-mono text-[11px] text-[var(--rootsy-bruma-500)]">
        app/home/page.tsx · espécimen Narciso — {POP_IDENTITY_SPECIMEN.imageUrl}
      </p>
    </div>
  )
}

export function PopHeaderLogoDemo() {
  return (
    <div className="space-y-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--rootsy-bruma-500)]">
        Header workspace · avatar cuadrado + nombre
      </p>
      <PopIdentityInlineDemo variantId="header-compact" />
      <p className="font-mono text-[11px] text-[var(--rootsy-bruma-500)]">
        size-8 · rounded-lg · ring-1 · truncate — DataWorkspaceLayout
      </p>
    </div>
  )
}

export function LogoClearanceDemo() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="library-doc-card rounded-2xl p-4">
        <p className="text-sm font-semibold text-[var(--rootsy-bruma-900)]">Rootsy · clearance</p>
        <p className="mt-1 text-xs text-[var(--rootsy-bruma-500)]">{LOGO_CLEARANCE.rootsy.ideal}</p>
        <div className="mt-4 flex justify-center rounded-xl bg-[#16704a] py-6">
          <div className="logo-clearance-demo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/rootsy-logo.svg" alt="Rootsy" className="h-7 w-auto" />
          </div>
        </div>
        <p className="mt-3 font-mono text-[10px] text-[var(--rootsy-bruma-500)]">
          Mínimo: {LOGO_CLEARANCE.rootsy.minimum}
        </p>
      </div>
      <div className="library-doc-card rounded-2xl p-4">
        <p className="text-sm font-semibold text-[var(--rootsy-bruma-900)]">POP · clearance</p>
        <p className="mt-1 text-xs text-[var(--rootsy-bruma-500)]">{LOGO_CLEARANCE.pop.ideal}</p>
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
        <p className="mt-3 font-mono text-[10px] text-[var(--rootsy-bruma-500)]">
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
            <li key={item} className="flex gap-2 text-sm text-[var(--rootsy-bruma-900)]">
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
            <li key={item} className="flex gap-2 text-sm text-[var(--rootsy-bruma-900)]">
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

function UserProfileBlockDemo({
  variantId,
}: {
  variantId: UserProfileVariantId
}) {
  const specimen = USER_PROFILE_SPECIMEN
  const compact = variantId === "header-workspace"
  const avatarSizeClass = compact ? "size-8" : "size-10"

  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex min-w-0 flex-col items-end text-right leading-tight">
        <span className="truncate text-sm font-normal text-white">
          {specimen.name}
        </span>
        <span className="truncate text-xs font-normal text-[var(--rootsy-bruma-400)]">
          {specimen.roleLabel}
        </span>
      </div>
      <span
        className={cn(
          "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full",
          "bg-linear-to-br from-[var(--rootsy-savia-500)] to-[var(--rootsy-savia-700)]",
          avatarSizeClass,
        )}
      >
        <span className="text-xs font-semibold tracking-tight text-white">
          {specimen.initials}
        </span>
        <span
          className="pointer-events-none absolute right-0 bottom-0 size-2 rounded-full bg-[var(--rootsy-savia-500)] ring-1 ring-[var(--rootsy-sombra-900)]"
          aria-hidden
        />
      </span>
    </div>
  )
}

export function UserProfileIdentityShowcase() {
  return (
    <div className="space-y-6">
      <div className="library-doc-card space-y-2 rounded-2xl px-5 py-4">
        <p className="text-sm font-semibold text-[var(--rootsy-bruma-900)]">
          {USER_PROFILE_CONCEPT.title}
        </p>
        <p className="text-sm leading-relaxed text-[var(--rootsy-bruma-500)]">
          {USER_PROFILE_CONCEPT.lead}
        </p>
        <ul className="space-y-1.5 pt-1">
          {USER_PROFILE_CONCEPT.why.map((line) => (
            <li
              key={line}
              className="text-sm leading-relaxed text-[var(--rootsy-bruma-500)]"
            >
              {line}
            </li>
          ))}
        </ul>
        <p className="pt-1 text-sm leading-relaxed text-[var(--rootsy-bruma-900)]">
          {USER_PROFILE_CONCEPT.closing}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {USER_PROFILE_PRINCIPLES.map((item) => (
          <div key={item.title} className="library-doc-card rounded-xl px-4 py-3">
            <p className="text-sm font-semibold text-[var(--rootsy-bruma-900)]">
              {item.title}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-[var(--rootsy-bruma-500)]">
              {item.detail}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {USER_PROFILE_VARIANTS.map((variant) => (
          <div
            key={variant.id}
            className="library-doc-panel overflow-hidden rounded-2xl"
          >
            <div className="logo-user-header-rail">
              <span className="mr-auto font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">
                {variant.label}
              </span>
              <UserProfileBlockDemo variantId={variant.id} />
            </div>
            <div className="space-y-2 border-t border-[var(--rootsy-bruma-200)] px-4 py-3">
              <p className="text-sm font-semibold text-[var(--rootsy-bruma-900)]">
                {variant.label}
              </p>
              <p className="text-xs leading-relaxed text-[var(--rootsy-bruma-500)]">
                {variant.usage}
              </p>
              <p className="font-mono text-[10px] text-[var(--rootsy-bruma-500)]">
                {variant.context}
              </p>
              <p className="font-mono text-[10px] text-[var(--rootsy-bruma-500)]">
                {variant.tokens}
              </p>
              <div className="flex flex-wrap gap-1 pt-0.5">
                {variant.fields.map((field) => (
                  <span
                    key={field}
                    className="rounded-md bg-[var(--rootsy-bruma-50)] px-2 py-0.5 font-mono text-[10px] text-[var(--rootsy-bruma-500)]"
                  >
                    {field}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {USER_PROFILE_ANATOMY.map((item) => (
          <div
            key={item.term}
            className="library-doc-card rounded-xl px-4 py-3"
          >
            <p className="text-sm font-semibold text-[var(--rootsy-bruma-900)]">
              {item.term}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-[var(--rootsy-bruma-500)]">
              {item.definition}
            </p>
          </div>
        ))}
      </div>

      <div className="library-doc-panel overflow-hidden rounded-2xl">
        <div className="border-b border-[var(--rootsy-bruma-200)] px-4 py-3">
          <p className="text-sm font-semibold text-[var(--rootsy-bruma-900)]">
            Medidas
          </p>
          <p className="mt-1 text-xs text-[var(--rootsy-bruma-500)]">
            Escala de espacio, radio y tipo — no medidas del código actual.
          </p>
        </div>
        <div className="divide-y divide-[var(--rootsy-bruma-200)]">
          {USER_PROFILE_MEASURES.map((row) => (
            <div
              key={row.token}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3 px-4 py-2.5 sm:grid-cols-[10rem_5.5rem_minmax(0,1fr)]"
            >
              <span className="text-sm font-semibold text-[var(--rootsy-bruma-900)]">
                {row.token}
              </span>
              <span className="font-mono text-[11px] text-[var(--rootsy-savia-600)]">
                {row.value}
              </span>
              <span className="col-span-2 font-mono text-[10px] text-[var(--rootsy-bruma-500)] sm:col-span-1">
                {row.note}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">
            Do
          </p>
          <ul className="mt-3 space-y-2">
            {USER_PROFILE_GUIDELINES.do.map((item) => (
              <li
                key={item}
                className="flex gap-2 text-sm text-[var(--rootsy-bruma-900)]"
              >
                <span className="text-emerald-600" aria-hidden>
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-700">
            Don&apos;t
          </p>
          <ul className="mt-3 space-y-2">
            {USER_PROFILE_GUIDELINES.dont.map((item) => (
              <li
                key={item}
                className="flex gap-2 text-sm text-[var(--rootsy-bruma-900)]"
              >
                <span className="text-red-600" aria-hidden>
                  ✕
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export function LogoAttributionDemo() {
  return (
    <div className="library-doc-card rounded-2xl p-5">
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--rootsy-bruma-500)]">
        Attribution · marketing externo
      </p>
      <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/rootsy-logo.svg" alt="Rootsy" className="h-6 w-auto opacity-90" />
        <span className="hidden text-[var(--rootsy-bruma-500)] sm:inline" aria-hidden>
          +
        </span>
        <div className="flex items-center gap-2.5 rounded-xl border border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-bruma-50)] px-3 py-2">
          <PopAvatar
            imageUrl={POP_IDENTITY_SPECIMEN.imageUrl}
            initials={POP_IDENTITY_SPECIMEN.initials}
            size="sm"
            shape="rounded-square"
          />
          <span className="text-sm font-semibold text-[var(--rootsy-bruma-900)]">
            {POP_IDENTITY_SPECIMEN.name}
          </span>
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-[var(--rootsy-bruma-500)]">
        Usar cuando el contexto Rootsy no es obvio — p. ej. anuncios, partners o material impreso
        del negocio.
      </p>
    </div>
  )
}

