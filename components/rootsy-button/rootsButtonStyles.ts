import { saleOpDialogPrimaryBtn } from "@/components/sale-operation/saleOperationStyles"
import { cn } from "@/lib/utils"

/**
 * Jerarquía semántica de botones en modales y workspace claro.
 * Mapea a `Button` de shadcn — no duplicar estilos fuera de acá.
 */
export const rootsButtonPrimaryClass = saleOpDialogPrimaryBtn

export const rootsButtonSecondaryClass = "h-10 rounded-lg"

export const rootsButtonTertiaryClass = "h-10 rounded-lg"

/** Variantes recomendadas por rol */
export const rootsButtonVariant = {
  primary: "default",
  secondary: "outline",
  tertiary: "ghost-neutral",
  destructive: "destructive",
  link: "link",
} as const

export type RootsButtonSemanticVariant = keyof typeof rootsButtonVariant

export function rootsButtonClassForVariant(
  semantic: RootsButtonSemanticVariant,
  className?: string,
) {
  switch (semantic) {
    case "primary":
      return cn(rootsButtonPrimaryClass, className)
    case "secondary":
      return cn(rootsButtonSecondaryClass, className)
    case "tertiary":
      return cn(rootsButtonTertiaryClass, className)
    default:
      return className
  }
}
