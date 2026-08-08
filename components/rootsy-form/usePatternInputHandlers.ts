"use client"

import type { FocusEvent } from "react"

type Options = {
  value: string
  onChange: (value: string) => void
  sanitize: (raw: string) => string
  toEditableOnFocus?: (value: string) => string
  formatOnBlur?: (value: string) => string
}

export function usePatternInputHandlers({
  value,
  onChange,
  sanitize,
  toEditableOnFocus,
  formatOnBlur,
}: Options) {
  const handleChange = (raw: string) => {
    onChange(sanitize(raw))
  }

  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    const input = e.currentTarget
    if (toEditableOnFocus) {
      const editable = toEditableOnFocus(value)
      if (editable !== value) {
        onChange(editable)
      }
    }
    requestAnimationFrame(() => {
      if (input.isConnected) input.select()
    })
  }

  const handleBlur = () => {
    if (!formatOnBlur) return
    onChange(formatOnBlur(value))
  }

  return { handleChange, handleFocus, handleBlur }
}
