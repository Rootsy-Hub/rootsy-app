"use client"

import { Eye, EyeOff } from "lucide-react"
import {
  RootsFormControlInput,
  RootsFormField,
} from "@/components/rootsy-form"
import { useState, type ChangeEvent } from "react"

type Props = {
  id: string
  name?: string
  label: string
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  autoComplete?: string
  placeholder?: string
  error?: string
  hint?: string
  disabled?: boolean
}

export function AuthPasswordField({
  id,
  name,
  label,
  value,
  onChange,
  autoComplete = "current-password",
  placeholder,
  error,
  hint,
  disabled,
}: Props) {
  const [visible, setVisible] = useState(false)

  return (
    <RootsFormField
      label={label}
      htmlFor={id}
      error={error}
      hint={!error ? hint : undefined}
      invalid={Boolean(error)}
    >
      <div className="relative">
        <RootsFormControlInput
          id={id}
          name={name ?? id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          invalid={Boolean(error)}
          disabled={disabled}
          className="pr-11"
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-[var(--rootsy-sombra-300)] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--rootsy-savia-400)_45%,transparent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-elevated)]"
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? (
            <EyeOff className="size-4" aria-hidden />
          ) : (
            <Eye className="size-4" aria-hidden />
          )}
        </button>
      </div>
    </RootsFormField>
  )
}
