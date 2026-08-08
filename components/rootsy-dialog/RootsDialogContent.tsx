"use client"

import {
  rootsDialogOverlayClass,
  rootsDialogContentZClass,
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
}

export function RootsDialogContent({
  size = "default",
  className,
  children,
  showCloseButton = true,
  ...props
}: Props) {
  return (
    <DialogContent
      className={cn(surfaceClassBySize[size], rootsDialogContentZClass, "min-h-0", className)}
      overlayClassName={rootsDialogOverlayClass}
      showCloseButton={showCloseButton}
      {...props}
    >
      {children}
    </DialogContent>
  )
}
