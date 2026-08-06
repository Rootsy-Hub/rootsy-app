"use client"

import {
  BUTTONS_UI_SIZE_SPECS,
  getButtonsUiAppearanceSurface,
} from "@/app/[siteId]/[popId]/library/ui-components/buttonsUiHardcodedSpec"
import {
  FORM_UI_CONTROL_TYPOGRAPHY,
  FORM_UI_LABEL_STYLE,
  getFormControlSpec,
  getFormControlUiSurface,
} from "@/app/[siteId]/[popId]/library/ui-components/formsUiHardcodedSpec"
import {
  MODAL_UI_ALERT_VARIANTS,
  MODAL_UI_BODY_TONES,
  MODAL_UI_DEMO_COPY,
  MODAL_UI_FOOTER_VARIANTS,
  MODAL_UI_OVERLAY_SPEC,
  MODAL_UI_PANEL_SURFACE_SPEC,
  MODAL_UI_SCRIM_SPEC,
  MODAL_UI_SURFACE_SIZES,
  MODAL_UI_DESCRIPTION_STYLE,
  MODAL_UI_BODY_TEXT_STYLE,
  getModalTitleUiStyle,
  getAlertActionUiStyle,
  getAlertContentUiStyle,
  getDialogBodyUiStyle,
  getDialogCloseButtonUiStyle,
  getDialogFooterUiStyle,
  getDialogHeaderUiStyle,
  getDialogLoadingUiStyle,
  getDialogPanelShellRadiusClass,
  getDialogPanelShellUiStyle,
  getDialogPreviewMinHeightPx,
  getModalUiOverlaySpecRows,
  type AlertDialogVariantId,
  type ModalBodyToneId,
  type ModalFooterVariantId,
  type ModalSurfaceSizeId,
} from "@/app/[siteId]/[popId]/library/ui-components/modalsUiHardcodedSpec"
import {
  DialogGallerySectionHeading,
  DialogGallerySpecBlock,
  DialogPreviewViewport,
  DialogVariantRow,
  DialogVariantSpecCell,
  OverlaySurfaceSpecTable,
} from "@/app/[siteId]/[popId]/library/ui-components/dialogUiDocShared"
import { FoundationBrumaStage } from "@/app/[siteId]/[popId]/library/libraryFoundationDocShared"
import { cn } from "@/lib/utils"
import { rootsySpacePx } from "@/lib/design-system"
import type { CSSProperties } from "react"

function HardcodedFooterButton({
  appearance,
  label,
  disabled = false,
}: {
  appearance: "primary" | "subtle" | "danger"
  label: string
  disabled?: boolean
}) {
  const size = BUTTONS_UI_SIZE_SPECS.default
  const surface = getButtonsUiAppearanceSurface(appearance)

  const style: CSSProperties = {
    fontFamily: "var(--rootsy-font-ui)",
    fontSize: size.fontSize,
    lineHeight: size.lineHeight,
    fontWeight: surface.fontWeight,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: size.heightPx,
    paddingLeft: size.paddingXPx,
    paddingRight: size.paddingXPx,
    borderRadius: size.radiusPx,
    backgroundColor: surface.backgroundColor,
    color: surface.color,
    border: surface.border,
    boxShadow: surface.boxShadow,
    opacity: disabled ? 0.5 : surface.opacity,
    whiteSpace: "nowrap",
    userSelect: "none",
  }

  return <span aria-hidden style={style}>{label}</span>
}

function HardcodedModalFooter({ variant }: { variant: ModalFooterVariantId }) {
  if (variant === "none") return null

  const footerStyle = getDialogFooterUiStyle()
  const copy = MODAL_UI_DEMO_COPY.footer

  const wrapStyle: CSSProperties = {
    ...footerStyle,
    display: "flex",
    alignItems: "center",
    justifyContent: variant === "single" ? "flex-end" : "space-between",
    gap: rootsySpacePx("150"),
  }

  if (variant === "single") {
    return (
      <div aria-hidden style={wrapStyle}>
        <HardcodedFooterButton appearance="primary" label={copy.single} />
      </div>
    )
  }

  return (
    <div aria-hidden style={wrapStyle}>
      <HardcodedFooterButton appearance="subtle" label={copy.cancel} />
      <HardcodedFooterButton
        appearance={variant === "destructive-dual" ? "danger" : "primary"}
        label={variant === "destructive-dual" ? copy.delete : copy.confirm}
      />
    </div>
  )
}

