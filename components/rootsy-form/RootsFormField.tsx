"use client"

import { CheckoutSectionLabel } from "@/components/checkout/CheckoutFormFields"
import { RootsFormFieldMessage } from "@/components/rootsy-form/RootsFormFieldMessage"
import {
  resolveRootsFormFieldMessage,
  type RootsFormFieldAssistProps,
} from "@/components/rootsy-form/rootsFormFieldAssist"
import { RootsFormFieldContext } from "@/components/rootsy-form/rootsFormFieldContext"
import { rootsFormFieldStackClass } from "@/components/rootsy-form/rootsFormStyles"
import { cn } from "@/lib/utils"
import { useId, type ReactNode } from "react"

type Props = {
  label: string
  htmlFor?: string
  children: ReactNode
  className?: string
} & RootsFormFieldAssistProps

export function RootsFormField({
  label,
  htmlFor,
  hint,
  error,
  warning,
  success,
  invalid,
  children,
  className,
}: Props) {
  const messageId = useId()
  const message = resolveRootsFormFieldMessage({ hint, error, warning, success })
  const isInvalid = invalid ?? Boolean(error)

  return (
    <RootsFormFieldContext.Provider
      value={{
        describedBy: message ? messageId : undefined,
        invalid: isInvalid || undefined,
      }}
    >
      <div className={cn(rootsFormFieldStackClass, className)}>
        <CheckoutSectionLabel htmlFor={htmlFor}>{label}</CheckoutSectionLabel>
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
