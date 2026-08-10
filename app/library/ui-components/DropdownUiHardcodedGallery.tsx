"use client"

import {
  BUTTONS_UI_SIZE_SPECS,
  getButtonsUiAppearanceSurface,
  getIconButtonUiRowSurface,
} from "@/app/library/ui-components/buttonsUiHardcodedSpec"
import {
  DROPDOWN_UI_DEMO_COPY,
  DROPDOWN_UI_DENSITIES,
  DROPDOWN_UI_PANEL_SPEC,
  DROPDOWN_UI_THEMES,
  DROPDOWN_UI_TRIGGERS,
  getDropdownCheckUiStyle,
  getDropdownChevronUiStyle,
  getDropdownItemShellUiStyle,
  getDropdownItemRowUiStyle,
  getDropdownLabelUiStyle,
  getDropdownPanelShellUiStyle,
  getDropdownSeparatorUiStyle,
  getDropdownUiPanelSpecRows,
  type DropdownDensityId,
  type DropdownItemStateId,
  type DropdownThemeId,
  type DropdownTriggerId,
} from "@/app/library/ui-components/dropdownUiHardcodedSpec"
import { OverlaySurfaceSpecTable } from "@/app/library/ui-components/dialogUiDocShared"
import { ROOTSY_DROPDOWN_ANATOMY } from "@/app/library/dropdown/rootsyDropdownSystem"
import { COLOR_TOKENS } from "@/app/library/color/rootsyColorSystem"
import { FoundationBrumaStage } from "@/app/library/libraryFoundationDocShared"
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
    <div className="flex min-w-56 max-w-md flex-1 flex-col gap-1.5">
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

function ChevronDownIcon({ theme = "light" }: { theme?: DropdownThemeId }) {
  const style = getDropdownChevronUiStyle(theme)
  return (
    <svg viewBox="0 0 16 16" fill="none" style={style} aria-hidden>
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CheckIcon({ theme = "light" }: { theme?: DropdownThemeId }) {
  const style = getDropdownCheckUiStyle(theme)
  return (
    <svg viewBox="0 0 16 16" fill="none" style={style} aria-hidden>
      <path d="M4 8.5l2.5 2.5 5.5-6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function MoreVerticalIcon() {
  return (
    <svg viewBox="0 0 16 16" width={16} height={16} aria-hidden>
      <circle cx="8" cy="4" r="1.25" fill="currentColor" />
      <circle cx="8" cy="8" r="1.25" fill="currentColor" />
      <circle cx="8" cy="12" r="1.25" fill="currentColor" />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 16 16" width={16} height={16} fill="none" aria-hidden style={{ flexShrink: 0 }}>
      <path
        d="M11.5 2.5l2 2L5 13H3v-2l8.5-8.5z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function HardcodedDropdownTrigger({
  trigger,
  theme = "light",
  open = false,
}: {
  trigger: DropdownTriggerId
  theme?: DropdownThemeId
  open?: boolean
}) {
  if (trigger === "icon-button") {
    const surface = getIconButtonUiRowSurface("neutral", open ? "hover" : "default")
    return (
      <button
        type="button"
        aria-label={DROPDOWN_UI_DEMO_COPY.triggerLabels.actions}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: rootsySpacePx("400"),
          height: rootsySpacePx("400"),
          border: surface.border,
          backgroundColor: surface.backgroundColor,
          color: surface.iconColor,
          borderRadius: `${surface.borderRadiusPx}px`,
          boxShadow: surface.boxShadow,
          cursor: "default",
          padding: 0,
        }}
      >
        <MoreVerticalIcon />
      </button>
    )
  }

  const appearance = trigger === "button-default" ? "default" : "subtle"
  const surface = getButtonsUiAppearanceSurface(appearance, open ? "hover" : "default")
  const size = BUTTONS_UI_SIZE_SPECS.default

  return (
    <button
      type="button"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: rootsySpacePx("100"),
        height: size.heightPx,
        paddingLeft: size.paddingXPx,
        paddingRight: size.paddingXPx,
        minWidth: 160,
        border: surface.border,
        backgroundColor: surface.backgroundColor,
        color: surface.color,
        borderRadius: `${size.radiusPx}px`,
        boxShadow: surface.boxShadow,
        fontFamily: "var(--rootsy-font-ui)",
        fontSize: size.fontSize,
        lineHeight: size.lineHeight,
        fontWeight: size.fontWeight,
        cursor: "default",
      }}
    >
      <span>{DROPDOWN_UI_DEMO_COPY.triggerLabels.section}</span>
      <ChevronDownIcon theme={theme} />
    </button>
  )
}

