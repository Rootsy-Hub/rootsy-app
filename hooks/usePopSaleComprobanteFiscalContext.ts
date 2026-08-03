import { usePopWorkspaceOptional } from "@/context/PopWorkspaceContext"
import type { PopEmisorIvaCondition } from "@/lib/saleComprobanteRules"

export function usePopSaleComprobanteFiscalContext() {
  const workspace = usePopWorkspaceOptional()
  const bootstrap = workspace?.bootstrap
  const fiscalBootstrapReady =
    bootstrap != null && typeof bootstrap.hasValidPopFiscalCuit === "boolean"

  return {
    hasValidPopFiscalCuit: bootstrap?.hasValidPopFiscalCuit ?? false,
    popEmisorIvaCondition:
      bootstrap?.popEmisorIvaCondition ??
      ("responsable_inscripto" as PopEmisorIvaCondition),
    bootstrapLoaded: fiscalBootstrapReady,
  }
}
