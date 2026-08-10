"use client"

import {
  BANNERS_UI_DEMO_COPY,
  BANNERS_UI_DENSITIES,
  BANNERS_UI_INTENTS,
  BANNERS_UI_LAYOUTS,
} from "@/app/library/ui-components/bannersUiHardcodedSpec"
import {
  FORM_UI_CONTROL_TYPOGRAPHY,
  FORM_UI_LABEL_STYLE,
  getFormControlSpec,
  getFormControlUiSurface,
} from "@/app/library/ui-components/formsUiHardcodedSpec"
import { ROOTSY_BANNER_MANIFESTO } from "@/app/library/banner/rootsyBannerSystem"
import { FoundationBrumaStage } from "@/app/library/libraryFoundationDocShared"
import { COLOR_TOKENS } from "@/app/library/color/rootsyColorSystem"
import { rootsySpacePx } from "@/lib/design-system"
import { RootsBanner } from "@/components/rootsy-banner"
import type { BannerDensityId, BannerIntentId, BannerLayoutId } from "@/components/rootsy-banner"
import { useState, type ReactNode } from "react"

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

function LiveBanner({
  intent,
  density = "default",
  layout = "title-message",
  fullWidth = false,
}: {
  intent: BannerIntentId
  density?: BannerDensityId
  layout?: BannerLayoutId
  fullWidth?: boolean
}) {
  const copy = BANNERS_UI_DEMO_COPY[intent]
  const messageOnlyCopy =
    layout === "message" && (intent === "neutral" || intent === "danger")
      ? BANNERS_UI_DEMO_COPY.messageOnly[intent]
      : copy.message

  return (
    <RootsBanner
      intent={intent}
      density={density}
      layout={layout}
      fullWidth={fullWidth}
      title={layout === "message" ? undefined : copy.title}
      message={layout === "message" ? messageOnlyCopy : copy.message}
      actionLabel={layout === "with-action" ? copy.action : undefined}
      onAction={layout === "with-action" ? () => undefined : undefined}
    />
  )
}

function LiveDismissibleBanner() {
  const [visible, setVisible] = useState(true)
  const copy = BANNERS_UI_DEMO_COPY.info

  if (!visible) {
    return (
      <button
        type="button"
        className="font-canopy text-xs text-[var(--rootsy-bruma-500)] underline"
        onClick={() => setVisible(true)}
      >
        Mostrar banner de nuevo
      </button>
    )
  }

  return (
    <RootsBanner
      intent="info"
      layout="dismissible"
      title={copy.title}
      message={copy.message}
      onDismiss={() => setVisible(false)}
    />
  )
}

function LiveMiniField({ label, error }: { label: string; error?: boolean }) {
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

export function BannersLiveGallery() {
  const layouts: { id: BannerLayoutId; intent: BannerIntentId }[] = [
    { id: "message", intent: "neutral" },
    { id: "title-message", intent: "success" },
    { id: "with-action", intent: "warning" },
    { id: "dismissible", intent: "info" },
  ]

  return (
    <div className="space-y-10">
      <p className="max-w-3xl font-canopy text-sm leading-relaxed text-muted-foreground">
        {ROOTSY_BANNER_MANIFESTO}
      </p>

      <FoundationBrumaStage caption="radius.large · space.150 gap · tint semántico 8% · sin shadow.">
        <div className="space-y-8">
          <SectionHeading
            title="Anatomía"
            description="Ícono space.200 · título body medium · mensaje body.small · borde bruma o semántico."
          />
          <LiveBanner intent="success" layout="title-message" fullWidth />
        </div>
      </FoundationBrumaStage>

      <FoundationBrumaStage caption="banner.intent · status-success · status-warning · status-danger · savia teal info.">
        <div className="space-y-8">
          <SectionHeading
            title="Intents"
            description="Cinco intents — neutral sunken; semánticos con tint y textHex del token."
          />
          <SpecBlock title="banner.intent · variantes" hint="neutral · info · success · warning · danger — tint 8% · borde 25%.">
            <VariantRow>
              {BANNERS_UI_INTENTS.map((intent) => (
                <VariantSpecCell key={intent.id} label={intent.token}>
                  <LiveBanner intent={intent.id} />
                </VariantSpecCell>
              ))}
            </VariantRow>
          </SpecBlock>
        </div>
      </FoundationBrumaStage>

      <FoundationBrumaStage caption="banner.density · banner.layout · dismiss space.400 · action body.small medium.">
        <div className="space-y-8">
          <SectionHeading
            title="Densidad y layout"
            description="Compacto para hints densos · acción y dismiss en la misma fila que el contenido."
          />
          <SpecBlock title="banner.density · variantes" hint="default space.150×200 · compact space.100×150.">
            <VariantRow>
              {BANNERS_UI_DENSITIES.map((density) => (
                <VariantSpecCell key={density.id} label={density.token}>
                  <LiveBanner intent="info" density={density.id} />
                </VariantSpecCell>
              ))}
            </VariantRow>
          </SpecBlock>
          <SpecBlock title="banner.layout · variantes" hint="message · title-message · with-action · dismissible.">
            <VariantRow>
              {layouts.map(({ id, intent }) => {
                const layoutMeta = BANNERS_UI_LAYOUTS.find((item) => item.id === id)!
                return (
                  <VariantSpecCell key={id} label={layoutMeta.token}>
                    {id === "dismissible" ? (
                      <LiveDismissibleBanner />
                    ) : (
                      <LiveBanner intent={intent} layout={id} />
                    )}
                  </VariantSpecCell>
                )
              })}
            </VariantRow>
          </SpecBlock>
        </div>
      </FoundationBrumaStage>

      <FoundationBrumaStage caption="banner.in-context · field-stack · validación inline.">
        <div className="space-y-8">
          <SectionHeading
            title="En contexto"
            description="Banner de error sobre campos — alineado a Formulario UI y color.border."
          />
          <SpecBlock
            title="banner.in-context · formulario"
            hint="danger arriba del stack · field-stack space.200 — sin sombra, borde semántico."
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
              <RootsBanner
                intent="danger"
                layout="message"
                fullWidth
                message={BANNERS_UI_DEMO_COPY.messageOnly.danger}
              />
              <LiveMiniField label="Nombre del artículo" error />
            </div>
          </SpecBlock>
        </div>
      </FoundationBrumaStage>
    </div>
  )
}
