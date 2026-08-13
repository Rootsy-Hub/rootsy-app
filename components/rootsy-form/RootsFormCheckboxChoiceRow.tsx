"use client"

import { layoutsOperarFormDarkMutedTextClass } from "@/app/library/layouts/layoutsOperarStyles"
import { RootsFormCheckbox } from "@/components/rootsy-form/RootsFormCheckbox"
import {
  getFormChoiceDescriptionStyle,
  getFormChoiceLabelStyle,
} from "@/components/rootsy-form/rootsFormSpecRuntime"
import { useRootsFormControlTone } from "@/components/rootsy-form/rootsFormFieldContext"
import { rootsFormCheckboxChoiceRowClass } from "@/components/rootsy-form/rootsFormStyles"
import {
  rootsFormUiChoiceDescriptionClass,
  rootsFormUiChoiceLabelClass,
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

/** Fila de checkbox — target táctil 48px, fila entera clickeable. */
export function RootsFormCheckboxChoiceRow({
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
  const tone = useRootsFormControlTone()
  const isDark = tone === "dark"
  const styleOptions = { tone }
  const labelStyle = getFormChoiceLabelStyle("checkbox", styleOptions)
  const descriptionStyle = getFormChoiceDescriptionStyle(styleOptions)
  const hasDescription = Boolean(description)

  return (
    <label
      htmlFor={checkboxId}
      className={cn(
        rootsFormCheckboxChoiceRowClass,
        hasDescription ? "items-start py-2.5" : "items-center",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      <RootsFormCheckbox
        ref={checkboxRef}
        id={checkboxId}
        checked={checked}
        invalid={invalid}
        className={cn("shrink-0", hasDescription && "mt-0.5")}
        onCheckedChange={(value) => {
          onCheckedChange(value === true)
          requestAnimationFrame(() => checkboxRef.current?.blur())
        }}
        disabled={disabled}
        aria-label={label}
      />
      <span
        className={cn(
          "flex min-w-0 flex-1 flex-col",
          hasDescription ? "gap-0.5" : "justify-center",
        )}
      >
        <span className={rootsFormUiChoiceLabelClass} style={labelStyle}>
          {label}
        </span>
        {hasDescription ? (
          <span
            className={cn(
              rootsFormUiChoiceDescriptionClass,
              "mt-0",
              isDark && layoutsOperarFormDarkMutedTextClass,
            )}
            style={descriptionStyle}
          >
            {description}
          </span>
        ) : null}
      </span>
    </label>
  )
}
