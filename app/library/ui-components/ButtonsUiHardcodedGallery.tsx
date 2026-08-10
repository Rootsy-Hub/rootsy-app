"use client"

import {
  BUTTONS_UI_APPEARANCE_LABELS,
  BUTTONS_UI_APPEARANCE_META,
  BUTTONS_UI_INTERACTION_STATES,
  BUTTONS_UI_SIZE_SPECS,
  BUTTONS_WITH_ICON_FONT_WEIGHT,
  BUTTONS_WITH_ICON_SPECS,
  ICON_BUTTON_UI_INTERACTION_STATES,
  ICON_BUTTON_UI_POS_PANEL,
  ICON_BUTTON_UI_POS_VARIANTS,
  ICON_BUTTON_UI_RADIUS_TOKEN,
  ICON_BUTTON_UI_ROW_INTENTS,
  ICON_BUTTON_UI_WORKSPACE_VARIANTS,
  getButtonsUiAppearanceSurface,
  getIconButtonUiRowSurface,
  getIconButtonUiSurface,
  iconButtonSize,
  type ButtonsUiAppearanceId,
  type ButtonsUiInteractionState,
  type ButtonsUiSizeId,
  type IconButtonEmphasisId,
  type IconButtonRowIntentId,
  type IconButtonSizeId,
  type IconButtonThemeId,
} from "@/app/library/ui-components/buttonsUiHardcodedSpec"
import { COLOR_TOKENS } from "@/app/library/color/rootsyColorSystem"
import { FoundationBrumaStage } from "@/app/library/libraryFoundationDocShared"
import { ROOTSY_COLOR_SEMANTIC } from "@/lib/design-system"
import type { CSSProperties, ReactNode, SVGProps } from "react"

const SIZE_ORDER: ButtonsUiSizeId[] = ["compact", "default", "large"]
const STATE_ORDER = BUTTONS_UI_INTERACTION_STATES

type SpecIconName =
  | "plus"
  | "home"
  | "arrowLeft"
  | "bell"
  | "eye"
  | "pencil"
  | "trash"
  | "save"
  | "arrowRight"

const SPEC_ICON_PATHS: Record<SpecIconName, ReactNode> = {
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  home: (
    <>
      <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
      <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </>
  ),
  arrowLeft: (
    <>
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </>
  ),
  bell: (
    <>
      <path d="M10.268 21a2 2 0 0 0 3.464 0" />
      <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
    </>
  ),
  eye: (
    <>
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  pencil: (
    <>
      <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z" />
    </>
  ),
  trash: (
    <>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </>
  ),
  save: (
    <>
      <path d="M15.2 3a2 2 0 0 1 1.4.6l2.8 2.8A2 2 0 0 1 20 7.8V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" />
      <path d="M7 3v4h8" />
    </>
  ),
  arrowRight: (
    <>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </>
  ),
}

function SpecIcon({
  name,
  sizePx,
  color,
}: {
  name: SpecIconName
  sizePx: number
  color: string
}) {
  const svgProps: SVGProps<SVGSVGElement> = {
    width: sizePx,
    height: sizePx,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  }

  return <svg {...svgProps}>{SPEC_ICON_PATHS[name]}</svg>
}

function SpecSpinner({ sizePx, color }: { sizePx: number; color: string }) {
  return (
    <span
      aria-hidden
      style={{
        display: "inline-block",
        width: sizePx,
        height: sizePx,
        borderRadius: "9999px",
        border: `2px solid color-mix(in srgb, ${color} 28%, transparent)`,
        borderTopColor: color,
        flexShrink: 0,
      }}
    />
  )
}

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

function StateSpecCell({
  label,
  darkPanel = false,
  children,
}: {
  label: string
  darkPanel?: boolean
  children: ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      {children}
      <span
        className="font-mono text-[10px] uppercase tracking-[0.08em]"
        style={{ color: darkPanel ? COLOR_TOKENS.sombra300 : COLOR_TOKENS.bruma500 }}
      >
        {label}
      </span>
    </div>
  )
}

function StateRow({
  darkPanel = false,
  children,
}: {
  darkPanel?: boolean
  children: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-end gap-3">{children}</div>
  )
}

function HardcodedButton({
  appearance,
  sizeId = "default",
  state = "default",
}: {
  appearance: ButtonsUiAppearanceId
  sizeId?: ButtonsUiSizeId
  state?: ButtonsUiInteractionState
}) {
  const size = BUTTONS_UI_SIZE_SPECS[sizeId]
  const surface = getButtonsUiAppearanceSurface(appearance, state)
  const label = surface.loadingLabel ?? BUTTONS_UI_APPEARANCE_LABELS[appearance]

  const style: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: surface.loadingLabel ? 8 : undefined,
    height: size.heightPx,
    paddingLeft: size.paddingXPx,
    paddingRight: size.paddingXPx,
    borderRadius: size.radiusPx,
    fontFamily: "var(--rootsy-font-ui)",
    fontSize: size.fontSize,
    lineHeight: size.lineHeight,
    fontWeight: surface.fontWeight,
    backgroundColor: surface.backgroundColor,
    color: surface.color,
    border: surface.border,
    boxShadow: surface.boxShadow,
    textDecoration: surface.textDecoration,
    textUnderlineOffset: surface.textDecoration ? "4px" : undefined,
    opacity: surface.opacity,
    userSelect: "none",
    whiteSpace: "nowrap",
  }

  return (
    <div aria-hidden style={style}>
      {surface.loadingLabel ? <SpecSpinner sizePx={14} color={surface.color} /> : null}
      {label}
    </div>
  )
}

