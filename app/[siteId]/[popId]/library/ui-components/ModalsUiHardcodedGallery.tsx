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
  getDialogPanelUiSurface,
  getDialogPreviewWidthPx,
  getDialogScrimUiStyle,
  type AlertDialogVariantId,
  type ModalBodyToneId,
  type ModalFooterVariantId,
  type ModalSurfaceSizeId,
} from "@/app/[siteId]/[popId]/library/ui-components/modalsUiHardcodedSpec"
import { COLOR_TOKENS } from "@/app/[siteId]/[popId]/library/color/rootsyColorSystem"
import { FoundationBrumaStage } from "@/app/[siteId]/[popId]/library/libraryFoundationDocShared"
import { rootsySpacePx } from "@/lib/design-system"
import type { CSSProperties, ReactNode } from "react"

function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="space-y-1">
      <h2 className="font-canopy text-base font-semibold" style={{ color: COLOR_TOKENS.bruma900 }}>
        {title}
      </h2>
      {description ? (
        <p className="font-canopy text-xs leading-relaxed" style={{ color: COLOR_TOKENS.bruma500 }}>
          {description}
        </p>
      ) : null}
    </div>
  )
}

function SpecBlock({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <div>
        <h3
          className="font-mono text-[11px] font-medium uppercase tracking-[0.12em]"
          style={{ color: COLOR_TOKENS.bruma500 }}
        >
          {title}
        </h3>
        {hint ? (
          <p className="mt-1 font-canopy text-xs leading-relaxed" style={{ color: COLOR_TOKENS.bruma500 }}>
            {hint}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

function VariantSpecCell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-[14rem] max-w-[20rem] flex-col gap-1.5">
      {children}
      <span
        className="font-mono text-[10px] uppercase tracking-[0.08em]"
        style={{ color: COLOR_TOKENS.bruma500 }}
      >
        {label}
      </span>
    </div>
  )
}

function VariantRow({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-start gap-4">{children}</div>
}

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
  scale = 0.92,
}: {
  size?: ModalSurfaceSizeId
  footerVariant?: ModalFooterVariantId
  bodyTone?: ModalBodyToneId
  showClose?: boolean
  scale?: number
}) {
  const scrim = getDialogScrimUiStyle("modal")
  const panel = getDialogPanelUiSurface("modal", size)
  const header = getDialogHeaderUiStyle("modal")
  const body = getDialogBodyUiStyle(bodyTone, "modal")
  const close = getDialogCloseButtonUiStyle()
  const copy = MODAL_UI_DEMO_COPY.modal
  const panelWidthPx = getDialogPreviewWidthPx(panel.maxWidthPx, scale)

  const scrimStyle: CSSProperties = {
    position: "relative",
    overflow: "hidden",
    borderRadius: scrim.borderRadiusPx,
    backgroundColor: scrim.backgroundColor,
    backdropFilter: scrim.backdropFilter,
    minHeight: scrim.minHeightPx,
    padding: scrim.paddingPx,
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
  }

  const panelStyle: CSSProperties = {
    width: "100%",
    maxWidth: panelWidthPx,
    backgroundColor: panel.backgroundColor,
    border: panel.border,
    boxShadow: panel.boxShadow,
    borderRadius: panel.borderRadiusPx,
    overflow: "hidden",
  }

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
    <div aria-hidden style={scrimStyle}>
      <div style={panelStyle}>
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
    </div>
  )
}

function HardcodedAlertPanel({
  variant,
  typedMatch = false,
}: {
  variant: AlertDialogVariantId
  typedMatch?: boolean
}) {
  const scrim = getDialogScrimUiStyle("alert")
  const panel = getDialogPanelUiSurface("alert")
  const actions = getAlertActionUiStyle(variant)
  const copy =
    variant === "confirm"
      ? MODAL_UI_DEMO_COPY.alert.confirm
      : variant === "destructive"
        ? MODAL_UI_DEMO_COPY.alert.destructive
        : MODAL_UI_DEMO_COPY.alert.typed

  const scrimStyle: CSSProperties = {
    position: "relative",
    overflow: "hidden",
    borderRadius: scrim.borderRadiusPx,
    backgroundColor: scrim.backgroundColor,
    backdropFilter: scrim.backdropFilter,
    minHeight: scrim.minHeightPx,
    padding: scrim.paddingPx,
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
  }

  const panelStyle: CSSProperties = {
    width: "100%",
    maxWidth: getDialogPreviewWidthPx(panel.maxWidthPx, 0.92),
    backgroundColor: panel.backgroundColor,
    border: panel.border,
    boxShadow: panel.boxShadow,
    borderRadius: panel.borderRadiusPx,
    overflow: "hidden",
  }

  const contentStyle = getAlertContentUiStyle()
  const footerStyle = getDialogFooterUiStyle("alert")

  return (
    <div aria-hidden style={scrimStyle}>
      <div style={panelStyle}>
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
    </div>
  )
}

