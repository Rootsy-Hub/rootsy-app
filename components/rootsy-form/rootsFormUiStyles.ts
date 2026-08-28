/**
 * Estilos RootsForm — tokens de fundamentos nuevos (border · elevation · bruma · savia).
 * Paridad con formsUiHardcodedSpec — space.500 · space.150 · space.100 · radius.large.
 */

import { cn } from "@/lib/utils"

/** radius.large — 12px en controles de formulario. */
export const rootsFormUiControlRadiusClass = "rounded-[12px]"

/** Selección de texto — bruma-100 · bruma-950. */
export const rootsFormControlSelectionClass =
  "selection:bg-[var(--rootsy-bruma-100)] selection:text-[var(--rootsy-bruma-950)]"

/** field-stack · space.100 (8px) entre label, control y assist. */
export const rootsFormUiFieldStackClass = "flex w-full min-w-0 flex-col gap-2"

/** form.field.label · font.body medium · bruma-700. */
export const rootsFormUiLabelClass =
  "rootsy-text-body font-medium text-[var(--rootsy-bruma-700)]"

/** Tipografía de control · font.body regular · bruma-950. */
export const rootsFormUiControlTypographyClass =
  "rootsy-text-body text-[var(--rootsy-bruma-950)]"

/** Hover reposo — bruma-300 · sin ring. Solo cuando el control no tiene foco. */
const rootsFormUiControlHoverClass =
  "hover:not-focus-visible:border-[var(--rootsy-bruma-300)] hover:not-focus-visible:shadow-none"

const rootsFormUiAffixShellHoverClass =
  "hover:not-focus-within:border-[var(--rootsy-bruma-300)] hover:not-focus-within:shadow-none"

/** Superficie base — elevation.surface.overlay · color.border · sin sombra. */
export const rootsFormUiControlBaseClass = cn(
  "w-full min-w-0 border border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-white)] shadow-none outline-none transition-[color,box-shadow,border-color]",
  rootsFormUiControlRadiusClass,
  rootsFormUiControlHoverClass,
  "placeholder:text-[var(--rootsy-bruma-700)]",
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  "aria-invalid:border-[var(--rootsy-lava-500)] aria-invalid:shadow-[0_0_0_2px_color-mix(in_srgb,var(--rootsy-lava-500)_25%,transparent)]",
  "focus-visible:border-[var(--rootsy-savia-400)] focus-visible:shadow-[0_0_0_2px_color-mix(in_srgb,var(--rootsy-savia-400)_45%,transparent)] focus-visible:ring-0",
  rootsFormUiControlTypographyClass,
)

/** form.control.text · space.500 × space.150. */
export const rootsFormUiTextFieldClass = cn(rootsFormUiControlBaseClass, "h-10 px-3")

/** form.control.textarea · min space.600+300 · inset space.150 × space.100. */
export const rootsFormUiTextareaFieldClass = cn(
  rootsFormUiControlBaseClass,
  "min-h-[4.5rem] resize-y px-3 py-2 leading-relaxed",
)

/** form.control.shell.leading-sunken — shell compuesta · hover bruma · focus savia. */
export const rootsFormUiAffixShellClass = cn(
  "group flex h-10 w-full min-w-0 items-stretch overflow-hidden border border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-white)] shadow-none outline-none transition-[color,box-shadow,border-color]",
  rootsFormUiControlRadiusClass,
  rootsFormUiAffixShellHoverClass,
  "focus-within:border-[var(--rootsy-savia-400)] focus-within:shadow-[0_0_0_2px_color-mix(in_srgb,var(--rootsy-savia-400)_45%,transparent)] focus-within:ring-0",
  "aria-invalid:border-[var(--rootsy-lava-500)] aria-invalid:shadow-[0_0_0_2px_color-mix(in_srgb,var(--rootsy-lava-500)_25%,transparent)]",
)

/** Slot leading — sin divisor. El prefijo es tinta dentro del mismo campo. */
export const rootsFormUiAffixPrefixSunkenClass = cn(
  "inline-flex w-10 shrink-0 items-center justify-center self-stretch bg-transparent rootsy-text-body font-medium leading-none text-[var(--rootsy-bruma-700)]",
  "[&_svg]:size-4 [&_svg]:shrink-0",
)

export const rootsFormUiAffixInputClass = cn(
  rootsFormUiControlTypographyClass,
  "h-full min-w-0 flex-1 bg-transparent px-3 outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed placeholder:text-[var(--rootsy-bruma-700)]",
)

