"use client"

import { CheckUpsertFormFields } from "@/app/[siteId]/[popId]/checks/CheckUpsertFormFields"
import type { CheckCreateFormState } from "@/app/[siteId]/[popId]/checks/checkFormState"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogDualActionFooter,
  RootsDialogErrorBanner,
  RootsDialogForm,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import { Dialog } from "@/components/ui/dialog"
import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type FormEventHandler,
  type SetStateAction,
} from "react"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  popId: string
  title: string
  description: string
  saving?: boolean
  banner?: string | null
  form: CheckCreateFormState
  setForm: Dispatch<SetStateAction<CheckCreateFormState>>
  onSubmit: FormEventHandler<HTMLFormElement>
  onCancel: () => void
  onAfterClose?: () => void
}

export function CheckUpsertDialog({
  open,
  onOpenChange,
  popId,
  title,
  description,
  saving = false,
  banner,
  form,
  setForm,
  onSubmit,
  onCancel,
  onAfterClose,
}: Props) {
  const wasOpenRef = useRef(false)
  const [mounted, setMounted] = useState(open)

  useEffect(() => {
    if (open) {
      wasOpenRef.current = true
      setMounted(true)
      return
    }
    if (!wasOpenRef.current) return
    const timer = window.setTimeout(() => {
      wasOpenRef.current = false
      setMounted(false)
      onAfterClose?.()
    }, 220)
    return () => window.clearTimeout(timer)
  }, [open, onAfterClose])

  if (!mounted) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent size="default" className="sm:max-w-lg">
        <RootsDialogHeader title={title} description={description} />
        <RootsDialogForm onSubmit={onSubmit}>
          <RootsDialogBody>
            {banner ? (
              <RootsDialogErrorBanner>{banner}</RootsDialogErrorBanner>
            ) : null}
            <CheckUpsertFormFields
              popId={popId}
              idPrefix="check-create"
              form={form}
              setForm={setForm}
            />
          </RootsDialogBody>
          <RootsDialogDualActionFooter
            onCancel={onCancel}
            confirmLabel="Guardar cheque"
            confirmLoadingLabel="Guardando…"
            confirmType="submit"
            confirmDisabled={saving}
            confirmLoading={saving}
          />
        </RootsDialogForm>
      </RootsDialogContent>
    </Dialog>
  )
}