function HardcodedDropdownItem({
  label,
  theme = "light",
  state = "default",
  density = "default",
  icon,
  showCheck = false,
}: {
  label: string
  theme?: DropdownThemeId
  state?: DropdownItemStateId
  density?: DropdownDensityId
  icon?: ReactNode
  showCheck?: boolean
}) {
  const style = getDropdownItemShellUiStyle(theme, state, density)
  const rowStyle = getDropdownItemRowUiStyle()

  return (
    <div style={style}>
      <div style={{ ...rowStyle, flex: 1 }}>
        {icon}
        <span style={{ flex: 1 }}>{label}</span>
        {showCheck ? <CheckIcon theme={theme} /> : null}
      </div>
    </div>
  )
}

function HardcodedDropdownPanel({
  theme = "light",
  density = "default",
  variant = "grouped",
}: {
  theme?: DropdownThemeId
  density?: DropdownDensityId
  variant?: "sections" | "grouped" | "compact-actions"
}) {
  const labelStyle = getDropdownLabelUiStyle(theme)
  const separatorStyle = getDropdownSeparatorUiStyle(theme)
  const copy = DROPDOWN_UI_DEMO_COPY
  const shellStyle: CSSProperties = getDropdownPanelShellUiStyle(theme, density)

  return (
    <div style={shellStyle} role="menu">
      {variant === "sections" ? (
        <>
          {copy.sections.map((section, index) => (
            <HardcodedDropdownItem
              key={section}
              label={section}
              theme={theme}
              density={density}
              state={index === 0 ? "selected" : "default"}
              showCheck={index === 0}
            />
          ))}
        </>
      ) : null}

      {variant === "grouped" ? (
        <>
          <div style={labelStyle}>{copy.groupLabel}</div>
          <HardcodedDropdownItem
            label={copy.items.edit}
            theme={theme}
            density={density}
            icon={<PencilIcon />}
          />
          <HardcodedDropdownItem label={copy.items.duplicate} theme={theme} density={density} />
          <HardcodedDropdownItem label={copy.items.export} theme={theme} density={density} />
          <div style={separatorStyle} aria-hidden />
          <HardcodedDropdownItem
            label={copy.items.delete}
            theme={theme}
            density={density}
            state="destructive"
          />
        </>
      ) : null}

      {variant === "compact-actions" ? (
        <>
          <HardcodedDropdownItem label={copy.items.duplicate} theme={theme} density={density} />
          <HardcodedDropdownItem label={copy.items.edit} theme={theme} density={density} />
          <div style={separatorStyle} aria-hidden />
          <HardcodedDropdownItem
            label={copy.items.delete}
            theme={theme}
            density={density}
            state="destructive"
          />
        </>
      ) : null}
    </div>
  )
}

function HardcodedDropdownAnatomy({
  theme = "light",
  trigger = "button-default",
}: {
  theme?: DropdownThemeId
  trigger?: DropdownTriggerId
}) {
  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-start", gap: ROOTSY_DROPDOWN_ANATOMY.anchorGapPx }}>
      <HardcodedDropdownTrigger trigger={trigger} theme={theme} open />
      <HardcodedDropdownPanel theme={theme} variant="grouped" />
    </div>
  )
}

function DropdownThemeVariantsBlock() {
  return (
    <SpecBlock title="dropdown.theme · variantes" hint="light workspace · dark sombra — mismo shadow.overlay.">
      <VariantRow>
        {DROPDOWN_UI_THEMES.map((theme) => (
          <VariantSpecCell key={theme.id} label={theme.token}>
            <div
              style={
                theme.id === "dark"
                  ? { padding: rootsySpacePx("200"), borderRadius: rootsySpacePx("150"), backgroundColor: COLOR_TOKENS.sombra700 }
                  : undefined
              }
            >
              <HardcodedDropdownPanel theme={theme.id} variant="sections" />
            </div>
          </VariantSpecCell>
        ))}
      </VariantRow>
    </SpecBlock>
  )
}

function DropdownItemStatesBlock() {
  const states: { id: DropdownItemStateId; token: string }[] = [
    { id: "default", token: "dropdown.item.default" },
    { id: "hover", token: "dropdown.item.hover" },
    { id: "selected", token: "dropdown.item.selected" },
    { id: "disabled", token: "dropdown.item.disabled" },
    { id: "destructive", token: "dropdown.item.destructive" },
    { id: "destructive-hover", token: "dropdown.item.destructive-hover" },
  ]

  return (
    <SpecBlock title="dropdown.item · estados" hint="default · hover · selected · disabled · destructive.">
      <VariantRow>
        {states.map((state) => (
            <VariantSpecCell key={state.id} label={state.token}>
              <div style={getDropdownPanelShellUiStyle("light", "default")}>
                <HardcodedDropdownItem
                  label={DROPDOWN_UI_DEMO_COPY.items.edit}
                  state={state.id}
                  showCheck={state.id === "selected"}
                />
              </div>
            </VariantSpecCell>
          ))}
      </VariantRow>
    </SpecBlock>
  )
}

