"use client"

import {
  MODAL_UI_BODY_TONES,
  MODAL_UI_DEMO_COPY,
  MODAL_UI_FOOTER_VARIANTS,
  MODAL_UI_OVERLAY_SPEC,
  MODAL_UI_PANEL_SURFACE_SPEC,
  MODAL_UI_SCRIM_SPEC,
  MODAL_UI_SURFACE_SIZES,
  getModalUiOverlaySpecRows,
  type ModalBodyToneId,
  type ModalFooterVariantId,
  type ModalSurfaceSizeId,
} from "@/app/library/ui-components/modalsUiHardcodedSpec"
import {
  DialogGallerySectionHeading,
  DialogGallerySpecBlock,
  DialogVariantRow,
  OverlaySurfaceSpecTable,
} from "@/app/library/ui-components/dialogUiDocShared"
import { FoundationBrumaStage } from "@/app/library/libraryFoundationDocShared"
import {
  RootsFormTextField,
} from "@/components/rootsy-form"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogFooterByVariant,
  RootsDialogHeader,
  RootsDialogLoadingState,
  rootsAlertDialogBodyTextClass,
  rootsDialogBodyClass,
  rootsDialogBodyCompactClass,
  rootsDialogDescriptionClass,
  rootsDialogFooterClass,
  rootsDialogHeaderClass,
  rootsDialogLoadingBodyClass,
  rootsDialogSurfaceDefaultClass,
  rootsDialogSurfaceTwoColClass,
  rootsDialogSurfaceWideClass,
  rootsDialogTitleClass,
  type RootsDialogFooterVariant,
  type RootsDialogSize,
} from "@/components/rootsy-dialog"
import { RootsDefaultButton } from "@/components/rootsy-button"
import { Dialog } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useState } from "react"

const surfaceClassBySize: Record<ModalSurfaceSizeId, string> = {
  default: rootsDialogSurfaceDefaultClass,
  wide: rootsDialogSurfaceWideClass,
  "two-column": rootsDialogSurfaceTwoColClass,
}

const dialogSizeBySpec: Record<ModalSurfaceSizeId, RootsDialogSize> = {
  default: "default",
  wide: "wide",
  "two-column": "twoCol",
}

type ModalDemoConfig = {
  size?: ModalSurfaceSizeId
  footerVariant: ModalFooterVariantId
  bodyTone: ModalBodyToneId
}

function modalBodyToneClass(tone: ModalBodyToneId): string | undefined {
  switch (tone) {
    case "loading":
      return rootsDialogLoadingBodyClass
    case "compact":
      return rootsDialogBodyCompactClass
    default:
      return undefined
  }
}

function ModalDemoFields({
  copy,
  interactive,
  name,
  onNameChange,
  price,
  onPriceChange,
  twoColumn = false,
}: {
  copy: (typeof MODAL_UI_DEMO_COPY)["modal"]
  interactive: boolean
  name: string
  onNameChange: (value: string) => void
  price: string
  onPriceChange: (value: string) => void
  twoColumn?: boolean
}) {
  const fields = (
    <>
      <RootsFormTextField
        label={copy.fieldName}
        value={name}
        onChange={(event) => onNameChange(event.target.value)}
        disabled={!interactive}
      />
      <RootsFormTextField
        label={copy.fieldPrice}
        value={price}
        onChange={(event) => onPriceChange(event.target.value)}
        disabled={!interactive}
      />
    </>
  )

  if (twoColumn) {
    return <div className="grid gap-[var(--rootsy-space-200)] sm:grid-cols-2">{fields}</div>
  }

  return <div className="flex flex-col gap-[var(--rootsy-space-150)]">{fields}</div>
}

function ModalDemoBody({
  config,
  interactive,
  name,
  onNameChange,
  price,
  onPriceChange,
}: {
  config: ModalDemoConfig
  interactive: boolean
  name: string
  onNameChange: (value: string) => void
  price: string
  onPriceChange: (value: string) => void
}) {
  const copy = MODAL_UI_DEMO_COPY.modal
  const toneClass = modalBodyToneClass(config.bodyTone)

  return (
    <RootsDialogBody className={toneClass}>
      {config.bodyTone === "loading" ? (
        <RootsDialogLoadingState />
      ) : config.bodyTone === "compact" ? (
        <p className={rootsAlertDialogBodyTextClass}>{copy.bodySummary}</p>
      ) : (
        <ModalDemoFields
          copy={copy}
          interactive={interactive}
          name={name}
          onNameChange={onNameChange}
          price={price}
          onPriceChange={onPriceChange}
          twoColumn={config.size === "two-column"}
        />
      )}
    </RootsDialogBody>
  )
}

