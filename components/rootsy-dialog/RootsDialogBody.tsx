"use client"

import { rootsDialogBodyClass } from "@/components/rootsy-dialog/rootsDialogStyles"
import { cn } from "@/lib/utils"
import type { ComponentProps } from "react"

type Props = ComponentProps<"div">

export function RootsDialogBody({ className, ...props }: Props) {
  return <div className={cn(rootsDialogBodyClass, className)} {...props} />
}
