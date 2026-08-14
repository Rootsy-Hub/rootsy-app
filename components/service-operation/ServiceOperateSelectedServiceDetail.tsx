"use client"

import {
  getServiceTypeChargeDetail,
  type ServiceTypeChargeDetail,
  type ServiceTypeChargeOption,
} from "@/app/[siteId]/[popId]/active-services/actions"
import {
  layoutsOperarFormDarkSecondaryButtonClass,
  layoutsOperarScrollMinimalClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import { ServiceOperateSelectedServiceDetailSkeleton } from "@/components/service-operation/ServiceOperateSelectedServiceDetailSkeleton"
import { ServiceOperateContractDialog } from "@/components/service-operation/ServiceOperateContractDialog"
import {
  ServicePlanDetailContent,
  servicePlanHasContract,
} from "@/components/service-operation/ServicePlanDetailContent"
import { ServiceOperateServiceShowcase } from "@/components/service-operation/ServiceOperateServiceShowcase"
import { cn } from "@/lib/utils"
import { FileText } from "lucide-react"
import { useEffect, useState } from "react"

type Props = {
  popId: string
  service: ServiceTypeChargeOption
  className?: string
}

export function ServiceOperateSelectedServiceDetail({
  popId,
  service,
  className,
}: Props) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [detail, setDetail] = useState<ServiceTypeChargeDetail | null>(null)
  const [contractOpen, setContractOpen] = useState(false)

  useEffect(() => {
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
  }, [popId, service.id])

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5",
          layoutsOperarScrollMinimalClass,
        )}
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
          <ServiceOperateServiceShowcase service={service} />

          {loading ? (
            <ServiceOperateSelectedServiceDetailSkeleton />
          ) : error ? (
            <p className="text-sm text-rose-300">{error}</p>
          ) : detail ? (
            <>
              <ServicePlanDetailContent
                detail={detail}
                tone="dark"
                showHero={false}
              />

              {servicePlanHasContract(detail) ? (
                <div>
                  <button
                    type="button"
                    className={layoutsOperarFormDarkSecondaryButtonClass}
                    onClick={() => setContractOpen(true)}
                  >
                    <FileText className="size-4 shrink-0 opacity-80" aria-hidden />
                    Ver contrato
                  </button>
                </div>
              ) : null}

              <ServiceOperateContractDialog
                open={contractOpen}
                onOpenChange={setContractOpen}
                serviceName={detail.name}
                contractText={detail.contractText.trim()}
              />
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
