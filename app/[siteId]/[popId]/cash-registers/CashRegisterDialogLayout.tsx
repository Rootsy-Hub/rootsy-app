"use client"

import { cn } from "@/lib/utils"
import {
  saleOpChannelErrorBanner,
  saleOpDialogBody,
  saleOpDialogLight,
  saleOpDialogMaxViewport,
  saleOpDialogSurface,
} from "@/components/sale-operation/saleOperationStyles"
import type { ReactNode } from "react"

export const cashRegisterDialogContentClass = cn(
  saleOpDialogSurface,
  saleOpDialogMaxViewport,
  "sm:max-w-3xl lg:max-w-4xl",
  saleOpDialogLight,
)

export const cashRegisterSessionDialogContentClass = cn(
  saleOpDialogSurface,
  saleOpDialogMaxViewport,
  "sm:max-w-md",
  saleOpDialogLight,
)

export const cashRegisterCloseDialogContentClass = cn(
  saleOpDialogSurface,
  saleOpDialogMaxViewport,
  "sm:max-w-3xl lg:max-w-4xl",
  saleOpDialogLight,
)

type SingleColumnBodyProps = {
  banner?: string | null
  children: ReactNode
}

export function CashRegisterDialogSingleColumnBody({
  banner,
  children,
}: SingleColumnBodyProps) {
  return (
    <div
      className={cn(
        saleOpDialogBody,
        "min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain",
      )}
    >
      {banner ? (
        <p role="alert" className={saleOpChannelErrorBanner}>
          {banner}
        </p>
      ) : null}
      {children}
    </div>
  )
}

type TwoColumnBodyProps = {
  banner?: string | null
  left: ReactNode
  right: ReactNode
}

export function CashRegisterDialogTwoColumnBody({
  banner,
  left,
  right,
}: TwoColumnBodyProps) {
  return (
    <div
      className={cn(
        saleOpDialogBody,
        "min-h-0 flex-1 overflow-y-auto overscroll-contain",
      )}
    >
      {banner ? (
        <p role="alert" className={cn(saleOpChannelErrorBanner, "mb-4")}>
          {banner}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start lg:gap-6">
        <div className="min-w-0 space-y-4">{left}</div>
        <div className="min-w-0 space-y-4 lg:border-l lg:border-border/50 lg:pl-6">
          {right}
        </div>
      </div>
    </div>
  )
}
