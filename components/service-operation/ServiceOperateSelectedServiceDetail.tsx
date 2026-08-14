"use client"

import {
  getServiceTypeChargeDetail,
  type ServiceTypeChargeDetail,
  type ServiceTypeChargeOption,
} from "@/app/[siteId]/[popId]/active-services/actions"
import { layoutsOperarScrollMinimalClass } from "@/app/library/layouts/layoutsOperarStyles"
import { ServiceOperateContractDialog } from "@/components/service-operation/ServiceOperateContractDialog"
import { ServiceOperateSelectedServiceDetailSkeleton } from "@/components/service-operation/ServiceOperateSelectedServiceDetailSkeleton"
import { ServiceOperateSelectedServiceMarketingDetail } from "@/components/service-operation/ServiceOperateSelectedServiceMarketingDetail"
import { cn } from "@/lib/utils"
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
          "min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 sm:px-4 sm:py-4",
          layoutsOperarScrollMinimalClass,
        )}
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
          {error ? (
            <p className="text-sm text-rose-300">{error}</p>
          ) : (
            <>
              <ServiceOperateSelectedServiceMarketingDetail
                service={service}
                detail={detail}
                loadingDetail={loading}
                onOpenContract={
                  detail?.contractText.trim()
                    ? () => setContractOpen(true)
                    : undefined
                }
              />
            </>
          )}

          {detail ? (
            <ServiceOperateContractDialog
              open={contractOpen}
              onOpenChange={setContractOpen}
              serviceName={detail.name}
              contractText={detail.contractText.trim()}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}
