"use client"

import {
  disconnectPopMercadoPago,
  startPopMercadoPagoConnect,
} from "@/lib/rootsyApi/treasuryClient"
import { RootsBanner } from "@/components/rootsy-banner"
import {
  RootsDangerSubtleButton,
  RootsPrimaryButton,
  rootsButtonCompactSizeClass,
} from "@/components/rootsy-button"
import { dataWorkspaceEntityCardFooterClass } from "@/components/data-workspace/dataWorkspaceListStyles"
import { RootsNaturePill } from "@/components/rootsy-pill"
import {
  popMercadoPagoConnectionPillVariant,
  popMercadoPagoConnectionStatusLabel,
  resolvePopMercadoPagoConnectionStatus,
  type PopMercadoPagoConnectionPublic,
} from "@/lib/popMercadoPago"
import { cn } from "@/lib/utils"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

function connectionCopy(
  status: ReturnType<typeof resolvePopMercadoPagoConnectionStatus>,
) {
  if (status === "connected") {
    return "Esta billetera puede usarse para cobrar suscripciones y otros servicios de Mercado Pago."
  }
  if (status === "expired") {
    return "Hay que volver a autorizar Mercado Pago para seguir cobrando desde Rootsy."
  }
  return "Conectá esta billetera para cobrar suscripciones y otros servicios de Mercado Pago desde Rootsy."
}

export function TreasuryMercadoPagoConnectionPanel({
  siteId,
  popId,
  treasuryAccountId,
  connection,
  canUpdate,
  onChanged,
}: {
  siteId: string
  popId: string
  treasuryAccountId: string
  connection: PopMercadoPagoConnectionPublic | null
  canUpdate: boolean
  onChanged?: () => void | Promise<void>
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const status = resolvePopMercadoPagoConnectionStatus(connection)
  const email = connection?.mpEmail?.trim() || null
  const [busy, setBusy] = useState(false)
  const [confirmDisconnect, setConfirmDisconnect] = useState(false)
  const [banner, setBanner] = useState<{
    intent: "success" | "danger"
    message: string
  } | null>(null)

  useEffect(() => {
    const result = searchParams.get("mp")
    if (result !== "connected" && result !== "error") return
    const error = searchParams.get("mp_error")?.trim()
    setBanner(
      result === "connected"
        ? { intent: "success", message: "Mercado Pago quedó conectado." }
        : {
            intent: "danger",
            message: error || "No se pudo conectar Mercado Pago.",
          },
    )
    const next = new URLSearchParams(searchParams.toString())
    next.delete("mp")
    next.delete("mp_error")
    const qs = next.toString()
    router.replace(qs ? `?${qs}` : "?", { scroll: false })
  }, [router, searchParams])

  const handleConnect = async () => {
    setBusy(true)
    setBanner(null)
    const res = await startPopMercadoPagoConnect(
      popId,
      siteId,
      treasuryAccountId,
    )
    if (!res.success) {
      setBusy(false)
      setBanner({ intent: "danger", message: res.error })
      return
    }
    window.location.assign(res.url)
  }

  const handleDisconnect = async () => {
    if (!confirmDisconnect) {
      setConfirmDisconnect(true)
      return
    }
    setBusy(true)
    setBanner(null)
    const res = await disconnectPopMercadoPago(popId, siteId, treasuryAccountId)
    setBusy(false)
    setConfirmDisconnect(false)
    if (!res.success) {
      setBanner({ intent: "danger", message: res.error })
      return
    }
    setBanner({ intent: "success", message: "Se desconectó Mercado Pago." })
    await onChanged?.()
  }

  return (
    <div className={dataWorkspaceEntityCardFooterClass}>
      {banner ? (
        <div className="px-4 pt-3 sm:px-6 lg:px-8">
          <RootsBanner
            intent={banner.intent}
            density="compact"
            message={banner.message}
            onDismiss={() => setBanner(null)}
          />
        </div>
      ) : null}
      <div
        className={cn(
          "flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8",
        )}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-foreground">
              Integración Mercado Pago
            </p>
            <RootsNaturePill variant={popMercadoPagoConnectionPillVariant(status)}>
              {popMercadoPagoConnectionStatusLabel(status)}
            </RootsNaturePill>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {connectionCopy(status)}
            {email ? ` · ${email}` : null}
          </p>
        </div>
        {canUpdate ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {status === "connected" || status === "expired" ? (
              <RootsDangerSubtleButton
                type="button"
                size="compact"
                disabled={busy}
                loading={busy && confirmDisconnect}
                className={rootsButtonCompactSizeClass}
                onClick={() => void handleDisconnect()}
              >
                {confirmDisconnect ? "Sí, desconectar" : "Desconectar"}
              </RootsDangerSubtleButton>
            ) : null}
            {status !== "connected" ? (
              <RootsPrimaryButton
                type="button"
                size="compact"
                disabled={busy}
                loading={busy && !confirmDisconnect}
                className={rootsButtonCompactSizeClass}
                onClick={() => void handleConnect()}
              >
                {status === "expired" ? "Volver a conectar" : "Conectar Mercado Pago"}
              </RootsPrimaryButton>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
