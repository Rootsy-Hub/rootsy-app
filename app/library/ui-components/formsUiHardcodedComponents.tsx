"use client"

import {
  FORM_UI_DEMO_COPY,
  FORM_UI_FIELD_STACK,
  FORM_UI_LABEL_STYLE,
  getCompositeShellUiSurface,
  getCompositeValueUiStyle,
  getFormControlSpec,
  getFormUiInlineIconShellStyle,
  getFormUiToolbarContextCellStyle,
  getFormUiToolbarContextGridStyle,
  getFormUiToolbarContextShellStyle,
  getFormUiToolbarEmbedShellStyle,
  getFormUiToolbarTableHeadPreviewStyle,
  getFormUiToolbarVariantOptionsWithShell,
  getLeadingSlotUiStyle,
  type FormControlStateId,
  type FormToolbarContextVariantId,
  type FormToolbarControlShellId,
} from "@/app/library/ui-components/formsUiHardcodedSpec"
import { rootsySpacePx } from "@/lib/design-system"
import { CalendarRange, ChevronDown, Filter, Search } from "lucide-react"
import type { CSSProperties, ReactNode } from "react"

export function FormUiSelectChevron({ size = 12 }: { size?: number }) {
  return <ChevronDown size={size} aria-hidden style={{ flexShrink: 0 }} />
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

/** form.control.shell.inline-icon — ícono + valor en fondo blanco, sin casilla sunken. */
export function FormUiInlineIconControl({
  state = "default",
  leading,
  value,
  placeholder,
  trailing,
}: {
  state?: FormControlStateId
  leading: ReactNode
  value?: string
  placeholder?: string
  trailing?: ReactNode
}) {
  const { spec, shell, iconColor, gapPx, paddingXPx, typography } = getFormUiInlineIconShellStyle(state)

  const shellStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    width: "100%",
    height: spec.heightPx,
    borderRadius: spec.radiusPx,
    backgroundColor: shell.backgroundColor,
    border: shell.border,
    boxShadow: shell.boxShadow,
    opacity: shell.opacity,
    paddingLeft: paddingXPx,
    paddingRight: paddingXPx,
    gap: gapPx,
    userSelect: "none",
    overflow: "hidden",
  }

  const valueStyle: CSSProperties = {
    ...typography,
    display: "flex",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
    color: value ? shell.color : shell.placeholderColor,
  }

  return (
    <div aria-hidden style={shellStyle}>
      <span style={{ display: "inline-flex", alignItems: "center", color: iconColor, flexShrink: 0 }}>
        {leading}
      </span>
      <span style={valueStyle}>{value ?? placeholder}</span>
      {trailing ? (
        <span style={{ display: "inline-flex", alignItems: "center", color: shell.placeholderColor, flexShrink: 0 }}>
          {trailing}
        </span>
      ) : null}
    </div>
  )
}

export function FormUiSelectInlineIconControl({
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
    <FormUiInlineIconControl
      state={state}
      leading={leading}
      value={value}
      placeholder={placeholder}
      trailing={<FormUiSelectChevron size={16} />}
    />
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
    color: leadingStyle.color,
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
      trailing={<FormUiSelectChevron size={12} />}
    />
  )
}

function FormUiToolbarFieldControl({
  role,
  controlShell,
  state = "default",
}: {
  role: "period" | "filters" | "search"
  controlShell: FormToolbarControlShellId
  state?: FormControlStateId
}) {
  const copy = FORM_UI_DEMO_COPY.toolbar

  if (controlShell === "inline-icon") {
    if (role === "period") {
      return (
        <FormUiSelectInlineIconControl
          state={state}
          leading={<CalendarRange size={16} aria-hidden />}
          placeholder={copy.period.placeholder}
        />
      )
    }
    if (role === "filters") {
      return (
        <FormUiSelectInlineIconControl
          state={state}
          leading={<Filter size={16} aria-hidden />}
          placeholder={copy.filters.placeholder}
        />
      )
    }
    return (
      <FormUiInlineIconControl
        state={state}
        leading={<Search size={16} aria-hidden />}
        placeholder={copy.search.placeholder}
      />
    )
  }

  if (role === "period") {
    return (
      <FormUiSelectLeadingControl
        state={state}
        leading={<CalendarRange size={16} aria-hidden />}
        placeholder={copy.period.placeholder}
      />
    )
  }
  if (role === "filters") {
    return (
      <FormUiSelectLeadingControl
        state={state}
        leading={<Filter size={16} aria-hidden />}
        placeholder={copy.filters.placeholder}
      />
    )
  }
  return (
    <FormUiLeadingControl
      state={state}
      leading={<Search size={16} aria-hidden />}
      placeholder={copy.search.placeholder}
    />
  )
}

/** @deprecated Usar FORM_UI_DEMO_COPY.toolbar */
export const FORM_UI_TOOLBAR_DEMO_COPY = FORM_UI_DEMO_COPY.toolbar

export function FormUiToolbarListFilters({
  variant = "flush",
  controlShell,
  hideLabels,
  flush,
}: {
  variant?: FormToolbarContextVariantId
  controlShell?: FormToolbarControlShellId
  hideLabels?: boolean
  flush?: boolean
}) {
  const variantOptions = getFormUiToolbarVariantOptionsWithShell(variant, controlShell)
  const resolvedHideLabels = hideLabels ?? variantOptions.hideLabels
  const resolvedFlush = flush ?? variantOptions.flush
  const resolvedControlShell = controlShell ?? variantOptions.controlShell
  const copy = FORM_UI_DEMO_COPY.toolbar

  return (
    <div style={getFormUiToolbarContextShellStyle(resolvedFlush)}>
      <div style={getFormUiToolbarContextGridStyle()}>
        <div style={getFormUiToolbarContextCellStyle()}>
          <FormUiFieldStack label={copy.period.label} fullWidth hideLabel={resolvedHideLabels}>
            <FormUiToolbarFieldControl role="period" controlShell={resolvedControlShell} />
          </FormUiFieldStack>
        </div>
        <div style={getFormUiToolbarContextCellStyle()}>
          <FormUiFieldStack label={copy.filters.label} fullWidth hideLabel={resolvedHideLabels}>
            <FormUiToolbarFieldControl role="filters" controlShell={resolvedControlShell} />
          </FormUiFieldStack>
        </div>
        <div style={getFormUiToolbarContextCellStyle(true)}>
          <FormUiFieldStack label={copy.search.label} fullWidth hideLabel={resolvedHideLabels}>
            <FormUiToolbarFieldControl role="search" controlShell={resolvedControlShell} />
          </FormUiFieldStack>
        </div>
      </div>
    </div>
  )
}

/** Demo embebida — misma composición que layout.toolbar en Layouts · Tablas. */
export function FormUiToolbarListFiltersEmbeddedDemo({
  variant = "flush",
  controlShell = "inline-icon",
  withTableHead = false,
}: {
  variant?: FormToolbarContextVariantId
  controlShell?: FormToolbarControlShellId
  withTableHead?: boolean
}) {
  return (
    <>
      <div style={getFormUiToolbarEmbedShellStyle()}>
        <FormUiToolbarListFilters variant={variant} controlShell={controlShell} />
      </div>
      {withTableHead ? <FormUiToolbarTableHeadPreview /> : null}
    </>
  )
}

function FormUiToolbarTableHeadPreview() {
  const columns = ["Artículo", "Referencia", "Monto", "Estado"]

  return (
    <div style={getFormUiToolbarTableHeadPreviewStyle()}>
      {columns.map((column) => (
        <span key={column}>{column}</span>
      ))}
    </div>
  )
}
