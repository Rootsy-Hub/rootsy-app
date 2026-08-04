"use client"

import { articleDialogBodyClass } from "@/app/[siteId]/[popId]/articles/articleConstants"
import { cn } from "@/lib/utils"
import type { ComponentProps } from "react"

type Props = ComponentProps<"div">

export function RootsDialogBody({ className, ...props }: Props) {
  return <div className={cn(articleDialogBodyClass, className)} {...props} />
}
