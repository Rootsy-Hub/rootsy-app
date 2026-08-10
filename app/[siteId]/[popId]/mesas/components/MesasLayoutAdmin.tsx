"use client"

import { MesasDecorsDialog } from "@/app/[siteId]/[popId]/mesas/components/MesasDecorsDialog"
import { MesasSalonsDialog } from "@/app/[siteId]/[popId]/mesas/components/MesasSalonsDialog"
import { MesasTablesDialog } from "@/app/[siteId]/[popId]/mesas/components/MesasTablesDialog"
import type { MesasLayoutData } from "@/app/[siteId]/[popId]/mesas/actions"
import type { MesaSalon } from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import { DataWorkspaceHeaderIconButton } from "@/components/layouts/DataWorkspaceHeaderIconButton"
import { dataWorkspaceModuleHeaderVariant } from "@/components/layouts-module/DataWorkspaceModuleLayout"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { LayoutGrid, MapPin, Shapes, type LucideIcon } from "lucide-react"
import { useState } from "react"

function MesasHeaderTooltipButton({
  label,
  icon: Icon,
  onClick,
}: {
  label: string
  icon: LucideIcon
  onClick: () => void
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <DataWorkspaceHeaderIconButton
          label={label}
          headerVariant={dataWorkspaceModuleHeaderVariant}
          onClick={onClick}
        >
          <Icon className="size-5" aria-hidden />
        </DataWorkspaceHeaderIconButton>
      </TooltipTrigger>
      <TooltipContent variant="dark" side="bottom" sideOffset={6}>
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

type Props = {
  popId: string
  siteId: string
  salons: MesaSalon[]
  canUpdate: boolean
  onLayoutChanged: () => Promise<void>
  getLayoutData?: () => MesasLayoutData | null
}

export function MesasLayoutAdminButtons({
  popId,
  siteId,
  salons,
  canUpdate,
  onLayoutChanged,
  getLayoutData,
}: Props) {
  const [salonsOpen, setSalonsOpen] = useState(false)
  const [tablesOpen, setTablesOpen] = useState(false)
  const [decorsOpen, setDecorsOpen] = useState(false)

  if (!canUpdate) return null

  return (
    <>
      <MesasHeaderTooltipButton
        label="Salones"
        icon={MapPin}
        onClick={() => setSalonsOpen(true)}
      />
      <MesasHeaderTooltipButton
        label="Mesas"
        icon={LayoutGrid}
        onClick={() => setTablesOpen(true)}
      />
      <MesasHeaderTooltipButton
        label="Elementos del plano"
        icon={Shapes}
        onClick={() => setDecorsOpen(true)}
      />

      <MesasSalonsDialog
        open={salonsOpen}
        onOpenChange={setSalonsOpen}
        popId={popId}
        siteId={siteId}
        onLayoutChanged={onLayoutChanged}
      />
      <MesasTablesDialog
        open={tablesOpen}
        onOpenChange={setTablesOpen}
        popId={popId}
        siteId={siteId}
        salons={salons}
        getLayoutData={getLayoutData}
        onLayoutChanged={onLayoutChanged}
      />
      <MesasDecorsDialog
        open={decorsOpen}
        onOpenChange={setDecorsOpen}
        popId={popId}
        siteId={siteId}
        salons={salons}
        getLayoutData={getLayoutData}
        onLayoutChanged={onLayoutChanged}
      />
    </>
  )
}
