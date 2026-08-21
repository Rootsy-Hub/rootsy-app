"use client"

import {
  BUTTONS_UI_APPEARANCE_LABELS,
  BUTTONS_UI_APPEARANCE_META,
  BUTTONS_UI_POS_TEXT_APPEARANCES,
  BUTTONS_WITH_ICON_SPECS,
  ICON_BUTTON_UI_POS_PANEL,
  ICON_BUTTON_UI_POS_VARIANTS,
  ICON_BUTTON_UI_ROW_INTENTS,
  ICON_BUTTON_UI_WORKSPACE_VARIANTS,
} from "@/app/library/ui-components/buttonsUiHardcodedSpec"
import { FoundationBrumaStage } from "@/app/library/libraryFoundationDocShared"
import { COLOR_TOKENS } from "@/app/library/color/rootsyColorSystem"
import { ROOTSY_COLOR_SEMANTIC } from "@/lib/design-system"
import {
  RootsDangerButton,
  RootsDefaultButton,
  RootsIconButton,
  RootsLinkButton,
  RootsPrimaryButton,
  RootsProgressButton,
  RootsSubtleButton,
} from "@/components/rootsy-button"
import type { ButtonsUiAppearanceId } from "@/app/library/ui-components/buttonsUiHardcodedSpec"
import type { RootsButtonSpecSize } from "@/components/rootsy-button/rootsButtonSpecRuntime"
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Eye,
  Home,
  Pencil,
  Plus,
  Save,
  Trash2,
} from "lucide-react"
import { useState, type ReactNode } from "react"

function SectionHeading({
  title,
  description,
  darkPanel = false,
}: {
  title: string
  description?: string
  darkPanel?: boolean
}) {
  return (
    <div className="space-y-1">
      <h2
        className="font-canopy text-base font-semibold"
        style={{ color: darkPanel ? ROOTSY_COLOR_SEMANTIC.textOnDark : COLOR_TOKENS.bruma900 }}
      >
        {title}
      </h2>
      {description ? (
        <p
          className="font-canopy text-xs leading-relaxed"
          style={{ color: darkPanel ? COLOR_TOKENS.sombra300 : COLOR_TOKENS.bruma500 }}
        >
          {description}
        </p>
      ) : null}
    </div>
  )
}

