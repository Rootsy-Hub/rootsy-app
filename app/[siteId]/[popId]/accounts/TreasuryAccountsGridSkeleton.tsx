"use client"

import { ACCOUNT_FILTER_OPTIONS } from "@/app/[siteId]/[popId]/accounts/workspaceUrl"
import { DataWorkspaceBlocksSection } from "@/components/data-workspace/DataWorkspaceBlocksSection"
import {
  dataWorkspaceBlocksPageContentClass,
  dataWorkspaceBlocksSkeletonBreathTone,
  dataWorkspaceEntityCardHeaderClass,
  dataWorkspaceEntityCardLosetaGridClass,
  dataWorkspaceEntityCardLosetaSurfaceClass,
  dataWorkspaceEntityCardSaldoSectionClass,
  dataWorkspaceEntityCardSettlementFooterClass,
  dataWorkspaceEntityCardsGridClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { RootsFormSegmentField } from "@/components/rootsy-form"
import { cn } from "@/lib/utils"

const NAME_WIDTHS = ["w-28", "w-36", "w-32", "w-24"] as const
const BALANCE_WIDTHS = ["w-36", "w-32", "w-40", "w-28"] as const

const sk = dataWorkspaceBlocksSkeletonBreathTone

function delayStyle(index: number) {
  return { animationDelay: `${index * 160}ms` }
}

function Bone({
  className,
  delay = 0,
}: {
  className?: string
  delay?: number
}) {
  return <div className={className} style={delayStyle(delay)} />
}

function TreasuryAccountCardSkeleton({ index }: { index: number }) {
  const nameWidth = NAME_WIDTHS[index % NAME_WIDTHS.length]
  const balanceWidth = BALANCE_WIDTHS[index % BALANCE_WIDTHS.length]

  return (
    <article aria-hidden className={cn("relative", dataWorkspaceEntityCardLosetaSurfaceClass)}>
      <div className={dataWorkspaceEntityCardLosetaGridClass}>
        <div className={cn(dataWorkspaceEntityCardHeaderClass, "pr-4")}>
          <div className="flex min-w-0 items-start gap-2">
            <Bone className={cn("size-11 shrink-0 rounded-xl", sk.box)} delay={index} />
            <div className="min-w-0 flex-1 space-y-2">
              <Bone className={cn("h-2.5 w-[4.5rem]", sk.pill)} delay={index} />
              <Bone className={cn("h-6", sk.bar, nameWidth)} delay={index} />
            </div>
            <Bone className={cn("-mr-1 size-8 shrink-0 rounded-lg", sk.box)} delay={index} />
          </div>
        </div>

        <div className={dataWorkspaceEntityCardSaldoSectionClass}>
          <Bone className={cn("h-2.5 w-16", sk.pill)} delay={index} />
          <Bone className={cn("mt-1.5 h-8", sk.bar, balanceWidth)} delay={index} />
        </div>

        <div className={dataWorkspaceEntityCardSettlementFooterClass}>
          <div>
            <Bone className={cn("h-2.5 w-14", sk.pill)} delay={index} />
            <Bone className={cn("mt-1 h-6 w-24", sk.bar)} delay={index} />
          </div>
          <div>
            <Bone className={cn("h-2.5 w-12", sk.pill)} delay={index} />
            <Bone className={cn("mt-1 h-6 w-20", sk.bar)} delay={index} />
          </div>
        </div>
      </div>
    </article>
  )
}

export function TreasuryAccountsGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Cargando cuentas"
      className={dataWorkspaceEntityCardsGridClass}
    >
      {Array.from({ length: count }, (_, index) => (
        <TreasuryAccountCardSkeleton key={index} index={index} />
      ))}
      <span className="sr-only">Cargando cuentas…</span>
    </div>
  )
}

export function TreasuryAccountsPageSkeleton() {
  return (
    <div className={dataWorkspaceBlocksPageContentClass}>
      <DataWorkspaceBlocksSection>
        <RootsFormSegmentField
          label="Ver cuentas"
          aria-label="Filtrar cuentas"
          layout="inline"
          className="[&>span:first-child]:sr-only"
          groupClassName="border-0"
          value="todas"
          onValueChange={() => undefined}
          options={ACCOUNT_FILTER_OPTIONS}
          disabled
        />
        <TreasuryAccountsGridSkeleton />
      </DataWorkspaceBlocksSection>
    </div>
  )
}
