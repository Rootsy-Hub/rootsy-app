"use client"

import { RootsFormCheckbox } from "@/components/rootsy-form/RootsFormCheckbox"
import {
  getFormChoiceDescriptionStyle,
  getFormChoiceLabelStyle,
} from "@/components/rootsy-form/rootsFormSpecRuntime"
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
  const labelStyle = getFormChoiceLabelStyle("checkbox")
  const descriptionStyle = getFormChoiceDescriptionStyle()

  return (
    <label
      htmlFor={checkboxId}
      className={cn(
        rootsFormUiChoiceRowClass,
        description ? "items-start" : "items-center",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      <RootsFormCheckbox
        ref={checkboxRef}
        id={checkboxId}
        checked={checked}
        invalid={invalid}
        className={cn("self-center", description && "mt-0.5")}
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
          description && "flex-col items-start",
        )}
      >
        <span className={rootsFormUiChoiceLabelClass} style={labelStyle}>
          {label}
        </span>
        {description ? (
          <span className={rootsFormUiChoiceDescriptionClass} style={descriptionStyle}>
            {description}
          </span>
        ) : null}
      </span>
    </label>
  )
}