function HardcodedMiniField({
  label,
  value,
  placeholder,
}: {
  label: string
  value?: string
  placeholder?: string
}) {
  const spec = getFormControlSpec("text")
  const surface = getFormControlUiSurface("default")

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: rootsySpacePx("100") }}>
      <span aria-hidden style={FORM_UI_LABEL_STYLE}>{label}</span>
      <div
        aria-hidden
        style={{
          ...FORM_UI_CONTROL_TYPOGRAPHY,
          display: "flex",
          alignItems: "center",
          height: spec.heightPx,
          paddingLeft: spec.paddingXPx,
          paddingRight: spec.paddingXPx,
          borderRadius: spec.radiusPx,
          backgroundColor: surface.backgroundColor,
          color: value ? surface.color : surface.placeholderColor,
          border: surface.border,
        }}
      >
        {value ?? placeholder}
      </div>
    </div>
  )
}

function HardcodedLoadingSpinner() {
  const loading = getDialogLoadingUiStyle()

  return (
    <div
      aria-hidden
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: loading.minHeightPx,
      }}
    >
      <div
        style={{
          width: loading.spinnerSizePx,
          height: loading.spinnerSizePx,
          borderRadius: 9999,
          border: `${loading.spinnerBorderWidthPx}px solid ${loading.trackColor}`,
          borderTopColor: loading.spinnerColor,
        }}
      />
    </div>
  )
}

function DialogCloseGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

function HardcodedModalPanel({
  size = "default",
  footerVariant = "dual",
  bodyTone = "default",
  showClose = true,
}: {
  size?: ModalSurfaceSizeId
  footerVariant?: ModalFooterVariantId
  bodyTone?: ModalBodyToneId
  showClose?: boolean
}) {
  const header = getDialogHeaderUiStyle("modal")
  const body = getDialogBodyUiStyle(bodyTone, "modal")
  const close = getDialogCloseButtonUiStyle()
  const copy = MODAL_UI_DEMO_COPY.modal
  const scrim = MODAL_UI_OVERLAY_SPEC.scrim
  const panelStyle = getDialogPanelShellUiStyle("modal", size)

  const headerStyle: CSSProperties = {
    ...header,
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: rootsySpacePx("100"),
    textAlign: "left",
  }

  const closeStyle: CSSProperties = {
    position: "absolute",
    top: close.insetPx,
    right: close.insetPx,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: close.sizePx,
    height: close.sizePx,
    borderRadius: close.borderRadiusPx,
    color: close.color,
  }

  return (
    <DialogPreviewViewport
      scrimBackground={scrim.background}
      minHeightPx={getDialogPreviewMinHeightPx("modal", { size, bodyTone })}
    >
      <div className={cn("shrink-0", getDialogPanelShellRadiusClass("modal"))} style={panelStyle}>
        <div style={headerStyle}>
          {showClose ? (
            <span style={closeStyle}>
              <DialogCloseGlyph />
            </span>
          ) : null}
          <p style={{ ...getModalTitleUiStyle("modal"), margin: 0 }}>{copy.title}</p>
          <p style={{ ...MODAL_UI_DESCRIPTION_STYLE, margin: 0 }}>{copy.description}</p>
        </div>
        <div style={body}>
          {bodyTone === "loading" ? (
            <HardcodedLoadingSpinner />
          ) : bodyTone === "compact" ? (
            <p style={{ ...MODAL_UI_BODY_TEXT_STYLE, margin: 0 }}>{copy.bodySummary}</p>
          ) : size === "two-column" ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: rootsySpacePx("200"),
              }}
            >
              <HardcodedMiniField label={copy.fieldName} value={copy.fieldNameValue} />
              <HardcodedMiniField label={copy.fieldPrice} value={copy.fieldPriceValue} />
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: rootsySpacePx("150") }}>
              <HardcodedMiniField label={copy.fieldName} value={copy.fieldNameValue} />
              <HardcodedMiniField label={copy.fieldPrice} value={copy.fieldPriceValue} />
            </div>
          )}
        </div>
        <HardcodedModalFooter variant={footerVariant} />
      </div>
    </DialogPreviewViewport>
  )
}