export const rootsFormUiSelectTriggerClass = cn(
  rootsFormUiControlBaseClass,
  "flex h-10 items-center justify-between gap-2 px-3",
  "data-[state=closed]:focus:!border-[var(--rootsy-bruma-200)] data-[state=closed]:focus:!shadow-none",
  "[&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:flex-1 [&_[data-slot=select-value]]:truncate [&_[data-slot=select-value]]:text-left",
  "[&_[data-slot=select-value][data-placeholder]]:text-[var(--rootsy-bruma-700)]",
)

export const rootsFormUiPrefixedSelectTriggerClass = cn(
  rootsFormUiAffixShellClass,
  rootsFormUiControlTypographyClass,
  "flex h-10 items-stretch gap-0 p-0",
  "data-[state=closed]:focus:!border-[var(--rootsy-bruma-200)] data-[state=closed]:focus:!shadow-none",
  "data-[state=closed]:focus-within:!border-[var(--rootsy-bruma-200)] data-[state=closed]:focus-within:!shadow-none",
  "[&_[data-slot=select-value]]:flex [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:flex-1 [&_[data-slot=select-value]]:items-center [&_[data-slot=select-value]]:px-3",
  "[&_[data-slot=select-value][data-placeholder]]:text-[var(--rootsy-bruma-700)]",
)

/** form.control.shell.inline-icon — fondo blanco · ícono inline · space.100 gap. */
export const rootsFormUiInlineIconShellClass = cn(
  "flex h-10 w-full min-w-0 items-center gap-2 overflow-hidden border border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-white)] px-3 shadow-none outline-none transition-[color,box-shadow,border-color]",
  rootsFormUiControlRadiusClass,
  rootsFormUiAffixShellHoverClass,
  "focus-within:border-[var(--rootsy-savia-400)] focus-within:shadow-[0_0_0_2px_color-mix(in_srgb,var(--rootsy-savia-400)_45%,transparent)] focus-within:ring-0",
  rootsFormUiControlTypographyClass,
)

export const rootsFormUiInlineIconPrefixedSelectTriggerClass = cn(
  rootsFormUiInlineIconShellClass,
  "justify-between gap-2 p-0 pl-3",
  "data-[state=closed]:focus:!border-[var(--rootsy-bruma-200)] data-[state=closed]:focus:!shadow-none",
  "[&_[data-slot=select-value]]:flex [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:flex-1 [&_[data-slot=select-value]]:items-center",
  "[&_[data-slot=select-value][data-placeholder]]:text-[var(--rootsy-bruma-700)]",
)

export const rootsFormUiInlineIconPrefixClass =
  "inline-flex shrink-0 items-center text-[var(--rootsy-bruma-700)] [&_svg]:size-4 [&_svg]:shrink-0"

export const rootsFormUiDateTriggerClass = cn(
  rootsFormUiControlBaseClass,
  "flex h-10 items-center px-3 text-left",
  "data-[state=closed]:focus:!border-[var(--rootsy-bruma-200)] data-[state=closed]:focus:!shadow-none",
  "[&_[data-slot=date-value]]:min-w-0 [&_[data-slot=date-value]]:flex-1 [&_[data-slot=date-value]]:truncate",
  "[&_[data-slot=date-value][data-placeholder]]:text-[var(--rootsy-bruma-700)]",
)

export const rootsFormUiPrefixedDateTriggerClass = cn(
  rootsFormUiAffixShellClass,
  rootsFormUiControlTypographyClass,
  "flex h-10 items-stretch gap-0 p-0 text-left",
  "data-[state=closed]:focus:!border-[var(--rootsy-bruma-200)] data-[state=closed]:focus:!shadow-none",
  "data-[state=closed]:focus-within:!border-[var(--rootsy-bruma-200)] data-[state=closed]:focus-within:!shadow-none",
  "[&_[data-slot=date-value]]:flex [&_[data-slot=date-value]]:min-w-0 [&_[data-slot=date-value]]:flex-1 [&_[data-slot=date-value]]:items-center [&_[data-slot=date-value]]:px-3 [&_[data-slot=date-value]]:truncate",
  "[&_[data-slot=date-value][data-placeholder]]:text-[var(--rootsy-bruma-700)]",
)

/** form.assist.* · body.small. */
export const rootsFormUiFieldHintClass =
  "block font-canopy text-xs leading-4 text-[var(--rootsy-bruma-700)]"