function HardcodedButtonWithIcon({
  appearance,
  label,
  icon,
  iconPosition,
  state = "default",
}: {
  appearance: ButtonsUiAppearanceId
  label: string
  icon: SpecIconName
  iconPosition: "before" | "after"
  state?: ButtonsUiInteractionState
}) {
  const size = BUTTONS_UI_SIZE_SPECS.default
  const surface = getButtonsUiAppearanceSurface(appearance, state)
  const displayLabel = surface.loadingLabel ?? label

  const style: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: BUTTONS_WITH_ICON_SPECS.gapPx,
    height: size.heightPx,
    paddingLeft: size.paddingXPx,
    paddingRight: size.paddingXPx,
    borderRadius: size.radiusPx,
    fontFamily: "var(--rootsy-font-ui)",
    fontSize: size.fontSize,
    lineHeight: size.lineHeight,
    fontWeight: appearance === "link" ? surface.fontWeight : BUTTONS_WITH_ICON_FONT_WEIGHT,
    backgroundColor: surface.backgroundColor,
    color: surface.color,
    border: surface.border,
    boxShadow: surface.boxShadow,
    textDecoration: surface.textDecoration,
    textUnderlineOffset: surface.textDecoration ? "4px" : undefined,
    opacity: surface.opacity,
    userSelect: "none",
    whiteSpace: "nowrap",
  }

  const iconEl = surface.loadingLabel ? (
    <SpecSpinner sizePx={BUTTONS_WITH_ICON_SPECS.iconPx} color={surface.color} />
  ) : (
    <SpecIcon name={icon} sizePx={BUTTONS_WITH_ICON_SPECS.iconPx} color={surface.color} />
  )

  return (
    <div aria-hidden style={style}>
      {iconPosition === "before" ? iconEl : null}
      {displayLabel}
      {iconPosition === "after" && !surface.loadingLabel ? iconEl : null}
    </div>
  )
}

