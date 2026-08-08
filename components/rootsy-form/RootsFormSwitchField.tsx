"use client"

import { RootsFormSwitch } from "@/components/rootsy-form/RootsFormSwitch"
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

export function RootsFormSwitchField({
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
  const switchId = id ?? autoId
  const switchRef = useRef<HTMLButtonElement>(null)
  const labelStyle = getFormChoiceLabelStyle("switch")
  const descriptionStyle = getFormChoiceDescriptionStyle()

  return (
    <label
      htmlFor={switchId}
      className={cn(
        rootsFormUiChoiceRowClass,
        description ? "items-start" : "items-center",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      <RootsFormSwitch
        ref={switchRef}
        id={switchId}
        checked={checked}
        invalid={invalid}
        className={cn("self-center", description && "mt-0.5")}
        onCheckedChange={(value) => {
          onCheckedChange(value)
          requestAnimationFrame(() => switchRef.current?.blur())
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
