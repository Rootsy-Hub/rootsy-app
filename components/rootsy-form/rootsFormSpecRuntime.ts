/**
 * Runtime de specs Formulario UI — misma resolución que formsUiHardcodedSpec.
 * Los componentes vivos aplican estos estilos inline para paridad exacta con Formulario UI.
 */

import {
  FORM_UI_CONTROL_TYPOGRAPHY,
  FORM_UI_LABEL_STYLE,
  FORM_UI_LEADING_SLOT_TYPOGRAPHY,
  getCompositeShellUiSurface,
  getCompositeValueUiStyle,
  getCheckboxUiSurface,
  getFormAssistUiStyle,
  getFormControlSpec,
  getFormControlUiSurface,
  getFormUiInlineIconShellStyle,
  getImageUploadThumbUiStyle,
  getImageUploadUiSurface,
  getLeadingSlotUiStyle,
  getSwitchUiSurface,
  type FormAssistVariantId,
  type FormControlStateId,
  type FormImageUploadDisplayStateId,
  type FormImageUploadModeId,
} from "@/app/[siteId]/[popId]/library/ui-components/formsUiHardcodedSpec"
import { ROOTSY_TEXT_STYLES } from "@/lib/design-system/tokens/typography"
import { rootsySpacePx } from "@/lib/design-system"
import type { CSSProperties } from "react"

/** Altura de línea body — selección debe abrazar el texto, no el control completo. */
const FORM_CONTROL_LINE_HEIGHT_PX = 20

function getFormSingleLinePaddingY(heightPx: number, borderPx = 2): number {
  return Math.max(0, (heightPx - borderPx - FORM_CONTROL_LINE_HEIGHT_PX) / 2)
}

export { FORM_UI_LABEL_STYLE, FORM_UI_CONTROL_TYPOGRAPHY, FORM_UI_LEADING_SLOT_TYPOGRAPHY }

export type RootsFormInteractionFlags = {
  disabled?: boolean
  invalid?: boolean
  hovered?: boolean
  focused?: boolean
  readonly?: boolean
}

/** Prioridad: disabled → error → focus → hover → default (spec Formulario UI). */
export function resolveFormControlState(flags: RootsFormInteractionFlags): FormControlStateId {
  if (flags.disabled) return "disabled"
  if (flags.invalid) return "error"
  if (flags.readonly) return "readonly"
  if (flags.focused) return "focus"
  if (flags.hovered) return "hover"
  return "default"
}

export function getFormTextControlStyle(
  state: FormControlStateId,
  options?: { multiline?: boolean },
): CSSProperties {
  const surface = getFormControlUiSurface(state)

  if (options?.multiline) {
    const spec = getFormControlSpec("textarea")
    return {
      ...FORM_UI_CONTROL_TYPOGRAPHY,
      display: "block",
      width: "100%",
      minHeight: spec.minHeightPx,
      padding: `${spec.paddingYPx}px ${spec.paddingXPx}px`,
      borderRadius: spec.radiusPx,
      backgroundColor: surface.backgroundColor,
      color: surface.color,
      border: surface.border,
      boxShadow: surface.boxShadow,
      opacity: surface.opacity,
      outline: "none",
      boxSizing: "border-box",
      transition: "color 150ms, box-shadow 150ms, border-color 150ms",
    }
  }

  const spec = getFormControlSpec("text")
  const paddingY = getFormSingleLinePaddingY(spec.heightPx)

  return {
    ...FORM_UI_CONTROL_TYPOGRAPHY,
    display: "block",
    width: "100%",
    height: spec.heightPx,
    lineHeight: ROOTSY_TEXT_STYLES.body.lineHeight,
    paddingTop: paddingY,
    paddingBottom: paddingY,
    paddingLeft: spec.paddingXPx,
    paddingRight: spec.paddingXPx,
    borderRadius: spec.radiusPx,
    backgroundColor: surface.backgroundColor,
    color: surface.color,
    border: surface.border,
    boxShadow: surface.boxShadow,
    opacity: surface.opacity,
    outline: "none",
    boxSizing: "border-box",
    transition: "color 150ms, box-shadow 150ms, border-color 150ms",
  }
}

