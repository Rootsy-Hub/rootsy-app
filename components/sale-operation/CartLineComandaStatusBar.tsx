import type { ComandaStatus } from "@/app/[siteId]/[popId]/comandas/comandasTypes"
import {
  comandaLineStatusBarClass,
  comandaStatusLabel,
} from "@/lib/comandaCartLine"
import { cn } from "@/lib/utils"

type Props = {
  status: ComandaStatus
}

export function CartLineComandaStatusBar({ status }: Props) {
  return (
    <div
      className={cn(
        "mx-2 rounded-t-xl px-2 py-1 text-center",
        "font-canopy text-[10px] font-semibold uppercase tracking-wide",
        comandaLineStatusBarClass(status),
      )}
      aria-label={`Comanda: ${comandaStatusLabel(status)}`}
    >
      {comandaStatusLabel(status)}
    </div>
  )
}
