"use client"

import {
  CONCEPT_LIST_ITEMS,
  CONCEPT_PALETTE_DEMO,
  CONCEPT_TOKENS,
  ROOTSY_BRAND_CLOSING,
  ROOTSY_PRODUCT_ESSENCE,
} from "@/app/[siteId]/[popId]/library/concept/rootsyConceptSystem"
import {
  LibraryDocLead,
  LibraryDocSection,
  LibraryPrinciplesGrid,
} from "@/app/[siteId]/[popId]/library/libraryDocPrimitives"
import { cn } from "@/lib/utils"
import { Package, Plus, ShoppingBag } from "lucide-react"
import type { ReactNode } from "react"

export function ConceptDocLead({ children }: { children: ReactNode }) {
  return <LibraryDocLead className="font-canopy">{children}</LibraryDocLead>
}

export function ConceptDocSection({
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
    <LibraryDocSection id={id} title={title} description={description}>
      {children}
    </LibraryDocSection>
  )
}

function ConceptExampleLabel({ children }: { children: ReactNode }) {
  return (
    <p className="font-canopy text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
      {children}
    </p>
  )
}

function ConceptBrumaStage({
  caption,
  children,
  className,
}: {
  caption?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className="overflow-hidden rounded-2xl border"
      style={{
        backgroundColor: CONCEPT_TOKENS.bruma100,
        borderColor: CONCEPT_TOKENS.bruma200,
      }}
    >
      <div className={cn("p-5 sm:p-6", className)}>{children}</div>
      {caption ? (
        <p
          className="border-t px-4 py-3 font-canopy text-[11px] leading-relaxed"
          style={{
            borderColor: CONCEPT_TOKENS.bruma200,
            color: CONCEPT_TOKENS.bruma500,
          }}
        >
          {caption}
        </p>
      ) : null}
    </div>
  )
}

function ConceptWhiteCard({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("library-spec-card rounded-2xl border p-5", className)}>
      {children}
    </div>
  )
}

export function ConceptBrandHero() {
  return (
    <div className="library-spec-card overflow-hidden rounded-2xl border">
      <div className="flex flex-col items-center gap-6 px-6 py-12 sm:px-10 sm:py-14">
        <img
          src="/logos/rootsy/rootsy-logo-brand.svg"
          alt="Rootsy"
          className="h-10 w-auto sm:h-12"
        />
        <div className="max-w-xl space-y-3 text-center">
          <p
            className="font-canopy text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{ color: CONCEPT_TOKENS.bruma500 }}
          >
            Sistema de gestión online
          </p>
          <p
            className="font-canopy text-2xl font-bold tracking-tight sm:text-3xl"
            style={{ color: CONCEPT_TOKENS.bruma900 }}
          >
            Para cualquier tipo de negocio
          </p>
          <p
            className="font-canopy text-sm leading-relaxed"
            style={{ color: CONCEPT_TOKENS.bruma600 }}
          >
            {ROOTSY_PRODUCT_ESSENCE}
          </p>
          <p
            className="border-t pt-4 font-stream text-sm leading-relaxed"
            style={{
              borderColor: CONCEPT_TOKENS.bruma200,
              color: CONCEPT_TOKENS.bruma500,
            }}
          >
            Un mundo natural hecho digital — la mascota Rootsy habita un parque donde lo
            intuitivo y lo vivo conviven.
          </p>
        </div>
      </div>
    </div>
  )
}

export function ConceptBrandClosing() {
  return (
    <p className="max-w-3xl font-stream text-base leading-relaxed text-muted-foreground italic">
      {ROOTSY_BRAND_CLOSING}
    </p>
  )
}

export function ConceptValuesGrid({
  principles,
}: {
  principles: ReadonlyArray<{ title: string; detail: string }>
}) {
  return <LibraryPrinciplesGrid principles={principles} />
}

export function ConceptDesignPrinciplesGrid({
  principles,
}: {
  principles: ReadonlyArray<{ title: string; detail: string }>
}) {
  return <LibraryPrinciplesGrid principles={principles} />
}

