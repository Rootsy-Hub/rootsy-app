"use client"

import {
  applyMoneyBackspace,
  applyMoneyDecimalJump,
  applyMoneyDelete,
  applyMoneyDigitInput,
  applyMoneyPaste,
} from "@/lib/moneyInputEdit"
import { formatMoneyInputForField, parseMoneyInput } from "@/lib/moneyInput"
import {
  useLayoutEffect,
  useRef,
  type ClipboardEvent,
  type FocusEvent,
  type KeyboardEvent,
} from "react"

type Options = {
  value: string
  onChange: (value: string) => void
  formatOnBlur?: boolean
  formatValue?: (amount: number) => string
}

export function useMoneyInputField({
  value,
  onChange,
  formatOnBlur = true,
  formatValue = formatMoneyInputForField,
}: Options) {
  const inputRef = useRef<HTMLInputElement>(null)
  const pendingSelection = useRef<{ start: number; end: number } | null>(null)
  const isFocusedRef = useRef(false)
  const repositionClickRef = useRef(false)

  useLayoutEffect(() => {
    const input = inputRef.current
    const selection = pendingSelection.current
    if (!input || !selection) return
    input.setSelectionRange(selection.start, selection.end)
    pendingSelection.current = null
  }, [value])

  const applyEdit = (result: {
    value: string
    selectionStart: number
    selectionEnd: number
  }) => {
    pendingSelection.current = {
      start: result.selectionStart,
      end: result.selectionEnd,
    }
    onChange(result.value)
  }

  const handleMouseDown = () => {
    if (isFocusedRef.current) {
      repositionClickRef.current = true
    }
  }

  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    isFocusedRef.current = true

    if (repositionClickRef.current) {
      repositionClickRef.current = false
      return
    }

    const input = e.currentTarget
    requestAnimationFrame(() => {
      if (input.isConnected) input.select()
    })
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget
    const start = input.selectionStart ?? 0
    const end = input.selectionEnd ?? start

    if (e.key.length === 1 && /\d/.test(e.key)) {
      e.preventDefault()
      applyEdit(applyMoneyDigitInput(value, start, end, e.key))
      return
    }

    if (e.key === "Backspace") {
      e.preventDefault()
      applyEdit(applyMoneyBackspace(value, start, end))
      return
    }

    if (e.key === "Delete") {
      e.preventDefault()
      applyEdit(applyMoneyDelete(value, start, end))
      return
    }

    if (e.key === "," || e.key === ".") {
      e.preventDefault()
      applyEdit(applyMoneyDecimalJump(value))
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const input = e.currentTarget
    const start = input.selectionStart ?? 0
    const end = input.selectionEnd ?? start
    const pasted = e.clipboardData.getData("text")
    applyEdit(applyMoneyPaste(value, start, end, pasted))
  }

  const handleBlur = () => {
    isFocusedRef.current = false
    repositionClickRef.current = false

    if (!formatOnBlur || !value.trim()) return
    const parsed = parseMoneyInput(value, Number.NaN)
    if (Number.isFinite(parsed)) {
      onChange(formatValue(parsed))
    }
  }

  const handleChange = () => {
    // Edición controlada por teclado y paste; ignorar input nativo del browser.
  }

  return {
    inputRef,
    handleMouseDown,
    handleFocus,
    handleChange,
    handleKeyDown,
    handlePaste,
    handleBlur,
  }
}