export function getFormCompositeShellStyle(state: FormControlStateId): CSSProperties {
  const spec = getFormControlSpec("leading-currency")
  const surface = getCompositeShellUiSurface(state)

  return {
    display: "flex",
    alignItems: "center",
    width: "100%",
    height: spec.heightPx,
    overflow: "hidden",
    borderRadius: spec.radiusPx,
    backgroundColor: surface.backgroundColor,
    border: surface.border,
    boxShadow: surface.boxShadow,
    opacity: surface.opacity,
    outline: "none",
    boxSizing: "border-box",
    transition: "color 150ms, box-shadow 150ms, border-color 150ms",
  }
}

export function getFormLeadingPrefixStyle(
  state: FormControlStateId,
  options?: { numeric?: boolean },
): CSSProperties {
  const spec = getFormControlSpec("leading-currency")
  const leading = getLeadingSlotUiStyle(state)

  return {
    ...leading,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "stretch",
    width: spec.leadingSlotPx,
    flexShrink: 0,
    fontVariantNumeric: options?.numeric ? "tabular-nums" : undefined,
  }
}

export function getFormCompositeInputStyle(
  state: FormControlStateId,
  options?: { numeric?: boolean; hasTrailing?: boolean },
): CSSProperties {
  const spec = getFormControlSpec("leading-currency")
  const shell = getCompositeShellUiSurface(state)
  const valueStyle = getCompositeValueUiStyle(state)

  return {
    ...FORM_UI_CONTROL_TYPOGRAPHY,
    display: "block",
    width: "100%",
    minWidth: 0,
    flex: 1,
    lineHeight: ROOTSY_TEXT_STYLES.body.lineHeight,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: spec.inputPaddingXPx,
    paddingRight: options?.hasTrailing ? rootsySpacePx("050") : spec.inputPaddingXPx,
    border: "none",
    backgroundColor: valueStyle.backgroundColor,
    color: shell.color,
    opacity: valueStyle.opacity,
    outline: "none",
    boxShadow: "none",
    fontVariantNumeric: options?.numeric ? "tabular-nums" : undefined,
    boxSizing: "border-box",
  }
}

/** Grupo %/$ en RootsFormDiscountField — slot leading ancho. */
export function getFormDiscountModeGroupStyle(state: FormControlStateId): CSSProperties {
  const leading = getLeadingSlotUiStyle(state)

  return {
    display: "flex",
    width: "4.75rem",
    flexShrink: 0,
    alignSelf: "stretch",
    overflow: "hidden",
    borderRight: leading.borderRight,
    backgroundColor: "var(--rootsy-white)",
    opacity: leading.opacity,
  }
}

/** Botón % o $ en descuento — seleccionado = sunken bruma-50. */
export function getFormDiscountModeButtonStyle(
  state: FormControlStateId,
  selected: boolean,
): CSSProperties {
  const leading = getLeadingSlotUiStyle(state)

  return {
    ...FORM_UI_LEADING_SLOT_TYPOGRAPHY,
    flex: 1,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "stretch",
    fontWeight: selected ? 600 : 400,
    backgroundColor: selected ? leading.backgroundColor : "var(--rootsy-white)",
    color: selected ? "var(--rootsy-bruma-600)" : "var(--rootsy-bruma-400)",
    border: "none",
    cursor: "pointer",
    opacity: leading.opacity,
  }
}

export function getFormAssistStyle(variant: FormAssistVariantId): CSSProperties {
  return getFormAssistUiStyle(variant)
}

export function getFormFieldStackStyle(): CSSProperties {
  return {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    minWidth: 0,
    gap: 8,
  }
}

