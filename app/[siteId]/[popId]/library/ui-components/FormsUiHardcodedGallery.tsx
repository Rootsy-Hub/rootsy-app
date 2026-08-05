"use client"

import {
  FORM_UI_ASSIST_VARIANTS,
  FORM_UI_CONTROL_TYPOGRAPHY,
  FORM_UI_DEMO_COPY,
  FORM_UI_FIELD_STACK,
  FORM_UI_INTERACTION_STATES,
  FORM_UI_LABEL_STYLE,
  FORM_UI_CONTROL_TYPES,
  getCheckboxUiSurface,
  getFormAssistUiStyle,
  getFormControlSpec,
  getFormControlUiSurface,
  getAffixShellUiSurface,
  getAffixPrefixUiStyle,
  getDateControlUiSurface,
  getImageUploadUiSurface,
  getImageUploadThumbUiStyle,
  FORM_UI_IMAGE_UPLOAD_TITLE_STYLE,
  FORM_UI_IMAGE_UPLOAD_META_STYLE,
  getSwitchUiSurface,
  type FormAssistVariantId,
  type FormControlStateId,
  type FormImageUploadModeId,
  type FormImageUploadDisplayStateId,
} from "@/app/[siteId]/[popId]/library/ui-components/formsUiHardcodedSpec"
import { COLOR_TOKENS } from "@/app/[siteId]/[popId]/library/color/rootsyColorSystem"
import { FoundationBrumaStage } from "@/app/[siteId]/[popId]/library/libraryFoundationDocShared"
import type { CSSProperties, ReactNode } from "react"

const STATE_ORDER = FORM_UI_INTERACTION_STATES

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

function StateSpecCell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-[11rem] flex-col gap-1.5">
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

function StateRow({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-start gap-3">{children}</div>
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span aria-hidden style={FORM_UI_LABEL_STYLE}>
      {children}
    </span>
  )
}

function FieldAssist({ variant, children }: { variant: FormAssistVariantId; children: ReactNode }) {
  return (
    <span aria-hidden style={getFormAssistUiStyle(variant)}>
      {children}
    </span>
  )
}

function HardcodedTextInput({
  state = "default",
  value,
  placeholder,
}: {
  state?: FormControlStateId
  value?: string
  placeholder?: string
}) {
  const spec = getFormControlSpec("text")
  const surface = getFormControlUiSurface(state)

  const style: CSSProperties = {
    ...FORM_UI_CONTROL_TYPOGRAPHY,
    display: "flex",
    alignItems: "center",
    width: "100%",
    height: spec.heightPx,
    paddingLeft: spec.paddingXPx,
    paddingRight: spec.paddingXPx,
    borderRadius: spec.radiusPx,
    backgroundColor: surface.backgroundColor,
    color: value ? surface.color : surface.placeholderColor,
    border: surface.border,
    boxShadow: surface.boxShadow,
    opacity: surface.opacity,
    userSelect: "none",
  }

  return <div aria-hidden style={style}>{value ?? placeholder}</div>
}

function HardcodedTextarea({
  state = "default",
  value,
  placeholder,
}: {
  state?: FormControlStateId
  value?: string
  placeholder?: string
}) {
  const spec = getFormControlSpec("textarea")
  const surface = getFormControlUiSurface(state)

  const style: CSSProperties = {
    ...FORM_UI_CONTROL_TYPOGRAPHY,
    display: "flex",
    alignItems: "flex-start",
    width: "100%",
    minHeight: spec.minHeightPx,
    padding: `${spec.paddingYPx}px ${spec.paddingXPx}px`,
    borderRadius: spec.radiusPx,
    backgroundColor: surface.backgroundColor,
    color: value ? surface.color : surface.placeholderColor,
    border: surface.border,
    boxShadow: surface.boxShadow,
    opacity: surface.opacity,
    userSelect: "none",
  }

  return <div aria-hidden style={style}>{value ?? placeholder}</div>
}

