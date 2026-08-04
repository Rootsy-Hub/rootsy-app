"use client"

import {
  ICONOGRAPHY_GUIDELINES,
  ICON_SMALL_USE_CASES,
  ROOTSY_ICON_CATEGORIES,
  ROOTSY_ICON_COLOR_ROLES,
  ROOTSY_ICON_LIBRARY,
  ROOTSY_ICON_SIZES,
  ROOTSY_ICON_VARIANTS,
  ROOTSY_ICON_VISUAL_STYLE,
  ICONSAX_IMPORT_EXAMPLE,
  type IconsaxVariant,
} from "@/app/[siteId]/[popId]/library/iconography/rootsyIconographySystem"
import { librarySectionHref } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"
import { cn } from "@/lib/utils"
import {
  Add,
  ArrowDown2,
  ArrowLeft2,
  ArrowRight2,
  Box,
  CloseCircle,
  DollarCircle,
  Edit,
  Element4,
  InfoCircle,
  Menu,
  Receipt,
  Refresh,
  Setting2,
  Shop,
  ShoppingCart,
  TickCircle,
  Trash,
  Warning2,
  type Icon,
} from "iconsax-reactjs"
import Link from "next/link"
import type { ReactNode } from "react"

const CANOPY = "#1E8F5A"
const CANOPY_LIGHT = "#A8EBC4"
const CANOPY_DARK = "#16704A"
const CANOPY_MIST = "#F0FBF4"
const VARIANT_UI: IconsaxVariant = "Linear"
const VARIANT_ACTIVE: IconsaxVariant = "Bold"

const CATEGORY_ICON_MAP: Record<string, Icon> = {
  Element4,
  Setting2,
  Shop,
  ShoppingCart,
  Receipt,
  DollarCircle,
  Box,
  ArrowRight2,
  ArrowDown2,
  ArrowLeft2,
  Menu,
  Add,
  Edit,
  Trash,
  TickCircle,
  CloseCircle,
  Warning2,
  InfoCircle,
  Refresh,
}

export function IconographyDocLead({ children }: { children: ReactNode }) {
  return (
    <p className="max-w-3xl text-base leading-relaxed text-muted-foreground">{children}</p>
  )
}

