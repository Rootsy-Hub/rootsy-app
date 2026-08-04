"use client"

import {
  ICONOGRAPHY_GUIDELINES,
  ICON_SMALL_USE_CASES,
  LUCIDE_TO_PHOSPHOR_MAP,
  ROOTSY_ICON_CATEGORIES,
  ROOTSY_ICON_COLOR_ROLES,
  ROOTSY_ICON_LIBRARY,
  ROOTSY_ICON_LIBRARY_OPTIONS,
  ROOTSY_ICON_SIZES,
  ROOTSY_ICON_VISUAL_STYLE,
} from "@/app/[siteId]/[popId]/library/iconography/rootsyIconographySystem"
import { librarySectionHref } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  CaretDown,
  CaretRight,
  Check,
  CheckCircle,
  CircleNotch,
  CurrencyDollar,
  Gear,
  Info,
  List,
  Package,
  PencilSimple,
  Plus,
  Receipt,
  ShoppingCart,
  SquaresFour,
  Storefront,
  Trash,
  WarningCircle,
  X,
  type Icon as PhosphorIcon,
} from "@phosphor-icons/react"
import Link from "next/link"
import type { ReactNode } from "react"

const CANOPY = "#1E8F5A"
const CANOPY_LIGHT = "#A8EBC4"
const CANOPY_DARK = "#16704A"
const CANOPY_MIST = "#F0FBF4"

const CATEGORY_ICON_MAP: Record<string, PhosphorIcon> = {
  SquaresFour,
  Gear,
  Storefront,
  ShoppingCart,
  Receipt,
  CurrencyDollar,
  Package,
  CaretRight,
  CaretDown,
  ArrowLeft,
  List,
  Plus,
  PencilSimple,
  Trash,
  Check,
  X,
  CheckCircle,
  WarningCircle,
  Info,
  CircleNotch,
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
              Señales de producto
            </p>
            <p className="text-sm leading-relaxed text-white/85">
              Phosphor · Regular 16px · Fill en activo · sin metáforas orgánicas en UI.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
            <SquaresFour className="text-white" size={24} weight="fill" />
            <ShoppingCart className="text-white/85" size={20} weight="regular" />
            <Gear className="text-white/70" size={16} weight="regular" />
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

export function IconLibraryComparison() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {ROOTSY_ICON_LIBRARY_OPTIONS.map((lib) => (
        <div
          key={lib.id}
          className={cn(
            "rounded-2xl border bg-card p-5 shadow-sm",
            lib.status === "recommended"
              ? "border-primary/40 ring-1 ring-primary/20"
              : "border-border/70",
          )}
        >
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-foreground">{lib.name}</p>
            <span
              className={cn(
                "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]",
                lib.status === "recommended" && "bg-primary/10 text-primary",
                lib.status === "legacy" && "bg-muted text-muted-foreground",
                lib.status === "alternative" && "bg-sky-500/10 text-sky-700",
              )}
            >
              {lib.status === "recommended"
                ? "Recomendado"
                : lib.status === "legacy"
                  ? "Legacy actual"
                  : "Alternativa"}
            </span>
          </div>
          <p className="mt-1 font-mono text-[10px] text-muted-foreground">{lib.package}</p>
          <p className="mt-3 text-xs text-muted-foreground">{lib.bestFor}</p>
          <ul className="mt-3 space-y-1">
            {lib.pros.slice(0, 3).map((pro) => (
              <li key={pro} className="text-xs text-foreground">
                + {pro}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export function IconLibraryCard() {
  const lib = ROOTSY_ICON_LIBRARY
  return (
    <div className="rounded-2xl border border-primary/30 bg-card p-5 shadow-sm ring-1 ring-primary/10">
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
          weight=&quot;{lib.defaultWeight}&quot;
        </span>
        <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
          activo: {lib.activeWeight}
        </span>
        <span className="rounded-md bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] text-amber-800">
          legacy: {lib.legacyPackage}
        </span>
      </div>
    </div>
  )
}

export function IconWeightDemo() {
  const icons = [
    { weight: "regular" as const, label: "Regular — UI general" },
    { weight: "bold" as const, label: "Bold — énfasis puntual" },
    { weight: "fill" as const, label: "Fill — nav activo / selección" },
  ]
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {icons.map((item) => (
        <div
          key={item.weight}
          className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-4 shadow-sm"
        >
          <SquaresFour size={20} weight={item.weight} style={{ color: CANOPY }} />
          <div>
            <p className="font-mono text-xs text-primary">weight=&quot;{item.weight}&quot;</p>
            <p className="text-xs text-muted-foreground">{item.label}</p>
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
                  <Package size={size.px} weight="regular" style={{ color: CANOPY }} />
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
        Carets · 12px vs 16px
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-6">
        <div className="inline-flex items-center gap-2 rounded-lg border border-border/70 px-3 py-2 text-sm font-medium">
          <span>Trigger correcto</span>
          <CaretDown size={12} weight="bold" className="text-muted-foreground" />
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg border border-dashed border-amber-500/50 px-3 py-2 text-sm font-medium opacity-70">
          <span>Demasiado grande</span>
          <CaretDown size={16} weight="bold" className="text-muted-foreground" />
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
              <Receipt size={20} weight="regular" style={{ color: role.hex }} />
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
              const Icon = CATEGORY_ICON_MAP[name]
              if (!Icon) return null
              return (
                <div
                  key={name}
                  className="flex flex-col items-center gap-1 rounded-lg border border-border/60 bg-muted/20 px-3 py-2"
                >
                  <Icon size={16} weight="regular" className="text-foreground" />
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

export function LucidePhosphorMapTable() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border/70">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-muted/30 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            <th className="px-4 py-2">Lucide (legacy)</th>
            <th className="px-4 py-2">Phosphor (target)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {LUCIDE_TO_PHOSPHOR_MAP.map((row) => (
            <tr key={row.lucide} className="hover:bg-muted/20">
              <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{row.lucide}</td>
              <td className="px-4 py-2.5 font-mono text-xs text-primary">{row.phosphor}</td>
            </tr>
          ))}
        </tbody>
      </table>
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
          <CheckCircle size={12} weight="fill" className="mt-0.5 shrink-0 text-primary" />
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
        <Plus size={16} weight="bold" />
        Nuevo artículo
      </button>
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-lg border border-border/70 bg-card px-4 py-2 text-sm font-medium text-foreground"
      >
        <PencilSimple size={16} weight="regular" className="text-muted-foreground" />
        Editar
      </button>
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700"
      >
        <Trash size={16} weight="regular" />
        Eliminar
      </button>
    </div>
  )
}

export function IconNavActiveDemo() {
  return (
    <div className="flex flex-wrap gap-2 rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
      <div className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
        <ShoppingCart size={16} weight="fill" />
        Ventas
      </div>
      <div className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground">
        <Receipt size={16} weight="regular" />
        Operaciones
      </div>
      <div className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground">
        <CurrencyDollar size={16} weight="regular" />
        Tesorería
      </div>
    </div>
  )
}

export function IconValidationDemo() {
  return (
    <div className="space-y-3 rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Info size={12} weight="fill" className="text-sky-600" />
        El precio incluye IVA.
      </div>
      <div className="flex items-center gap-2 text-sm text-amber-800">
        <WarningCircle size={12} weight="fill" className="text-amber-600" />
        Stock bajo — revisá inventario.
      </div>
      <div className="flex items-center gap-2 text-sm text-red-700">
        <WarningCircle size={12} weight="fill" className="text-red-600" />
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
            <Package size={spec.size} weight="regular" />
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