function HardcodedSelect({
  state = "default",
  value,
  placeholder,
}: {
  state?: FormControlStateId
  value?: string
  placeholder?: string
}) {
  const spec = getFormControlSpec("select")
  const surface = getFormControlUiSurface(state)

  const style: CSSProperties = {
    ...FORM_UI_CONTROL_TYPOGRAPHY,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    height: spec.heightPx,
    paddingLeft: spec.paddingXPx,
    paddingRight: spec.paddingXPx,
    borderRadius: spec.radiusPx,
    backgroundColor: surface.backgroundColor,
    color: value ? surface.color : surface.placeholderColor,
    border: surface.border,
    boxShadow: surface.boxShadow,
    opacity: surface.opacity,
    userSelect: "none",
  }

  return (
    <div aria-hidden style={style}>
      <span>{value ?? placeholder}</span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  )
}

function HardcodedCheckbox({
  state = "default",
  checked = false,
}: {
  state?: FormControlStateId
  checked?: boolean
}) {
  const spec = getFormControlSpec("checkbox")
  const surface = getCheckboxUiSurface(checked, state)

  const style: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: spec.sizePx,
    height: spec.sizePx,
    borderRadius: spec.radiusPx,
    backgroundColor: surface.backgroundColor,
    border: surface.border,
    boxShadow: surface.boxShadow,
    opacity: surface.opacity,
    color: surface.color,
    flexShrink: 0,
  }

  return (
    <div aria-hidden style={style}>
      {checked ? (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      ) : null}
    </div>
  )
}

function HardcodedSwitch({
  state = "default",
  on = false,
}: {
  state?: FormControlStateId
  on?: boolean
}) {
  const spec = getFormControlSpec("switch")
  const surface = getSwitchUiSurface(on, state)

  const trackStyle: CSSProperties = {
    position: "relative",
    width: spec.widthPx,
    height: spec.heightPx,
    borderRadius: 9999,
    backgroundColor: surface.trackColor,
    boxShadow: surface.boxShadow,
    opacity: surface.opacity,
    flexShrink: 0,
  }

  const thumbStyle: CSSProperties = {
    position: "absolute",
    top: 2,
    left: on ? spec.widthPx - spec.thumbPx - 2 : 2,
    width: spec.thumbPx,
    height: spec.thumbPx,
    borderRadius: 9999,
    backgroundColor: surface.thumbColor,
    boxShadow: "0 1px 2px rgb(0 0 0 / 0.12)",
  }

  return (
    <div aria-hidden style={trackStyle}>
      <div style={thumbStyle} />
    </div>
  )
}

function CalendarIconGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}

function ImageIconGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  )
}

function HardcodedAffixField({
  state = "default",
  prefix,
  value,
  placeholder,
  numeric = false,
}: {
  state?: FormControlStateId
  prefix: ReactNode
  value?: string
  placeholder?: string
  numeric?: boolean
}) {
  const spec = getFormControlSpec("prefix-money")
  const shell = getAffixShellUiSurface(state)
  const prefixStyle = getAffixPrefixUiStyle(state)

  const shellStyle: CSSProperties = {
    display: "flex",
    alignItems: "stretch",
    width: "100%",
    height: spec.heightPx,
    overflow: "hidden",
    borderRadius: spec.radiusPx,
    backgroundColor: shell.backgroundColor,
    border: shell.border,
    boxShadow: shell.boxShadow,
    opacity: shell.opacity,
    userSelect: "none",
  }

  const slotStyle: CSSProperties = {
    ...prefixStyle,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: spec.prefixWidthPx,
    flexShrink: 0,
    fontVariantNumeric: numeric ? "tabular-nums" : undefined,
  }

  const inputStyle: CSSProperties = {
    ...FORM_UI_CONTROL_TYPOGRAPHY,
    display: "flex",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
    paddingLeft: spec.inputPaddingXPx,
    paddingRight: spec.inputPaddingXPx,
    color: value ? shell.color : shell.placeholderColor,
    fontVariantNumeric: numeric ? "tabular-nums" : undefined,
    backgroundColor: state === "readonly" ? shell.backgroundColor : "transparent",
  }

  return (
    <div aria-hidden style={shellStyle}>
      <span style={slotStyle}>{prefix}</span>
      <span style={inputStyle}>{value ?? placeholder}</span>
    </div>
  )
}

