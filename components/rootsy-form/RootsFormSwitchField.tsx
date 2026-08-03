"use client"

import { RootsFormSwitch } from "@/components/rootsy-form/RootsFormSwitch"
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

export function RootsFormSwitchField({
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
  const switchId = id ?? autoId
  const switchRef = useRef<HTMLButtonElement>(null)

  return (
    <div className={cn(rootsFormFieldStackClass, className)}>
      <label
        htmlFor={switchId}
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
        <RootsFormSwitch
          ref={switchRef}
          id={switchId}
          checked={checked}
          onCheckedChange={(value) => {
            onCheckedChange(value)
            requestAnimationFrame(() => switchRef.current?.blur())
          }}
          disabled={disabled}
          aria-label={label}
        />
      </label>
    </div>
  )
}