export const rootsFormUiFieldErrorClass =
  "block font-canopy text-xs leading-4 text-[var(--rootsy-lava-700)]"

export const rootsFormUiFieldWarningClass =
  "block font-canopy text-xs leading-4 text-[var(--rootsy-sol-700)]"

export const rootsFormUiFieldSuccessClass =
  "block font-canopy text-xs leading-4 text-[var(--rootsy-savia-700)]"

export const rootsFormUiCheckboxClass = cn(
  "size-4 shrink-0 rounded-[4px] border border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-white)] shadow-none [&_[data-slot=checkbox-indicator]_svg]:size-3.5",
  "data-[state=checked]:border-[var(--rootsy-savia-500)] data-[state=checked]:bg-[var(--rootsy-savia-500)] data-[state=checked]:text-[var(--rootsy-savia-950)]",
  "focus-visible:shadow-[0_0_0_2px_color-mix(in_srgb,var(--rootsy-savia-400)_45%,transparent)] focus-visible:ring-0",
  "disabled:cursor-not-allowed disabled:opacity-50",
)

/** Fila inline checkbox/switch — control · gap.100 · label body. */
export const rootsFormUiChoiceRowClass =
  "flex max-w-full cursor-pointer select-none items-center gap-2"

export const rootsFormUiChoiceTextWrapClass = "flex min-w-0 flex-1 items-center"

export const rootsFormUiChoiceLabelClass =
  "font-canopy text-sm font-normal text-[var(--rootsy-bruma-950)]"

export const rootsFormUiChoiceDescriptionClass =
  "mt-0.5 block font-canopy text-xs leading-4 text-[var(--rootsy-bruma-700)]"

export const rootsFormUiSwitchTrackClass = cn(
  "inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 outline-none transition-colors duration-200 ease-out",
  "data-[state=unchecked]:bg-[var(--rootsy-bruma-200)] data-[state=checked]:bg-[var(--rootsy-savia-500)]",
  "focus-visible:shadow-[0_0_0_2px_color-mix(in_srgb,var(--rootsy-savia-400)_45%,transparent)] focus-visible:ring-0",
  "disabled:cursor-not-allowed disabled:opacity-50",
)

export const rootsFormUiSwitchBoxClass = cn(
  "flex h-10 w-full min-w-0 cursor-pointer select-none items-center border border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-white)] px-3 shadow-none transition-[background-color,border-color,box-shadow]",
  rootsFormUiControlRadiusClass,
  "hover:not-focus-within:border-[var(--rootsy-bruma-300)] hover:not-focus-within:shadow-none",
)

export const rootsFormUiImageUploadShellClass = cn(
  "flex w-full min-w-0 items-center gap-3 border border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-white)] px-2 py-2 shadow-none transition-[box-shadow,background-color,border-color] duration-150",
  rootsFormUiControlRadiusClass,
)

export const rootsFormUiImageUploadShellEmptyClass = cn(
  rootsFormUiImageUploadShellClass,
  "cursor-pointer appearance-none border-dashed text-left",
  "hover:border-[var(--rootsy-bruma-300)] hover:bg-[var(--rootsy-bruma-50)]",
  "focus-visible:outline-none focus-visible:border-[var(--rootsy-savia-400)] focus-visible:shadow-[0_0_0_2px_color-mix(in_srgb,var(--rootsy-savia-400)_45%,transparent)]",
)

export const rootsFormUiImageUploadThumbClass =
  "relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-[8px] border border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-bruma-50)]"

/**
 * form.control.segment — default claro = bruma + pastilla blanca.
 * No usa --color-* en light: el html lleva .dark y esos tokens se vuelven sombra.
 */
export const rootsFormUiSegmentGroupClass = cn(
  "relative grid h-10 w-full gap-1 rounded-[12px] border border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-bruma-50)] p-1 shadow-none",
)

export const rootsFormUiSegmentGroupDarkClass = cn(
  "relative grid h-10 w-full gap-1 rounded-[12px] border border-[var(--color-borde)] bg-[var(--color-superficie)] p-1 shadow-none",
)

/** Filtro en línea — sin track; la pastilla activa es bruma 50. */
export const rootsFormUiSegmentGroupInlineClass = cn(
  "relative flex h-10 w-full gap-1 rounded-[12px] border-0 bg-transparent p-1 shadow-none",
)