function HardcodedDateField({
  state = "default",
  withPrefix = false,
  value,
  placeholder,
}: {
  state?: FormControlStateId
  withPrefix?: boolean
  value?: string
  placeholder?: string
}) {
  if (withPrefix) {
    return (
      <HardcodedAffixField
        state={state}
        prefix={<CalendarIconGlyph />}
        value={value}
        placeholder={placeholder}
      />
    )
  }

  const spec = getFormControlSpec("date")
  const surface = getDateControlUiSurface(state)

  const style: CSSProperties = {
    ...FORM_UI_CONTROL_TYPOGRAPHY,
    display: "flex",
    alignItems: "center",
    width: "100%",
    height: spec.heightPx,
    paddingLeft: spec.paddingXPx,
    paddingRight: spec.paddingXPx,
    borderRadius: spec.radiusPx,
    backgroundColor: surface.backgroundColor,
    color: value ? surface.color : surface.placeholderColor,
    border: surface.border,
    boxShadow: surface.boxShadow,
    opacity: surface.opacity,
    userSelect: "none",
  }

  return <div aria-hidden style={style}>{value ?? placeholder}</div>
}

function HardcodedImageUpload({
  mode,
  state = "default",
}: {
  mode: FormImageUploadModeId
  state?: FormImageUploadDisplayStateId
}) {
  const spec = getFormControlSpec("image-upload")
  const shell = getImageUploadUiSurface(mode, state)
  const thumb = getImageUploadThumbUiStyle(mode, state)
  const copy = FORM_UI_DEMO_COPY.imageUpload

  const shellStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    width: "100%",
    gap: spec.gapPx,
    padding: spec.shellPaddingPx,
    borderRadius: spec.radiusPx,
    backgroundColor: shell.backgroundColor,
    border: shell.border,
    borderStyle: shell.borderStyle,
    boxShadow: shell.boxShadow,
    opacity: shell.opacity,
    userSelect: "none",
  }

  const thumbStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: spec.thumbPx,
    height: spec.thumbPx,
    flexShrink: 0,
    borderRadius: 8,
    backgroundColor: thumb.backgroundColor,
    border: thumb.border,
    borderStyle: thumb.borderStyle,
    opacity: thumb.opacity,
    color: COLOR_TOKENS.bruma500,
    overflow: "hidden",
  }

  return (
    <div aria-hidden style={shellStyle}>
      <div style={thumbStyle}>
        {mode === "filled" ? (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: `linear-gradient(135deg, ${COLOR_TOKENS.bruma200} 0%, ${COLOR_TOKENS.bruma100} 100%)`,
            }}
          />
        ) : (
          <ImageIconGlyph />
        )}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <p
          style={{
            ...FORM_UI_IMAGE_UPLOAD_TITLE_STYLE,
            color: COLOR_TOKENS.bruma900,
            margin: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {mode === "empty" ? copy.emptyTitle : copy.filledTitle}
        </p>
        <p
          style={{
            ...FORM_UI_IMAGE_UPLOAD_META_STYLE,
            margin: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {mode === "empty" ? copy.emptySubtitle : copy.filledMeta}
        </p>
      </div>
    </div>
  )
}

function FieldStack({
  label,
  assist,
  assistVariant = "hint",
  children,
}: {
  label: string
  assist?: string
  assistVariant?: FormAssistVariantId
  children: ReactNode
}) {
  return (
    <div
      className="flex w-full min-w-0 flex-col"
      style={{ gap: FORM_UI_FIELD_STACK.gapPx, maxWidth: 280 }}
    >
      <FieldLabel>{label}</FieldLabel>
      {children}
      {assist ? <FieldAssist variant={assistVariant}>{assist}</FieldAssist> : null}
    </div>
  )
}

function TextControlStatesBlock() {
  const meta = FORM_UI_CONTROL_TYPES.find((item) => item.id === "text")!

  return (
    <div className="space-y-4">
      <SpecBlock title={`${meta.token} · ${meta.label}`} hint={meta.usage}>
        <StateRow>
          {STATE_ORDER.map((state) => (
            <StateSpecCell key={state.id} label={state.label}>
              <FieldStack label={FORM_UI_DEMO_COPY.text.label}>
                <HardcodedTextInput
                  state={state.id}
                  value={state.id === "default" || state.id === "focus" ? FORM_UI_DEMO_COPY.text.value : undefined}
                  placeholder={FORM_UI_DEMO_COPY.text.placeholder}
                />
              </FieldStack>
            </StateSpecCell>
          ))}
        </StateRow>
      </SpecBlock>
    </div>
  )
}

function TextareaControlStatesBlock() {
  const meta = FORM_UI_CONTROL_TYPES.find((item) => item.id === "textarea")!

  return (
    <SpecBlock title={`${meta.token} · ${meta.label}`} hint={meta.usage}>
      <StateRow>
        {STATE_ORDER.map((state) => (
          <StateSpecCell key={state.id} label={state.label}>
            <FieldStack label={FORM_UI_DEMO_COPY.textarea.label}>
              <HardcodedTextarea
                state={state.id}
                value={state.id === "default" ? FORM_UI_DEMO_COPY.textarea.value : undefined}
                placeholder={FORM_UI_DEMO_COPY.textarea.placeholder}
              />
            </FieldStack>
          </StateSpecCell>
        ))}
      </StateRow>
    </SpecBlock>
  )
}

function SelectControlStatesBlock() {
  const meta = FORM_UI_CONTROL_TYPES.find((item) => item.id === "select")!

  return (
    <SpecBlock title={`${meta.token} · ${meta.label}`} hint={meta.usage}>
      <StateRow>
        {STATE_ORDER.map((state) => (
          <StateSpecCell key={state.id} label={state.label}>
            <FieldStack label={FORM_UI_DEMO_COPY.select.label}>
              <HardcodedSelect
                state={state.id}
                value={state.id === "default" ? FORM_UI_DEMO_COPY.select.value : undefined}
                placeholder={FORM_UI_DEMO_COPY.select.placeholder}
              />
            </FieldStack>
          </StateSpecCell>
        ))}
      </StateRow>
    </SpecBlock>
  )
}

function CheckboxControlStatesBlock() {
  const meta = FORM_UI_CONTROL_TYPES.find((item) => item.id === "checkbox")!

  return (
    <SpecBlock title={`${meta.token} · ${meta.label}`} hint={meta.usage}>
      <StateRow>
        {STATE_ORDER.map((state) => (
          <StateSpecCell key={state.id} label={state.label}>
            <div className="flex items-center gap-2" style={{ maxWidth: 280 }}>
              <HardcodedCheckbox state={state.id} checked={state.id !== "disabled"} />
              <span style={{ ...FORM_UI_CONTROL_TYPOGRAPHY, color: COLOR_TOKENS.bruma900 }}>
                {FORM_UI_DEMO_COPY.checkbox.label}
              </span>
            </div>
          </StateSpecCell>
        ))}
      </StateRow>
    </SpecBlock>
  )
}

function SwitchControlStatesBlock() {
  const meta = FORM_UI_CONTROL_TYPES.find((item) => item.id === "switch")!

  return (
    <SpecBlock title={`${meta.token} · ${meta.label}`} hint={meta.usage}>
      <StateRow>
        {STATE_ORDER.map((state) => (
          <StateSpecCell key={state.id} label={state.label}>
            <div className="flex items-center gap-2" style={{ maxWidth: 280 }}>
              <HardcodedSwitch state={state.id} on={state.id !== "disabled"} />
              <span style={{ ...FORM_UI_CONTROL_TYPOGRAPHY, color: COLOR_TOKENS.bruma900 }}>
                {FORM_UI_DEMO_COPY.switch.label}
              </span>
            </div>
          </StateSpecCell>
        ))}
      </StateRow>
    </SpecBlock>
  )
}

function PrefixMoneyControlStatesBlock() {
  const meta = FORM_UI_CONTROL_TYPES.find((item) => item.id === "prefix-money")!

  return (
    <SpecBlock title={`${meta.token} · ${meta.label}`} hint={meta.usage}>
      <StateRow>
        {STATE_ORDER.map((state) => (
          <StateSpecCell key={state.id} label={state.label}>
            <FieldStack label={FORM_UI_DEMO_COPY.prefixMoney.label}>
              <HardcodedAffixField
                state={state.id}
                prefix={FORM_UI_DEMO_COPY.prefixMoney.prefix}
                value={state.id === "default" || state.id === "readonly" ? FORM_UI_DEMO_COPY.prefixMoney.value : undefined}
                placeholder="0"
                numeric
              />
            </FieldStack>
          </StateSpecCell>
        ))}
      </StateRow>
    </SpecBlock>
  )
}

function PrefixQuantityControlStatesBlock() {
  const meta = FORM_UI_CONTROL_TYPES.find((item) => item.id === "prefix-quantity")!

  return (
    <SpecBlock title={`${meta.token} · ${meta.label}`} hint={meta.usage}>
      <StateRow>
        {STATE_ORDER.map((state) => (
          <StateSpecCell key={state.id} label={state.label}>
            <FieldStack label={FORM_UI_DEMO_COPY.prefixQuantity.label}>
              <HardcodedAffixField
                state={state.id}
                prefix={FORM_UI_DEMO_COPY.prefixQuantity.prefix}
                value={state.id === "default" || state.id === "readonly" ? FORM_UI_DEMO_COPY.prefixQuantity.value : undefined}
                placeholder="0"
                numeric
              />
            </FieldStack>
          </StateSpecCell>
        ))}
      </StateRow>
    </SpecBlock>
  )
}

function DateControlStatesBlock() {
  const meta = FORM_UI_CONTROL_TYPES.find((item) => item.id === "date")!

  return (
    <SpecBlock title={`${meta.token} · ${meta.label}`} hint={meta.usage}>
      <StateRow>
        {STATE_ORDER.map((state) => (
          <StateSpecCell key={state.id} label={state.label}>
            <FieldStack label={FORM_UI_DEMO_COPY.date.label}>
              <HardcodedDateField
                state={state.id}
                value={state.id === "default" || state.id === "readonly" ? FORM_UI_DEMO_COPY.date.value : undefined}
                placeholder={FORM_UI_DEMO_COPY.date.placeholder}
              />
            </FieldStack>
          </StateSpecCell>
        ))}
      </StateRow>
    </SpecBlock>
  )
}

function DatePrefixControlStatesBlock() {
  const meta = FORM_UI_CONTROL_TYPES.find((item) => item.id === "date-prefix")!

  return (
    <SpecBlock title={`${meta.token} · ${meta.label}`} hint={meta.usage}>
      <StateRow>
        {STATE_ORDER.map((state) => (
          <StateSpecCell key={state.id} label={state.label}>
            <FieldStack label={FORM_UI_DEMO_COPY.datePrefix.label}>
              <HardcodedDateField
                state={state.id}
                withPrefix
                value={state.id === "default" || state.id === "readonly" ? FORM_UI_DEMO_COPY.datePrefix.value : undefined}
                placeholder={FORM_UI_DEMO_COPY.datePrefix.placeholder}
              />
            </FieldStack>
          </StateSpecCell>
        ))}
      </StateRow>
    </SpecBlock>
  )
}

const IMAGE_UPLOAD_EMPTY_STATES: FormImageUploadDisplayStateId[] = [
  "default",
  "hover",
  "focus",
  "drag",
  "disabled",
  "error",
]

const IMAGE_UPLOAD_FILLED_STATES: FormImageUploadDisplayStateId[] = [
  "default",
  "hover",
  "focus",
  "disabled",
  "error",
]

function ImageUploadEmptyStatesBlock() {
  const meta = FORM_UI_CONTROL_TYPES.find((item) => item.id === "image-upload")!

  return (
    <SpecBlock title={`${meta.token} · empty`} hint="Borde dashed · hover bruma-50 · drag savia-600.">
      <StateRow>
        {IMAGE_UPLOAD_EMPTY_STATES.map((state) => (
          <StateSpecCell key={state} label={state}>
            <FieldStack label={FORM_UI_DEMO_COPY.imageUpload.label}>
              <HardcodedImageUpload mode="empty" state={state} />
            </FieldStack>
          </StateSpecCell>
        ))}
      </StateRow>
    </SpecBlock>
  )
}

function ImageUploadFilledStatesBlock() {
  const meta = FORM_UI_CONTROL_TYPES.find((item) => item.id === "image-upload")!

  return (
    <SpecBlock title={`${meta.token} · filled`} hint="Miniatura 56px · borde sólido · metadata debajo del título.">
      <StateRow>
        {IMAGE_UPLOAD_FILLED_STATES.map((state) => (
          <StateSpecCell key={state} label={state}>
            <FieldStack label={FORM_UI_DEMO_COPY.imageUpload.label}>
              <HardcodedImageUpload mode="filled" state={state} />
            </FieldStack>
          </StateSpecCell>
        ))}
      </StateRow>
    </SpecBlock>
  )
}

export function FormsUiHardcodedGallery() {
  return (
    <div className="space-y-10">
      <FoundationBrumaStage caption="ROOTSY_FORM_FIELD_STACK · space.100 · label + control + assist.">
        <div className="space-y-8">
          <SectionHeading
            title="Anatomía de campo"
            description="Stack completo — hint neutral y variante error."
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <FieldStack label={FORM_UI_DEMO_COPY.text.label} assist={FORM_UI_DEMO_COPY.hint}>
              <HardcodedTextInput value={FORM_UI_DEMO_COPY.text.value} />
            </FieldStack>
            <FieldStack
              label={FORM_UI_DEMO_COPY.text.label}
              assist={FORM_UI_DEMO_COPY.error}
              assistVariant="error"
            >
              <HardcodedTextInput state="error" placeholder={FORM_UI_DEMO_COPY.text.placeholder} />
            </FieldStack>
          </div>

          <SpecBlock title="form.field.assist · variantes">
            <div className="flex flex-wrap gap-4">
              {FORM_UI_ASSIST_VARIANTS.map((variant) => (
                <FieldAssist key={variant.id} variant={variant.id}>
                  {variant.id === "hint"
                    ? FORM_UI_DEMO_COPY.hint
                    : variant.id === "error"
                      ? FORM_UI_DEMO_COPY.error
                      : variant.id === "warning"
                        ? "Revisá el valor antes de guardar."
                        : "Campo validado correctamente."}
                </FieldAssist>
              ))}
            </div>
          </SpecBlock>
        </div>
      </FoundationBrumaStage>

      <FoundationBrumaStage caption="ROOTSY_FORM_COLOR_TOKENS · border.form · radius.large · estados completos.">
        <div className="space-y-8">
          <SectionHeading
            title="Controles"
            description="Cinco tipos · seis estados — default · hover · focus · disabled · error · readonly."
          />

          <TextControlStatesBlock />
          <TextareaControlStatesBlock />
          <SelectControlStatesBlock />
          <CheckboxControlStatesBlock />
          <SwitchControlStatesBlock />
        </div>
      </FoundationBrumaStage>

      <FoundationBrumaStage caption="form.control.prefix · form.control.date · form.control.image-upload · w-11 · focus-within savia.">
        <div className="space-y-8">
          <SectionHeading
            title="Prefijo · fecha · imagen"
            description="Shell affix w-11 · date trigger · carga compacta con miniatura 56px y drag savia."
          />

          <PrefixMoneyControlStatesBlock />
          <PrefixQuantityControlStatesBlock />
          <DateControlStatesBlock />
          <DatePrefixControlStatesBlock />
          <ImageUploadEmptyStatesBlock />
          <ImageUploadFilledStatesBlock />
        </div>
      </FoundationBrumaStage>
    </div>
  )
}