export function getFormCompositeValueAreaStyle(
  state: FormControlStateId,
  options?: { hasTrailing?: boolean; placeholder?: boolean },
): CSSProperties {
  const spec = getFormControlSpec("leading-currency")
  const shell = getCompositeShellUiSurface(state)
  const valueStyle = getCompositeValueUiStyle(state)

  return {
    ...FORM_UI_CONTROL_TYPOGRAPHY,
    display: "flex",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
    paddingLeft: spec.inputPaddingXPx,
    paddingRight: options?.hasTrailing ? rootsySpacePx("050") : spec.inputPaddingXPx,
    color: options?.placeholder ? shell.placeholderColor : shell.color,
    backgroundColor: valueStyle.backgroundColor,
    opacity: valueStyle.opacity,
  }
}

export function getFormSelectTriggerStyle(
  state: FormControlStateId,
  options?: { prefixed?: boolean; inlineIcon?: boolean },
): CSSProperties {
  if (options?.inlineIcon) {
    const { spec, shell, gapPx, paddingXPx } = getFormUiInlineIconShellStyle(state)

    return {
      ...FORM_UI_CONTROL_TYPOGRAPHY,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      height: spec.heightPx,
      paddingLeft: paddingXPx,
      paddingRight: paddingXPx,
      gap: gapPx,
      borderRadius: spec.radiusPx,
      backgroundColor: shell.backgroundColor,
      color: shell.color,
      border: shell.border,
      boxShadow: shell.boxShadow,
      opacity: shell.opacity,
      outline: "none",
      boxSizing: "border-box",
      transition: "color 150ms, box-shadow 150ms, border-color 150ms",
      cursor: "default",
    }
  }

  if (options?.prefixed) {
    const surface = getCompositeShellUiSurface(state)

    return {
      ...FORM_UI_CONTROL_TYPOGRAPHY,
      ...getFormCompositeShellStyle(state),
      color: surface.color,
      width: "100%",
      cursor: "default",
    }
  }

  const spec = getFormControlSpec("select")
  const surface = getFormControlUiSurface(state)

  return {
    ...FORM_UI_CONTROL_TYPOGRAPHY,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    width: "100%",
    height: spec.heightPx,
    paddingLeft: spec.paddingXPx,
    paddingRight: spec.paddingXPx,
    borderRadius: spec.radiusPx,
    backgroundColor: surface.backgroundColor,
    color: surface.color,
    border: surface.border,
    boxShadow: surface.boxShadow,
    opacity: surface.opacity,
    outline: "none",
    boxSizing: "border-box",
    transition: "color 150ms, box-shadow 150ms, border-color 150ms",
    cursor: "default",
  }
}

export function getFormSelectChevronWrapStyle(state: FormControlStateId): CSSProperties {
  const spec = getFormControlSpec("select")
  const surface = getFormControlUiSurface(state)

  return {
    display: "inline-flex",
    alignItems: "center",
    flexShrink: 0,
    paddingRight: spec.paddingXPx,
    color: surface.placeholderColor,
  }
}

export function getFormDateTriggerStyle(
  state: FormControlStateId,
  options?: { prefixed?: boolean },
): CSSProperties {
  if (options?.prefixed) {
    const surface = getCompositeShellUiSurface(state)

    return {
      ...FORM_UI_CONTROL_TYPOGRAPHY,
      ...getFormCompositeShellStyle(state),
      color: surface.color,
      width: "100%",
      cursor: "pointer",
    }
  }

  const spec = getFormControlSpec("date")
  const surface = getFormControlUiSurface(state)

  return {
    ...FORM_UI_CONTROL_TYPOGRAPHY,
    display: "flex",
    alignItems: "center",
    width: "100%",
    height: spec.heightPx,
    paddingLeft: spec.paddingXPx,
    paddingRight: spec.paddingXPx,
    borderRadius: spec.radiusPx,
    backgroundColor: surface.backgroundColor,
    color: surface.color,
    border: surface.border,
    boxShadow: surface.boxShadow,
    opacity: surface.opacity,
    outline: "none",
    boxSizing: "border-box",
    transition: "color 150ms, box-shadow 150ms, border-color 150ms",
    cursor: "pointer",
    textAlign: "left",
  }
}