function ModalSizeVariantsBlock() {
  return (
    <SpecBlock title="dialog.width · tamaños" hint="default · wide · two-column — shadow.overlay · radius.xxlarge.">
      <VariantRow>
        {MODAL_UI_SURFACE_SIZES.map((size) => (
          <VariantSpecCell key={size.id} label={size.token}>
            <HardcodedModalPanel size={size.id} footerVariant="dual" scale={size.id === "two-column" ? 0.55 : 0.82} />
          </VariantSpecCell>
        ))}
      </VariantRow>
    </SpecBlock>
  )
}

function ModalFooterVariantsBlock() {
  return (
    <SpecBlock title="dialog.footer · variantes" hint="none · single · dual · destructive-dual.">
      <VariantRow>
        {MODAL_UI_FOOTER_VARIANTS.map((variant) => (
          <VariantSpecCell key={variant.id} label={variant.token}>
            <HardcodedModalPanel footerVariant={variant.id} bodyTone="compact" scale={0.82} />
          </VariantSpecCell>
        ))}
      </VariantRow>
    </SpecBlock>
  )
}

function ModalBodyTonesBlock() {
  return (
    <SpecBlock title="dialog.body · tonos" hint="default sunken · compact · loading spinner.">
      <VariantRow>
        {MODAL_UI_BODY_TONES.map((tone) => (
          <VariantSpecCell key={tone.id} label={tone.token}>
            <HardcodedModalPanel
              footerVariant={tone.id === "loading" ? "none" : "dual"}
              bodyTone={tone.id}
              scale={0.82}
            />
          </VariantSpecCell>
        ))}
      </VariantRow>
    </SpecBlock>
  )
}

function AlertDialogVariantsBlock() {
  return (
    <SpecBlock title="dialog.alert · variantes" hint="confirm · destructive · typed-confirmation.">
      <VariantRow>
        {MODAL_UI_ALERT_VARIANTS.map((variant) => (
          <VariantSpecCell key={variant.id} label={variant.token}>
            <HardcodedAlertPanel
              variant={variant.id}
              typedMatch={variant.id === "typed-confirmation"}
            />
          </VariantSpecCell>
        ))}
        <VariantSpecCell label="alert.typed-confirmation · disabled">
          <HardcodedAlertPanel variant="typed-confirmation" typedMatch={false} />
        </VariantSpecCell>
      </VariantRow>
    </SpecBlock>
  )
}

export function ModalsUiHardcodedGallery() {
  return (
    <div className="space-y-10">
      <FoundationBrumaStage caption="panel-padding space.400 · font.heading.medium · color.border · elevation.shadow.overlay.">
        <div className="space-y-8">
          <SectionHeading
            title="Anatomía"
            description="Scrim sombra-950 · panel overlay · body sunken · footer dual — close space.400."
          />
          <HardcodedModalPanel size="default" footerVariant="dual" scale={1} />
        </div>
      </FoundationBrumaStage>

      <FoundationBrumaStage caption="dialog.modal · dialog.width · dialog.footer · panel-padding space.400.">
        <div className="space-y-8">
          <SectionHeading
            title="Modal"
            description="Tres anchos · cuatro footers · tres tonos de body — tokens elevation + border."
          />
          <ModalSizeVariantsBlock />
          <ModalFooterVariantsBlock />
          <ModalBodyTonesBlock />
        </div>
      </FoundationBrumaStage>

      <FoundationBrumaStage caption="dialog.alert · font.heading.small · status-danger solo en botón · justify-between.">
        <div className="space-y-8">
          <SectionHeading
            title="Alert dialog"
            description="Confirmación · destructivo · confirmación escrita — shell compacto sin body sunken."
          />
          <AlertDialogVariantsBlock />
        </div>
      </FoundationBrumaStage>
    </div>
  )
}
