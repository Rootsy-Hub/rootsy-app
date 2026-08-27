"use client"

import { MesasDecorsDialog } from "@/app/[siteId]/[popId]/mesas/components/MesasDecorsDialog"
import { MesasSalonsDialog } from "@/app/[siteId]/[popId]/mesas/components/MesasSalonsDialog"
import { MesasTablesDialog } from "@/app/[siteId]/[popId]/mesas/components/MesasTablesDialog"
import type { MesasLayoutData } from "@/app/[siteId]/[popId]/mesas/actions"
import type { MesaSalon } from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import type { DataWorkspaceHeaderMoreAction } from "@/components/layouts-module/ModuleWorkspaceHeader"
import {
  RootsAlertDialogContent,
  RootsAlertDialogFooter,
  RootsAlertDialogPanel,
} from "@/components/rootsy-dialog/RootsAlertDialog"
import { AlertDialog } from "@/components/ui/alert-dialog"
import { useIsMobile } from "@/hooks/use-mobile"
import { LayoutGrid, MapPin, Shapes } from "lucide-react"
import { useCallback, useMemo, useState, type ReactNode } from "react"

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
  const isMobile = useIsMobile()
  const [salonsOpen, setSalonsOpen] = useState(false)
  const [tablesOpen, setTablesOpen] = useState(false)
  const [decorsOpen, setDecorsOpen] = useState(false)
  const [desktopOnlyOpen, setDesktopOnlyOpen] = useState(false)

  const openLayoutEditor = useCallback(
    (open: () => void) => {
      if (isMobile) {
        setDesktopOnlyOpen(true)
        return
      }
      open()
    },
    [isMobile],
  )

  const moreActions = useMemo<DataWorkspaceHeaderMoreAction[]>(
    () =>
      canUpdate
        ? [
            {
              label: "Salones",
              icon: MapPin,
              onClick: () => openLayoutEditor(() => setSalonsOpen(true)),
            },
            {
              label: "Mesas",
              icon: LayoutGrid,
              onClick: () => openLayoutEditor(() => setTablesOpen(true)),
            },
            {
              label: "Elementos del plano",
              icon: Shapes,
              onClick: () => openLayoutEditor(() => setDecorsOpen(true)),
            },
          ]
        : [],
    [canUpdate, openLayoutEditor],
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
          <AlertDialog open={desktopOnlyOpen} onOpenChange={setDesktopOnlyOpen}>
            <RootsAlertDialogContent>
              <RootsAlertDialogPanel
                title="Solo en escritorio"
                description="La edición de mesas, salones y elementos del plano solo se puede realizar en desktop."
              />
              <RootsAlertDialogFooter
                hideCancel
                confirmLabel="Entendido"
                onConfirm={() => setDesktopOnlyOpen(false)}
              />
            </RootsAlertDialogContent>
          </AlertDialog>
        </>
      ) : null}
    </>
  )
}
