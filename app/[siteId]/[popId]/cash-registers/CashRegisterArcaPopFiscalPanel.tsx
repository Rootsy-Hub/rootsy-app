"use client"

import { RootsBanner } from "@/components/rootsy-banner"
import { RootsFormField } from "@/components/rootsy-form"
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
    <RootsFormField label="Facturación electrónica (ARCA)">
      {cuitFormatted ? (
        <RootsBanner
          intent="neutral"
          title={cuitFormatted}
          message={
            <>
              {razonSocial ? <span className="block">{razonSocial}</span> : null}
              <span className="block">
                Los archivos .crt / .key y el número de punto de venta de esta caja
                deben estar emitidos para este CUIT.
              </span>
            </>
          }
          icon={<Building2 className="size-4 shrink-0" aria-hidden />}
        />
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
    </RootsFormField>
  )
}
