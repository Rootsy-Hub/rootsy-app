"use client"

import { RecipeUpsertFormFields } from "@/app/[siteId]/[popId]/recipes/RecipeUpsertFormFields"
import type { RecipeFormState } from "@/app/[siteId]/[popId]/recipes/recipeFormState"
import type { RecipeCategoryOption } from "@/app/[siteId]/[popId]/recipes/actions"
import type { SalePriceList } from "@/lib/salePriceLists"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogDualActionFooter,
  RootsDialogErrorBanner,
  RootsDialogForm,
  RootsDialogHeader,
  RootsDialogLoadingState,
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

type FormFieldsProps = {
  idPrefix: string
  siteId: string
  popId: string
  form: RecipeFormState
  setForm: Dispatch<SetStateAction<RecipeFormState>>
  categories: RecipeCategoryOption[]
  categoriesLoading?: boolean
  priceLists?: SalePriceList[]
  priceListsLoading?: boolean
  disabled?: boolean
}

type Props = FormFieldsProps & {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  title: string
  description: string
  loading?: boolean
  refreshing?: boolean
  saving?: boolean
  banner?: string | null
  onSubmit: FormEventHandler<HTMLFormElement>
  onCancel: () => void
  onAfterClose?: () => void
}

export function RecipeUpsertDialog({
  open,
  onOpenChange,
  mode,
  title,
  description,
  loading = false,
  refreshing = false,
  saving = false,
  banner,
  onSubmit,
  onCancel,
  onAfterClose,
  ...formProps
}: Props) {
  const confirmLabel = mode === "create" ? "Crear receta" : "Guardar cambios"
  const confirmLoadingLabel = mode === "create" ? "Creando…" : "Guardando…"
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
      <RootsDialogContent size="twoCol">
        <RootsDialogHeader title={title} description={description} />
        {refreshing ? (
          <div
            className="h-0.5 w-full overflow-hidden bg-[color:var(--rootsy-bruma-200)]"
            aria-hidden
          >
            <div className="h-full w-1/3 animate-pulse bg-[color:var(--rootsy-savia-500)]/50" />
          </div>
        ) : null}
        {loading ? (
          <RootsDialogBody>
            <RootsDialogLoadingState message="Cargando receta…" />
          </RootsDialogBody>
        ) : (
          <RootsDialogForm onSubmit={onSubmit}>
            <RootsDialogBody>
              {banner ? (
                <RootsDialogErrorBanner>{banner}</RootsDialogErrorBanner>
              ) : null}
              <RecipeUpsertFormFields {...formProps} />
            </RootsDialogBody>
            <RootsDialogDualActionFooter
              onCancel={onCancel}
              confirmLabel={confirmLabel}
              confirmLoadingLabel={confirmLoadingLabel}
              confirmType="submit"
              confirmDisabled={saving || refreshing}
              confirmLoading={saving}
            />
          </RootsDialogForm>
        )}
      </RootsDialogContent>
    </Dialog>
  )
}
