"use client"

import { RootsFormCheckbox } from "@/components/rootsy-form/RootsFormCheckbox"
import {
  getFormChoiceDescriptionStyle,
  getFormChoiceLabelStyle,
} from "@/components/rootsy-form/rootsFormSpecRuntime"
import { useRootsFormControlTone } from "@/components/rootsy-form/rootsFormFieldContext"
import {
  rootsFormUiChoiceDescriptionClass,
  rootsFormUiChoiceLabelClass,
  rootsFormUiChoiceRowClass,
  rootsFormUiChoiceTextWrapClass,
} from "@/components/rootsy-form/rootsFormUiStyles"
import { cn } from "@/lib/utils"
import { useId, useRef } from "react"

type Props = {
  label: string
  description?: string
  /** Reserva altura de la línea de descripción aunque esté vacía — ritmo parejo en listas. */
  reserveDescriptionSpace?: boolean
  id?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  invalid?: boolean
  className?: string
}

export function RootsFormCheckboxField({
  label,
  description,
  reserveDescriptionSpace = false,
  id,
  checked,
  onCheckedChange,
  disabled,
  invalid,
  className,
}: Props) {
  const autoId = useId()
  const checkboxId = id ?? autoId
  const checkboxRef = useRef<HTMLButtonElement>(null)
  const tone = useRootsFormControlTone()
  const styleOptions = { tone }
  const labelStyle = getFormChoiceLabelStyle("checkbox", styleOptions)
  const descriptionStyle = getFormChoiceDescriptionStyle(styleOptions)
  const hasDescriptionBlock = Boolean(description) || reserveDescriptionSpace

  return (
    <label
      htmlFor={checkboxId}
      className={cn(
        rootsFormUiChoiceRowClass,
        hasDescriptionBlock ? "items-start" : "items-center",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      <RootsFormCheckbox
        ref={checkboxRef}
        id={checkboxId}
        checked={checked}
        invalid={invalid}
        className={cn("shrink-0 self-start", hasDescriptionBlock && "mt-0.5")}
        onCheckedChange={(value) => {
          onCheckedChange(value === true)
          requestAnimationFrame(() => checkboxRef.current?.blur())
        }}
        disabled={disabled}
        aria-label={label}
      />
      <span
        className={cn(
          rootsFormUiChoiceTextWrapClass,
          hasDescriptionBlock && "flex min-h-[2.5rem] flex-col items-start",
        )}
      >
        <span className={rootsFormUiChoiceLabelClass} style={labelStyle}>
          {label}
        </span>
        {hasDescriptionBlock ? (
          <span
            className={cn(
              rootsFormUiChoiceDescriptionClass,
              !description && "invisible",
            )}
            style={descriptionStyle}
          >
            {description ?? "\u00a0"}
          </span>
        ) : null}
      </span>
    </label>
  )
}
