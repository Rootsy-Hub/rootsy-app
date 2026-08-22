"use client"

import { useMesaOpenDurationTick } from "@/app/[siteId]/[popId]/mesas/components/useMesaOpenDurationTick"
import {
  reservationFloorCountdown,
  type MesasReservationSettings,
} from "@/app/[siteId]/[popId]/mesas/mesasReservationLogic"
import { cn } from "@/lib/utils"

type Props = {
  arrivalAt: string
  settings: MesasReservationSettings
  className?: string
}

export function formatMesaReservationCountdown(
  arrivalAt: string,
  settings: MesasReservationSettings,
  now = new Date(),
): string | null {
  return reservationFloorCountdown(arrivalAt, settings, now)?.label ?? null
}

/** Tiempo hasta la llegada o hasta que venza; se actualiza cada minuto. */
export function MesaReservationCountdownLabel({
  arrivalAt,
  settings,
  className,
}: Props) {
  useMesaOpenDurationTick()
  const countdown = reservationFloorCountdown(arrivalAt, settings)

  if (!countdown) return null

  return (
    <span
      className={cn(
        "font-medium tabular-nums",
        countdown.kind === "until_expire" &&
          "text-[color-mix(in_srgb,#fde68a_88%,white)]",
        className,
      )}
    >
      {countdown.label}
    </span>
  )
}
