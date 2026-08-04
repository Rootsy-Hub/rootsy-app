"use client"

import type { PaletteFamilySpec, PaletteStepSpec } from "@/app/[siteId]/[popId]/library/color/colorExtendedData"
import {
  CHART_CATEGORICAL_COLORS,
  CHART_STATUS_COLORS,
  PICKER_BG_ROWS,
  PICKER_CHART_ROWS,
  PICKER_TEXT_ROWS,
  ROOTSY_ACCENT_COLORS,
  type AccentColorSpec,
} from "@/app/[siteId]/[popId]/library/color/colorExtendedData"
import { librarySectionHref } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"
import type { ColorRoleSpec, ColorSwatchSpec } from "@/app/[siteId]/[popId]/library/color/colorFoundationData"
import { COLOR_USAGE_STEPS } from "@/app/[siteId]/[popId]/library/color/colorFoundationData"
import { cn } from "@/lib/utils"
import Link from "next/link"
import type { ReactNode } from "react"

export function ColorDocLead({ children }: { children: ReactNode }) {
  return (
    <p className="max-w-3xl text-base leading-relaxed text-muted-foreground">
      {children}
    </p>
  )
}

export function ColorDocSection({
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
    <section id={id} className="scroll-mt-24 space-y-5 border-t border-border/60 pt-10 first:border-t-0 first:pt-0">
      <div className="max-w-3xl space-y-2">
        <h3 className="text-xl font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        {description ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

export function ColorUsagePrinciples() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
      <p className="text-sm font-medium text-foreground">
        Cómo elegir un color
      </p>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        Antes de fijar un tono, definí el rol y el nivel de énfasis. Así la
        interfaz se mantiene coherente en ventas, stock y modales.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {COLOR_USAGE_STEPS.map((step, index) => (
          <div key={step.label} className="flex items-center gap-2">
            <div className="rounded-lg border border-border/70 bg-muted/30 px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {step.label}
              </p>
              <p className="mt-0.5 text-xs text-foreground">{step.detail}</p>
            </div>
            {index < COLOR_USAGE_STEPS.length - 1 ? (
              <span className="text-muted-foreground" aria-hidden>
                →
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}

export function ColorRampStrip({
  swatches,
  className,
}: {
  swatches: ColorSwatchSpec[]
  className?: string
}) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border/70 shadow-sm", className)}>
      <div className="flex h-20">
        {swatches.map((swatch) => (
          <div
            key={swatch.id}
            className={cn("relative min-w-0 flex-1", swatch.className)}
            title={swatch.label}
          >
            <span className="sr-only">{swatch.label}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-px bg-border/60 sm:grid-cols-3 lg:grid-cols-5">
        {swatches.map((swatch) => (
          <div key={swatch.id} className="bg-card px-3 py-2.5">
            <p className="text-xs font-medium text-foreground">{swatch.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ColorSwatchCard({
  label,
  usage,
  className,
  ring,
}: ColorSwatchSpec) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
      <div
        className={cn(
          "h-24",
          className,
          ring && "ring-1 ring-inset ring-border/60",
        )}
        aria-hidden
      />
      <div className="space-y-1 border-t border-border/60 px-3 py-3">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs leading-snug text-muted-foreground">{usage}</p>
      </div>
    </div>
  )
}

export function ColorSwatchGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{children}</div>
  )
}

export function ColorRoleTable({ roles }: { roles: ColorRoleSpec[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-muted/40">
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Rol
            </th>
            <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:table-cell">
              Cuándo usarlo
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Ejemplo
            </th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr
              key={role.roleLabel}
              className="border-b border-border/40 last:border-b-0"
            >
              <td className="px-4 py-3 align-top font-medium text-foreground">
                {role.roleLabel}
              </td>
              <td className="hidden px-4 py-3 align-top text-muted-foreground md:table-cell">
                {role.description}
              </td>
              <td className="px-4 py-3 align-top">
                <span
                  className={cn(
                    "inline-flex rounded-lg px-2.5 py-1 text-xs font-medium",
                    role.exampleClassName,
                  )}
                >
                  {role.exampleLabel}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function EmphasisComparison() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Alto énfasis
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Máximo contraste sobre la superficie — acciones principales y alertas
          críticas.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">
            Guardar artículo
          </span>
          <span className="inline-flex h-9 items-center rounded-lg bg-destructive px-4 text-sm font-medium text-white">
            Eliminar
          </span>
        </div>
      </div>
      <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Bajo énfasis
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Tintes suaves y neutros — ayudas, banners informativos y fondos de
          navegación.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex h-9 items-center rounded-lg border border-border bg-card px-4 text-sm text-foreground">
            Cancelar
          </span>
          <span className="inline-flex items-center rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
            Sección activa
          </span>
          <span className="inline-flex items-center rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 text-sm text-emerald-800">
            Éxito
          </span>
        </div>
      </div>
    </div>
  )
}

export function InteractionStatesDemo() {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
      <p className="text-sm font-medium text-foreground">Estados de interacción</p>
      <p className="mt-1 text-sm text-muted-foreground">
        El verde de foco unifica formularios; hovers neutros en iconos y menú.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="space-y-2 rounded-xl border border-dashed border-border/70 p-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Reposo
          </p>
          <div className="h-11 rounded-lg border border-zinc-200 bg-white px-3 text-sm leading-11 text-zinc-900">
            Nombre del artículo
          </div>
        </div>
        <div className="space-y-2 rounded-xl border border-dashed border-border/70 p-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Activo
          </p>
          <div className="h-11 rounded-lg border border-emerald-700 bg-white px-3 text-sm leading-11 text-zinc-900 ring-2 ring-emerald-700/45">
            Nombre del artículo
          </div>
        </div>
        <div className="space-y-2 rounded-xl border border-dashed border-border/70 p-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Hover en menú
          </p>
          <div className="rounded-lg bg-muted/50 px-2 py-1.5 text-sm text-foreground">
            Color
          </div>
        </div>
      </div>
    </div>
  )
}

export function GuidelinePair({
  doText,
  dontText,
}: {
  doText: string
  dontText: string
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">
          Hacer
        </p>
        <p className="mt-2 text-sm leading-relaxed text-emerald-900">{doText}</p>
      </div>
      <div className="rounded-xl border border-destructive/25 bg-destructive/5 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-destructive">
          Evitar
        </p>
        <p className="mt-2 text-sm leading-relaxed text-destructive">{dontText}</p>
      </div>
    </div>
  )
}

export function AlphaOverlayDemo() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/70">
      <div className="grid grid-cols-3 gap-0">
        <div className="bg-background p-6" />
        <div className="bg-muted p-6" />
        <div className="bg-primary/20 p-6" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-xl border border-border/60 bg-card/80 p-4 shadow-lg backdrop-blur-sm">
          <p className="text-sm font-medium text-foreground">Panel semitransparente</p>
          <p className="mt-1 text-xs text-muted-foreground">
            La misma capa se adapta sobre fondos distintos sin perder legibilidad.
          </p>
        </div>
      </div>
    </div>
  )
}

export function AppliedColorDemo() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
      <div className="border-b border-border/60 bg-muted/30 px-4 py-3">
        <p className="text-xs font-medium text-muted-foreground">
          Vista previa · editar artículo
        </p>
      </div>
      <div className="grid gap-4 p-4 lg:grid-cols-[1fr_auto]">
        <div className="space-y-3">
          <p className="text-base font-semibold text-foreground">Cola 500 ml</p>
          <div className="h-11 rounded-lg border border-zinc-200 bg-white px-3 text-sm leading-11 text-zinc-900 ring-2 ring-emerald-700/45">
            Precio · 1.250,00
          </div>
          <p className="text-xs text-zinc-500">Precio de lista antes de impuestos.</p>
        </div>
        <div className="flex flex-col justify-end gap-2">
          <div className="flex h-9 w-28 items-center justify-center rounded-lg border border-zinc-200 bg-white text-sm text-foreground">
            Cancelar
          </div>
          <div className="flex h-9 w-28 items-center justify-center rounded-lg bg-emerald-600 text-sm font-medium text-white shadow-sm">
            Guardar
          </div>
        </div>
      </div>
    </div>
  )
}

export function ThemeComparison() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="overflow-hidden rounded-xl border border-primary/30 shadow-sm">
        <div className="bg-background px-4 py-6">
          <div className="rounded-lg border border-border bg-card p-3 shadow-sm">
            <p className="text-sm font-medium text-foreground">Artículo activo</p>
            <p className="mt-1 text-xs text-muted-foreground">Workspace claro</p>
          </div>
        </div>
        <div className="border-t border-primary/20 bg-primary/5 px-4 py-3">
          <p className="text-sm font-semibold text-foreground">Workspace claro</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Stock, artículos y modales de edición. Tema activo hoy.
          </p>
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-border/70 opacity-90 shadow-sm">
        <div className="bg-[#070a09] px-4 py-6">
          <div className="rounded-lg border border-white/10 bg-[#0c0f0e] p-3">
            <p className="text-sm font-medium text-white">Ticket en curso</p>
            <p className="mt-1 text-xs text-white/45">Mostrador oscuro</p>
          </div>
        </div>
        <div className="border-t border-border/60 bg-muted/20 px-4 py-3">
          <p className="text-sm font-semibold text-foreground">Mostrador oscuro</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Venta en POS — paleta equivalente documentada en Paleta completa.
          </p>
        </div>
      </div>
    </div>
  )
}

export function ColorRelatedLinks({
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
            className="rounded-xl border border-border/70 bg-card p-4 shadow-sm transition-colors hover:border-primary/30 hover:bg-primary/5"
          >
            <p className="text-sm font-semibold text-foreground">{link.label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{link.hint}</p>
          </Link>
        ))}
    </div>
  )
}

export function AccentTagsDemo() {
  return (
    <div className="flex flex-wrap gap-2">
      {ROOTSY_ACCENT_COLORS.map((accent) => (
        <span
          key={accent.id}
          className={cn(
            "inline-flex rounded-full px-3 py-1 text-xs font-medium",
            accent.tagClassName,
          )}
        >
          {accent.label}
        </span>
      ))}
    </div>
  )
}

function accentBgClass(accent: AccentColorSpec, level: string) {
  switch (level) {
    case "subtlest":
      return accent.subtlestClassName
    case "subtler":
      return accent.subtlerClassName
    case "subtle":
      return accent.subtleClassName
    case "bold":
      return accent.boldClassName
    default:
      return accent.subtleClassName
  }
}

export function AccentBackgroundEmphasisDemo() {
  const sample = ROOTSY_ACCENT_COLORS[0]
  const levels = [
    { label: "Más sutil", className: sample.subtlestClassName },
    { label: "Sutil", className: sample.subtlerClassName },
    { label: "Medio", className: sample.subtleClassName },
    { label: "Intenso", className: sample.boldClassName },
  ]

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Cuatro niveles de énfasis en fondo — ejemplo con acento Verde.
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {levels.map((level) => (
          <div key={level.label} className="space-y-2">
            <div className={cn("h-16 rounded-xl border border-border/40", level.className)} />
            <p className="text-xs text-muted-foreground">{level.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AccentTextIconDemo() {
  const sample = ROOTSY_ACCENT_COLORS[0]
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-xl border border-border/70 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Texto
        </p>
        <p className={cn("mt-3 text-lg font-semibold", sample.textDefaultClassName)}>
          Normal · Bebidas
        </p>
        <p className={cn("mt-1 text-lg font-bold", sample.textBoldClassName)}>
          Intenso · Bebidas
        </p>
      </div>
      <div className="rounded-xl border border-border/70 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Ícono
        </p>
        <div className="mt-3 flex gap-3">
          <div
            className={cn(
              "flex size-10 items-center justify-center rounded-lg bg-muted/40",
              sample.textDefaultClassName,
            )}
          >
            ●
          </div>
          <div
            className={cn(
              "flex size-10 items-center justify-center rounded-lg bg-muted/40",
              sample.textBoldClassName,
            )}
          >
            ●
          </div>
        </div>
      </div>
    </div>
  )
}

export function AccentPairingDemo() {
  const accent = ROOTSY_ACCENT_COLORS[0]
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className={cn("rounded-xl p-4", accent.subtlestClassName)}>
        <p className={cn("text-sm font-medium", accent.textDefaultClassName)}>
          Texto normal
        </p>
      </div>
      <div className={cn("rounded-xl p-4", accent.subtlerClassName)}>
        <p className={cn("text-sm font-bold", accent.textBoldClassName)}>
          Texto intenso
        </p>
      </div>
      <div className={cn("rounded-xl p-4", accent.subtleClassName)}>
        <p className={cn("text-sm font-bold", accent.textBoldClassName)}>
          Solo intenso
        </p>
      </div>
      <div className={cn("rounded-xl p-4", accent.boldClassName)}>
        <p className="text-sm font-medium text-white">Texto claro</p>
      </div>
    </div>
  )
}

export function ColorPickerGrid({
  variant,
}: {
  variant: "text" | "background" | "chart"
}) {
  const accents = ROOTSY_ACCENT_COLORS.slice(0, 6)

  if (variant === "text") {
    return (
      <div className="overflow-hidden rounded-2xl border border-border/70">
        <div className="grid grid-cols-[auto_1fr] gap-px bg-border/60">
          <div className="bg-muted/30 p-3" />
          {accents.map((a) => (
            <div key={a.id} className="bg-muted/30 p-2 text-center text-[10px] font-medium text-muted-foreground">
              {a.label}
            </div>
          ))}
          {PICKER_TEXT_ROWS.map((row) => (
            <div key={row.emphasis} className="contents">
              <div className="flex items-center bg-card px-3 text-xs text-muted-foreground">
                {row.emphasis}
              </div>
              {accents.map((accent) => (
                <button
                  key={`${row.emphasis}-${accent.id}`}
                  type="button"
                  className="flex h-10 items-center justify-center bg-card text-sm font-semibold hover:bg-muted/30"
                >
                  <span
                    className={
                      row.suffix === "bold"
                        ? accent.textBoldClassName
                        : accent.textDefaultClassName
                    }
                  >
                    Aa
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (variant === "background") {
    return (
      <div className="overflow-hidden rounded-2xl border border-border/70">
        <div className="grid grid-cols-[auto_1fr] gap-px bg-border/60">
          <div className="bg-muted/30 p-3" />
          {accents.map((a) => (
            <div key={a.id} className="bg-muted/30 p-2 text-center text-[10px] font-medium text-muted-foreground">
              {a.label}
            </div>
          ))}
          {PICKER_BG_ROWS.map((row) => (
            <div key={row.emphasis} className="contents">
              <div className="flex items-center bg-card px-3 text-xs text-muted-foreground">
                {row.emphasis}
              </div>
              {accents.map((accent) => (
                <button
                  key={`${row.emphasis}-${accent.id}`}
                  type="button"
                  className={cn(
                    "h-10 border border-transparent hover:ring-2 hover:ring-primary/30",
                    accentBgClass(accent, row.level),
                  )}
                  aria-label={`${accent.label} ${row.emphasis}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70">
      <div className="grid grid-cols-[auto_1fr] gap-px bg-border/60">
        <div className="bg-muted/30 p-3" />
        {accents.map((a) => (
          <div key={a.id} className="bg-muted/30 p-2 text-center text-[10px] font-medium text-muted-foreground">
            {a.label}
          </div>
        ))}
        {PICKER_CHART_ROWS.map((row) => (
          <div key={row.emphasis} className="contents">
            <div className="flex items-center bg-card px-3 text-xs text-muted-foreground">
              {row.emphasis}
            </div>
            {accents.map((accent) => {
              const opacity = row.level === 0 ? 0.45 : row.level === 1 ? 0.7 : 1
              return (
                <button
                  key={`${row.emphasis}-${accent.id}`}
                  type="button"
                  className={cn("h-10 hover:ring-2 hover:ring-primary/30", accent.boldClassName)}
                  style={{ opacity }}
                  aria-label={`${accent.label} ${row.emphasis}`}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export function SingleColorChartDemo() {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4">
      <p className="text-sm font-medium text-foreground">Un solo color · ventas del mes</p>
      <div className="mt-4 flex h-32 items-end gap-2">
        {[40, 65, 50, 80, 55, 90, 70].map((h, i) => (
          <div key={i} className="flex flex-1 flex-col justify-end gap-1">
            <div
              className={cn("rounded-t-md", i === 6 ? "bg-primary" : "bg-muted-foreground/25")}
              style={{ height: `${h}%` }}
            />
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Verde de marca para el dato destacado; neutro para el resto.
      </p>
    </div>
  )
}

export function CategoricalChartDemo() {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4">
      <p className="text-sm font-medium text-foreground">Categórico · ventas por categoría</p>
      <div className="mt-4 space-y-2">
        {CHART_CATEGORICAL_COLORS.map((series, i) => (
          <div key={series.id} className="flex items-center gap-3">
            <div className={cn("h-3 w-3 shrink-0 rounded-full", series.className)} />
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full", series.className)}
                style={{ width: `${90 - i * 12}%` }}
              />
            </div>
            <span className="w-16 text-right text-xs text-muted-foreground">
              {series.label}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Máximo 5–6 series; agrupá el resto en «Otros».
      </p>
    </div>
  )
}

export function StatusChartDemo() {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4">
      <p className="text-sm font-medium text-foreground">Estado · prioridad de pedidos</p>
      <div className="mt-4 flex h-8 overflow-hidden rounded-lg">
        {CHART_STATUS_COLORS.map((status, i) => (
          <div
            key={status.id}
            className={cn(
              i % 2 === 0 ? status.defaultClassName : status.boldClassName,
              "flex-1 border-r border-white/30 last:border-r-0",
            )}
            title={status.label}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-3">
        {CHART_STATUS_COLORS.map((status) => (
          <div key={status.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className={cn("size-2.5 rounded-full", status.boldClassName)} />
            {status.label}
          </div>
        ))}
      </div>
    </div>
  )
}

export function ChartInteractionDemo() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-xl border border-border/70 p-4">
        <p className="text-xs font-medium text-muted-foreground">Hover · resaltar segmento</p>
        <div className="mt-3 flex h-10 overflow-hidden rounded-lg">
          <div className="flex-[2] bg-chart-1 opacity-100" />
          <div className="flex-1 bg-chart-2 opacity-40" />
          <div className="flex-1 bg-chart-3 opacity-40" />
        </div>
      </div>
      <div className="rounded-xl border border-border/70 p-4">
        <p className="text-xs font-medium text-muted-foreground">Hover · atenuar resto</p>
        <div className="mt-3 flex h-10 overflow-hidden rounded-lg">
          <div className="flex-1 bg-chart-1 opacity-30" />
          <div className="flex-[2] bg-chart-2" />
          <div className="flex-1 bg-chart-3 opacity-30" />
        </div>
      </div>
    </div>
  )
}

export function PaletteFamilyRamp({ family }: { family: PaletteFamilySpec }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">{family.label}</p>
      <div className="flex overflow-hidden rounded-xl border border-border/70">
        {family.steps.map((step) => (
          <div key={step.id} className="min-w-0 flex-1">
            <div className={cn("h-12", step.className)} title={step.label} />
            <p className="border-t border-border/60 bg-card py-1 text-center text-[10px] text-muted-foreground">
              {step.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function NeutralPaletteComparison({
  lightSteps,
  darkSteps,
  title,
}: {
  lightSteps: PaletteStepSpec[]
  darkSteps: PaletteStepSpec[]
  title: string
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <div className="grid gap-3 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-xs text-muted-foreground">Workspace claro</p>
          <div className="flex overflow-hidden rounded-xl border border-border/70">
            {lightSteps.map((step) => (
              <div key={step.id} className="min-w-0 flex-1">
                <div className={cn("h-10", step.className)} />
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs text-muted-foreground">Mostrador oscuro</p>
          <div className="flex overflow-hidden rounded-xl border border-border/70">
            {darkSteps.map((step) => (
              <div key={step.id} className="min-w-0 flex-1">
                <div className={cn("h-10", step.className)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function DarkModeSymmetryDemo() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70">
      <div className="grid lg:grid-cols-2">
        <div className="border-b border-border/60 bg-background p-4 lg:border-b-0 lg:border-r">
          <p className="text-xs font-medium text-muted-foreground">Workspace claro</p>
          <div className="mt-3 flex gap-2">
            <div className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white">
              Guardar
            </div>
            <div className="rounded-lg bg-emerald-100 px-4 py-2 text-sm text-emerald-900">
              Info
            </div>
          </div>
        </div>
        <div className="bg-[#070a09] p-4">
          <p className="text-xs font-medium text-white/45">Mostrador oscuro</p>
          <div className="mt-3 flex gap-2">
            <div className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white">
              Guardar
            </div>
            <div className="rounded-lg bg-emerald-950 px-4 py-2 text-sm text-emerald-300">
              Info
            </div>
          </div>
        </div>
      </div>
      <p className="border-t border-border/60 bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
        El tono intenso en claro se equilibra con uno más luminoso en oscuro — misma jerarquía, distinta superficie.
      </p>
    </div>
  )
}

