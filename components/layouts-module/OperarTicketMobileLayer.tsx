"use client"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { ChevronUp } from "lucide-react"
import { useState, type ReactNode } from "react"

type Props = {
  ticket: ReactNode
  toolbox?: ReactNode
  dockLabel?: string
}

/** Mobile: barra inferior + sheet con el ticket (y toolbox). Desktop no monta esto. */
export function OperarTicketMobileLayer({
  ticket,
  toolbox,
  dockLabel = "Pedido",
}: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        type="button"
        className={cn(
          "flex h-14 w-full shrink-0 items-center justify-between gap-3 px-4",
          "border-t border-white/10 bg-[color-mix(in_srgb,var(--rootsy-sombra-950)_88%,transparent)]",
          "text-left text-sm font-medium text-white/90",
          "outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-400/50",
        )}
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <span>{dockLabel}</span>
        <ChevronUp className="size-5 shrink-0 opacity-70" aria-hidden />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className={cn(
            "gap-0 p-0 sm:max-w-none",
            "h-[min(88dvh,44rem)] max-h-[88dvh]",
            "bg-[var(--rootsy-bruma-100)] [&>button.absolute]:hidden",
          )}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>{dockLabel}</SheetTitle>
            <SheetDescription>Detalle del pedido y acciones</SheetDescription>
          </SheetHeader>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {toolbox ? (
              <div className="shrink-0 border-b border-[var(--rootsy-bruma-200)]">
                {toolbox}
              </div>
            ) : null}
            <div className="min-h-0 flex-1 overflow-hidden">{ticket}</div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
