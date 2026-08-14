"use client"

import { ReportHubCard, reportHubGridClass } from "@/components/reports/ReportHubCard"
import { SalesDetailReportView } from "@/components/reports/SalesDetailReportView"
import { VatPositionReportView } from "@/components/reports/VatPositionReportView"
import {
  dataWorkspaceBlocksPageContentClass,
  dataWorkspaceBlocksPageMainClass,
  dataWorkspaceBlocksPageScopeClass,
  dataWorkspaceBlocksSectionDescriptionClass,
  dataWorkspaceBlocksSectionTitleClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  DataWorkspaceModuleLayout,
  dataWorkspaceModuleHeaderVariant,
} from "@/components/layouts-module/DataWorkspaceModuleLayout"
import withAuth from "@/hoc/withAuth"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import {
  buildReportHref,
  REPORT_CATALOG,
  supportsInlineReportDetail,
} from "@/lib/reportsCatalog"
import {
  computeDataWorkspaceDateBounds,
  type DataWorkspaceDatePreset,
} from "@/lib/dataWorkspaceDateFilter"
import { cn } from "@/lib/utils"
import { useParams } from "next/navigation"
import type { DateRange } from "react-day-picker"
import { useMemo, useState } from "react"

function ReportsPage() {
  const params = useParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : undefined

  const { bootstrap, loading: bootstrapLoading, error: bootstrapError } =
    usePopWorkspace()

  const [preset, setPreset] = useState<DataWorkspaceDatePreset>("this_month")
  const [customRange, setCustomRange] = useState<DateRange | undefined>(
    undefined,
  )
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)

  const bounds = useMemo(
    () => computeDataWorkspaceDateBounds(preset, customRange),
    [preset, customRange],
  )
  const showingInlineDetail =
    selectedReportId != null && supportsInlineReportDetail(selectedReportId)

  const periodProps = {
    preset,
    customRange,
    bounds,
    onPresetChange: setPreset,
    onCustomRangeChange: setCustomRange,
  }

  if (!popId || !siteId) {
    return (
      <div className="rootsy-app-light min-h-screen bg-background p-10 text-foreground">
        <p className="text-sm">Punto de venta no encontrado.</p>
      </div>
    )
  }

  return (
    <DataWorkspaceModuleLayout
      siteId={siteId}
      popId={popId}
      popName={bootstrap?.popName ?? ""}
      title="Reportes"
      headerVariant={dataWorkspaceModuleHeaderVariant}
      loading={bootstrapLoading}
      userName={bootstrap?.userFullName}
      userAvatarSrc={bootstrap?.userImageUrl ?? undefined}
      userRoleLabel={bootstrap?.roleLabel}
      contentFlush
      mainMaxWidthClass={showingInlineDetail ? "max-w-none" : "max-w-[88rem]"}
      mainClassName={dataWorkspaceBlocksPageMainClass}
    >
      <div
        className={cn(
          showingInlineDetail
            ? dataWorkspaceBlocksPageScopeClass
            : dataWorkspaceBlocksPageContentClass,
          showingInlineDetail ? "flex min-h-full flex-1 flex-col" : "space-y-8",
        )}
      >
        {bootstrapError ? (
          <div
            role="alert"
            className={cn(
              "rounded-lg border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive",
              showingInlineDetail && "mx-4 mt-4 sm:mx-6 lg:mx-8",
            )}
          >
            Cabecera: {bootstrapError}
          </div>
        ) : null}

        {selectedReportId === "vat-position" ? (
          <VatPositionReportView
            popId={popId}
            from={bounds.from}
            to={bounds.to}
            onBack={() => setSelectedReportId(null)}
            {...periodProps}
          />
        ) : selectedReportId === "sales-detail" ? (
          <SalesDetailReportView
            popId={popId}
            from={bounds.from}
            to={bounds.to}
            onBack={() => setSelectedReportId(null)}
            {...periodProps}
          />
        ) : (
          <>
            {REPORT_CATALOG.map((category) => (
              <section key={category.id} className="space-y-3">
                <div className="space-y-1 px-1">
                  <h2 className={dataWorkspaceBlocksSectionTitleClass}>
                    {category.title}
                  </h2>
                  <p className={dataWorkspaceBlocksSectionDescriptionClass}>
                    {category.summary}
                  </p>
                </div>
                <div className={reportHubGridClass}>
                  {category.items.map((item) => {
                    const inline = supportsInlineReportDetail(item.id)
                    return (
                      <ReportHubCard
                        key={item.id}
                        title={item.title}
                        description={item.description}
                        icon={item.icon}
                        selected={selectedReportId === item.id}
                        {...(inline
                          ? { onSelect: () => setSelectedReportId(item.id) }
                          : {
                              href: buildReportHref(siteId, popId, item, bounds),
                            })}
                      />
                    )
                  })}
                </div>
              </section>
            ))}
          </>
        )}
      </div>
    </DataWorkspaceModuleLayout>
  )
}

export default withAuth(ReportsPage)