export function getFormDateValueStyle(
  state: FormControlStateId,
  options?: { prefixed?: boolean; placeholder?: boolean },
): CSSProperties {
  if (options?.prefixed) {
    return getFormCompositeValueAreaStyle(state, { placeholder: options.placeholder })
  }

  const surface = getFormControlUiSurface(state)

  return {
    ...FORM_UI_CONTROL_TYPOGRAPHY,
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    color: options?.placeholder ? surface.placeholderColor : surface.color,
  }
}

export function getFormInlineIconSearchShellStyle(state: FormControlStateId): CSSProperties {
  const { spec, shell, gapPx, paddingXPx } = getFormUiInlineIconShellStyle(state)

  return {
    display: "flex",
    alignItems: "center",
    width: "100%",
    height: spec.heightPx,
    paddingLeft: paddingXPx,
    paddingRight: paddingXPx,
    gap: gapPx,
    borderRadius: spec.radiusPx,
    backgroundColor: shell.backgroundColor,
    border: shell.border,
    boxShadow: shell.boxShadow,
    opacity: shell.opacity,
    outline: "none",
    boxSizing: "border-box",
    transition: "color 150ms, box-shadow 150ms, border-color 150ms",
  }
}

export function getFormInlineIconSearchInputStyle(state: FormControlStateId): CSSProperties {
  const shell = getFormControlUiSurface(state)

  return {
    ...FORM_UI_CONTROL_TYPOGRAPHY,
    flex: 1,
    minWidth: 0,
    border: "none",
    background: "transparent",
    outline: "none",
    boxShadow: "none",
    color: shell.color,
    padding: 0,
  }
}

export function getFormChoiceLabelStyle(
  control: "checkbox" | "switch" = "switch",
): CSSProperties {
  const lineHeightPx =
    control === "checkbox"
      ? getFormControlSpec("checkbox").sizePx
      : getFormControlSpec("switch").heightPx

  return {
    ...FORM_UI_CONTROL_TYPOGRAPHY,
    lineHeight: `${lineHeightPx}px`,
    color: getFormControlUiSurface("default").color,
  }
}

export function getFormChoiceDescriptionStyle(): CSSProperties {
  return {
    display: "block",
    marginTop: 2,
    fontFamily: "var(--rootsy-font-ui)",
    fontSize: ROOTSY_TEXT_STYLES["body.small"].fontSize,
    lineHeight: ROOTSY_TEXT_STYLES["body.small"].lineHeight,
    fontWeight: 400,
    color: getFormControlUiSurface("default").placeholderColor,
  }
}

export function getFormCheckboxStyle(
  state: FormControlStateId,
  checked: boolean,
): CSSProperties {
  const spec = getFormControlSpec("checkbox")
  const surface = getCheckboxUiSurface(checked, state)

  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: spec.sizePx,
    height: spec.sizePx,
    borderRadius: spec.radiusPx,
    backgroundColor: surface.backgroundColor,
    color: surface.color,
    border: surface.border,
    boxShadow: surface.boxShadow,
    opacity: surface.opacity,
    flexShrink: 0,
    outline: "none",
    boxSizing: "border-box",
    cursor: state === "disabled" ? "not-allowed" : "pointer",
    transition: "color 150ms, box-shadow 150ms, border-color 150ms, background-color 150ms",
  }
}

