"use client"

import {
  ChannelDataSection,
} from "@/components/sale-operation/ChannelOperationDataPanel"
import { saleOpChannelSelectableRow } from "@/components/sale-operation/saleOperationStyles"
import { RootsFormCheckbox } from "@/components/rootsy-form/RootsFormCheckbox"
import { rootsFormFieldLabelClass } from "@/components/rootsy-form/rootsFormStyles"
import {
  rootsFormUiChoiceLabelClass,
  rootsFormUiFieldHintClass,
} from "@/components/rootsy-form/rootsFormUiStyles"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

export {
  RootsFormCheckboxField as ChannelDataFormCheckboxField,
  RootsFormGrid as ChannelDataFormGrid,
  RootsFormIntegerField as ChannelDataFormIntegerField,
  RootsFormSegmentField as ChannelDataFormSegmentField,
  RootsFormSelectField as ChannelDataFormSelectField,
  RootsFormSelectItem as ChannelDataFormSelectItem,
  RootsFormTextareaField as ChannelDataFormTextareaField,
  RootsFormTextField as ChannelDataFormTextField,
} from "@/components/rootsy-form"

type SectionProps = {
  title?: ReactNode
  description?: ReactNode
  children: ReactNode
  className?: string
}

/** Sección de formulario dentro del panel de canal (Mesa / Mostrador). */
export function ChannelDataFormSection({
  title,
  description,
  children,
  className,
}: SectionProps) {
  return (
    <ChannelDataSection className={cn("space-y-4", className)}>
      {title != null ? (
        <div>
          {typeof title === "string" ? (
            <p className={rootsFormFieldLabelClass}>{title}</p>
          ) : (
            title
          )}
          {description ? (
            <p className={cn("mt-1 leading-relaxed", rootsFormUiFieldHintClass)}>
              {description}
            </p>
          ) : null}
        </div>
      ) : null}
      {children}
    </ChannelDataSection>
  )
}

type CheckboxOptionProps = {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label: ReactNode
  meta?: ReactNode
  disabled?: boolean
  "aria-label"?: string
}

/** Fila seleccionable con checkbox — p. ej. juntar mesas. */
export function ChannelDataFormCheckboxOption({
  checked,
  onCheckedChange,
  label,
  meta,
  disabled,
  "aria-label": ariaLabel,
}: CheckboxOptionProps) {
  return (
    <label className={saleOpChannelSelectableRow(checked)}>
      <RootsFormCheckbox
        checked={checked}
        disabled={disabled}
        aria-label={typeof label === "string" ? ariaLabel ?? label : ariaLabel}
        onCheckedChange={(value) => onCheckedChange(value === true)}
      />
      <span className={cn("min-w-0 flex-1", rootsFormUiChoiceLabelClass)}>
        {label}
      </span>
      {meta ? (
        <span
          className={cn(
            "shrink-0 font-canopy text-xs tabular-nums",
            rootsFormUiFieldHintClass,
          )}
        >
          {meta}
        </span>
      ) : null}
    </label>
  )
}
