"use client"

import {
  layoutsOperarCheckoutFloorClass,
  layoutsOperarCheckoutFloorCloseClass,
  layoutsOperarCheckoutFloorProposalClass,
  layoutsOperarCheckoutFloorStepsClass,
  layoutsOperarCheckoutFloorClusterClass,
  layoutsOperarCheckoutFloorClusterCloseClass,
  layoutsOperarCheckoutFloorLeadClass,
  layoutsOperarCheckoutFloorConfirmClass,
  layoutsOperarCheckoutFloorSavingsAmountClass,
  layoutsOperarCheckoutFloorSavingsClass,
  layoutsOperarCheckoutFloorSavingsLabelClass,
  layoutsOperarCheckoutFloorTotalAmountClass,
  layoutsOperarCheckoutFloorTotalClass,
  layoutsOperarCheckoutFloorTotalLabelClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import {
  LayoutsOperarCheckoutSteps,
  type LayoutsOperarCheckoutProposal,
  type LayoutsOperarCheckoutStep,
} from "@/components/layouts-module/LayoutsOperarCheckoutSteps"
import {
  SaleOperationActionsBar,
  type SaleOperationActionsBarProps,
} from "@/components/sale-operation/SaleOperationActionsBar"
import { SaleOperationToolboxSkeleton } from "@/components/sale-operation/SaleOperationToolboxSkeleton"
import { saleOpFmt, saleOpImporteBaseClass } from "@/components/sale-operation/saleOperationStyles"
import {
  RootsButtonAtmosphereProvider,
  RootsSemanticButton,
} from "@/components/rootsy-button"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

export type LayoutsOperarSaleCheckoutFloorProps = {
  steps?: ReactNode
  proposal?: LayoutsOperarCheckoutProposal
  proposalSteps?: readonly LayoutsOperarCheckoutStep[]
  proposalOptions?: readonly LayoutsOperarCheckoutStep[]
  savingsAmount?: number
  closingTotal: number
  totalLabel?: string
  regionLabel?: string
  actions: SaleOperationActionsBarProps
  className?: string
}

export function LayoutsOperarSaleCheckoutFloor({
  steps,
  proposal,
  proposalSteps,
  proposalOptions,
  savingsAmount = 0,
  closingTotal,
  totalLabel = "Total",
  regionLabel = "Checkout de la venta",
  actions,
  className,
}: LayoutsOperarSaleCheckoutFloorProps) {
  const isProposal = proposal != null && proposalSteps != null
  const showCloseTotal = !isProposal || proposal !== "pipeline"

  const discardButton = (
    <RootsSemanticButton
      semantic="destructiveSubtle"
      size="compact"
      shape="pill"
      atmosphere="eter"
      disabled={actions.discardDisabled}
      title={actions.discardTitle}
      onClick={actions.onDiscard}
    >
      Descartar
    </RootsSemanticButton>
  )

  const totalBlock = (
    <div className={layoutsOperarCheckoutFloorTotalClass}>
      {isProposal ? null : (
        <p className={layoutsOperarCheckoutFloorTotalLabelClass}>{totalLabel}</p>
      )}
      <p
        className={cn(
          saleOpImporteBaseClass,
          isProposal
            ? "layouts-operar-checkout-floor-total-amount truncate rootsy-text-metric"
            : layoutsOperarCheckoutFloorTotalAmountClass,
        )}
        aria-label={`${totalLabel} ${saleOpFmt.format(closingTotal)}`}
        aria-live="polite"
        aria-atomic="true"
      >
        {saleOpFmt.format(closingTotal)}
      </p>
    </div>
  )

  const isPay = actions.confirmTone === "pay"
  const confirmLabel = actions.confirmLoading
    ? "Procesando"
    : (actions.confirmLabel ?? (isPay ? "Pagar" : "Vender"))

  const confirmBar = isProposal ? (
    <RootsSemanticButton
      semantic="primary"
      size="large"
      shape="pill"
      atmosphere="eter"
      loading={actions.confirmLoading}
      disabled={actions.confirmDisabled}
      title={actions.confirmTitle}
      onClick={actions.onConfirm}
      className={layoutsOperarCheckoutFloorConfirmClass}
    >
      {confirmLabel}
    </RootsSemanticButton>
  ) : (
    <SaleOperationActionsBar
      {...actions}
      variant="operar"
      showClosingTotal={false}
      showDiscard
    />
  )

  if (isProposal) {
    return (
      <RootsButtonAtmosphereProvider atmosphere="eter">
      <div
        role="region"
        aria-label={regionLabel}
        className={cn(
          layoutsOperarCheckoutFloorClass,
          layoutsOperarCheckoutFloorProposalClass,
          className,
        )}
      >
        <div className={layoutsOperarCheckoutFloorClusterClass}>
          <div className={layoutsOperarCheckoutFloorLeadClass}>{discardButton}</div>
          <LayoutsOperarCheckoutSteps
            proposal={proposal}
            steps={proposalSteps}
            options={proposalOptions}
            closingTotal={proposal === "pipeline" ? closingTotal : undefined}
          />
        </div>
        <div
          className={cn(
            layoutsOperarCheckoutFloorClusterClass,
            layoutsOperarCheckoutFloorClusterCloseClass,
          )}
        >
          {isProposal && savingsAmount > 0 ? (
            <p
              className={layoutsOperarCheckoutFloorSavingsClass}
              aria-label={`Se ahorra ${saleOpFmt.format(savingsAmount)}`}
            >
              <span className={layoutsOperarCheckoutFloorSavingsLabelClass}>
                Se ahorra
              </span>
              <span
                className={cn(
                  layoutsOperarCheckoutFloorSavingsAmountClass,
                  saleOpImporteBaseClass,
                )}
              >
                {saleOpFmt.format(savingsAmount)}
              </span>
            </p>
          ) : null}
          {showCloseTotal ? totalBlock : null}
          {confirmBar}
        </div>
      </div>
      </RootsButtonAtmosphereProvider>
    )
  }

  return (
    <div
      role="region"
      aria-label={regionLabel}
      className={cn(layoutsOperarCheckoutFloorClass, className)}
    >
      <div className={layoutsOperarCheckoutFloorStepsClass}>{steps}</div>
      <div className={layoutsOperarCheckoutFloorCloseClass}>
        {totalBlock}
        {confirmBar}
      </div>
    </div>
  )
}

export function LayoutsOperarSaleCheckoutFloorSkeleton() {
  return (
    <LayoutsOperarSaleCheckoutFloor
      steps={<SaleOperationToolboxSkeleton embedded />}
      closingTotal={0}
      actions={{
        discardDisabled: true,
        confirmDisabled: true,
        onDiscard: () => undefined,
        onConfirm: () => undefined,
      }}
    />
  )
}