export function getFormSwitchTrackStyle(
  state: FormControlStateId,
  on: boolean,
): CSSProperties {
  const spec = getFormControlSpec("switch")
  const surface = getSwitchUiSurface(on, state)
  const inset = rootsySpacePx("025")

  return {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    width: spec.widthPx,
    height: spec.heightPx,
    padding: inset,
    borderRadius: 9999,
    backgroundColor: surface.trackColor,
    boxShadow: surface.boxShadow,
    opacity: surface.opacity,
    flexShrink: 0,
    border: "none",
    outline: "none",
    boxSizing: "border-box",
    cursor: state === "disabled" ? "not-allowed" : "pointer",
    transition: "background-color 200ms ease-out, box-shadow 150ms",
  }
}

export function getFormSwitchThumbStyle(on: boolean): CSSProperties {
  const spec = getFormControlSpec("switch")
  const inset = rootsySpacePx("025")
  const surface = getSwitchUiSurface(on)
  const travelPx = spec.widthPx - spec.thumbPx - inset * 2

  return {
    display: "block",
    width: spec.thumbPx,
    height: spec.thumbPx,
    borderRadius: 9999,
    backgroundColor: surface.thumbColor,
    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.18)",
    transform: on ? `translateX(${travelPx}px)` : "translateX(0)",
    transition: "transform 200ms ease-out",
    pointerEvents: "none",
  }
}

export function getFormImageUploadShellStyle(
  mode: FormImageUploadModeId,
  state: FormImageUploadDisplayStateId,
): CSSProperties {
  const spec = getFormControlSpec("image-upload")
  const shell = getImageUploadUiSurface(mode, state)

  return {
    display: "flex",
    alignItems: "center",
    width: "100%",
    gap: spec.gapPx,
    padding: spec.shellPaddingPx,
    borderRadius: spec.radiusPx,
    backgroundColor: shell.backgroundColor,
    border: shell.border,
    borderStyle: shell.borderStyle,
    boxShadow: shell.boxShadow,
    opacity: shell.opacity,
    boxSizing: "border-box",
    transition: "box-shadow 150ms, background-color 150ms, border-color 150ms",
  }
}

export function getFormImageUploadThumbStyle(
  mode: FormImageUploadModeId,
  state: FormImageUploadDisplayStateId,
): CSSProperties {
  const spec = getFormControlSpec("image-upload")
  const thumb = getImageUploadThumbUiStyle(mode, state)

  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: spec.thumbPx,
    height: spec.thumbPx,
    flexShrink: 0,
    borderRadius: thumb.borderRadiusPx,
    backgroundColor: thumb.backgroundColor,
    border: thumb.border,
    borderStyle: thumb.borderStyle,
    opacity: thumb.opacity,
    overflow: "hidden",
    color: "var(--rootsy-bruma-500)",
  }
}

/** Segment group — radio interior concéntrico: radius.large − space.050. */
const FORM_SEGMENT_OUTER_RADIUS_PX = 12
const FORM_SEGMENT_INSET_PX = rootsySpacePx("050")
const FORM_SEGMENT_GAP_PX = rootsySpacePx("050")
const FORM_SEGMENT_INDICATOR_RADIUS_PX = FORM_SEGMENT_OUTER_RADIUS_PX - FORM_SEGMENT_INSET_PX

export function getFormSegmentIndicatorLayoutStyle(
  optionCount: number,
  selectedIndex: number,
): CSSProperties {
  const gapsTotal = (optionCount - 1) * FORM_SEGMENT_GAP_PX

  return {
    top: FORM_SEGMENT_INSET_PX,
    bottom: FORM_SEGMENT_INSET_PX,
    left: FORM_SEGMENT_INSET_PX,
    width: `calc((100% - ${FORM_SEGMENT_INSET_PX * 2}px - ${gapsTotal}px) / ${optionCount})`,
    transform: `translateX(calc(${selectedIndex} * (100% + ${FORM_SEGMENT_GAP_PX}px)))`,
    borderRadius: FORM_SEGMENT_INDICATOR_RADIUS_PX,
  }
}

export const FORM_SEGMENT_INDICATOR_RADIUS = FORM_SEGMENT_INDICATOR_RADIUS_PX