function HardcodedIconButton({
  theme,
  emphasis,
  sizeId = "default",
  icon,
  rowIntent,
  state = "default",
}: {
  theme?: IconButtonThemeId
  emphasis?: IconButtonEmphasisId
  sizeId?: IconButtonSizeId
  icon: SpecIconName
  rowIntent?: IconButtonRowIntentId
  state?: ButtonsUiInteractionState
}) {
  const size = iconButtonSize(sizeId)
  const surface = rowIntent
    ? getIconButtonUiRowSurface(rowIntent, state)
    : getIconButtonUiSurface(theme!, emphasis!, state)

  const style: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: size.hitAreaPx,
    height: size.hitAreaPx,
    borderRadius: surface.borderRadiusPx,
    backgroundColor: surface.backgroundColor,
    border: surface.border,
    boxShadow: surface.boxShadow,
    opacity: surface.opacity,
    userSelect: "none",
    flexShrink: 0,
  }

  return (
    <div aria-hidden style={style}>
      {state === "loading" ? (
        <SpecSpinner sizePx={size.iconPx} color={surface.iconColor} />
      ) : (
        <SpecIcon name={icon} sizePx={size.iconPx} color={surface.iconColor} />
      )}
    </div>
  )
}

function TextButtonAppearanceBlock({ appearance }: { appearance: ButtonsUiAppearanceId }) {
  const meta = BUTTONS_UI_APPEARANCE_META.find((item) => item.id === appearance)!

  return (
    <div className="space-y-4">
      <SpecBlock title={`${meta.title} · ${meta.natureName}`}>
        <StateRow>
          {SIZE_ORDER.map((sizeId) => (
            <StateSpecCell key={sizeId} label={sizeId}>
              <HardcodedButton appearance={appearance} sizeId={sizeId} />
            </StateSpecCell>
          ))}
        </StateRow>
      </SpecBlock>

      <SpecBlock title="estados · default size">
        <StateRow>
          {STATE_ORDER.map((state) => (
            <StateSpecCell key={state.id} label={state.label}>
              <HardcodedButton appearance={appearance} state={state.id} />
            </StateSpecCell>
          ))}
        </StateRow>
      </SpecBlock>
    </div>
  )
}

function IconButtonVariantBlock({
  theme,
  emphasis,
  icon,
  darkPanel = false,
}: {
  theme: IconButtonThemeId
  emphasis: IconButtonEmphasisId
  icon: SpecIconName
  darkPanel?: boolean
}) {
  const variants =
    theme === "workspace" ? ICON_BUTTON_UI_WORKSPACE_VARIANTS : ICON_BUTTON_UI_POS_VARIANTS
  const meta = variants.find((item) => item.emphasis === emphasis)!

  return (
    <div className="space-y-4">
      <SpecBlock
        title={`theme=${theme} · emphasis=${emphasis} · ${meta.id}`}
        hint={meta.usage}
        darkPanel={darkPanel}
      >
        <StateRow darkPanel={darkPanel}>
          {SIZE_ORDER.map((sizeId) => (
            <StateSpecCell key={sizeId} label={sizeId} darkPanel={darkPanel}>
              <HardcodedIconButton
                theme={theme}
                emphasis={emphasis}
                sizeId={sizeId}
                icon={icon}
              />
            </StateSpecCell>
          ))}
        </StateRow>
      </SpecBlock>

      <SpecBlock title="estados · default size" darkPanel={darkPanel}>
        <StateRow darkPanel={darkPanel}>
          {ICON_BUTTON_UI_INTERACTION_STATES.map((state) => (
            <StateSpecCell key={state.id} label={state.label} darkPanel={darkPanel}>
              <HardcodedIconButton
                theme={theme}
                emphasis={emphasis}
                icon={icon}
                state={state.id}
              />
            </StateSpecCell>
          ))}
        </StateRow>
      </SpecBlock>
    </div>
  )
}

function RowIntentBlock({ intent, icon }: { intent: IconButtonRowIntentId; icon: SpecIconName }) {
  const meta = ICON_BUTTON_UI_ROW_INTENTS.find((item) => item.id === intent)!

  return (
    <SpecBlock title={`${meta.token} · compact`} hint={meta.usage}>
      <StateRow>
        {ICON_BUTTON_UI_INTERACTION_STATES.map((state) => (
          <StateSpecCell key={state.id} label={state.label}>
            <HardcodedIconButton sizeId="compact" icon={icon} rowIntent={intent} state={state.id} />
          </StateSpecCell>
        ))}
      </StateRow>
    </SpecBlock>
  )
}

