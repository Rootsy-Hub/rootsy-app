"use client"

import { RootsProgressButton } from "@/components/rootsy-button"
import { RootsFormControlInput } from "@/components/rootsy-form/RootsFormControlInput"
import { RootsFormField } from "@/components/rootsy-form/RootsFormField"
import type { RootsFormFieldAssistProps } from "@/components/rootsy-form/rootsFormFieldAssist"
import { useRootsFormFieldControlProps } from "@/components/rootsy-form/rootsFormFieldContext"
import { rootsFormFieldGroupClass } from "@/components/rootsy-form/rootsFormStyles"
import {
  sanitizeTaxDocumentInput,
  type TaxDocumentInputMode,
} from "@/lib/argentinaTaxDocumentInput"
import { cn } from "@/lib/utils"
import { useId, type ChangeEventHandler } from "react"

export const rootsFormTaxDocumentActionButtonClass = "w-[9.75rem] shrink-0"

export type RootsFormTaxDocumentFieldAction = {
  label: string
  loadingLabel?: string
  onClick: () => void
  disabled?: boolean
  loading?: boolean
}

export type RootsFormTaxDocumentValueMode = TaxDocumentInputMode | "digits_only"

type Props = {
  label: string
  id?: string
  value: string
  onChange: (value: string) => void
  valueMode?: RootsFormTaxDocumentValueMode
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  invalid?: boolean
  className?: string
  inputClassName?: string
  action?: RootsFormTaxDocumentFieldAction
} & RootsFormFieldAssistProps

function sanitizeTaxDocumentFieldValue(
  raw: string,
  valueMode: RootsFormTaxDocumentValueMode,
): string {
  if (valueMode === "digits_only") {
    return raw.replace(/\D/g, "").slice(0, 11)
  }
  return sanitizeTaxDocumentInput(raw, valueMode)
}

export function RootsFormTaxDocumentField({
  label,
  id,
  value,
  onChange,
  valueMode = "cuit_only",
  placeholder,
  disabled,
  readOnly,
  invalid,
  hint,
  labelInfo,
  error,
  warning,
  success,
  className,
  inputClassName,
  action,
}: Props) {
  const autoId = useId()
  const fieldId = id ?? autoId
  const controlProps = useRootsFormFieldControlProps({ invalid })
  const fieldDisabled = disabled || readOnly

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    onChange(sanitizeTaxDocumentFieldValue(event.target.value, valueMode))
  }

  return (
    <div className={rootsFormFieldGroupClass}>
      <RootsFormField
        label={label}
        htmlFor={fieldId}
        className={className}
        hint={hint}
        labelInfo={labelInfo}
        error={error}
        warning={warning}
        success={success}
        invalid={invalid}
      >
        <div className="flex items-center gap-2">
          <RootsFormControlInput
            id={fieldId}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={fieldDisabled}
            readOnly={readOnly}
            invalid={controlProps.isInvalid}
            aria-describedby={controlProps.describedBy}
            aria-invalid={controlProps.isInvalid || undefined}
            className={cn("min-w-0 flex-1", inputClassName)}
          />
          {action ? (
            <RootsProgressButton
              type="button"
              semantic="secondary"
              className={rootsFormTaxDocumentActionButtonClass}
              disabled={fieldDisabled || action.disabled}
              loading={action.loading}
              loadingLabel={action.loadingLabel ?? "Consultando"}
              onClick={action.onClick}
            >
              {action.label}
            </RootsProgressButton>
          ) : null}
        </div>
      </RootsFormField>
    </div>
  )
}
