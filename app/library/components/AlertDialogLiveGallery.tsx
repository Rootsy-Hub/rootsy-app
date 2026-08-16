"use client"

import {
  MODAL_UI_ALERT_VARIANTS,
  MODAL_UI_DEMO_COPY,
  MODAL_UI_PANEL_SURFACE_SPEC,
  MODAL_UI_SCRIM_SPEC,
  getModalUiOverlaySpecRows,
  type AlertDialogVariantId,
} from "@/app/library/ui-components/modalsUiHardcodedSpec"
import {
  DialogGallerySectionHeading,
  DialogGallerySpecBlock,
  DialogVariantRow,
  DialogVariantSpecCell,
  OverlaySurfaceSpecTable,
} from "@/app/library/ui-components/dialogUiDocShared"
import { FoundationBrumaStage } from "@/app/library/libraryFoundationDocShared"
import {
  RootsAlertDialogBodyText,
  RootsAlertDialogContent,
  RootsAlertDialogFooter,
  RootsAlertDialogPanel,
  rootsAlertDialogContentClass,
  rootsAlertDialogDescriptionClass,
  rootsAlertDialogFooterClass,
  rootsAlertDialogSurfaceClass,
  rootsAlertDialogTitleClass,
} from "@/components/rootsy-dialog"
import { RootsDefaultButton, RootsDangerButton, RootsPrimaryButton, RootsSubtleButton } from "@/components/rootsy-button"
import { RootsFormTextField } from "@/components/rootsy-form"
import { AlertDialog } from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { useState } from "react"

function alertCopyForVariant(variant: AlertDialogVariantId) {
  switch (variant) {
    case "confirm":
      return MODAL_UI_DEMO_COPY.alert.confirm
    case "destructive":
      return MODAL_UI_DEMO_COPY.alert.destructive
    case "typed-confirmation":
      return MODAL_UI_DEMO_COPY.alert.typed
  }
}

function AlertChromePreview({
  variant,
  typedMatch = false,
}: {
  variant: AlertDialogVariantId
  typedMatch?: boolean
}) {
  const copy = alertCopyForVariant(variant)
  const typed = MODAL_UI_DEMO_COPY.alert.typed

  return (
    <div className="overflow-hidden rounded-2xl border border-dashed border-[var(--rootsy-bruma-200)] bg-[color-mix(in_srgb,var(--rootsy-bruma-50)_85%,transparent)] p-3">
      <div className={cn("pointer-events-none mx-auto w-full overflow-hidden shadow-md", rootsAlertDialogSurfaceClass)}>
        <div className={rootsAlertDialogContentClass}>
          <div className="flex flex-col gap-1">
            <p className={rootsAlertDialogTitleClass}>{copy.title}</p>
            <p className={rootsAlertDialogDescriptionClass}>{copy.description}</p>
          </div>
          <p className="text-sm leading-relaxed text-[var(--rootsy-bruma-700)]">{copy.body}</p>
          {variant === "typed-confirmation" ? (
            <div className="pointer-events-none space-y-1">
              <RootsFormTextField
                label={typed.inputLabel}
                value={typedMatch ? typed.inputValue : ""}
                placeholder={typed.inputPlaceholder}
                readOnly
              />
            </div>
          ) : null}
        </div>
        <div className={cn(rootsAlertDialogFooterClass, "flex items-center justify-between")}>
          <RootsSubtleButton type="button">{copy.cancel}</RootsSubtleButton>
          {variant === "confirm" ? (
            <RootsPrimaryButton type="button">{copy.confirm}</RootsPrimaryButton>
          ) : (
            <RootsDangerButton type="button" disabled={variant === "typed-confirmation" && !typedMatch}>
              {copy.confirm}
            </RootsDangerButton>
          )}
        </div>
      </div>
    </div>
  )
}

