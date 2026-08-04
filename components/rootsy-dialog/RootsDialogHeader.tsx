"use client"

import {
  articleDialogDescriptionClass,
  articleDialogHeaderClass,
  articleDialogTitleClass,
} from "@/app/[siteId]/[popId]/articles/articleConstants"
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type Props = {
  title: ReactNode
  description?: ReactNode
  descriptionHidden?: boolean
  className?: string
}

export function RootsDialogHeader({
  title,
  description,
  descriptionHidden = false,
  className,
}: Props) {
  return (
    <DialogHeader className={cn(articleDialogHeaderClass, className)}>
      <DialogTitle className={articleDialogTitleClass}>{title}</DialogTitle>
      {description != null ? (
        <DialogDescription
          className={cn(
            articleDialogDescriptionClass,
            descriptionHidden && "sr-only",
          )}
        >
          {description}
        </DialogDescription>
      ) : null}
    </DialogHeader>
  )
}