export function ConceptMonolithCardDemo() {
  return (
    <ConceptBrumaStage caption="Card monolito blanco sobre bruma — un dato principal, metadatos discretos y savia solo en la acción.">
      <div className="flex min-h-[200px] items-center justify-center">
        <ConceptWhiteCard className="w-full max-w-sm">
          <div className="mb-4 flex items-center justify-between">
            <p
              className="font-canopy text-sm font-semibold"
              style={{ color: CONCEPT_TOKENS.bruma900 }}
            >
              Resumen del día
            </p>
            <span
              className="font-canopy rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
              style={{ backgroundColor: CONCEPT_TOKENS.savia50, color: CONCEPT_TOKENS.savia800 }}
            >
              Activo
            </span>
          </div>
          <p
            className="font-ledger text-3xl font-bold tabular-nums tracking-tight"
            style={{ color: CONCEPT_TOKENS.bruma900 }}
          >
            $ 48.320
          </p>
          <p className="mt-1 font-canopy text-sm" style={{ color: CONCEPT_TOKENS.bruma500 }}>
            12 ventas · ticket promedio $ 4.027
          </p>
          <button
            type="button"
            className="mt-5 rounded-lg px-4 py-2 font-canopy text-sm font-medium text-white"
            style={{ backgroundColor: CONCEPT_TOKENS.savia600 }}
          >
            Ver detalle
          </button>
        </ConceptWhiteCard>
      </div>
    </ConceptBrumaStage>
  )
}

