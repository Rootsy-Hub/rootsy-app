"use client"

import type {
  NatureAccent,
  NatureFamily,
  NatureGradient,
} from "@/app/[siteId]/[popId]/library/color/rootsyNaturePalette"
import {
  CHART_NATURE_SEQUENCE,
  CHART_STATUS_NATURE,
  NATURE_ACCENTS,
  NATURE_COLOR_ROLES,
  NATURE_GRADIENTS,
  NATURE_PILL_VARIANTS,
} from "@/app/[siteId]/[popId]/library/color/rootsyNaturePalette"
import { RootsNaturePill } from "@/components/rootsy-pill"
import {
  CANOPY,
  CANOPY_DARK,
  LibraryManifestoHero,
} from "@/app/[siteId]/[popId]/library/libraryDocPrimitives"
import type { CSSProperties, ReactNode } from "react"

export {
  LibraryDocLead as ColorDocLead,
  LibraryDocSection as ColorDocSection,
  LibraryPrinciplesGrid as NaturePrinciplesGrid,
  LibraryDoDontPair as GuidelinePair,
  LibraryRelatedLinks as ColorRelatedLinks,
} from "@/app/[siteId]/[popId]/library/libraryDocPrimitives"

export function NatureManifestoHero() {
  return (
    <LibraryManifestoHero
      tone="spectrum"
      eyebrow="Rootsy · Color"
      title="La naturaleza en su mejor esplendor"
      description="Verde canopy como protagonista — otoño, cielo, mar, fuego, tierra y noche como el mundo real."
    />
  )
}

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

export function NatureSwatchCard({
  label,
  hex,
  usage,
  textHex = "#FFFFFF",
}: {
  label: string
  hex: string
  usage: string
  textHex?: string
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
      <div
        className="flex h-24 items-end p-3"
        style={{ backgroundColor: hex }}
      >
        <span
          className="rounded-md px-2 py-0.5 text-[10px] font-medium backdrop-blur-sm"
          style={{
            backgroundColor: `${textHex}22`,
            color: textHex,
          }}
        >
          {label}
        </span>
      </div>
      <div className="border-t border-border/60 px-3 py-3">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="mt-1 text-xs leading-snug text-muted-foreground">
          {usage}
        </p>
      </div>
    </div>
  )
}

export function NatureSwatchGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{children}</div>
  )
}

export function NatureRoleTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-muted/40">
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Rol
            </th>
            <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:table-cell">
              Cuándo
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Ejemplo
            </th>
          </tr>
        </thead>
        <tbody>
          {NATURE_COLOR_ROLES.map((role) => (
            <tr key={role.roleLabel} className="border-b border-border/40 last:border-b-0">
              <td className="px-4 py-3 align-top font-medium text-foreground">
                {role.roleLabel}
              </td>
              <td className="hidden px-4 py-3 align-top text-muted-foreground md:table-cell">
                {role.description}
              </td>
              <td className="px-4 py-3 align-top">
                <span
                  className="inline-flex rounded-lg border px-2.5 py-1 text-xs font-medium"
                  style={{
                    backgroundColor: role.bg,
                    color: role.text,
                    borderColor: "border" in role ? role.border : "transparent",
                  }}
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

export function AppliedNatureDemo() {
  const brand = CANOPY
  const focus = CANOPY_DARK
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
      <div
        className="border-b px-4 py-3"
        style={{ backgroundColor: "#F0FBF4" }}
      >
        <p className="text-xs font-medium" style={{ color: "#16704A" }}>
          Vista previa · editar artículo
        </p>
      </div>
      <div className="grid gap-4 p-4 lg:grid-cols-[1fr_auto]">
        <div className="space-y-3">
          <p className="text-base font-semibold" style={{ color: "#141C19" }}>
            Cola 500 ml
          </p>
          <div
            className="h-11 rounded-lg px-3 text-sm leading-[2.75rem]"
            style={{
              backgroundColor: "#FFFFFF",
              border: `2px solid ${focus}`,
              boxShadow: `0 0 0 3px ${focus}40`,
              color: "#292524",
            }}
          >
            Precio · 1.250,00
          </div>
          <p className="text-xs" style={{ color: "#78716C" }}>
            Precio de lista antes de impuestos.
          </p>
        </div>
        <div className="flex flex-col justify-end gap-2">
          <div
            className="flex h-9 w-28 items-center justify-center rounded-lg text-sm"
            style={{
              border: "1px solid #D6D3D1",
              backgroundColor: "#FFFFFF",
              color: "#44403C",
            }}
          >
            Cancelar
          </div>
          <div
            className="flex h-9 w-28 items-center justify-center rounded-lg text-sm font-medium text-white shadow-sm"
            style={{ backgroundColor: brand }}
          >
            Guardar
          </div>
        </div>
      </div>
    </div>
  )
}

export function EmphasisComparison() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Alto énfasis · vivo
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span
            className="inline-flex h-9 items-center rounded-lg px-4 text-sm font-medium text-white"
            style={{ backgroundColor: "#1E8F5A" }}
          >
            Guardar
          </span>
          <span
            className="inline-flex h-9 items-center rounded-lg px-4 text-sm font-medium text-white"
            style={{ backgroundColor: "#DC2626" }}
          >
            Eliminar
          </span>
        </div>
      </div>
      <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Bajo énfasis · bruma
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span
            className="inline-flex h-9 items-center rounded-lg border px-4 text-sm"
            style={{ borderColor: "#D6D3D1", color: "#44403C" }}
          >
            Cancelar
          </span>
          <span
            className="inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium"
            style={{ backgroundColor: "#DDF5E8", color: "#16704A" }}
          >
            Activo
          </span>
        </div>
      </div>
    </div>
  )
}

