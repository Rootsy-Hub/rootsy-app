"use client"

import { CheckoutSectionLabel, CheckoutSectionPanel } from "@/components/checkout/CheckoutFormFields"
import { saleOpChannelWarningBanner } from "@/components/sale-operation/saleOperationStyles"
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
    <CheckoutSectionPanel>
      <CheckoutSectionLabel>Facturación electrónica (ARCA)</CheckoutSectionLabel>

      {cuitFormatted ? (
        <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-background px-3.5 py-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Building2 className="size-4" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              CUIT del punto de venta
            </p>
            <p className="font-mono text-base font-semibold tracking-tight text-foreground">
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
        <div className={saleOpChannelWarningBanner}>
          <p>
            Todavía no hay un CUIT configurado en los ajustes del punto de venta.
            Configuralo antes de cargar certificados ARCA o facturar.
          </p>
          {settingsHref ? (
            <Link
              href={settingsHref}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-950 underline-offset-2 hover:underline"
            >
              Ir a ajustes del punto de venta
              <ExternalLink className="size-3.5" aria-hidden />
            </Link>
          ) : null}
        </div>
      )}
    </CheckoutSectionPanel>
  )
}
