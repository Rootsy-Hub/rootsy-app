"use client"

import {
  rootsDialogOverlayClass,
  rootsDialogOverlayNestedClass,
  rootsDialogContentZClass,
  rootsDialogContentNestedZClass,
  rootsDialogSurfaceDefaultClass,
  rootsDialogSurfaceTwoColClass,
  rootsDialogSurfaceWideClass,
} from "@/components/rootsy-dialog/rootsDialogProductStyles"
import { DialogContent } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import type { ComponentProps } from "react"

export type RootsDialogSize = "default" | "wide" | "twoCol"

const surfaceClassBySize: Record<RootsDialogSize, string> = {
  default: rootsDialogSurfaceDefaultClass,
  wide: rootsDialogSurfaceWideClass,
  twoCol: rootsDialogSurfaceTwoColClass,
}

type Props = Omit<ComponentProps<typeof DialogContent>, "overlayClassName"> & {
  size?: RootsDialogSize
  /** Abrí este diálogo encima de otro: el velo cubre el modal de abajo. */
  nested?: boolean
}

export function RootsDialogContent({
  size = "default",
  nested = false,
  className,
  children,
  showCloseButton = true,
  ...props
}: Props) {
  return (
    <DialogContent
      className={cn(
        surfaceClassBySize[size],
        nested ? rootsDialogContentNestedZClass : rootsDialogContentZClass,
        "min-h-0",
        className,
      )}
      overlayClassName={
        nested ? rootsDialogOverlayNestedClass : rootsDialogOverlayClass
      }
      showCloseButton={showCloseButton}
      {...props}
    >
      {children}
    </DialogContent>
  )
}
