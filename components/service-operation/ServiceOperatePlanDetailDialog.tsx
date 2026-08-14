"use client"

import {
  getServiceTypeChargeDetail,
  type ServiceTypeChargeDetail,
  type ServiceTypeChargeOption,
} from "@/app/[siteId]/[popId]/active-services/actions"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogFooterByVariant,
  RootsDialogHeader,
  RootsDialogLoadingState,
} from "@/components/rootsy-dialog"
import {
  ServicePlanDetailContent,
  servicePlanHasContract,
} from "@/components/service-operation/ServicePlanDetailContent"
import { ServiceOperateContractDialog } from "@/components/service-operation/ServiceOperateContractDialog"
import { Dialog } from "@/components/ui/dialog"
import { useEffect, useState } from "react"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  popId: string
  service: ServiceTypeChargeOption
}

export function ServiceOperatePlanDetailDialog({
  open,
  onOpenChange,
  popId,
  service,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [detail, setDetail] = useState<ServiceTypeChargeDetail | null>(null)
  const [contractOpen, setContractOpen] = useState(false)

  useEffect(() => {
    if (!open) return

    let cancelled = false
    setLoading(true)
    setError(null)
    setDetail(null)

    void getServiceTypeChargeDetail(popId, service.id).then((res) => {
      if (cancelled) return
      setLoading(false)
      if (!res.success) {
        setError(res.error)
        return
      }
      setDetail(res.service)
    })

    return () => {
      cancelled = true
    }
  }, [open, popId, service.id])

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <RootsDialogContent size="default" className="sm:max-w-lg">
          <RootsDialogHeader
            title="Detalle del plan"
            description="Información del servicio seleccionado en el catálogo."
          />
          <RootsDialogBody>
            {loading ? (
              <RootsDialogLoadingState message="Cargando detalle del plan…" />
            ) : error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : detail ? (
              <>
                <ServicePlanDetailContent detail={detail} tone="light" />
                {servicePlanHasContract(detail) ? (
                  <div className="mt-4">
                    <button
                      type="button"
                      className="text-sm font-medium text-[var(--rootsy-savia-700)] underline-offset-2 hover:underline"
                      onClick={() => setContractOpen(true)}
                    >
                      Ver contrato
                    </button>
                  </div>
                ) : null}
              </>
            ) : null}
          </RootsDialogBody>
          <RootsDialogFooterByVariant
            variant="single"
            confirmLabel="Cerrar"
            onClose={() => onOpenChange(false)}
          />
        </RootsDialogContent>
      </Dialog>

      {detail && servicePlanHasContract(detail) ? (
        <ServiceOperateContractDialog
          open={contractOpen}
          onOpenChange={setContractOpen}
          serviceName={detail.name}
          contractText={detail.contractText.trim()}
        />
      ) : null}
    </>
  )
}