function DropdownDensityVariantsBlock() {
  return (
    <SpecBlock title="dropdown.density · variantes" hint="default space.500 ítems · compact space.400 filas.">
      <VariantRow>
        {DROPDOWN_UI_DENSITIES.map((density) => (
          <VariantSpecCell key={density.id} label={density.token}>
            <HardcodedDropdownPanel
              theme="light"
              density={density.id}
              variant={density.id === "compact" ? "compact-actions" : "grouped"}
            />
          </VariantSpecCell>
        ))}
      </VariantRow>
    </SpecBlock>
  )
}

function DropdownTriggerVariantsBlock() {
  return (
    <SpecBlock title="dropdown.trigger · variantes" hint="icon-button · button-default · button-subtle — desde Botones UI.">
      <VariantRow>
        {DROPDOWN_UI_TRIGGERS.map((trigger) => (
          <VariantSpecCell key={trigger.id} label={trigger.token}>
            <HardcodedDropdownAnatomy trigger={trigger.id} />
          </VariantSpecCell>
        ))}
      </VariantRow>
    </SpecBlock>
  )
}

function DropdownInContextBlock() {
  return (
    <SpecBlock
      title="dropdown.in-context · fila"
      hint="icon-button compact · align end · menú compacto w-44 equivalente."
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          maxWidth: 420,
          padding: `${rootsySpacePx("150")}px ${rootsySpacePx("200")}px`,
          borderRadius: `${rootsySpacePx("150")}px`,
          border: `1px solid ${COLOR_TOKENS.bruma200}`,
          backgroundColor: COLOR_TOKENS.white,
        }}
      >
        <div>
          <p style={{ margin: 0, fontFamily: "var(--rootsy-font-ui)", fontSize: 14, fontWeight: 500, color: COLOR_TOKENS.bruma900 }}>
            Café orgánico 250g
          </p>
          <p style={{ margin: 0, marginTop: 2, fontFamily: "var(--rootsy-font-ui)", fontSize: 12, color: COLOR_TOKENS.bruma500 }}>
            SKU · CAF-250
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: ROOTSY_DROPDOWN_ANATOMY.anchorGapPx }}>
          <HardcodedDropdownTrigger trigger="icon-button" />
          <HardcodedDropdownPanel theme="light" density="compact" variant="compact-actions" />
        </div>
      </div>
    </SpecBlock>
  )
}

export function DropdownUiHardcodedGallery() {
  return (
    <div className="space-y-10">
      <OverlaySurfaceSpecTable
        title="Superficie panel · dropdown (light)"
        description={DROPDOWN_UI_PANEL_SPEC.pairRule}
        rows={getDropdownUiPanelSpecRows("light")}
        pairNote="Tema dark: elevation.surface.overlay → sombra-500 · mismos borde y sombra."
      />

      <FoundationBrumaStage clip={false} caption="elevation.surface.overlay · elevation.shadow.overlay · radius.xlarge · color.border.">
        <div className="space-y-8">
          <SectionHeading
            title="Anatomía"
            description="Trigger Botones UI · panel flotante · label body.small · separator bruma · destructive aislado."
          />
          <HardcodedDropdownAnatomy trigger="button-default" />
        </div>
      </FoundationBrumaStage>

      <FoundationBrumaStage clip={false} caption="dropdown.theme · bruma claro · sombra oscuro · savia en selección.">
        <div className="space-y-8">
          <SectionHeading
            title="Temas"
            description="Misma anatomía en workspace claro y shell sombra — tokens elevation dark/light."
          />
          <DropdownThemeVariantsBlock />
        </div>
      </FoundationBrumaStage>

      <FoundationBrumaStage clip={false} caption="dropdown.item · hover bruma-50 · selected savia-100 · status-danger.">
        <div className="space-y-8">
          <SectionHeading
            title="Estados de ítem"
            description="Seis estados — tipografía body · check savia-600 en seleccionado."
          />
          <DropdownItemStatesBlock />
        </div>
      </FoundationBrumaStage>

      <FoundationBrumaStage clip={false} caption="dropdown.density · dropdown.trigger · anchor gap space.100.">
        <div className="space-y-8">
          <SectionHeading
            title="Densidad y triggers"
            description="Compacto para filas · default para navegación · tres triggers permitidos."
          />
          <DropdownDensityVariantsBlock />
          <DropdownTriggerVariantsBlock />
        </div>
      </FoundationBrumaStage>

      <FoundationBrumaStage clip={false} caption="dropdown.in-context · icon-button.row.neutral · align end.">
        <div className="space-y-8">
          <SectionHeading
            title="En contexto"
            description="Menú ⋮ en fila de tabla — densidad compact · destructive después del separator."
          />
          <DropdownInContextBlock />
        </div>
      </FoundationBrumaStage>
    </div>
  )
}
