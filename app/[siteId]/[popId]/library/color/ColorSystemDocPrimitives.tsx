"use client"

import type {
  ColorTheme,
  ComplementaryPairing,
  ContrastPair,
  SemanticToken,
  SurfaceLayer,
} from "@/app/[siteId]/[popId]/library/color/rootsyColorSystem"
import {
  ROOTSY_CHART_SEQUENCE,
  ROOTSY_CHART_STATUS,
  ROOTSY_COLOR_ROLES,
  ROOTSY_INTERACTION_STATES,
  ROOTSY_PRODUCT_EMPHASIS,
  ROOTSY_THEMES,
} from "@/app/[siteId]/[popId]/library/color/rootsyColorSystem"

const PRODUCT_HERO_GRADIENT =
  "linear-gradient(135deg, #070A09 0%, #1A2027 28%, #059669 62%, #EEF1F5 100%)"

export function ColorSystemHero() {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-border/70 shadow-sm"
      style={{ background: PRODUCT_HERO_GRADIENT }}
    >
      <div className="space-y-2 px-6 py-8 sm:px-8 sm:py-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
          Rootsy · Sistema de color
        </p>
        <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Ceniza, bruma, savia, landing
        </h2>
        <p className="max-w-xl text-sm leading-relaxed text-white/85">
          Cuatro familias extraídas de pantallas reales — mostrador, ticket, acción y hero.
          Sin paletas decorativas paralelas.
        </p>
      </div>
    </div>
  )
}

export function ThemePreviewCard({ theme }: { theme: ColorTheme }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 shadow-sm">
      <div className="p-4" style={{ backgroundColor: theme.shell }}>
        <div
          className="overflow-hidden rounded-xl border"
          style={{
            backgroundColor: theme.surface,
            borderColor: theme.border,
          }}
        >
          <div
            className="flex items-center justify-between border-b px-3 py-2"
            style={{ borderColor: theme.border }}
          >
            <span
              className="text-xs font-semibold"
              style={{ color: theme.textPrimary }}
            >
              {theme.label}
            </span>
            <span className="text-[10px]" style={{ color: theme.textSecondary }}>
              {theme.subtitle}
            </span>
          </div>
          <div className="space-y-2 p-3">
            <div
              className="rounded-lg px-3 py-2 text-xs"
              style={{
                backgroundColor: theme.elevated,
                color: theme.textPrimary,
                border: `1px solid ${theme.border}`,
              }}
            >
              Superficie elevada
            </div>
            <div className="flex gap-2">
              <span
                className="inline-flex h-8 flex-1 items-center justify-center rounded-lg text-xs font-medium"
                style={{
                  backgroundColor: theme.action,
                  color: theme.actionText,
                }}
              >
                Acción
              </span>
              <span
                className="inline-flex h-8 items-center justify-center rounded-lg px-3 text-xs"
                style={{
                  color: theme.accent,
                  border: `1px solid ${theme.accent}55`,
                }}
              >
                Foco
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-1 border-t border-border/60 bg-card px-4 py-3">
        <p className="text-sm font-semibold text-foreground">{theme.label}</p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {theme.description}
        </p>
      </div>
    </div>
  )
}

export function ThemeGallery() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {ROOTSY_THEMES.map((theme) => (
        <ThemePreviewCard key={theme.id} theme={theme} />
      ))}
    </div>
  )
}

