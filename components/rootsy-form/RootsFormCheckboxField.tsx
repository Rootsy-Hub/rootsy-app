"use client"

import { RootsFormCheckbox } from "@/components/rootsy-form/RootsFormCheckbox"
import {
  rootsFormFieldStackClass,
  rootsFormSwitchBoxClass,
  rootsFormSwitchDescriptionClass,
  rootsFormSwitchLabelClass,
} from "@/components/rootsy-form/rootsFormStyles"
import { cn } from "@/lib/utils"
import { useId, useRef } from "react"

type Props = {
  label: string
  description?: string
  id?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
  boxClassName?: string
}

export function RootsFormCheckboxField({
  label,
  description,
  id,
  checked,
  onCheckedChange,
  disabled,
  className,
  boxClassName,
}: Props) {
  const autoId = useId()
  const checkboxId = id ?? autoId
  const checkboxRef = useRef<HTMLButtonElement>(null)

  return (
    <div className={cn(rootsFormFieldStackClass, className)}>
      <label
        htmlFor={checkboxId}
        className={cn(
          rootsFormSwitchBoxClass,
          !description && "h-11 py-0",
          disabled && "cursor-not-allowed opacity-50",
          boxClassName,
        )}
      >
        <span className="min-w-0 flex-1 pr-3">
          <span className={rootsFormSwitchLabelClass}>{label}</span>
          {description ? (
            <span className={rootsFormSwitchDescriptionClass}>
              {description}
            </span>
          ) : null}
        </span>
        <RootsFormCheckbox
          ref={checkboxRef}
          id={checkboxId}
          checked={checked}
          onCheckedChange={(value) => {
            onCheckedChange(value === true)
            requestAnimationFrame(() => checkboxRef.current?.blur())
          }}
          disabled={disabled}
          aria-label={label}
        />
      </label>
    </div>
  )
}
