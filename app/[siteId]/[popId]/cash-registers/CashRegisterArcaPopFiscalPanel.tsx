"use client"

import { CheckoutSectionLabel } from "@/components/checkout/CheckoutFormFields"
import { RootsBanner } from "@/components/rootsy-banner"
import {
  saleOpLightInsetPanel,
} from "@/components/sale-operation/saleOperationStyles"
import { cn } from "@/lib/utils"
import { Building2, ExternalLink } from "lucide-react"
import Link from "next/link"

function formatCuitDisplay(raw: string | null | undefined): string | null {
  const digits = String(raw ?? "").replace(/\D/g, "")
  if (digits.length !== 11) return null
  return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10)}`
}

type Props = {
  fiscalCuit: string | null
  fiscalRazonSocial?: string | null
  settingsHref?: string
}

export function CashRegisterArcaPopFiscalPanel({
  fiscalCuit,
  fiscalRazonSocial,
  settingsHref,
}: Props) {
  const cuitFormatted = formatCuitDisplay(fiscalCuit)
  const razonSocial = fiscalRazonSocial?.trim() || null

  return (
    <div className="space-y-3">
      <CheckoutSectionLabel>Facturación electrónica (ARCA)</CheckoutSectionLabel>

      {cuitFormatted ? (
        <div
          className={cn(
            saleOpLightInsetPanel,
            "flex items-start gap-3 px-3.5 py-3",
          )}
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/80 text-zinc-500">
            <Building2 className="size-4" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              CUIT del punto de venta
            </p>
            <p className="text-base font-semibold tracking-tight text-foreground">
              {cuitFormatted}
            </p>
            {razonSocial ? (
              <p className="text-sm text-muted-foreground">{razonSocial}</p>
            ) : null}
            <p className="text-xs leading-relaxed text-muted-foreground">
              Los archivos .crt / .key y el número de punto de venta de esta caja
              deben estar emitidos para este CUIT.
            </p>
          </div>
        </div>
      ) : (
        <RootsBanner
          intent="warning"
          layout="message"
          message={
            <>
              <span className="block">
                Todavía no hay un CUIT configurado en los ajustes del punto de venta.
                Configuralo antes de cargar certificados ARCA o facturar.
              </span>
              {settingsHref ? (
                <Link
                  href={settingsHref}
                  className="mt-2 inline-flex items-center gap-1.5 font-medium underline-offset-2 hover:underline"
                  style={{ color: "inherit" }}
                >
                  Ir a ajustes del punto de venta
                  <ExternalLink className="size-3.5" aria-hidden />
                </Link>
              ) : null}
            </>
          }
        />
      )}
    </div>
  )
}
