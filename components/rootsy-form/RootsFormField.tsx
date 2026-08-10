"use client"

import { RootsFormFieldMessage } from "@/components/rootsy-form/RootsFormFieldMessage"
import { RootsFormLabelInfo } from "@/components/rootsy-form/RootsFormLabelInfo"
import {
  resolveRootsFormFieldMessage,
  type RootsFormFieldAssistProps,
} from "@/components/rootsy-form/rootsFormFieldAssist"
import { RootsFormFieldContext } from "@/components/rootsy-form/rootsFormFieldContext"
import {
  FORM_UI_LABEL_STYLE,
  getFormFieldStackStyle,
} from "@/components/rootsy-form/rootsFormSpecRuntime"
import { cn } from "@/lib/utils"
import { useId, type CSSProperties, type ReactNode } from "react"

type Props = {
  label: string
  htmlFor?: string
  children: ReactNode
  className?: string
  style?: CSSProperties
} & RootsFormFieldAssistProps

export function RootsFormField({
  label,
  htmlFor,
  labelInfo,
  hint,
  error,
  warning,
  success,
  invalid,
  children,
  className,
  style,
}: Props) {
  const messageId = useId()
  const message = resolveRootsFormFieldMessage({ hint, error, warning, success })
  const isInvalid = invalid ?? Boolean(error)

  const labelNode = (
    <>
      {label}
      {labelInfo ? (
        <RootsFormLabelInfo
          content={labelInfo}
          ariaLabel={`Información sobre ${label}`}
        />
      ) : null}
    </>
  )

  return (
    <RootsFormFieldContext.Provider
      value={{
        describedBy: message ? messageId : undefined,
        invalid: isInvalid || undefined,
      }}
    >
      <div className={cn(className)} style={{ ...getFormFieldStackStyle(), ...style }}>
        {htmlFor ? (
          <label
            htmlFor={htmlFor}
            className="inline-flex items-center gap-1.5"
            style={FORM_UI_LABEL_STYLE}
          >
            {labelNode}
          </label>
        ) : (
          <span
            className="inline-flex items-center gap-1.5"
            style={FORM_UI_LABEL_STYLE}
          >
            {labelNode}
          </span>
        )}
        {children}
        {message ? (
          <RootsFormFieldMessage id={messageId} variant={message.variant}>
            {message.content}
          </RootsFormFieldMessage>
        ) : null}
      </div>
    </RootsFormFieldContext.Provider>
  )
}
