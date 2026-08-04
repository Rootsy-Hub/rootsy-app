"use client"

import {
  articleDialogOverlayClass,
  articleDialogSurfaceClass,
  articleDialogSurfaceTwoColClass,
  articleDialogSurfaceWideClass,
} from "@/app/[siteId]/[popId]/articles/articleConstants"
import { DialogContent } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import type { ComponentProps } from "react"

export type RootsDialogSize = "default" | "wide" | "twoCol"

const surfaceClassBySize: Record<RootsDialogSize, string> = {
  default: articleDialogSurfaceClass,
  wide: articleDialogSurfaceWideClass,
  twoCol: articleDialogSurfaceTwoColClass,
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
      className={cn(surfaceClassBySize[size], className)}
      overlayClassName={articleDialogOverlayClass}
      data-rootsy-light-shell="true"
      showCloseButton={showCloseButton}
      {...props}
    >
      {children}
    </DialogContent>
  )
}