export function ConceptPaletteDemo() {
  return (
    <ConceptWhiteCard>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {CONCEPT_PALETTE_DEMO.map((swatch) => (
          <div key={swatch.label} className="space-y-2">
            <div
              className={cn(
                "aspect-[4/3] rounded-xl border",
                swatch.hex === CONCEPT_TOKENS.white && "border-[#DFE4EA]",
              )}
              style={{
                backgroundColor: swatch.hex,
                borderColor:
                  swatch.hex === CONCEPT_TOKENS.white ? CONCEPT_TOKENS.bruma200 : "transparent",
              }}
            />
            <div>
              <p className="font-canopy text-[11px] font-semibold text-foreground">{swatch.label}</p>
              <p className="font-mono text-[10px] text-muted-foreground">{swatch.hex}</p>
              <p className="font-canopy text-[10px] text-muted-foreground">{swatch.role}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 font-canopy text-sm leading-relaxed text-muted-foreground">
        Bruma como niebla de fondo. Savia como el verde de una planta entre la bruma —
        reservado para acción y énfasis.
      </p>
    </ConceptWhiteCard>
  )
}

export function ConceptListDemo() {
  return (
    <ConceptBrumaStage caption="Lista con pocas columnas — nombre, contexto y monto. La fila activa se marca con savia, sin decoración extra.">
      <ConceptWhiteCard className="p-0 overflow-hidden">
        <div
          className="border-b px-4 py-3"
          style={{ borderColor: CONCEPT_TOKENS.bruma200, backgroundColor: CONCEPT_TOKENS.bruma50 }}
        >
          <p
            className="font-canopy text-xs font-semibold uppercase tracking-wide"
            style={{ color: CONCEPT_TOKENS.bruma500 }}
          >
            Tu pedido
          </p>
        </div>
        <ul>
          {CONCEPT_LIST_ITEMS.map((item, index) => (
            <li
              key={item.name}
              className="flex items-center justify-between gap-3 px-4 py-3"
              style={{
                borderBottom:
                  index < CONCEPT_LIST_ITEMS.length - 1
                    ? `1px solid ${CONCEPT_TOKENS.bruma200}`
                    : undefined,
                backgroundColor: item.active ? CONCEPT_TOKENS.savia50 : CONCEPT_TOKENS.white,
              }}
            >
              <div className="min-w-0">
                <p
                  className="truncate font-canopy text-sm font-medium"
                  style={{ color: CONCEPT_TOKENS.bruma900 }}
                >
                  {item.name}
                </p>
                <p className="font-canopy text-xs" style={{ color: CONCEPT_TOKENS.bruma500 }}>
                  {item.meta}
                </p>
              </div>
              <p
                className="shrink-0 font-ledger text-sm font-semibold tabular-nums"
                style={{ color: CONCEPT_TOKENS.bruma900 }}
              >
                {item.price}
              </p>
            </li>
          ))}
        </ul>
      </ConceptWhiteCard>
    </ConceptBrumaStage>
  )
}

export function ConceptButtonsDemo() {
  return (
    <ConceptWhiteCard>
      <p className="mb-4 font-canopy text-sm font-medium" style={{ color: CONCEPT_TOKENS.bruma900 }}>
        Confirmar venta
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-lg px-4 py-2 font-canopy text-sm font-medium text-white"
          style={{ backgroundColor: CONCEPT_TOKENS.savia600 }}
        >
          Cobrar $ 8.500
        </button>
        <button
          type="button"
          className="rounded-lg border px-4 py-2 font-canopy text-sm font-medium"
          style={{
            borderColor: CONCEPT_TOKENS.bruma200,
            color: CONCEPT_TOKENS.bruma900,
            backgroundColor: CONCEPT_TOKENS.white,
          }}
        >
          Guardar borrador
        </button>
        <button
          type="button"
          className="rounded-lg px-4 py-2 font-canopy text-sm font-medium"
          style={{ color: CONCEPT_TOKENS.bruma500 }}
        >
          Cancelar
        </button>
      </div>
      <p className="mt-4 font-canopy text-xs leading-relaxed" style={{ color: CONCEPT_TOKENS.bruma500 }}>
        Una acción primaria clara. Secundaria con borde. Terciaria solo texto — sin variantes raras.
      </p>
    </ConceptWhiteCard>
  )
}

export function ConceptFieldDemo() {
  return (
    <ConceptWhiteCard>
      <label className="block space-y-2">
        <span className="font-canopy text-sm font-medium" style={{ color: CONCEPT_TOKENS.bruma900 }}>
          Nombre del artículo
        </span>
        <input
          readOnly
          value="Medialuna clásica"
          className="w-full rounded-lg border px-3 py-2 font-canopy text-sm outline-none"
          style={{
            borderColor: CONCEPT_TOKENS.bruma200,
            backgroundColor: CONCEPT_TOKENS.white,
            color: CONCEPT_TOKENS.bruma900,
          }}
        />
        <span className="block font-canopy text-xs" style={{ color: CONCEPT_TOKENS.bruma500 }}>
          Nombre comercial visible en ventas y catálogo.
        </span>
      </label>
      <p className="mt-4 font-canopy text-xs leading-relaxed" style={{ color: CONCEPT_TOKENS.bruma500 }}>
        Label, campo y ayuda — tres niveles, sin íconos ni adornos innecesarios.
      </p>
    </ConceptWhiteCard>
  )
}

export function ConceptTypeScaleDemo() {
  return (
    <ConceptWhiteCard className="space-y-4">
      <div>
        <p
          className="font-canopy text-2xl font-bold tracking-tight"
          style={{ color: CONCEPT_TOKENS.bruma900 }}
        >
          Ventas de hoy
        </p>
        <p className="mt-1 font-canopy text-sm" style={{ color: CONCEPT_TOKENS.bruma500 }}>
          Resumen del turno · actualizado hace 5 min
        </p>
      </div>
      <p
        className="font-canopy text-sm leading-relaxed"
        style={{ color: CONCEPT_TOKENS.bruma900 }}
      >
        Doce ventas cerradas con un ticket promedio saludable. Los productos de panadería
        concentran el volumen de la mañana.
      </p>
      <p
        className="font-ledger text-3xl font-bold tabular-nums tracking-tight"
        style={{ color: CONCEPT_TOKENS.bruma900 }}
      >
        $ 48.320
      </p>
      <p className="font-canopy text-xs" style={{ color: CONCEPT_TOKENS.bruma500 }}>
        Total del día
      </p>
      <p className="font-canopy text-xs leading-relaxed" style={{ color: CONCEPT_TOKENS.bruma500 }}>
        Título → contexto → cuerpo → monto → metadato. UI en Nunito, montos en Inter.
      </p>
    </ConceptWhiteCard>
  )
}

export function ConceptPosSplitDemo() {
  const navItems = [
    { label: "Vender", active: true, icon: ShoppingBag },
    { label: "Artículos", active: false, icon: Package },
    { label: "Operaciones", active: false, icon: Plus },
  ] as const

  return (
    <ConceptBrumaStage
      className="!p-0"
      caption="Split ceniza + bruma del POS — oscuro para navegar, claro para trabajar. Dos atmósferas, un mismo sistema."
    >
      <div className="flex min-h-[240px] overflow-hidden rounded-xl">
        <div
          className="flex w-36 shrink-0 flex-col gap-1 p-3 sm:w-44"
          style={{ backgroundColor: CONCEPT_TOKENS.ceniza900 }}
        >
          <p className="mb-3 px-2 font-canopy text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
            Mostrador
          </p>
          {navItems.map(({ label, active, icon: Icon }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-lg px-2 py-2 font-canopy text-xs font-medium"
              style={{
                backgroundColor: active ? CONCEPT_TOKENS.ceniza700 : "transparent",
                color: active ? CONCEPT_TOKENS.white : "#94A3B8",
              }}
            >
              <Icon className="size-3.5 shrink-0" style={{ color: active ? CONCEPT_TOKENS.savia500 : "#64748B" }} />
              {label}
            </div>
          ))}
        </div>
        <div className="min-w-0 flex-1 p-4" style={{ backgroundColor: CONCEPT_TOKENS.bruma100 }}>
          <ConceptWhiteCard>
            <p className="font-canopy text-sm font-semibold" style={{ color: CONCEPT_TOKENS.bruma900 }}>
              Ticket abierto
            </p>
            <p className="mt-1 font-canopy text-xs" style={{ color: CONCEPT_TOKENS.bruma500 }}>
              3 ítems · mesa 4
            </p>
            <div
              className="mt-4 flex items-center justify-between rounded-lg px-3 py-2"
              style={{ backgroundColor: CONCEPT_TOKENS.bruma50 }}
            >
              <span className="font-canopy text-sm" style={{ color: CONCEPT_TOKENS.bruma900 }}>
                Total
              </span>
              <span
                className="font-ledger text-sm font-semibold tabular-nums"
                style={{ color: CONCEPT_TOKENS.bruma900 }}
              >
                $ 8.500
              </span>
            </div>
            <button
              type="button"
              className="mt-4 w-full rounded-lg py-2 font-canopy text-sm font-medium text-white"
              style={{ backgroundColor: CONCEPT_TOKENS.savia600 }}
            >
              Cobrar
            </button>
          </ConceptWhiteCard>
        </div>
      </div>
    </ConceptBrumaStage>
  )
}

export function ConceptEmptyStateDemo() {
  return (
    <ConceptWhiteCard className="flex min-h-[180px] flex-col items-center justify-center text-center">
      <div
        className="mb-3 flex size-10 items-center justify-center rounded-full"
        style={{ backgroundColor: CONCEPT_TOKENS.bruma50 }}
      >
        <Package className="size-5" style={{ color: CONCEPT_TOKENS.bruma500 }} />
      </div>
      <p className="font-canopy text-sm font-medium" style={{ color: CONCEPT_TOKENS.bruma900 }}>
        Todavía no hay ventas hoy
      </p>
      <p
        className="mt-1 max-w-[220px] font-canopy text-xs leading-relaxed"
        style={{ color: CONCEPT_TOKENS.bruma500 }}
      >
        Cuando cierres la primera, el resumen aparece acá.
      </p>
      <button
        type="button"
        className="mt-4 rounded-lg px-4 py-2 font-canopy text-sm font-medium text-white"
        style={{ backgroundColor: CONCEPT_TOKENS.savia600 }}
      >
        Ir a vender
      </button>
      <p className="mt-4 font-canopy text-[11px] leading-relaxed" style={{ color: CONCEPT_TOKENS.bruma500 }}>
        Un mensaje, una acción. Sin ilustraciones complejas ni copy largo.
      </p>
    </ConceptWhiteCard>
  )
}

export function ConceptBadgeDemo() {
  const badges = [
    { label: "Pagado", bg: CONCEPT_TOKENS.savia50, text: CONCEPT_TOKENS.savia800 },
    { label: "Pendiente", bg: CONCEPT_TOKENS.bruma50, text: CONCEPT_TOKENS.bruma600 },
    { label: "Anulado", bg: "#FEF2F2", text: "#B91C1C" },
  ] as const

  return (
    <ConceptWhiteCard>
      <div className="flex flex-wrap gap-2">
        {badges.map((badge) => (
          <span
            key={badge.label}
            className="font-canopy rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
            style={{ backgroundColor: badge.bg, color: badge.text }}
          >
            {badge.label}
          </span>
        ))}
      </div>
      <p className="mt-4 font-canopy text-xs leading-relaxed" style={{ color: CONCEPT_TOKENS.bruma500 }}>
        Pills suaves — color de fondo tenue, texto legible. Savia solo cuando el estado es positivo o activo.
      </p>
    </ConceptWhiteCard>
  )
}

export function ConceptExamplesGrid() {
  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <ConceptExampleLabel>Superficie</ConceptExampleLabel>
          <ConceptMonolithCardDemo />
        </div>
        <div className="space-y-3">
          <ConceptExampleLabel>Paleta</ConceptExampleLabel>
          <ConceptPaletteDemo />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <ConceptExampleLabel>Lista</ConceptExampleLabel>
          <ConceptListDemo />
        </div>
        <div className="space-y-3">
          <ConceptExampleLabel>Botones</ConceptExampleLabel>
          <ConceptButtonsDemo />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <ConceptExampleLabel>Campo</ConceptExampleLabel>
          <ConceptFieldDemo />
        </div>
        <div className="space-y-3">
          <ConceptExampleLabel>Jerarquía tipográfica</ConceptExampleLabel>
          <ConceptTypeScaleDemo />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <ConceptExampleLabel>Estados</ConceptExampleLabel>
          <ConceptBadgeDemo />
        </div>
        <div className="space-y-3">
          <ConceptExampleLabel>Estado vacío</ConceptExampleLabel>
          <ConceptEmptyStateDemo />
        </div>
      </div>

      <div className="space-y-3">
        <ConceptExampleLabel>Split POS</ConceptExampleLabel>
        <ConceptPosSplitDemo />
      </div>
    </div>
  )
}

/** @deprecated Usar ConceptExamplesGrid */
export function ConceptExamplesRow() {
  return <ConceptExamplesGrid />
}