function ModalChromePreview({ config }: { config: ModalDemoConfig }) {
  const copy = MODAL_UI_DEMO_COPY.modal
  const size = config.size ?? "default"

  return (
    <div className="overflow-hidden rounded-2xl border border-dashed border-[var(--rootsy-bruma-200)] bg-[color-mix(in_srgb,var(--rootsy-bruma-50)_85%,transparent)] p-3">
      <div
        className={cn(
          "pointer-events-none mx-auto w-full overflow-hidden max-h-none shadow-md",
          surfaceClassBySize[size],
        )}
      >
        <div className={rootsDialogHeaderClass}>
          <p className={rootsDialogTitleClass}>{copy.title}</p>
          <p className={rootsDialogDescriptionClass}>{copy.description}</p>
        </div>
        <div
          className={cn(
            config.bodyTone === "loading"
              ? rootsDialogLoadingBodyClass
              : config.bodyTone === "compact"
                ? rootsDialogBodyCompactClass
                : rootsDialogBodyClass,
          )}
        >
          {config.bodyTone === "loading" ? (
            <RootsDialogLoadingState />
          ) : config.bodyTone === "compact" ? (
            <p className={rootsAlertDialogBodyTextClass}>{copy.bodySummary}</p>
          ) : (
            <ModalDemoFields
              copy={copy}
              interactive={false}
              name={copy.fieldNameValue}
              onNameChange={() => {}}
              price={copy.fieldPriceValue}
              onPriceChange={() => {}}
              twoColumn={size === "two-column"}
            />
          )}
        </div>
        {config.bodyTone !== "loading" ? (
          <RootsDialogFooterByVariant
            variant={config.footerVariant as RootsDialogFooterVariant}
            onClose={() => {}}
            confirmLabel={
              config.footerVariant === "destructive-dual"
                ? MODAL_UI_DEMO_COPY.footer.delete
                : MODAL_UI_DEMO_COPY.footer.confirm
            }
          />
        ) : null}
      </div>
    </div>
  )
}

function LiveModalDialog({
  config,
  open,
  onOpenChange,
}: {
  config: ModalDemoConfig
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const copy = MODAL_UI_DEMO_COPY.modal
  const [name, setName] = useState<string>(copy.fieldNameValue)
  const [price, setPrice] = useState<string>(copy.fieldPriceValue)
  const size = config.size ?? "default"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent size={dialogSizeBySpec[size]}>
        <RootsDialogHeader title={copy.title} description={copy.description} />
        <ModalDemoBody
          config={config}
          interactive
          name={name}
          onNameChange={setName}
          price={price}
          onPriceChange={setPrice}
        />
        {config.bodyTone !== "loading" ? (
          <RootsDialogFooterByVariant
            variant={config.footerVariant as RootsDialogFooterVariant}
            onClose={() => onOpenChange(false)}
            confirmLabel={
              config.footerVariant === "destructive-dual"
                ? MODAL_UI_DEMO_COPY.footer.delete
                : MODAL_UI_DEMO_COPY.footer.confirm
            }
          />
        ) : null}
      </RootsDialogContent>
    </Dialog>
  )
}

function ModalVariantCell({
  label,
  config,
  liveId,
  onOpenLive,
}: {
  label: string
  config: ModalDemoConfig
  liveId: string
  onOpenLive: (id: string) => void
}) {
  return (
    <div className="space-y-3">
      <ModalChromePreview config={config} />
      <div className="space-y-2 px-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--rootsy-bruma-500)]">
          {label}
        </p>
        <RootsDefaultButton type="button" onClick={() => onOpenLive(liveId)}>
          Abrir en vivo
        </RootsDefaultButton>
      </div>
    </div>
  )
}

