"use client"

import { MesasDecorsDialog } from "@/app/[siteId]/[popId]/mesas/components/MesasDecorsDialog"
import { MesasSalonsDialog } from "@/app/[siteId]/[popId]/mesas/components/MesasSalonsDialog"
import { MesasTablesDialog } from "@/app/[siteId]/[popId]/mesas/components/MesasTablesDialog"
import type { MesasLayoutData } from "@/app/[siteId]/[popId]/mesas/actions"
import type { MesaSalon } from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import type { DataWorkspaceHeaderMoreAction } from "@/components/layouts/DataWorkspaceHeaderMoreMenu"
import { LayoutGrid, MapPin, Shapes } from "lucide-react"
import { useMemo, useState, type ReactNode } from "react"

type Props = {
  popId: string
  siteId: string
  salons: MesaSalon[]
  canUpdate: boolean
  onLayoutChanged: () => Promise<void>
  getLayoutData?: () => MesasLayoutData | null
  children: (parts: {
    moreActions: DataWorkspaceHeaderMoreAction[]
  }) => ReactNode
}

export function MesasLayoutAdmin({
  popId,
  siteId,
  salons,
  canUpdate,
  onLayoutChanged,
  getLayoutData,
  children,
}: Props) {
  const [salonsOpen, setSalonsOpen] = useState(false)
  const [tablesOpen, setTablesOpen] = useState(false)
  const [decorsOpen, setDecorsOpen] = useState(false)

  const moreActions = useMemo<DataWorkspaceHeaderMoreAction[]>(
    () =>
      canUpdate
        ? [
            {
              label: "Salones",
              icon: MapPin,
              onClick: () => setSalonsOpen(true),
            },
            {
              label: "Mesas",
              icon: LayoutGrid,
              onClick: () => setTablesOpen(true),
            },
            {
              label: "Elementos del plano",
              icon: Shapes,
              onClick: () => setDecorsOpen(true),
            },
          ]
        : [],
    [canUpdate],
  )

  return (
    <>
      {children({ moreActions })}
      {canUpdate ? (
        <>
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
      ) : null}
    </>
  )
}
