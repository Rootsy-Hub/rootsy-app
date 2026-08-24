"use client"

import { presentAuditEvent } from "@/lib/audit/auditEventPresentation"
import type { AuditEventRow } from "@/lib/rootsyApi/auditClient"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogFooter,
  RootsDialogHeader,
  rootsDialogDetailFieldStackClass,
  rootsDialogDetailLabelClass,
  rootsDialogDetailMetaClass,
  rootsDialogDetailValueClass,
} from "@/components/rootsy-dialog"
import {
  RootsFormGrid,
  rootsFormColumnClass,
} from "@/components/rootsy-form"
import {
  rootsButtonClassForVariant,
  rootsButtonVariant,
} from "@/components/rootsy-button"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import type { ReactNode } from "react"

function DetailField({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className={rootsDialogDetailFieldStackClass}>
      <p className={rootsDialogDetailLabelClass}>{label}</p>
      <div className={rootsDialogDetailValueClass}>{children}</div>
    </div>
  )
}

function formatWhen(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date)
}

export function AuditEventDetailDialog({
  event,
  open,
  onOpenChange,
}: {
  event: AuditEventRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!event) return null
  const presented = presentAuditEvent(event)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent size="twoCol">
        <RootsDialogHeader
          title={presented.activity}
          description={presented.recordTitle}
        />
        <RootsDialogBody>
          <RootsFormGrid>
            <div className={rootsFormColumnClass}>
              <DetailField label="Cuándo">
                {formatWhen(event.occurred_at)}
              </DetailField>
              <DetailField label="Quién">{presented.whoLabel}</DetailField>
              <DetailField label="Origen">{presented.sourceLabel}</DetailField>
              <DetailField label="Módulo">{presented.resourceLabel}</DetailField>
              {presented.approvedByLabel ? (
                <DetailField label="Aprobó">
                  {presented.approvedByLabel}
                </DetailField>
              ) : null}
              <p className={rootsDialogDetailMetaClass}>
                El rastro caduca el {formatWhen(event.expires_at)}.
              </p>
            </div>
            <div className={rootsFormColumnClass}>
              {presented.fieldChanges.length === 0 ? (
                <DetailField label="Cambio">{presented.changeSummary}</DetailField>
              ) : (
                presented.fieldChanges.map((change) => (
                  <DetailField key={change.key} label={change.label}>
                    {change.from === "—"
                      ? change.to
                      : `${change.from} → ${change.to}`}
                  </DetailField>
                ))
              )}
            </div>
          </RootsFormGrid>
        </RootsDialogBody>
        <RootsDialogFooter className="sm:justify-end">
          <Button
            type="button"
            variant={rootsButtonVariant.tertiary}
            className={rootsButtonClassForVariant("tertiary")}
            onClick={() => onOpenChange(false)}
          >
            Cerrar
          </Button>
        </RootsDialogFooter>
      </RootsDialogContent>
    </Dialog>
  )
}