function HardcodedAlertPanel({
  variant,
  typedMatch = false,
}: {
  variant: AlertDialogVariantId
  typedMatch?: boolean
}) {
  const scrim = MODAL_UI_OVERLAY_SPEC.scrim
  const copy =
    variant === "confirm"
      ? MODAL_UI_DEMO_COPY.alert.confirm
      : variant === "destructive"
        ? MODAL_UI_DEMO_COPY.alert.destructive
        : MODAL_UI_DEMO_COPY.alert.typed

  const actions = getAlertActionUiStyle(variant)
  const panelStyle = getDialogPanelShellUiStyle("alert")

  const contentStyle = getAlertContentUiStyle()
  const footerStyle = getDialogFooterUiStyle("alert")

  return (
    <DialogPreviewViewport
      scrimBackground={scrim.background}
      minHeightPx={getDialogPreviewMinHeightPx("alert", { alertVariant: variant })}
    >
      <div className={cn("shrink-0", getDialogPanelShellRadiusClass("alert"))} style={panelStyle}>
        <div
          style={{
            ...contentStyle,
            display: "flex",
            flexDirection: "column",
            gap: rootsySpacePx("150"),
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: rootsySpacePx("100") }}>
            <p style={{ ...getModalTitleUiStyle("alert"), margin: 0 }}>{copy.title}</p>
            <p style={{ ...MODAL_UI_DESCRIPTION_STYLE, margin: 0 }}>{copy.description}</p>
          </div>
          <p style={{ ...MODAL_UI_BODY_TEXT_STYLE, margin: 0 }}>{copy.body}</p>
          {variant === "typed-confirmation" ? (
            <div>
              <HardcodedMiniField
                label={MODAL_UI_DEMO_COPY.alert.typed.inputLabel}
                value={typedMatch ? MODAL_UI_DEMO_COPY.alert.typed.inputValue : undefined}
                placeholder={MODAL_UI_DEMO_COPY.alert.typed.inputPlaceholder}
              />
              {!typedMatch ? (
                <p
                  style={{
                    ...MODAL_UI_DESCRIPTION_STYLE,
                    marginTop: rootsySpacePx("100"),
                    marginBottom: 0,
                  }}
                >
                  Escribí &quot;{MODAL_UI_DEMO_COPY.alert.typed.inputPlaceholder}&quot; para habilitar eliminar.
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
        <div
          style={{
            ...footerStyle,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: rootsySpacePx("150"),
          }}
        >
          <HardcodedFooterButton appearance="subtle" label={copy.cancel} />
          <HardcodedFooterButton
            appearance={actions.confirmAppearance}
            label={copy.confirm}
            disabled={variant === "typed-confirmation" && !typedMatch}
          />
        </div>
      </div>
    </DialogPreviewViewport>
  )
}

function ModalSizeVariantsBlock() {
  return (
    <DialogGallerySpecBlock title="dialog.width · tamaños" hint="default · wide · two-column — shadow.overlay · radius.xxlarge.">
      <DialogVariantRow>
        {MODAL_UI_SURFACE_SIZES.filter((size) => size.id !== "two-column").map((size) => (
          <DialogVariantSpecCell key={size.id} label={size.token}>
            <HardcodedModalPanel size={size.id} footerVariant="dual" />
          </DialogVariantSpecCell>
        ))}
      </DialogVariantRow>
      <DialogVariantSpecCell label="dialog.width.two-column" className="min-w-full basis-full">
        <div className="overflow-x-auto pb-1">
          <HardcodedModalPanel size="two-column" footerVariant="dual" />
        </div>
      </DialogVariantSpecCell>
    </DialogGallerySpecBlock>
  )
}

function ModalFooterVariantsBlock() {
  return (
    <DialogGallerySpecBlock title="dialog.footer · variantes" hint="none · single · dual · destructive-dual.">
      <DialogVariantRow>
        {MODAL_UI_FOOTER_VARIANTS.map((variant) => (
          <DialogVariantSpecCell key={variant.id} label={variant.token}>
            <HardcodedModalPanel footerVariant={variant.id} bodyTone="compact" />
          </DialogVariantSpecCell>
        ))}
      </DialogVariantRow>
    </DialogGallerySpecBlock>
  )
}

function ModalBodyTonesBlock() {
  return (
    <DialogGallerySpecBlock title="dialog.body · tonos" hint="default sunken · compact · loading spinner.">
      <DialogVariantRow>
        {MODAL_UI_BODY_TONES.map((tone) => (
          <DialogVariantSpecCell key={tone.id} label={tone.token}>
            <HardcodedModalPanel
              footerVariant={tone.id === "loading" ? "none" : "dual"}
              bodyTone={tone.id}
            />
          </DialogVariantSpecCell>
        ))}
      </DialogVariantRow>
    </DialogGallerySpecBlock>
  )
}

function AlertDialogVariantsBlock() {
  return (
    <DialogGallerySpecBlock title="dialog.alert · variantes" hint="confirm · destructive · typed-confirmation.">
      <DialogVariantRow>
        {MODAL_UI_ALERT_VARIANTS.map((variant) => (
          <DialogVariantSpecCell key={variant.id} label={variant.token} className="min-w-[20rem]">
            <HardcodedAlertPanel
              variant={variant.id}
              typedMatch={variant.id === "typed-confirmation"}
            />
          </DialogVariantSpecCell>
        ))}
        <DialogVariantSpecCell label="alert.typed-confirmation · disabled" className="min-w-[20rem]">
          <HardcodedAlertPanel variant="typed-confirmation" typedMatch={false} />
        </DialogVariantSpecCell>
      </DialogVariantRow>
    </DialogGallerySpecBlock>
  )
}

export function ModalsUiHardcodedGallery() {
  return (
    <div className="space-y-10">
      <OverlaySurfaceSpecTable
        title="Superficie overlay · modal"
        description={MODAL_UI_SCRIM_SPEC.note}
        rows={getModalUiOverlaySpecRows("modal")}
        pairNote={MODAL_UI_PANEL_SURFACE_SPEC.pairRule}
      />

      <FoundationBrumaStage clip={false} caption="panel-padding space.400 · font.heading.medium · color.border · elevation.shadow.overlay.">
        <div className="space-y-8">
          <DialogGallerySectionHeading
            title="Anatomía"
            description="Scrim sombra-950 · panel overlay · body sunken · footer dual — close space.400."
          />
          <HardcodedModalPanel size="default" footerVariant="dual" />
        </div>
      </FoundationBrumaStage>

      <FoundationBrumaStage clip={false} caption="dialog.modal · dialog.width · dialog.footer · panel-padding space.400.">
        <div className="space-y-8">
          <DialogGallerySectionHeading
            title="Modal"
            description="Tres anchos · cuatro footers · tres tonos de body — tokens elevation + border."
          />
          <ModalSizeVariantsBlock />
          <ModalFooterVariantsBlock />
          <ModalBodyTonesBlock />
        </div>
      </FoundationBrumaStage>

      <OverlaySurfaceSpecTable
        title="Superficie overlay · alert dialog"
        description="Mismo scrim y par surface+shadow que modal. Radio radius.xlarge · sin body sunken."
        rows={getModalUiOverlaySpecRows("alert")}
        pairNote={MODAL_UI_PANEL_SURFACE_SPEC.pairRule}
      />

      <FoundationBrumaStage clip={false} caption="dialog.alert · font.heading.small · status-danger solo en botón · justify-between.">
        <div className="space-y-8">
          <DialogGallerySectionHeading
            title="Alert dialog"
            description="Confirmación · destructivo · confirmación escrita — shell compacto sin body sunken."
          />
          <AlertDialogVariantsBlock />
        </div>
      </FoundationBrumaStage>
    </div>
  )
}
