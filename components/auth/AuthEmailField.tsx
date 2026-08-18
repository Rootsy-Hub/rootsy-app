"use client"

import { RootsFormTextField } from "@/components/rootsy-form"
import { formatEmailInput, sanitizeEmailInput } from "@/lib/authValidation"

type Props = {
  id?: string
  name?: string
  label?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  disabled?: boolean
  autoComplete?: string
}

export function AuthEmailField({
  id = "email",
  name = "email",
  label = "Correo electrónico",
  value,
  onChange,
  placeholder = "usuario@mail.com",
  error,
  disabled,
  autoComplete = "email",
}: Props) {
  return (
    <RootsFormTextField
      label={label}
      id={id}
      name={name}
      type="email"
      inputMode="email"
      autoComplete={autoComplete}
      autoCapitalize="none"
      autoCorrect="off"
      spellCheck={false}
      value={value}
      onChange={(event) => onChange(sanitizeEmailInput(event.target.value))}
      onBlur={() => onChange(formatEmailInput(value))}
      placeholder={placeholder}
      error={error}
      invalid={Boolean(error)}
      disabled={disabled}
    />
  )
}
