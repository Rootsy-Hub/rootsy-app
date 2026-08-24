import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type SlotProps = {
  className?: string
  children?: ReactNode
}

function MascotFallback({
  mood,
  className,
}: {
  mood: "thinking" | "working" | "waiting" | "success"
  className?: string
}) {
  return (
    <span
      className={cn(
        "chat-rootsy-mascot-fallback",
        `chat-rootsy-mascot-fallback--${mood}`,
        className,
      )}
    />
  )
}

function MascotSlot({
  mood,
  label,
  className,
  children,
}: SlotProps & { mood: "thinking" | "working" | "waiting" | "success"; label: string }) {
  return (
    <span
      className={cn("chat-rootsy-mascot-slot size-9", className)}
      data-rootsy-asset={mood}
      aria-hidden
      title={label}
    >
      {children ?? <MascotFallback mood={mood} />}
    </span>
  )
}

/** Placeholder para el asset de Rootsy pensando / planificando. */
export function RootsyThinkingAsset({ className, children }: SlotProps) {
  return (
    <MascotSlot mood="thinking" label="Rootsy pensando" className={className}>
      {children}
    </MascotSlot>
  )
}

/** Placeholder para el asset de Rootsy consultando o ejecutando. */
export function RootsyWorkingAsset({ className, children }: SlotProps) {
  return (
    <MascotSlot mood="working" label="Rootsy trabajando" className={className}>
      {children}
    </MascotSlot>
  )
}

/** Placeholder para el asset de Rootsy esperando aprobación. */
export function RootsyWaitingAsset({ className, children }: SlotProps) {
  return (
    <MascotSlot mood="waiting" label="Rootsy esperando" className={className}>
      {children}
    </MascotSlot>
  )
}

/** Placeholder para el asset de Rootsy cuando la operación terminó bien. */
export function RootsySuccessAsset({ className, children }: SlotProps) {
  return (
    <MascotSlot mood="success" label="Rootsy listo" className={className}>
      {children}
    </MascotSlot>
  )
}
