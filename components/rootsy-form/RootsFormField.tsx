"use client"

import { RootsFormFieldMessage } from "@/components/rootsy-form/RootsFormFieldMessage"
import { RootsFormLabelInfo } from "@/components/rootsy-form/RootsFormLabelInfo"
import {
  resolveRootsFormFieldMessage,
  type RootsFormFieldAssistProps,
} from "@/components/rootsy-form/rootsFormFieldAssist"
import { RootsFormFieldContext } from "@/components/rootsy-form/rootsFormFieldContext"
import {
  getFormFieldStackStyle,
  getFormLabelUiStyle,
} from "@/components/rootsy-form/rootsFormSpecRuntime"
import { useAmbientRootsFormTone } from "@/components/rootsy-form/rootsFormToneContext"
import { cn } from "@/lib/utils"
import { useId, type CSSProperties, type ReactNode } from "react"
import type { RootsFormTone } from "@/app/library/ui-components/formsUiHardcodedSpec"

type Props = {
  label: string
  htmlFor?: string
  children: ReactNode
  className?: string
  style?: CSSProperties
  tone?: RootsFormTone
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
  tone,
}: Props) {
  const messageId = useId()
  const message = resolveRootsFormFieldMessage({ hint, error, warning, success })
  const isInvalid = invalid ?? Boolean(error)
  const inheritedTone = useAmbientRootsFormTone()
  const resolvedTone = tone ?? inheritedTone
  const labelStyle = getFormLabelUiStyle({ tone: resolvedTone })

  const labelNode = (
    <>
      {label}
      {labelInfo ? (
        <RootsFormLabelInfo
          content={labelInfo}
          tone={resolvedTone}
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
        tone: resolvedTone,
      }}
    >
      <div className={cn(className)} style={{ ...getFormFieldStackStyle(), ...style }}>
        {htmlFor ? (
          <label
            htmlFor={htmlFor}
            className="inline-flex items-center gap-1.5"
            style={labelStyle}
          >
            {labelNode}
          </label>
        ) : (
          <span
            className="inline-flex items-center gap-1.5"
            style={labelStyle}
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
