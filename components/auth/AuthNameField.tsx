"use client"

import { RootsFormTextField } from "@/components/rootsy-form"
import { formatNameInput, sanitizeNameInput } from "@/lib/authValidation"

type Props = {
  id: string
  name?: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  disabled?: boolean
  autoComplete?: string
}

export function AuthNameField({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  error,
  disabled,
  autoComplete,
}: Props) {
  return (
    <RootsFormTextField
      label={label}
      id={id}
      name={name ?? id}
      autoComplete={autoComplete}
      autoCapitalize="words"
      spellCheck={false}
      value={value}
      onChange={(event) => onChange(sanitizeNameInput(event.target.value))}
      onBlur={() => onChange(formatNameInput(value))}
      placeholder={placeholder}
      error={error}
      invalid={Boolean(error)}
      disabled={disabled}
    />
  )
}
