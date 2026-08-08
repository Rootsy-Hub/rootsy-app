"use client"

import { popScopedHref } from "@/lib/popRoutes"
import { RootsBanner } from "@/components/rootsy-banner"

type Props = {
  siteId: string
  popId: string
  registerName?: string | null
  variant?: "light" | "dark"
}

export function OpenCashSessionBanner({
  siteId,
  popId,
  registerName,
  variant = "light",
}: Props) {
  const href = popScopedHref(siteId, popId, "cash-registers")
  const isDark = variant === "dark"

  return (
    <RootsBanner
      intent="warning"
      layout="with-action"
      variant={isDark ? "strip" : "default"}
      fullWidth
      title="Abrí un turno de caja para vender"
      message={
        registerName
          ? `No hay turno abierto en ${registerName}. Todas las ventas requieren una sesión de caja activa.`
          : "Todas las ventas (efectivo, tarjeta, transferencia o cuenta corriente) requieren una sesión de caja abierta."
      }
      actionLabel="Ir a Cajas"
      actionHref={href}
    />
  )
}
