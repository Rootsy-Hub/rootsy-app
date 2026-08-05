"use client"

import {
  BANNERS_UI_DEMO_COPY,
  BANNERS_UI_DENSITIES,
  BANNERS_UI_INTENTS,
  BANNERS_UI_LAYOUTS,
  getBannerActionUiStyle,
  getBannerContentStackUiStyle,
  getBannerDismissUiStyle,
  getBannerIconUiStyle,
  getBannerMessageUiStyle,
  getBannerRowUiStyle,
  getBannerTitleUiStyle,
  getBannerUiSurface,
  type BannerDensityId,
  type BannerIntentId,
  type BannerLayoutId,
} from "@/app/[siteId]/[popId]/library/ui-components/bannersUiHardcodedSpec"
import {
  FORM_UI_CONTROL_TYPOGRAPHY,
  FORM_UI_LABEL_STYLE,
  getFormControlSpec,
  getFormControlUiSurface,
} from "@/app/[siteId]/[popId]/library/ui-components/formsUiHardcodedSpec"
import { COLOR_TOKENS } from "@/app/[siteId]/[popId]/library/color/rootsyColorSystem"
import { FoundationBrumaStage } from "@/app/[siteId]/[popId]/library/libraryFoundationDocShared"
import { rootsySpacePx } from "@/lib/design-system"
import type { CSSProperties, ReactNode } from "react"

function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="space-y-1">
      <h2 className="font-canopy text-base font-semibold" style={{ color: COLOR_TOKENS.bruma900 }}>
        {title}
      </h2>
      {description ? (
        <p className="font-canopy text-xs leading-relaxed" style={{ color: COLOR_TOKENS.bruma500 }}>
          {description}
        </p>
      ) : null}
    </div>
  )
}

