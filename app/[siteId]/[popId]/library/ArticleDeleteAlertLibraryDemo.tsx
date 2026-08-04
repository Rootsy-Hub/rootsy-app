"use client"

import { ArticleDeleteDialog } from "@/app/[siteId]/[popId]/articles/ArticleDeleteDialog"
import { articleDeleteConfirmPhrase } from "@/app/[siteId]/[popId]/articles/articleConstants"
import { SpecCard } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"
import {
  RootsDangerButton,
  RootsPrimaryButton,
  RootsSubtleButton,
} from "@/components/rootsy-button"
import { rootsFormTextFieldClass } from "@/components/rootsy-form/rootsFormStyles"
import { saleOpAlertDialogContent } from "@/components/sale-operation/saleOperationStyles"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
        "saleOpAlertDialogContent",
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

      <AlertDialog open={false}>
        <AlertDialogContent className={saleOpAlertDialogContent}>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar {DEMO_ARTICLE_NAME}</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Para confirmar, escribí (
              {confirmPhrase}) abajo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            readOnly
            value=""
            placeholder={confirmPhrase}
            className={rootsFormTextFieldClass}
            aria-label={`Confirmación: ${confirmPhrase}`}
          />
          <AlertDialogFooter>
            <RootsSubtleButton type="button">Cancelar</RootsSubtleButton>
            <RootsDangerButton type="button" disabled>
              Eliminar definitivamente
            </RootsDangerButton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div
        className={cn(
          "mt-3 overflow-hidden rounded-2xl border border-dashed border-border/70 p-4",
          saleOpAlertDialogContent,
        )}
      >
        <div className="space-y-4 px-1 py-1">
          <div className="space-y-2">
            <p className="text-base font-semibold">Eliminar {DEMO_ARTICLE_NAME}</p>
            <p className="text-sm text-muted-foreground">
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
          <div className="flex justify-end gap-2 pt-1">
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