export function InteractionStatesDemo() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {[
        { label: "Reposo", border: "#D6D3D1", ring: "none" },
        { label: "Activo", border: "#16704A", ring: "0 0 0 3px #16704A40" },
        { label: "Hover menú", border: "transparent", ring: "none", bg: "#F5F5F0" },
      ].map((state) => (
        <div
          key={state.label}
          className="space-y-2 rounded-xl border border-dashed border-border/70 p-3"
        >
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {state.label}
          </p>
          <div
            className="h-11 rounded-lg px-3 text-sm leading-[2.75rem]"
            style={{
              backgroundColor: state.bg ?? "#FFFFFF",
              border: `1px solid ${state.border}`,
              boxShadow: state.ring,
              color: "#292524",
            }}
          >
            Nombre del artículo
          </div>
        </div>
      ))}
    </div>
  )
}

export function NaturePillsDemo() {
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Soft · bruma + borde
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {NATURE_PILL_VARIANTS.filter((v) => v.emphasis === "soft").map(
            (variant) => (
              <RootsNaturePill
                key={variant.id}
                variant={variant.id}
                title={variant.description}
              >
                {variant.example}
              </RootsNaturePill>
            ),
          )}
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Solid · canopy vivo
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {NATURE_PILL_VARIANTS.filter((v) => v.emphasis === "solid").map(
            (variant) => (
              <RootsNaturePill
                key={variant.id}
                variant={variant.id}
                title={variant.description}
              >
                {variant.example}
              </RootsNaturePill>
            ),
          )}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Descuentos de catálogo, badges numéricos y acentos que compiten con el
          CTA primario.
        </p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border/70">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-muted/40">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Variante
              </th>
              <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:table-cell">
                Cuándo
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Ejemplo
              </th>
            </tr>
          </thead>
          <tbody>
            {NATURE_PILL_VARIANTS.map((variant) => (
              <tr
                key={variant.id}
                className="border-b border-border/40 last:border-b-0"
              >
                <td className="px-4 py-3 align-top font-medium text-foreground">
                  {variant.label}
                </td>
                <td className="hidden px-4 py-3 align-top text-muted-foreground md:table-cell">
                  {variant.description}
                </td>
                <td className="px-4 py-3 align-top">
                  <RootsNaturePill variant={variant.id}>
                    {variant.example}
                  </RootsNaturePill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function AccentTagsDemo() {
  return (
    <div className="flex flex-wrap gap-2">
      {NATURE_ACCENTS.map((accent) => (
        <span
          key={accent.id}
          className="inline-flex rounded-full px-3 py-1 text-xs font-medium"
          style={{ backgroundColor: accent.tagBg, color: accent.tagText }}
        >
          {accent.label}
        </span>
      ))}
    </div>
  )
}

export function AccentBackgroundEmphasisDemo({ accent }: { accent: NatureAccent }) {
  const levels = [
    { label: "Más sutil", bg: accent.subtlest },
    { label: "Sutil", bg: accent.subtler },
    { label: "Medio", bg: accent.subtle },
    { label: "Intenso", bg: accent.bold },
  ]
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Cuatro niveles de énfasis — familia {accent.label}.
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {levels.map((level) => (
          <div key={level.label} className="space-y-2">
            <div
              className="h-16 rounded-xl border border-border/30"
              style={{ backgroundColor: level.bg }}
            />
            <p className="text-xs text-muted-foreground">{level.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AccentPairingDemo({ accent }: { accent: NatureAccent }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl p-4" style={{ backgroundColor: accent.subtlest }}>
        <p className="text-sm font-medium" style={{ color: accent.textDefault }}>
          Texto normal
        </p>
      </div>
      <div className="rounded-xl p-4" style={{ backgroundColor: accent.subtler }}>
        <p className="text-sm font-bold" style={{ color: accent.textBold }}>
          Texto intenso
        </p>
      </div>
      <div className="rounded-xl p-4" style={{ backgroundColor: accent.subtle }}>
        <p className="text-sm font-bold" style={{ color: accent.textBold }}>
          Solo intenso
        </p>
      </div>
      <div className="rounded-xl p-4" style={{ backgroundColor: accent.bold }}>
        <p className="text-sm font-medium text-white">Sobre intenso</p>
      </div>
    </div>
  )
}

function PickerGrid({
  rows,
  columns,
  renderCell,
}: {
  rows: { key: string; label: string }[]
  columns: NatureAccent[]
  renderCell: (accent: NatureAccent, rowKey: string) => CSSProperties
}) {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-border/70"
      style={{
        display: "grid",
        gridTemplateColumns: `auto repeat(${columns.length}, minmax(0, 1fr))`,
        gap: 1,
        backgroundColor: "rgba(0,0,0,0.06)",
      }}
    >
      <div className="bg-muted/30 p-2" />
      {columns.map((col) => (
        <div
          key={col.id}
          className="bg-muted/30 p-2 text-center text-[10px] font-medium text-muted-foreground"
        >
          {col.label}
        </div>
      ))}
      {rows.map((row) => (
        <div key={row.key} className="contents">
          <div className="flex items-center bg-card px-3 text-xs text-muted-foreground">
            {row.label}
          </div>
          {columns.map((accent) => (
            <button
              key={`${row.key}-${accent.id}`}
              type="button"
              className="h-10 hover:ring-2 hover:ring-[#1E8F5A55]"
              style={renderCell(accent, row.key)}
              aria-label={`${accent.label} ${row.label}`}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export function ColorPickerGrid({
  variant,
}: {
  variant: "text" | "background" | "chart"
}) {
  const columns = NATURE_ACCENTS.slice(0, 6)

  if (variant === "text") {
    return (
      <PickerGrid
        rows={[
          { key: "bold", label: "Intenso" },
          { key: "default", label: "Normal" },
        ]}
        columns={columns}
        renderCell={(accent, rowKey) => ({
          backgroundColor: "#FAFAF7",
          color: rowKey === "bold" ? accent.textBold : accent.textDefault,
        })}
      />
    )
  }

  if (variant === "background") {
    return (
      <PickerGrid
        rows={[
          { key: "subtlest", label: "Más sutil" },
          { key: "subtler", label: "Sutil" },
          { key: "subtle", label: "Medio" },
          { key: "bold", label: "Intenso" },
        ]}
        columns={columns}
        renderCell={(accent, rowKey) => ({
          backgroundColor:
            rowKey === "subtlest"
              ? accent.subtlest
              : rowKey === "subtler"
                ? accent.subtler
                : rowKey === "subtle"
                  ? accent.subtle
                  : accent.bold,
        })}
      />
    )
  }

  return (
    <PickerGrid
      rows={[
        { key: "soft", label: "Suave" },
        { key: "mid", label: "Medio" },
        { key: "bold", label: "Intenso" },
      ]}
      columns={columns}
      renderCell={(accent, rowKey) => ({
        backgroundColor: accent.bold,
        opacity: rowKey === "soft" ? 0.45 : rowKey === "mid" ? 0.72 : 1,
      })}
    />
  )
}

export function SingleColorChartDemo() {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4">
      <p className="text-sm font-medium">Un color · ventas del mes</p>
      <div className="mt-4 flex h-32 items-end gap-2">
        {[40, 65, 50, 80, 55, 90, 70].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-md"
            style={{
              height: `${h}%`,
              backgroundColor: i === 6 ? "#1E8F5A" : "#D6D3D1",
            }}
          />
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Canopy para el dato que importa; tierra para el resto.
      </p>
    </div>
  )
}

export function CategoricalChartDemo() {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4">
      <p className="text-sm font-medium">Categórico · ventas por rubro</p>
      <div className="mt-4 space-y-2">
        {CHART_NATURE_SEQUENCE.map((series, i) => (
          <div key={series.id} className="flex items-center gap-3">
            <div
              className="size-3 shrink-0 rounded-full"
              style={{ backgroundColor: series.hex }}
            />
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#F5F5F0]">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${90 - i * 12}%`,
                  backgroundColor: series.hex,
                }}
              />
            </div>
            <span className="w-16 text-right text-xs text-muted-foreground">
              {series.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function StatusChartDemo() {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4">
      <p className="text-sm font-medium">Estado · prioridad</p>
      <div className="mt-4 flex h-8 overflow-hidden rounded-lg">
        {CHART_STATUS_NATURE.map((status, i) => (
          <div
            key={status.id}
            className="flex-1 border-r border-white/30 last:border-r-0"
            style={{
              backgroundColor: i % 2 === 0 ? status.hex : status.boldHex,
            }}
            title={status.label}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-3">
        {CHART_STATUS_NATURE.map((status) => (
          <div key={status.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div
              className="size-2.5 rounded-full"
              style={{ backgroundColor: status.boldHex }}
            />
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
        <p className="text-xs font-medium text-muted-foreground">Resaltar segmento</p>
        <div className="mt-3 flex h-10 overflow-hidden rounded-lg">
          <div className="flex-[2] opacity-100" style={{ backgroundColor: "#1E8F5A" }} />
          <div className="flex-1 opacity-35" style={{ backgroundColor: "#06B6D4" }} />
          <div className="flex-1 opacity-35" style={{ backgroundColor: "#F59E0B" }} />
        </div>
      </div>
      <div className="rounded-xl border border-border/70 p-4">
        <p className="text-xs font-medium text-muted-foreground">Atenuar resto</p>
        <div className="mt-3 flex h-10 overflow-hidden rounded-lg">
          <div className="flex-1 opacity-30" style={{ backgroundColor: "#1E8F5A" }} />
          <div className="flex-[2]" style={{ backgroundColor: "#06B6D4" }} />
          <div className="flex-1 opacity-30" style={{ backgroundColor: "#F59E0B" }} />
        </div>
      </div>
    </div>
  )
}

export function ThemeComparison() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="overflow-hidden rounded-xl border shadow-sm" style={{ borderColor: "#A8EBC4" }}>
        <div className="px-4 py-6" style={{ backgroundColor: "#FAFAF7" }}>
          <div
            className="rounded-lg border p-3 shadow-sm"
            style={{ backgroundColor: "#FFFFFF", borderColor: "#D6D3D1" }}
          >
            <p className="text-sm font-medium" style={{ color: "#141C19" }}>
              Artículo activo
            </p>
            <p className="mt-1 text-xs" style={{ color: "#78716C" }}>
              Workspace · luz de prado
            </p>
          </div>
        </div>
        <div className="border-t px-4 py-3" style={{ borderColor: "#A8EBC4", backgroundColor: "#F0FBF4" }}>
          <p className="text-sm font-semibold" style={{ color: "#16704A" }}>
            Workspace claro
          </p>
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-border/70 shadow-sm">
        <div className="px-4 py-6" style={{ backgroundColor: "#0C1210" }}>
          <div
            className="rounded-lg border p-3"
            style={{ backgroundColor: "#141C19", borderColor: "#263530" }}
          >
            <p className="text-sm font-medium" style={{ color: "#A8EBC4" }}>
              Ticket en curso
            </p>
            <p className="mt-1 text-xs" style={{ color: "#78716C" }}>
              Mostrador · noche de bosque
            </p>
          </div>
        </div>
        <div className="border-t border-border/60 bg-muted/20 px-4 py-3">
          <p className="text-sm font-semibold text-foreground">Mostrador oscuro</p>
        </div>
      </div>
    </div>
  )
}

export function DarkModeSymmetryDemo() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70">
      <div className="grid lg:grid-cols-2">
        <div className="border-b p-4 lg:border-b-0 lg:border-r" style={{ backgroundColor: "#FAFAF7" }}>
          <p className="text-xs text-muted-foreground">Workspace claro</p>
          <div className="mt-3 flex gap-2">
            <span
              className="rounded-lg px-4 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: "#16704A" }}
            >
              Guardar
            </span>
            <span
              className="rounded-lg px-4 py-2 text-sm"
              style={{ backgroundColor: "#DDF5E8", color: "#16704A" }}
            >
              Info
            </span>
          </div>
        </div>
        <div className="p-4" style={{ backgroundColor: "#0C1210" }}>
          <p className="text-xs" style={{ color: "#78716C" }}>
            Mostrador oscuro
          </p>
          <div className="mt-3 flex gap-2">
            <span
              className="rounded-lg px-4 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: "#3FC87E" }}
            >
              Guardar
            </span>
            <span
              className="rounded-lg px-4 py-2 text-sm"
              style={{ backgroundColor: "#141C19", color: "#6DD99E" }}
            >
              Info
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AlphaOverlayDemo() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/70">
      <div className="grid grid-cols-3">
        <div style={{ backgroundColor: "#FAFAF7", height: 120 }} />
        <div style={{ backgroundColor: "#DDF5E8", height: 120 }} />
        <div style={{ backgroundColor: "#1E8F5A33", height: 120 }} />
      </div>
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div
          className="w-full max-w-sm rounded-xl border p-4 shadow-lg backdrop-blur-md"
          style={{
            backgroundColor: "rgba(255,255,255,0.82)",
            borderColor: "#D6D3D1",
          }}
        >
          <p className="text-sm font-medium text-foreground">Panel semitransparente</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Bruma sobre el paisaje — se adapta al fondo.
          </p>
        </div>
      </div>
    </div>
  )
}

