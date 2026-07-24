"use client"

import { Button } from "@/components/ui/button"
import { popScopedHref } from "@/lib/popRoutes"
import Link from "next/link"
import { AlertCircle } from "lucide-react"

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
    <div
      role="alert"
      className={
        isDark
          ? "flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-100"
          : "flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/35 bg-amber-500/10 px-4 py-3 text-amber-950"
      }
    >
      <div className="flex min-w-0 items-start gap-2.5">
        <AlertCircle
          className={cnIcon(isDark, "mt-0.5 size-4 shrink-0")}
          aria-hidden
        />
        <div className="min-w-0 text-sm leading-relaxed">
          <p className="font-semibold">Abrí un turno de caja para vender</p>
          <p className={isDark ? "text-amber-100/85" : "text-amber-950/80"}>
            {registerName
              ? `No hay turno abierto en ${registerName}. Todas las ventas requieren una sesión de caja activa.`
              : "Todas las ventas (efectivo, tarjeta, transferencia o cuenta corriente) requieren una sesión de caja abierta."}
          </p>
        </div>
      </div>
      <Button
        asChild
        size="sm"
        variant={isDark ? "secondary" : "default"}
        className="shrink-0"
      >
        <Link href={href}>Ir a Cajas</Link>
      </Button>
    </div>
  )
}

function cnIcon(isDark: boolean, base: string) {
  return `${base} ${isDark ? "text-amber-300" : "text-amber-700"}`
}