/** Default claro — pastilla blanca (alias savia 50). */
export const rootsFormUiSegmentSelectedSurfaceLightClass =
  "bg-[var(--rootsy-white)] shadow-sm"

/** Filtro inline — activo blanco sobre el aire bruma-50 de bloques. */
export const rootsFormUiSegmentSelectedSurfaceFilterLightClass =
  "bg-[var(--rootsy-white)] shadow-sm ring-1 ring-[var(--rootsy-bruma-200)]"

/** Oscuro — foco sobre elevada de la atmósfera. */
export const rootsFormUiSegmentSelectedSurfaceDarkClass =
  "bg-[color-mix(in_srgb,var(--color-foco)_18%,var(--color-elevada))] shadow-sm"

export const rootsFormUiSegmentSelectedSurfaceClass =
  rootsFormUiSegmentSelectedSurfaceLightClass

export const rootsFormUiSegmentIndicatorClass = cn(
  "pointer-events-none absolute transition-transform duration-200 ease-out",
  rootsFormUiSegmentSelectedSurfaceLightClass,
)

export function rootsFormUiSegmentOptionClass(selected: boolean, disabled?: boolean) {
  return cn(
    "rootsy-text-body relative z-[1] inline-flex h-full min-w-0 items-center justify-center gap-2 rounded-[8px] px-3 font-medium transition-colors duration-150",
    "focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_color-mix(in_srgb,var(--rootsy-savia-400)_45%,transparent)]",
    disabled && "pointer-events-none opacity-50",
    selected
      ? "text-[var(--rootsy-bruma-950)]"
      : "text-[var(--rootsy-bruma-700)] hover:text-[var(--rootsy-bruma-950)]",
  )
}

export function rootsFormUiSegmentOptionDarkClass(selected: boolean, disabled?: boolean) {
  return cn(
    "rootsy-text-body relative z-[1] inline-flex h-full min-w-0 items-center justify-center gap-2 rounded-[8px] px-3 font-medium transition-colors duration-150",
    "focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_color-mix(in_srgb,var(--color-foco)_45%,transparent)]",
    disabled && "pointer-events-none opacity-50",
    selected
      ? "text-[var(--color-texto)]"
      : "text-[var(--color-texto-muted)] hover:text-[var(--color-texto)]",
  )
}

/** Prefijo dual %/$ en descuento — sin divisor hacia el valor. */
export const rootsFormUiDiscountModePrefixClass = cn(
  "flex w-[4.75rem] shrink-0 self-stretch overflow-hidden bg-transparent",
  "[&>button:first-child]:border-r [&>button:first-child]:border-[var(--rootsy-bruma-200)] [&>button:first-child]:transition-[border-color]",
  "group-hover:[&>button:first-child]:border-[var(--rootsy-bruma-300)]",
  "group-focus-within:[&>button:first-child]:border-[var(--rootsy-savia-400)]",
)

export function rootsFormUiDiscountModeButtonClass(
  selected: boolean,
  optionDisabled?: boolean,
) {
  return cn(
    "relative inline-flex flex-1 items-center justify-center self-stretch text-sm font-semibold leading-none tabular-nums transition-[color,background-color,border-color] duration-150",
    "focus-visible:outline-none focus-visible:ring-0",
    optionDisabled && "opacity-45",
    selected
      ? "bg-[var(--rootsy-bruma-50)] font-semibold text-[var(--rootsy-bruma-600)]"
      : "bg-[var(--rootsy-blanco)] text-[var(--rootsy-bruma-700)] hover:text-[var(--rootsy-bruma-950)]",
  )
}

/** Botón borrar en shells affix (descuento, búsqueda). */
export const rootsFormUiAffixClearButtonClass = cn(
  "absolute right-1 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-[var(--rootsy-bruma-700)] transition-[color,background-color] duration-150",
  "hover:bg-[var(--rootsy-bruma-50)] hover:text-[var(--rootsy-bruma-900)]",
  "focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_color-mix(in_srgb,var(--rootsy-savia-400)_45%,transparent)]",
)

/** Divider horizontal — color.border · hairline 1px. */
export const rootsFormUiSectionDividerClass =
  "h-px w-full shrink-0 bg-[var(--rootsy-bruma-200)]"

/** Divider entre filas repetibles — color.border. */
export const rootsFormUiItemDividerClass =
  "my-2.5 h-px w-full shrink-0 bg-[var(--rootsy-bruma-200)]"