function LiveAlertDialog({
  variant,
  open,
  onOpenChange,
}: {
  variant: AlertDialogVariantId
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const copy = alertCopyForVariant(variant)
  const typed = MODAL_UI_DEMO_COPY.alert.typed
  const [confirmValue, setConfirmValue] = useState("")
  const typedReady = confirmValue.trim() === typed.inputPlaceholder

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <RootsAlertDialogContent>
        <RootsAlertDialogPanel title={copy.title} description={copy.description}>
          <RootsAlertDialogBodyText>{copy.body}</RootsAlertDialogBodyText>
          {variant === "typed-confirmation" ? (
            <RootsFormTextField
              label={typed.inputLabel}
              value={confirmValue}
              onChange={(event) => setConfirmValue(event.target.value)}
              placeholder={typed.inputPlaceholder}
            />
          ) : null}
        </RootsAlertDialogPanel>
        <RootsAlertDialogFooter
          cancelLabel={copy.cancel}
          confirmLabel={copy.confirm}
          destructive={variant !== "confirm"}
          confirmDisabled={variant === "typed-confirmation" && !typedReady}
          onCancel={() => onOpenChange(false)}
          onConfirm={() => onOpenChange(false)}
        />
      </RootsAlertDialogContent>
    </AlertDialog>
  )
}

function AlertVariantCell({
  variant,
  typedMatch = true,
  liveId,
  onOpenLive,
}: {
  variant: AlertDialogVariantId
  typedMatch?: boolean
  liveId: string
  onOpenLive: (id: string) => void
}) {
  return (
    <div className="space-y-3">
      <AlertChromePreview variant={variant} typedMatch={typedMatch} />
      <RootsDefaultButton type="button" onClick={() => onOpenLive(liveId)}>
        Abrir en vivo
      </RootsDefaultButton>
    </div>
  )
}

export function AlertDialogLiveGallery() {
  const [liveId, setLiveId] = useState<string | null>(null)

  const liveVariant = liveId?.startsWith("alert-")
    ? (liveId.replace("alert-", "").replace("-disabled", "") as AlertDialogVariantId)
    : null

  return (
    <div className="space-y-10">
      <OverlaySurfaceSpecTable
        title="Superficie overlay · alert dialog (producto)"
        description={`${MODAL_UI_SCRIM_SPEC.note} Mismo scrim que modal. Radio ${MODAL_UI_PANEL_SURFACE_SPEC.radiusAlertToken} · sin body sunken.`}
        rows={getModalUiOverlaySpecRows("alert")}
        pairNote={MODAL_UI_PANEL_SURFACE_SPEC.pairRule}
      />

      <FoundationBrumaStage clip={false} caption="dialog.alert · font.heading.small · radius.xlarge · justify-between.">
        <div className="space-y-6">
          <DialogGallerySectionHeading
            title="Variantes"
            description="Confirmación · destructivo · confirmación escrita — shell compacto sin body sunken."
          />
          <DialogGallerySpecBlock title="dialog.alert" hint="RootsAlertDialogContent · Panel · Footer.">
            <DialogVariantRow>
              {MODAL_UI_ALERT_VARIANTS.map((variant) => (
                <DialogVariantSpecCell key={variant.id} label={variant.token} className="min-w-[20rem]">
                  <AlertVariantCell
                    variant={variant.id}
                    liveId={`alert-${variant.id}`}
                    onOpenLive={setLiveId}
                  />
                </DialogVariantSpecCell>
              ))}
              <DialogVariantSpecCell label="alert.typed-confirmation · disabled" className="min-w-[20rem]">
                <AlertVariantCell
                  variant="typed-confirmation"
                  typedMatch={false}
                  liveId="alert-typed-confirmation-disabled"
                  onOpenLive={setLiveId}
                />
              </DialogVariantSpecCell>
            </DialogVariantRow>
          </DialogGallerySpecBlock>
        </div>
      </FoundationBrumaStage>

      {liveVariant ? (
        <LiveAlertDialog
          variant={liveVariant}
          open
          onOpenChange={(open) => {
            if (!open) setLiveId(null)
          }}
        />
      ) : null}
    </div>
  )
}
