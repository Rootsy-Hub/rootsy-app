"use client"

import { comandasBrisaPageMainClass } from "@/app/[siteId]/[popId]/comandas/comandasBrisaStyles"
import { ComandasStationMenu } from "@/app/[siteId]/[popId]/comandas/components/ComandasStationMenu"
import { ComandasWorkspace } from "@/app/[siteId]/[popId]/comandas/components/ComandasWorkspace"
import { useComandasState } from "@/app/[siteId]/[popId]/comandas/useComandasState"
import {
  RootsDialogContent,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import { Dialog } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useEffect, useRef, useState } from "react"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  siteId: string
  popId: string
  canUpdate: boolean
}

export function ComandasDialog({
  open,
  onOpenChange,
  siteId,
  popId,
  canUpdate,
}: Props) {
  const wasOpenRef = useRef(false)
  const [mounted, setMounted] = useState(open)

  useEffect(() => {
    if (open) {
      wasOpenRef.current = true
      setMounted(true)
      return
    }
    if (!wasOpenRef.current) return
    const timer = window.setTimeout(() => {
      wasOpenRef.current = false
      setMounted(false)
    }, 220)
    return () => window.clearTimeout(timer)
  }, [open])

  if (!mounted) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ComandasDialogBody
        siteId={siteId}
        popId={popId}
        canUpdate={canUpdate}
      />
    </Dialog>
  )
}

function ComandasDialogBody({
  siteId,
  popId,
  canUpdate,
}: {
  siteId: string
  popId: string
  canUpdate: boolean
}) {
  const comandas = useComandasState(popId, siteId)

  return (
    <RootsDialogContent
      size="twoCol"
      className="flex h-[min(92vh,56rem)] max-h-[min(92vh,56rem)] w-[min(96vw,86rem)] max-w-[86rem] flex-col overflow-hidden p-0"
    >
      <div className="flex items-start justify-between gap-4 pr-12">
        <RootsDialogHeader
          title="Comandas"
            description="Elegí la estación y mové las comandas entre comandado, preparando, listo y entregado."
          className="min-w-0 flex-1"
        />
        <div className="shrink-0 pt-5">
          <ComandasStationMenu
            stations={comandas.stations}
            stationId={comandas.stationId}
            onChange={comandas.setStationId}
            headerVariant="default"
          />
        </div>
      </div>
      <div className={cn(comandasBrisaPageMainClass, "min-h-0 flex-1 rounded-none")}>
        <ComandasWorkspace state={comandas} canUpdate={canUpdate} />
      </div>
    </RootsDialogContent>
  )
}
