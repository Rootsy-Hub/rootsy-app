"use client"

import { ArticleDeleteDialog } from "@/app/[siteId]/[popId]/articles/ArticleDeleteDialog"
import { articleDeleteConfirmPhrase } from "@/app/[siteId]/[popId]/articles/articleConstants"
import { SpecCard } from "@/app/library/layoutLibraryShared"
import {
  RootsDangerButton,
  RootsPrimaryButton,
  RootsSubtleButton,
} from "@/components/rootsy-button"
import {
  rootsAlertDialogContentClass,
  rootsAlertDialogDescriptionClass,
  rootsAlertDialogFooterClass,
  rootsAlertDialogSurfaceClass,
  rootsAlertDialogTitleClass,
} from "@/components/rootsy-dialog"
import { rootsFormTextFieldClass } from "@/components/rootsy-form/rootsFormStyles"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useState } from "react"

const DEMO_ARTICLE_NAME = "Carne molida"

export function ArticleDeleteAlertLibraryDemo() {
  const [open, setOpen] = useState(false)
  const [confirmValue, setConfirmValue] = useState("")
  const confirmPhrase = articleDeleteConfirmPhrase(DEMO_ARTICLE_NAME)

  const handleClose = () => {
    setOpen(false)
    setConfirmValue("")
  }

  return (
    <SpecCard
      title="Eliminar artículo"
      source="app/[siteId]/[popId]/articles/ArticleDeleteDialog.tsx"
      tokens={[
        "RootsAlertDialogContent",
        "rootsFormTextFieldClass",
        "RootsSubtleButton",
        "RootsDangerButton",
        "articleDeleteConfirmPhrase",
      ]}
    >
      <div className="flex flex-wrap items-center gap-2">
        <RootsPrimaryButton type="button" onClick={() => setOpen(true)}>
          Abrir en vivo
        </RootsPrimaryButton>
      </div>

      <ArticleDeleteDialog
        open={open}
        articleName={DEMO_ARTICLE_NAME}
        confirmValue={confirmValue}
        banner={null}
        busy={false}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen)
        }}
        onClose={handleClose}
        onAfterClose={() => setConfirmValue("")}
        onConfirmValueChange={setConfirmValue}
        onConfirmDelete={handleClose}
      />

      <div className="mt-3 overflow-hidden rounded-2xl border border-dashed border-border/70 p-4">
        <div className={cn("pointer-events-none shadow-md", rootsAlertDialogSurfaceClass)}>
          <div className={rootsAlertDialogContentClass}>
            <div className="space-y-2">
              <p className={rootsAlertDialogTitleClass}>Eliminar {DEMO_ARTICLE_NAME}</p>
              <p className={rootsAlertDialogDescriptionClass}>
                Esta acción no se puede deshacer. Para confirmar, escribí (
                {confirmPhrase}) abajo.
              </p>
            </div>
            <Input
              readOnly
              value=""
              placeholder={confirmPhrase}
              className={rootsFormTextFieldClass}
              aria-label={`Confirmación: ${confirmPhrase}`}
            />
          </div>
          <div className={cn(rootsAlertDialogFooterClass, "flex items-center justify-between")}>
            <RootsSubtleButton type="button">Cancelar</RootsSubtleButton>
            <RootsDangerButton type="button" disabled>
              Eliminar definitivamente
            </RootsDangerButton>
          </div>
        </div>
      </div>
    </SpecCard>
  )
}