function SpecBlock({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <div>
        <h3
          className="font-mono text-[11px] font-medium uppercase tracking-[0.12em]"
          style={{ color: COLOR_TOKENS.bruma500 }}
        >
          {title}
        </h3>
        {hint ? (
          <p className="mt-1 font-canopy text-xs leading-relaxed" style={{ color: COLOR_TOKENS.bruma500 }}>
            {hint}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

function VariantSpecCell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-[14rem] max-w-[28rem] flex-1 flex-col gap-1.5">
      {children}
      <span
        className="font-mono text-[10px] uppercase tracking-[0.08em]"
        style={{ color: COLOR_TOKENS.bruma500 }}
      >
        {label}
      </span>
    </div>
  )
}

function VariantRow({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-start gap-4">{children}</div>
}

function BannerIntentIcon({ intent }: { intent: BannerIntentId }) {
  const style = getBannerIconUiStyle(intent)

  if (intent === "success") {
    return (
      <svg viewBox="0 0 16 16" fill="none" style={style} aria-hidden>
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.25" />
        <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (intent === "danger") {
    return (
      <svg viewBox="0 0 16 16" fill="none" style={style} aria-hidden>
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.25" />
        <path d="M8 5v4M8 11h.01" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    )
  }

  if (intent === "warning") {
    return (
      <svg viewBox="0 0 16 16" fill="none" style={style} aria-hidden>
        <path
          d="M8 2.5L14.5 13H1.5L8 2.5Z"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinejoin="round"
        />
        <path d="M8 6.5v3M8 11h.01" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    )
  }

  if (intent === "info") {
    return (
      <svg viewBox="0 0 16 16" fill="none" style={style} aria-hidden>
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.25" />
        <path d="M8 7v4M8 5.5h.01" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 16 16" fill="none" style={style} aria-hidden>
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.25" />
      <path d="M8 7.5v3.5M8 5.5h.01" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  )
}

function BannerDismissButton() {
  const dismiss = getBannerDismissUiStyle()

  return (
    <button
      type="button"
      aria-label="Cerrar"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: dismiss.sizePx,
        height: dismiss.sizePx,
        border: "none",
        background: "transparent",
        color: dismiss.color,
        borderRadius: dismiss.borderRadiusPx,
        cursor: "default",
        flexShrink: 0,
        padding: 0,
      }}
    >
      <svg viewBox="0 0 16 16" width={rootsySpacePx("200")} height={rootsySpacePx("200")} aria-hidden>
        <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    </button>
  )
}

function HardcodedBanner({
  intent,
  density = "default",
  layout = "title-message",
  showIcon = true,
  fullWidth = false,
}: {
  intent: BannerIntentId
  density?: BannerDensityId
  layout?: BannerLayoutId
  showIcon?: boolean
  fullWidth?: boolean
}) {
  const surface = getBannerUiSurface(intent, density)
  const copy =
    intent === "neutral" ||
    intent === "info" ||
    intent === "success" ||
    intent === "warning" ||
    intent === "danger"
      ? BANNERS_UI_DEMO_COPY[intent]
      : BANNERS_UI_DEMO_COPY.neutral
  const rowStyle = getBannerRowUiStyle()
  const stackStyle = getBannerContentStackUiStyle()
  const titleStyle = getBannerTitleUiStyle()
  const messageStyle = getBannerMessageUiStyle(intent)
  const actionStyle = getBannerActionUiStyle(intent)

  const shellStyle: CSSProperties = {
    ...surface,
    width: fullWidth ? "100%" : undefined,
    maxWidth: fullWidth ? undefined : surface.maxWidthPx,
    boxSizing: "border-box",
  }

  const messageOnlyCopy =
    layout === "message" && (intent === "neutral" || intent === "danger")
      ? BANNERS_UI_DEMO_COPY.messageOnly[intent]
      : copy.message

  return (
    <div style={shellStyle} role="status">
      <div style={rowStyle}>
        {showIcon ? <BannerIntentIcon intent={intent} /> : null}
        <div style={{ ...rowStyle, flex: 1, minWidth: 0, alignItems: layout === "message" ? "center" : "flex-start" }}>
          <div style={layout === "message" ? { flex: 1, minWidth: 0 } : stackStyle}>
            {layout !== "message" ? <p style={{ ...titleStyle, margin: 0 }}>{copy.title}</p> : null}
            <p style={{ ...messageStyle, margin: 0 }}>
              {layout === "message" ? messageOnlyCopy : copy.message}
            </p>
          </div>
          {layout === "with-action" ? (
            <button
              type="button"
              style={{
                ...actionStyle,
                border: "none",
                background: "transparent",
                padding: 0,
                cursor: "default",
                flexShrink: 0,
              }}
            >
              {copy.action}
            </button>
          ) : null}
          {layout === "dismissible" ? <BannerDismissButton /> : null}
        </div>
      </div>
    </div>
  )
}

function HardcodedMiniField({ label, error }: { label: string; error?: boolean }) {
  const spec = getFormControlSpec("text")
  const surface = getFormControlUiSurface(error ? "error" : "default")

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: rootsySpacePx("100") }}>
      <span aria-hidden style={FORM_UI_LABEL_STYLE}>
        {label}
      </span>
      <div
        aria-hidden
        style={{
          ...FORM_UI_CONTROL_TYPOGRAPHY,
          display: "flex",
          alignItems: "center",
          height: spec.heightPx,
          paddingLeft: spec.paddingXPx,
          paddingRight: spec.paddingXPx,
          borderRadius: spec.radiusPx,
          backgroundColor: surface.backgroundColor,
          color: surface.color,
          border: surface.border,
          boxShadow: surface.boxShadow,
        }}
      >
        {error ? null : "Ej. Café orgánico 250g"}
      </div>
    </div>
  )
}

function BannerIntentVariantsBlock() {
  return (
    <SpecBlock title="banner.intent · variantes" hint="neutral · info · success · warning · danger — tint 8% · borde 25%.">
      <VariantRow>
        {BANNERS_UI_INTENTS.map((intent) => (
          <VariantSpecCell key={intent.id} label={intent.token}>
            <HardcodedBanner intent={intent.id} />
          </VariantSpecCell>
        ))}
      </VariantRow>
    </SpecBlock>
  )
}

function BannerDensityVariantsBlock() {
  return (
    <SpecBlock title="banner.density · variantes" hint="default space.150×200 · compact space.100×150.">
      <VariantRow>
        {BANNERS_UI_DENSITIES.map((density) => (
          <VariantSpecCell key={density.id} label={density.token}>
            <HardcodedBanner intent="info" density={density.id} />
          </VariantSpecCell>
        ))}
      </VariantRow>
    </SpecBlock>
  )
}

function BannerLayoutVariantsBlock() {
  const layouts: { id: BannerLayoutId; intent: BannerIntentId }[] = [
    { id: "message", intent: "neutral" },
    { id: "title-message", intent: "success" },
    { id: "with-action", intent: "warning" },
    { id: "dismissible", intent: "info" },
  ]

  return (
    <SpecBlock title="banner.layout · variantes" hint="message · title-message · with-action · dismissible.">
      <VariantRow>
        {layouts.map(({ id, intent }) => {
          const layoutMeta = BANNERS_UI_LAYOUTS.find((item) => item.id === id)!
          return (
            <VariantSpecCell key={id} label={layoutMeta.token}>
              <HardcodedBanner intent={intent} layout={id} />
            </VariantSpecCell>
          )
        })}
      </VariantRow>
    </SpecBlock>
  )
}

function BannerInContextBlock() {
  return (
    <SpecBlock
      title="banner.in-context · formulario"
      hint="danger arriba del stack · field-stack space.100 — sin sombra, borde semántico."
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: rootsySpacePx("200"),
          maxWidth: 420,
          width: "100%",
        }}
      >
        <HardcodedBanner intent="danger" layout="message" fullWidth />
        <HardcodedMiniField label="Nombre del artículo" error />
      </div>
    </SpecBlock>
  )
}

export function BannersUiHardcodedGallery() {
  return (
    <div className="space-y-10">
      <FoundationBrumaStage caption="radius.large · space.150 gap · tint semántico 8% · sin shadow.">
        <div className="space-y-8">
          <SectionHeading
            title="Anatomía"
            description="Ícono space.200 · título body medium · mensaje body.small · borde bruma o semántico."
          />
          <HardcodedBanner intent="success" layout="title-message" fullWidth />
        </div>
      </FoundationBrumaStage>

      <FoundationBrumaStage caption="banner.intent · status-success · status-warning · status-danger · savia teal info.">
        <div className="space-y-8">
          <SectionHeading
            title="Intents"
            description="Cinco intents — neutral sunken; semánticos con tint y textHex del token."
          />
          <BannerIntentVariantsBlock />
        </div>
      </FoundationBrumaStage>

      <FoundationBrumaStage caption="banner.density · banner.layout · dismiss space.400 · action body.small medium.">
        <div className="space-y-8">
          <SectionHeading
            title="Densidad y layout"
            description="Compacto para hints densos · acción y dismiss en la misma fila que el contenido."
          />
          <BannerDensityVariantsBlock />
          <BannerLayoutVariantsBlock />
        </div>
      </FoundationBrumaStage>

      <FoundationBrumaStage caption="banner.in-context · field-stack · validación inline.">
        <div className="space-y-8">
          <SectionHeading
            title="En contexto"
            description="Banner de error sobre campos — alineado a Formulario UI y color.border."
          />
          <BannerInContextBlock />
        </div>
      </FoundationBrumaStage>
    </div>
  )
}
