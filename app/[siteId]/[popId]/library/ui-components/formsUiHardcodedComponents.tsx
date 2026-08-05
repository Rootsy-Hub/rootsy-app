"use client"

import {
  FORM_UI_DEMO_COPY,
  FORM_UI_FIELD_STACK,
  FORM_UI_LABEL_STYLE,
  getCompositeShellUiSurface,
  getCompositeValueUiStyle,
  getFormControlSpec,
  getFormUiToolbarContextCellStyle,
  getFormUiToolbarContextGridStyle,
  getFormUiToolbarContextShellStyle,
  getFormUiToolbarEmbedShellStyle,
  getFormUiToolbarVariantOptions,
  getLeadingSlotUiStyle,
  type FormControlStateId,
  type FormToolbarContextVariantId,
} from "@/app/[siteId]/[popId]/library/ui-components/formsUiHardcodedSpec"
import { rootsySpacePx } from "@/lib/design-system"
import { CalendarRange, Filter, Search } from "lucide-react"
import type { CSSProperties, ReactNode } from "react"

export function FormUiSelectChevron() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export function FormUiFieldLabel({ children }: { children: ReactNode }) {
  return (
    <span aria-hidden style={FORM_UI_LABEL_STYLE}>
      {children}
    </span>
  )
}

export function FormUiFieldStack({
  label,
  children,
  fullWidth = false,
  hideLabel = false,
}: {
  label: string
  children: ReactNode
  fullWidth?: boolean
  hideLabel?: boolean
}) {
  return (
    <div
      className="flex w-full min-w-0 flex-col"
      style={{ gap: FORM_UI_FIELD_STACK.gapPx, maxWidth: fullWidth ? undefined : 280 }}
    >
      {!hideLabel ? <FormUiFieldLabel>{label}</FormUiFieldLabel> : null}
      {children}
    </div>
  )
}

export function FormUiLeadingControl({
  state = "default",
  leading,
  value,
  placeholder,
  numeric = false,
  trailing,
}: {
  state?: FormControlStateId
  leading: ReactNode
  value?: string
  placeholder?: string
  numeric?: boolean
  trailing?: ReactNode
}) {
  const spec = getFormControlSpec("select-leading")
  const shell = getCompositeShellUiSurface(state)
  const leadingStyle = getLeadingSlotUiStyle(state)
  const valueStyle = getCompositeValueUiStyle(state)

  const shellStyle: CSSProperties = {
    display: "flex",
    alignItems: "stretch",
    width: "100%",
    height: spec.heightPx,
    overflow: "hidden",
    borderRadius: spec.radiusPx,
    backgroundColor: shell.backgroundColor,
    border: shell.border,
    boxShadow: shell.boxShadow,
    opacity: shell.opacity,
    userSelect: "none",
  }

  const slotStyle: CSSProperties = {
    ...leadingStyle,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: spec.leadingSlotPx,
    flexShrink: 0,
    fontVariantNumeric: numeric ? "tabular-nums" : undefined,
  }

  const inputStyle: CSSProperties = {
    fontFamily: "var(--rootsy-font-ui)",
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: 400,
    display: "flex",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
    paddingLeft: spec.inputPaddingXPx,
    paddingRight: trailing ? rootsySpacePx("050") : spec.inputPaddingXPx,
    color: value ? shell.color : shell.placeholderColor,
    fontVariantNumeric: numeric ? "tabular-nums" : undefined,
    backgroundColor: valueStyle.backgroundColor,
    opacity: valueStyle.opacity,
  }

  return (
    <div aria-hidden style={shellStyle}>
      <span style={slotStyle}>{leading}</span>
      <span style={inputStyle}>{value ?? placeholder}</span>
      {trailing ? (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            paddingRight: spec.inputPaddingXPx,
            color: shell.placeholderColor,
            flexShrink: 0,
          }}
        >
          {trailing}
        </span>
      ) : null}
    </div>
  )
}

export function FormUiSelectLeadingControl({
  state = "default",
  leading,
  value,
  placeholder,
}: {
  state?: FormControlStateId
  leading: ReactNode
  value?: string
  placeholder?: string
}) {
  return (
    <FormUiLeadingControl
      state={state}
      leading={leading}
      value={value}
      placeholder={placeholder}
      trailing={<FormUiSelectChevron />}
    />
  )
}

/** @deprecated Usar FORM_UI_DEMO_COPY.toolbar */
export const FORM_UI_TOOLBAR_DEMO_COPY = FORM_UI_DEMO_COPY.toolbar

export function FormUiToolbarListFilters({
  variant = "flush",
  hideLabels,
  flush,
}: {
  variant?: FormToolbarContextVariantId
  hideLabels?: boolean
  flush?: boolean
}) {
  const variantOptions = getFormUiToolbarVariantOptions(variant)
  const resolvedHideLabels = hideLabels ?? variantOptions.hideLabels
  const resolvedFlush = flush ?? variantOptions.flush
  const copy = FORM_UI_DEMO_COPY.toolbar

  return (
    <div style={getFormUiToolbarContextShellStyle(resolvedFlush)}>
      <div style={getFormUiToolbarContextGridStyle()}>
        <div style={getFormUiToolbarContextCellStyle()}>
          <FormUiFieldStack label={copy.period.label} fullWidth hideLabel={resolvedHideLabels}>
            <FormUiSelectLeadingControl
              leading={<CalendarRange size={16} aria-hidden />}
              placeholder={copy.period.placeholder}
            />
          </FormUiFieldStack>
        </div>
        <div style={getFormUiToolbarContextCellStyle()}>
          <FormUiFieldStack label={copy.filters.label} fullWidth hideLabel={resolvedHideLabels}>
            <FormUiSelectLeadingControl
              leading={<Filter size={16} aria-hidden />}
              placeholder={copy.filters.placeholder}
            />
          </FormUiFieldStack>
        </div>
        <div style={getFormUiToolbarContextCellStyle(true)}>
          <FormUiFieldStack label={copy.search.label} fullWidth hideLabel={resolvedHideLabels}>
            <FormUiLeadingControl
              leading={<Search size={16} aria-hidden />}
              placeholder={copy.search.placeholder}
            />
          </FormUiFieldStack>
        </div>
      </div>
    </div>
  )
}

/** Demo embebida — misma composición que layout.toolbar en Layouts · Tablas. */
export function FormUiToolbarListFiltersEmbeddedDemo({
  variant = "flush",
}: {
  variant?: FormToolbarContextVariantId
}) {
  return (
    <div style={getFormUiToolbarEmbedShellStyle()}>
      <FormUiToolbarListFilters variant={variant} />
    </div>
  )
}
