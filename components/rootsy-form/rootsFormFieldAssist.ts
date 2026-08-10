import type { ReactNode } from "react"

export type RootsFormFieldMessageVariant = "hint" | "error" | "warning" | "success"

export type RootsFormFieldAssistProps = {
  /** Ayuda en tooltip junto al label (ícono ⓘ). */
  labelInfo?: ReactNode
  /** Ayuda neutral debajo del control. */
  hint?: ReactNode
  /** Error de validación — prioridad sobre hint y warning. */
  error?: ReactNode
  /** Aviso no bloqueante. */
  warning?: ReactNode
  /** Confirmación puntual (p. ej. dato verificado). */
  success?: ReactNode
  /** Marca el control como inválido; default true si hay error. */
  invalid?: boolean
}

export function resolveRootsFormFieldMessage(input: {
  hint?: ReactNode
  error?: ReactNode
  warning?: ReactNode
  success?: ReactNode
}):
  | { variant: RootsFormFieldMessageVariant; content: ReactNode }
  | null {
  if (input.error) return { variant: "error", content: input.error }
  if (input.warning) return { variant: "warning", content: input.warning }
  if (input.success) return { variant: "success", content: input.success }
  if (input.hint) return { variant: "hint", content: input.hint }
  return null
}