export function IconographyDocSection({
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

export function IconographyManifestoHero() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 shadow-sm">
      <div
        className="relative px-6 py-10 sm:px-8"
        style={{
          background: `linear-gradient(160deg, ${CANOPY_DARK} 0%, #0F5739 40%, ${CANOPY} 70%, ${CANOPY_LIGHT} 100%)`,
        }}
      >
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">
              Rootsy · Icon System
            </p>
            <p className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Señales SaaS
            </p>
            <p className="text-sm leading-relaxed text-white/85">
              Iconsax · Linear 16px · Bold en activo · tier gratuito.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
            <Element4 size={24} variant={VARIANT_ACTIVE} color="#fff" />
            <Receipt size={20} variant={VARIANT_UI} color="rgba(255,255,255,0.85)" />
            <Setting2 size={16} variant={VARIANT_UI} color="rgba(255,255,255,0.7)" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function IconographyPrinciplesGrid({
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

export function IconLibraryCard() {
  const lib = ROOTSY_ICON_LIBRARY
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">{lib.name}</p>
          <p className="font-mono text-xs text-muted-foreground">{lib.package}</p>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">{lib.rationale}</p>
        </div>
        <span className="rounded-md bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-primary">
          {lib.role}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
          {lib.tier}
        </span>
        <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
          variant=&quot;{lib.variantDefault}&quot;
        </span>
        <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
          grid {lib.grid}
        </span>
      </div>
      <pre className="mt-4 overflow-x-auto rounded-xl bg-muted/40 p-4 font-mono text-[11px] leading-relaxed text-foreground">
        {ICONSAX_IMPORT_EXAMPLE}
      </pre>
    </div>
  )
}

export function IconVariantDemo() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {ROOTSY_ICON_VARIANTS.filter((v) =>
        ["Linear", "Bold", "Outline", "Bulk"].includes(v.id),
      ).map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-4 shadow-sm"
        >
          <Box size={20} variant={item.id} color={CANOPY} />
          <div>
            <p className="font-mono text-xs text-primary">variant=&quot;{item.id}&quot;</p>
            <p className="text-xs text-muted-foreground">{item.usage}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export function IconVisualStyleGrid() {
  const style = ROOTSY_ICON_VISUAL_STYLE
  const entries = Object.entries(style) as [string, string][]
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map(([key, value]) => (
        <div key={key} className="rounded-xl border border-border/70 bg-muted/20 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            {key.replace(/([A-Z])/g, " $1").trim()}
          </p>
          <p className="mt-1 text-sm text-foreground">{value}</p>
        </div>
      ))}
    </div>
  )
}

export function IconSizeTable() {
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-2xl border border-border/70">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-muted/30 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              <th className="px-4 py-2">Token</th>
              <th className="px-4 py-2">Label</th>
              <th className="px-4 py-2 text-right">px</th>
              <th className="px-4 py-2">Preview</th>
              <th className="px-4 py-2">Uso</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {ROOTSY_ICON_SIZES.map((size) => (
              <tr key={size.id} className="hover:bg-muted/20">
                <td className="px-4 py-2.5 font-mono text-xs text-primary">{size.token}</td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground">
                  {size.label}
                  {size.sparing ? (
                    <span className="ml-1 rounded bg-amber-500/10 px-1 text-[10px] text-amber-700">
                      con moderación
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-2.5 text-right font-mono font-medium">{size.px}</td>
                <td className="px-4 py-2.5">
                  <Box size={size.px} variant={VARIANT_UI} color={CANOPY} />
                </td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground">{size.usage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <IconSizeCompareDemo />
    </div>
  )
}

function IconSizeCompareDemo() {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        Chevrons · 12px vs 16px
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-6">
        <div className="inline-flex items-center gap-2 rounded-lg border border-border/70 px-3 py-2 text-sm font-medium">
          <span>Trigger correcto</span>
          <ArrowDown2 size={12} variant={VARIANT_UI} className="text-muted-foreground" />
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg border border-dashed border-amber-500/50 px-3 py-2 text-sm font-medium opacity-70">
          <span>Demasiado grande</span>
          <ArrowDown2 size={16} variant={VARIANT_UI} className="text-muted-foreground" />
        </div>
      </div>
    </div>
  )
}

export function IconColorRolesGrid() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {ROOTSY_ICON_COLOR_ROLES.map((role) => (
        <div
          key={role.id}
          className="rounded-xl border border-border/70 bg-card p-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div
              className="flex size-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${role.hex}18` }}
            >
              <Receipt size={20} variant={VARIANT_UI} color={role.hex} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{role.label}</p>
              <p className="font-mono text-[10px] text-muted-foreground">{role.token}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{role.usage}</p>
        </div>
      ))}
    </div>
  )
}

export function IconCategoriesGallery() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {ROOTSY_ICON_CATEGORIES.map((cat) => (
        <div
          key={cat.id}
          className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm"
        >
          <p className="text-sm font-semibold text-foreground">{cat.label}</p>
          <p className="mt-1 text-xs text-muted-foreground">{cat.usage}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {cat.examples.map((name) => {
              const IconComponent = CATEGORY_ICON_MAP[name]
              if (!IconComponent) return null
              return (
                <div
                  key={name}
                  className="flex flex-col items-center gap-1 rounded-lg border border-border/60 bg-muted/20 px-3 py-2"
                >
                  <IconComponent size={24} variant={VARIANT_UI} className="text-foreground" />
                  <span className="font-mono text-[9px] text-muted-foreground">{name}</span>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

export function IconGuidelinesGrid() {
  return (
    <div className="grid gap-4">
      {ICONOGRAPHY_GUIDELINES.map((g) => (
        <div
          key={g.id}
          className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm"
        >
          <p className="text-sm font-semibold text-foreground">{g.title}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-[#A8EBC4] bg-[#F0FBF4] p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#16704A]">
                Hacer
              </p>
              <p className="mt-1 text-sm text-foreground">{g.doText}</p>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50/80 p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-red-700">
                Evitar
              </p>
              <p className="mt-1 text-sm text-foreground">{g.dontText}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function IconSmallUseCasesList() {
  return (
    <ul className="space-y-2 rounded-xl border border-border/70 bg-muted/20 p-4">
      {ICON_SMALL_USE_CASES.map((item) => (
        <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
          <TickCircle size={12} variant={VARIANT_ACTIVE} className="mt-0.5 shrink-0 text-primary" />
          {item}
        </li>
      ))}
    </ul>
  )
}

export function IconLabelDemo() {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        <Add size={16} variant={VARIANT_ACTIVE} color="currentColor" />
        Nuevo artículo
      </button>
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-lg border border-border/70 bg-card px-4 py-2 text-sm font-medium text-foreground"
      >
        <Edit size={16} variant={VARIANT_UI} className="text-muted-foreground" />
        Editar
      </button>
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700"
      >
        <Trash size={16} variant={VARIANT_UI} color="currentColor" />
        Eliminar
      </button>
    </div>
  )
}

export function IconNavActiveDemo() {
  return (
    <div className="flex flex-wrap gap-2 rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
      <div className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
        <ShoppingCart size={16} variant={VARIANT_ACTIVE} color="currentColor" />
        Ventas
      </div>
      <div className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground">
        <Receipt size={16} variant={VARIANT_UI} />
        Operaciones
      </div>
      <div className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground">
        <DollarCircle size={16} variant={VARIANT_UI} />
        Tesorería
      </div>
    </div>
  )
}

export function IconValidationDemo() {
  return (
    <div className="space-y-3 rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <InfoCircle size={12} variant={VARIANT_ACTIVE} className="text-sky-600" />
        El precio incluye IVA.
      </div>
      <div className="flex items-center gap-2 text-sm text-amber-800">
        <Warning2 size={12} variant={VARIANT_ACTIVE} className="text-amber-600" />
        Stock bajo — revisá inventario.
      </div>
      <div className="flex items-center gap-2 text-sm text-red-700">
        <Warning2 size={12} variant={VARIANT_ACTIVE} className="text-red-600" />
        El nombre es obligatorio.
      </div>
    </div>
  )
}

export function IconTileDemo() {
  return (
    <div className="flex flex-wrap gap-4">
      {[
        { size: 20, tile: "size-12", label: "20px · tile 48" },
        { size: 24, tile: "size-14", label: "24px · tile 56" },
      ].map((spec) => (
        <div key={spec.label} className="text-center">
          <div
            className={cn(
              "inline-flex items-center justify-center rounded-xl",
              spec.tile,
            )}
            style={{ backgroundColor: CANOPY_MIST, color: CANOPY }}
          >
            <Box size={spec.size} variant={VARIANT_UI} color={CANOPY} />
          </div>
          <p className="mt-2 font-mono text-[10px] text-muted-foreground">{spec.label}</p>
        </div>
      ))}
    </div>
  )
}

export function IconographyRelatedLinks({
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