export function SemanticTokenTable({ tokens }: { tokens: SemanticToken[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-muted/40">
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Token
            </th>
            <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:table-cell">
              Uso
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Muestra
            </th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((token) => (
            <tr key={token.id} className="border-b border-border/40 last:border-b-0">
              <td className="px-4 py-3 align-top">
                <p className="font-medium text-foreground">{token.label}</p>
                <code className="mt-0.5 block text-[11px] text-muted-foreground">
                  {token.token}
                </code>
              </td>
              <td className="hidden px-4 py-3 align-top text-muted-foreground md:table-cell">
                {token.usage}
              </td>
              <td className="px-4 py-3 align-top">
                <span
                  className="inline-flex min-w-28 rounded-lg border px-2.5 py-1 text-xs font-medium"
                  style={{
                    backgroundColor: token.hex,
                    color: token.textHex ?? "#FFFFFF",
                    borderColor: token.borderHex ?? "transparent",
                  }}
                >
                  {token.hex}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function ProductRoleTable() {
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
          {ROOTSY_COLOR_ROLES.map((role) => (
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
                    borderColor: role.border ?? "transparent",
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

export function ProductEmphasisGallery() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {ROOTSY_PRODUCT_EMPHASIS.map((family) => (
        <div key={family.id} className="space-y-3">
          <p className="text-sm font-semibold text-foreground">{family.label}</p>
          <div className="grid grid-cols-4 gap-2">
            {family.levels.map((level) => (
              <div key={level.id} className="space-y-1.5">
                <div
                  className="h-14 rounded-lg border border-border/40"
                  style={{ backgroundColor: level.hex }}
                />
                <p className="text-[10px] leading-tight text-muted-foreground">
                  {level.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

const HARMONY_LABELS: Record<ComplementaryPairing["harmony"], string> = {
  split: "Split",
  analogous: "Análogo",
  complementary: "Complementario",
  "neutral-action": "Neutro + acción",
}

export function PairingCard({ pairing }: { pairing: ComplementaryPairing }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
      <div className="flex h-20">
        <div className="flex-1" style={{ backgroundColor: pairing.primary.hex }} />
        <div className="flex-1" style={{ backgroundColor: pairing.secondary.hex }} />
        {pairing.accent ? (
          <div className="w-1/4" style={{ backgroundColor: pairing.accent.hex }} />
        ) : null}
      </div>
      <div className="space-y-2 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-foreground">{pairing.title}</p>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {HARMONY_LABELS[pairing.harmony]}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{pairing.description}</p>
        <p className="text-xs leading-relaxed text-foreground/80">
          <span className="font-medium">Uso: </span>
          {pairing.usage}
        </p>
      </div>
    </div>
  )
}

export function ContrastTable({ pairs }: { pairs: ContrastPair[] }) {
  const levelStyles: Record<ContrastPair["level"], string> = {
    AAA: "bg-[#D1FAE5] text-[#065F46]",
    AA: "bg-[#EEF1F5] text-[#334155]",
    Fail: "bg-[#FEE2E2] text-[#991B1B]",
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-muted/40">
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Par
            </th>
            <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:table-cell">
              Contexto
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Ratio
            </th>
          </tr>
        </thead>
        <tbody>
          {pairs.map((pair) => (
            <tr key={pair.id} className="border-b border-border/40 last:border-b-0">
              <td className="px-4 py-3 align-top">
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-9 w-16 overflow-hidden rounded-md border border-border/50"
                    style={{ backgroundColor: pair.background }}
                  >
                    <span
                      className="m-auto text-[10px] font-bold"
                      style={{ color: pair.foreground }}
                    >
                      Aa
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    <p>{pair.foreground}</p>
                    <p>{pair.background}</p>
                  </div>
                </div>
              </td>
              <td className="hidden px-4 py-3 align-top text-muted-foreground sm:table-cell">
                {pair.context}
              </td>
              <td className="px-4 py-3 align-top">
                <p className="font-medium tabular-nums text-foreground">{pair.ratio}</p>
                <span
                  className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${levelStyles[pair.level]}`}
                >
                  {pair.level}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function SurfaceStackDemo({
  themeId,
  layers,
}: {
  themeId: string
  layers: SurfaceLayer[]
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {themeId}
      </p>
      <div className="space-y-1.5">
        {layers.map((layer) => (
          <div
            key={layer.level}
            className="flex items-center gap-3 rounded-xl border border-border/60 px-3 py-2"
            style={{
              marginLeft: `${layer.level * 12}px`,
              backgroundColor: layer.hex.length === 9 ? undefined : layer.hex,
              background: layer.hex.length === 9 ? layer.hex : undefined,
            }}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-black/10 text-[10px] font-bold">
              {layer.level}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{layer.label}</p>
              <p className="truncate text-[11px] text-muted-foreground">
                {layer.token} · {layer.usage}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function InteractionStatesGallery() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {ROOTSY_INTERACTION_STATES.map((state) => (
        <div
          key={state.id}
          className="space-y-2 rounded-xl border border-dashed border-border/70 p-3"
        >
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {state.label}
            <span className="ml-1 normal-case text-muted-foreground/70">
              · {state.context}
            </span>
          </p>
          <div
            className="h-11 rounded-lg px-3 text-sm leading-11"
            style={{
              backgroundColor: state.background,
              border: `1px solid ${state.border}`,
              boxShadow: state.ring,
              color: state.context === "pos" ? "#F8FAFC" : "#121417",
            }}
          >
            Campo de ejemplo
          </div>
        </div>
      ))}
    </div>
  )
}

export function PosSplitDemo() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 shadow-sm">
      <div className="grid min-h-[200px] lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-3 p-4" style={{ backgroundColor: "#20262E" }}>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
            Ceniza · catálogo
          </p>
          <div
            className="rounded-lg p-3"
            style={{ backgroundColor: "#252B34", border: "1px solid #334155" }}
          >
            <p className="text-sm font-medium text-[#F8FAFC]">Cola 500 ml</p>
            <p className="mt-1 text-xs text-[#94A3B8]">$1.250</p>
          </div>
          <span
            className="inline-flex rounded-lg px-3 py-1.5 text-xs font-medium text-white"
            style={{ backgroundColor: "#059669" }}
          >
            Vender
          </span>
        </div>
        <div className="space-y-3 p-4" style={{ backgroundColor: "#EEF1F5" }}>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
            Bruma · ticket
          </p>
          <p className="text-sm font-medium text-[#121417]">Tu pedido</p>
          <div
            className="rounded-lg px-3 py-2 text-xs"
            style={{ backgroundColor: "#F4F6F9", color: "#121417" }}
          >
            1× Cola 500 ml
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProductSingleChartDemo() {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4">
      <p className="text-sm font-medium">Serie única · ventas</p>
      <div className="mt-4 flex h-32 items-end gap-2">
        {[40, 65, 50, 80, 55, 90, 70].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-md"
            style={{
              height: `${h}%`,
              backgroundColor: i === 6 ? "#059669" : "#DFE4EA",
            }}
          />
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Savia 600 para el dato clave; bruma 200 para el resto.
      </p>
    </div>
  )
}

export function ProductCategoricalChartDemo() {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4">
      <p className="text-sm font-medium">Categórico · rubros</p>
      <div className="mt-4 space-y-2">
        {ROOTSY_CHART_SEQUENCE.map((series, i) => (
          <div key={series.id} className="flex items-center gap-3">
            <div
              className="size-3 shrink-0 rounded-full"
              style={{ backgroundColor: series.hex }}
            />
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#EEF1F5]">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${90 - i * 14}%`,
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

export function ProductStatusChartDemo() {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4">
      <p className="text-sm font-medium">Estados</p>
      <div className="mt-4 flex h-8 overflow-hidden rounded-lg">
        {ROOTSY_CHART_STATUS.map((status, i) => (
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
        {ROOTSY_CHART_STATUS.map((status) => (
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