function SpecBlock({
  title,
  hint,
  darkPanel = false,
  children,
}: {
  title: string
  hint?: string
  darkPanel?: boolean
  children: ReactNode
}) {
  return (
    <section className="space-y-3">
      <div>
        <h3
          className="font-mono text-[11px] font-medium uppercase tracking-[0.12em]"
          style={{ color: darkPanel ? COLOR_TOKENS.sombra300 : COLOR_TOKENS.bruma500 }}
        >
          {title}
        </h3>
        {hint ? (
          <p
            className="mt-1 font-canopy text-xs leading-relaxed"
            style={{ color: darkPanel ? COLOR_TOKENS.sombra300 : COLOR_TOKENS.bruma500 }}
          >
            {hint}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

function DemoRow({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-3">{children}</div>
}

function appearanceButton(
  appearance: ButtonsUiAppearanceId,
  props?: { size?: RootsButtonSpecSize; loading?: boolean; theme?: "workspace" | "pos" },
) {
  const label = BUTTONS_UI_APPEARANCE_LABELS[appearance]
  const common = {
    size: props?.size ?? "default",
    loading: props?.loading,
    theme: props?.theme,
  }

  switch (appearance) {
    case "primary":
      return <RootsPrimaryButton {...common}>{label}</RootsPrimaryButton>
    case "default":
      return <RootsDefaultButton {...common}>{label}</RootsDefaultButton>
    case "subtle":
      return <RootsSubtleButton {...common}>{label}</RootsSubtleButton>
    case "danger":
      return <RootsDangerButton {...common}>{label}</RootsDangerButton>
    case "link":
      return <RootsLinkButton {...common}>{label}</RootsLinkButton>
  }
}

const SPEC_ICONS = {
  plus: Plus,
  home: Home,
  arrowLeft: ArrowLeft,
  bell: Bell,
  eye: Eye,
  pencil: Pencil,
  trash: Trash2,
  save: Save,
  arrowRight: ArrowRight,
} as const

export function ButtonsLiveGallery() {
  const [loadingPrimary, setLoadingPrimary] = useState(false)

  return (
    <div className="space-y-10">
      <FoundationBrumaStage caption="ROOTSY_BUTTON_COLOR_TOKENS · ROOTSY_BUTTON_STATES · radius.focus +2px savia.">
        <div className="space-y-8">
          <SectionHeading
            title="Botones de texto"
            description="Cinco appearances · tres tamaños · interactivos en default."
          />

          {BUTTONS_UI_APPEARANCE_META.map((meta) => (
            <div key={meta.id} className="space-y-4">
              <SpecBlock title={`${meta.title} · ${meta.natureName}`} hint={`Roots*Button · ${meta.token}`}>
                <DemoRow>
                  {(["compact", "default", "large"] as const).map((sizeId) => (
                    <div key={sizeId}>{appearanceButton(meta.id, { size: sizeId })}</div>
                  ))}
                </DemoRow>
              </SpecBlock>
            </div>
          ))}

          <SpecBlock title="loading · primary" hint="RootsProgressButton">
            <DemoRow>
              <RootsProgressButton
                loading={loadingPrimary}
                loadingLabel="Guardando…"
                onClick={() => {
                  setLoadingPrimary(true)
                  window.setTimeout(() => setLoadingPrimary(false), 1400)
                }}
              >
                Guardar
              </RootsProgressButton>
            </DemoRow>
          </SpecBlock>
        </div>
      </FoundationBrumaStage>

      <div
        className="overflow-hidden rounded-2xl"
        style={{
          background: ICON_BUTTON_UI_POS_PANEL.background,
          border: ICON_BUTTON_UI_POS_PANEL.border,
        }}
      >
        <div className="space-y-8 p-5 sm:p-6">
          <SectionHeading
            title="Botones de texto · tema POS"
            description="Default · Borde · Sutil · Enlace — chrome nocturno, mismos tamaños."
            darkPanel
          />

          {BUTTONS_UI_POS_TEXT_APPEARANCES.map((appearance) => {
            const meta = BUTTONS_UI_APPEARANCE_META.find((item) => item.id === appearance)!
            return (
              <SpecBlock
                key={appearance}
                title={`${meta.title} · ${meta.natureName}`}
                hint={`Roots*Button · theme=pos · ${meta.token}`}
                darkPanel
              >
                <DemoRow>
                  {(["compact", "default", "large"] as const).map((sizeId) => (
                    <div key={sizeId}>
                      {appearanceButton(appearance, { size: sizeId, theme: "pos" })}
                    </div>
                  ))}
                </DemoRow>
              </SpecBlock>
            )
          })}
        </div>
      </div>

      <FoundationBrumaStage caption="Botones con ícono · icon.size.medium · space.100.">
        <div className="space-y-8">
          <SectionHeading
            title="Botones con ícono"
            description="Leading y trailing — size default interactivo."
          />

          {BUTTONS_WITH_ICON_SPECS.iconBefore.map((item) => {
            const Icon = SPEC_ICONS[item.icon]
            return (
              <SpecBlock key={item.label} title={`iconBefore · ${item.appearance}`}>
                <DemoRow>
                  <RootsProgressButton
                    semantic={
                      item.appearance === "danger"
                        ? "destructive"
                        : item.appearance === "default"
                          ? "secondary"
                          : "primary"
                    }
                    icon={Icon}
                    iconPosition="left"
                  >
                    {item.label}
                  </RootsProgressButton>
                </DemoRow>
              </SpecBlock>
            )
          })}

          {BUTTONS_WITH_ICON_SPECS.iconAfter.slice(0, 2).map((item) => {
            const Icon = SPEC_ICONS[item.icon]
            return (
              <SpecBlock key={item.label} title={`iconAfter · ${item.appearance}`}>
                <DemoRow>
                  <RootsProgressButton
                    semantic={
                      item.appearance === "link"
                        ? "link"
                        : item.appearance === "danger"
                          ? "destructive"
                          : "primary"
                    }
                    icon={Icon}
                    iconPosition="right"
                  >
                    {item.label}
                  </RootsProgressButton>
                </DemoRow>
              </SpecBlock>
            )
          })}
        </div>
      </FoundationBrumaStage>

      <FoundationBrumaStage caption="Tema workspace · radius.medium · hover/active/focus.">
        <div className="space-y-8">
          <SectionHeading
            title="Icon button · tema workspace"
            description="Énfasis outlined · filled · ghost — RootsIconButton."
          />

          {ICON_BUTTON_UI_WORKSPACE_VARIANTS.map((variant) => {
            const Icon = SPEC_ICONS[variant.icon]
            return (
              <SpecBlock
                key={variant.id}
                title={`theme=workspace · emphasis=${variant.emphasis}`}
                hint={variant.usage}
              >
                <DemoRow>
                  {(["compact", "default", "large"] as const).map((sizeId) => (
                    <RootsIconButton
                      key={sizeId}
                      label={variant.id}
                      theme="workspace"
                      emphasis={variant.emphasis}
                      size={sizeId}
                    >
                      <Icon aria-hidden />
                    </RootsIconButton>
                  ))}
                </DemoRow>
              </SpecBlock>
            )
          })}
        </div>
      </FoundationBrumaStage>

      <div
        className="overflow-hidden rounded-2xl"
        style={{
          background: ICON_BUTTON_UI_POS_PANEL.background,
          border: ICON_BUTTON_UI_POS_PANEL.border,
        }}
      >
        <div className="space-y-8 p-5 sm:p-6">
          <SectionHeading
            title="Icon button · tema POS"
            description="Énfasis outlined · filled · ghost — RootsIconButton."
            darkPanel
          />

          {ICON_BUTTON_UI_POS_VARIANTS.map((variant) => {
            const Icon = SPEC_ICONS[variant.icon]
            return (
              <SpecBlock
                key={variant.id}
                title={`theme=pos · emphasis=${variant.emphasis}`}
                hint={variant.usage}
                darkPanel
              >
                <DemoRow>
                  {(["compact", "default", "large"] as const).map((sizeId) => (
                    <RootsIconButton
                      key={sizeId}
                      label={variant.id}
                      theme="pos"
                      emphasis={variant.emphasis}
                      size={sizeId}
                    >
                      <Icon aria-hidden />
                    </RootsIconButton>
                  ))}
                </DemoRow>
              </SpecBlock>
            )
          })}
        </div>
      </div>

      <FoundationBrumaStage caption="ROOTSY_ICON_BUTTON_ROW_INTENTS · compact · interactivo.">
        <div className="space-y-8">
          <SectionHeading
            title="Acciones de fila"
            description="neutral · edit (savia) · destructive — RootsIconButton tone=action."
          />

          {ICON_BUTTON_UI_ROW_INTENTS.map((item) => {
            const Icon = SPEC_ICONS[item.icon]
            const rowLabel =
              item.id === "neutral"
                ? "Ver detalle"
                : item.id === "edit"
                  ? "Editar"
                  : "Eliminar"
            return (
              <SpecBlock key={item.id} title={`${item.token} · compact`} hint={item.usage}>
                <DemoRow>
                  <RootsIconButton label={rowLabel} rowIntent={item.id} size="compact">
                    <Icon aria-hidden />
                  </RootsIconButton>
                  <RootsIconButton
                    label={rowLabel}
                    tone="action"
                    intent={item.id}
                    size="compact"
                  >
                    <Icon aria-hidden />
                  </RootsIconButton>
                </DemoRow>
              </SpecBlock>
            )
          })}
        </div>
      </FoundationBrumaStage>
    </div>
  )
}