export function ButtonsUiHardcodedGallery() {
  return (
    <div className="space-y-10">
      <FoundationBrumaStage caption="ROOTSY_BUTTON_COLOR_TOKENS · ROOTSY_BUTTON_STATES · radius.focus +2px savia.">
        <div className="space-y-8">
          <SectionHeading
            title="Botones de texto"
            description="Cinco appearances · tres tamaños · seis estados interactivos."
          />

          {BUTTONS_UI_APPEARANCE_META.map((meta) => (
            <TextButtonAppearanceBlock key={meta.id} appearance={meta.id} />
          ))}
        </div>
      </FoundationBrumaStage>

      <FoundationBrumaStage caption="Botones con ícono · mismos estados · icon.size.medium · space.100.">
        <div className="space-y-8">
          <SectionHeading
            title="Botones con ícono"
            description="Leading y trailing — estados por appearance en size default."
          />

          {BUTTONS_WITH_ICON_SPECS.iconBefore.map((item) => (
            <SpecBlock key={item.label} title={`iconBefore · ${item.appearance}`}>
              <StateRow>
                {STATE_ORDER.map((state) => (
                  <StateSpecCell key={state.id} label={state.label}>
                    <HardcodedButtonWithIcon
                      appearance={item.appearance}
                      label={item.label}
                      icon={item.icon}
                      iconPosition="before"
                      state={state.id}
                    />
                  </StateSpecCell>
                ))}
              </StateRow>
            </SpecBlock>
          ))}

          {BUTTONS_WITH_ICON_SPECS.iconAfter.slice(0, 2).map((item) => (
            <SpecBlock key={item.label} title={`iconAfter · ${item.appearance}`}>
              <StateRow>
                {STATE_ORDER.map((state) => (
                  <StateSpecCell key={state.id} label={state.label}>
                    <HardcodedButtonWithIcon
                      appearance={item.appearance}
                      label={item.label}
                      icon={item.icon}
                      iconPosition="after"
                      state={state.id}
                    />
                  </StateSpecCell>
                ))}
              </StateRow>
            </SpecBlock>
          ))}
        </div>
      </FoundationBrumaStage>

      <FoundationBrumaStage
        caption={`Tema workspace · ${ICON_BUTTON_UI_RADIUS_TOKEN} · estados hover/active/focus.`}
      >
        <div className="space-y-8">
          <SectionHeading
            title="Icon button · tema workspace"
            description="Énfasis outlined · filled · ghost — tamaños y estados."
          />

          {ICON_BUTTON_UI_WORKSPACE_VARIANTS.map((variant) => (
            <IconButtonVariantBlock
              key={variant.id}
              theme="workspace"
              emphasis={variant.emphasis}
              icon={variant.icon}
            />
          ))}
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
            description="Énfasis outlined · filled · ghost — tamaños y estados."
            darkPanel
          />

          {ICON_BUTTON_UI_POS_VARIANTS.map((variant) => (
            <IconButtonVariantBlock
              key={variant.id}
              theme="pos"
              emphasis={variant.emphasis}
              icon={variant.icon}
              darkPanel
            />
          ))}
        </div>
      </div>

      <FoundationBrumaStage caption="ROOTSY_ICON_BUTTON_ROW_INTENTS · compact · estados completos.">
        <div className="space-y-8">
          <SectionHeading
            title="Acciones de fila"
            description="neutral · edit (savia) · destructive (danger) — todos los estados."
          />

          {ICON_BUTTON_UI_ROW_INTENTS.map((item) => (
            <RowIntentBlock key={item.id} intent={item.id} icon={item.icon} />
          ))}
        </div>
      </FoundationBrumaStage>
    </div>
  )
}