export function ModalsLiveGallery() {
  const [liveId, setLiveId] = useState<string | null>(null)

  const liveConfig =
    liveId === "anatomy"
      ? { size: "default" as const, footerVariant: "dual" as const, bodyTone: "default" as const }
      : liveId?.startsWith("size-")
        ? {
            size: liveId.replace("size-", "") as ModalSurfaceSizeId,
            footerVariant: "dual" as const,
            bodyTone: "default" as const,
          }
        : liveId?.startsWith("footer-")
          ? {
              size: "default" as const,
              footerVariant: liveId.replace("footer-", "") as ModalFooterVariantId,
              bodyTone: "compact" as const,
            }
          : liveId?.startsWith("body-")
            ? {
                size: "default" as const,
                footerVariant:
                  liveId === "body-loading"
                    ? ("none" as const)
                    : ("dual" as const),
                bodyTone: liveId.replace("body-", "") as ModalBodyToneId,
              }
            : null

  return (
    <div className="space-y-10">
      <OverlaySurfaceSpecTable
        title="Superficie overlay · modal (producto)"
        description={MODAL_UI_SCRIM_SPEC.note}
        rows={getModalUiOverlaySpecRows("modal")}
        pairNote={MODAL_UI_PANEL_SURFACE_SPEC.pairRule}
      />

      <FoundationBrumaStage clip={false} caption="panel-padding space.400 · font.heading.medium · elevation.shadow.overlay · radius.xxlarge.">
        <div className="space-y-4">
          <DialogGallerySectionHeading
            title="Anatomía"
            description="Scrim sombra-950 · panel overlay · body sunken · footer dual."
          />
          <ModalChromePreview
            config={{ size: "default", footerVariant: "dual", bodyTone: "default" }}
          />
          <RootsDefaultButton type="button" onClick={() => setLiveId("anatomy")}>
            Abrir en vivo
          </RootsDefaultButton>
        </div>
      </FoundationBrumaStage>

      <FoundationBrumaStage clip={false} caption="dialog.width · default · wide · two-column.">
        <div className="space-y-6">
          <DialogGallerySectionHeading title="Tamaños" description="448px · 512px · 896px — max-height por spec." />
          <DialogGallerySpecBlock title="dialog.width" hint="RootsDialogContent size prop.">
            <DialogVariantRow>
              {MODAL_UI_SURFACE_SIZES.filter((size) => size.id !== "two-column").map((size) => (
                <ModalVariantCell
                  key={size.id}
                  label={size.token}
                  liveId={`size-${size.id}`}
                  onOpenLive={setLiveId}
                  config={{ size: size.id, footerVariant: "dual", bodyTone: "default" }}
                />
              ))}
            </DialogVariantRow>
            <div className="min-w-full basis-full overflow-x-auto pb-1">
              <ModalVariantCell
                label="dialog.width.two-column"
                liveId="size-two-column"
                onOpenLive={setLiveId}
                config={{ size: "two-column", footerVariant: "dual", bodyTone: "default" }}
              />
            </div>
          </DialogGallerySpecBlock>
        </div>
      </FoundationBrumaStage>

      <FoundationBrumaStage clip={false} caption="dialog.footer · none · single · dual · destructive-dual.">
        <div className="space-y-6">
          <DialogGallerySectionHeading title="Footers" description="Subtle izq · primary/danger der — justify-between." />
          <DialogGallerySpecBlock title="dialog.footer" hint="RootsDialogFooterByVariant.">
            <DialogVariantRow>
              {MODAL_UI_FOOTER_VARIANTS.map((variant) => (
                <ModalVariantCell
                  key={variant.id}
                  label={variant.token}
                  liveId={`footer-${variant.id}`}
                  onOpenLive={setLiveId}
                  config={{ footerVariant: variant.id, bodyTone: "compact" }}
                />
              ))}
            </DialogVariantRow>
          </DialogGallerySpecBlock>
        </div>
      </FoundationBrumaStage>

      <FoundationBrumaStage clip={false} caption="dialog.body · default sunken · compact · loading.">
        <div className="space-y-6">
          <DialogGallerySectionHeading title="Body" description="Sunken bruma-50 · overlay compacto · spinner savia." />
          <DialogGallerySpecBlock title="dialog.body" hint="rootsDialogBody* · RootsDialogLoadingState.">
            <DialogVariantRow>
              {MODAL_UI_BODY_TONES.map((tone) => (
                <ModalVariantCell
                  key={tone.id}
                  label={tone.token}
                  liveId={`body-${tone.id}`}
                  onOpenLive={setLiveId}
                  config={{
                    footerVariant: tone.id === "loading" ? "none" : "dual",
                    bodyTone: tone.id,
                  }}
                />
              ))}
            </DialogVariantRow>
          </DialogGallerySpecBlock>
        </div>
      </FoundationBrumaStage>

      {liveConfig ? (
        <LiveModalDialog
          config={liveConfig}
          open
          onOpenChange={(open) => {
            if (!open) setLiveId(null)
          }}
        />
      ) : null}
    </div>
  )
}
