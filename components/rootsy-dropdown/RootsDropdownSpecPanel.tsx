"use client"

import {
  DROPDOWN_UI_DEMO_COPY,
  getDropdownItemRowUiStyle,
  getDropdownItemShellUiStyle,
  getDropdownLabelUiStyle,
  getDropdownPanelShellUiStyle,
  getDropdownSeparatorUiStyle,
  type DropdownDensityId,
  type DropdownItemStateId,
  type DropdownThemeId,
} from "@/app/library/ui-components/dropdownUiHardcodedSpec"
import { ROOTSY_DROPDOWN_ANATOMY } from "@/app/library/dropdown/rootsyDropdownSystem"
import { getDropdownCheckStyle } from "@/components/rootsy-dropdown/rootsDropdownSpecRuntime"
import { rootsDropdownPanelRadiusClass } from "@/components/rootsy-dropdown/rootsDropdownStyles"
import { cn } from "@/lib/utils"
import type { CSSProperties, ReactNode } from "react"

type PanelVariant = "grouped" | "sections" | "compact-actions"

export function RootsDropdownSpecItem({
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
        {showCheck ? (
          <svg viewBox="0 0 16 16" fill="none" style={getDropdownCheckStyle(theme)} aria-hidden>
            <path
              d="M4 8.5l2.5 2.5 5.5-6"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </div>
    </div>
  )
}

export function RootsDropdownSpecPanel({
  theme = "light",
  density = "default",
  variant = "grouped",
  className,
  style,
}: {
  theme?: DropdownThemeId
  density?: DropdownDensityId
  variant?: PanelVariant
  className?: string
  style?: CSSProperties
}) {
  const labelStyle = getDropdownLabelUiStyle(theme)
  const separatorStyle = getDropdownSeparatorUiStyle(theme)
  const copy = DROPDOWN_UI_DEMO_COPY

  return (
    <div
      role="menu"
      className={cn(rootsDropdownPanelRadiusClass, className)}
      style={{ ...getDropdownPanelShellUiStyle(theme, density), ...style }}
    >
      {variant === "sections" ? (
        <>
          {copy.sections.map((section, index) => (
            <RootsDropdownSpecItem
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
          <RootsDropdownSpecItem label={copy.items.edit} theme={theme} density={density} />
          <RootsDropdownSpecItem label={copy.items.duplicate} theme={theme} density={density} />
          <RootsDropdownSpecItem label={copy.items.export} theme={theme} density={density} />
          <div style={separatorStyle} aria-hidden />
          <RootsDropdownSpecItem
            label={copy.items.delete}
            theme={theme}
            density={density}
            state="destructive"
          />
        </>
      ) : null}

      {variant === "compact-actions" ? (
        <>
          <RootsDropdownSpecItem label={copy.items.duplicate} theme={theme} density={density} />
          <RootsDropdownSpecItem label={copy.items.edit} theme={theme} density={density} />
          <div style={separatorStyle} aria-hidden />
          <RootsDropdownSpecItem
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

export function RootsDropdownSpecAnatomy({
  theme = "light",
  trigger,
  density = "default",
}: {
  theme?: DropdownThemeId
  density?: DropdownDensityId
  trigger: ReactNode
}) {
  return (
    <div
      className="inline-flex flex-col items-start"
      style={{ gap: ROOTSY_DROPDOWN_ANATOMY.anchorGapPx }}
    >
      {trigger}
      <RootsDropdownSpecPanel theme={theme} density={density} variant="grouped" />
    </div>
  )
}

export function RootsDropdownSpecItemStatesPanel({
  theme = "light",
  className,
}: {
  theme?: DropdownThemeId
  className?: string
}) {
  return (
    <div
      className={cn(rootsDropdownPanelRadiusClass, className)}
      style={getDropdownPanelShellUiStyle(theme, "default")}
    >
      {(
        [
          "default",
          "hover",
          "selected",
          "disabled",
          "destructive",
          "destructive-hover",
        ] as DropdownItemStateId[]
      ).map((state) => (
        <RootsDropdownSpecItem
          key={state}
          label={DROPDOWN_UI_DEMO_COPY.items.edit}
          theme={theme}
          state={state}
          showCheck={state === "selected"}
        />
      ))}
    </div>
  )
}
