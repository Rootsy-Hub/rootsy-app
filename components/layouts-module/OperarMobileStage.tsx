"use client"

import {
  layoutsOperarCatalogToolbarControlFocusClass,
  layoutsOperarCatalogToolbarControlShellClass,
  layoutsOperarCatalogToolbarIconMutedClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"

export type OperarMobileStageId = "home" | "ticket" | "catalog"

export type OperarMobileCategoryPicker = {
  label: string
  open: boolean
  setOpen: (open: boolean) => void
}

type OperarMobileStageValue = {
  stage: OperarMobileStageId
  setStage: (stage: OperarMobileStageId) => void
  homeLabel: string | null
  setHomeLabel: (label: string | null) => void
  catalogDisabled: boolean
  setCatalogDisabled: (disabled: boolean) => void
  categoryPicker: OperarMobileCategoryPicker | null
  registerCategoryPicker: (next: OperarMobileCategoryPicker | null) => void
}

const OperarMobileStageContext = createContext<OperarMobileStageValue | null>(
  null,
)

export function OperarMobileStageProvider({
  children,
}: {
  children: ReactNode
}) {
  const [stage, setStageState] = useState<OperarMobileStageId>("ticket")
  const [homeLabel, setHomeLabelState] = useState<string | null>(null)
  const [catalogDisabled, setCatalogDisabled] = useState(false)
  const [categoryPicker, setCategoryPicker] =
    useState<OperarMobileCategoryPicker | null>(null)
  const pickerSetOpenRef = useRef<((open: boolean) => void) | null>(null)
  const userSetStageRef = useRef(false)

  const registerCategoryPicker = useCallback(
    (next: OperarMobileCategoryPicker | null) => {
      pickerSetOpenRef.current = next?.setOpen ?? null
      setCategoryPicker(next)
    },
    [],
  )

  const setStage = useCallback((next: OperarMobileStageId) => {
    userSetStageRef.current = true
    setStageState(next)
    if (next !== "catalog") {
      pickerSetOpenRef.current?.(false)
    }
  }, [])

  const setHomeLabel = useCallback((label: string | null) => {
    setHomeLabelState(label)
    if (userSetStageRef.current) return
    setStageState(label ? "home" : "ticket")
  }, [])

  useEffect(() => {
    if (catalogDisabled && stage === "catalog") {
      setStage("ticket")
    }
  }, [catalogDisabled, stage, setStage])

  const value = useMemo<OperarMobileStageValue>(
    () => ({
      stage,
      setStage,
      homeLabel,
      setHomeLabel,
      catalogDisabled,
      setCatalogDisabled,
      categoryPicker,
      registerCategoryPicker,
    }),
    [
      stage,
      setStage,
      homeLabel,
      setHomeLabel,
      catalogDisabled,
      categoryPicker,
      registerCategoryPicker,
    ],
  )

  return (
    <OperarMobileStageContext.Provider value={value}>
      {children}
    </OperarMobileStageContext.Provider>
  )
}

export function useOperarMobileStage() {
  return useContext(OperarMobileStageContext)
}

export function useRegisterOperarMobileCategoryPicker(
  label: string,
  open: boolean,
  setOpen: (open: boolean) => void,
) {
  const stage = useOperarMobileStage()
  const register = stage?.registerCategoryPicker
  const setOpenRef = useRef(setOpen)
  setOpenRef.current = setOpen
  const openRef = useRef(open)
  openRef.current = open

  useEffect(() => {
    if (!register) return
    register({
      label,
      open: openRef.current,
      setOpen: (next) => setOpenRef.current(next),
    })
  }, [register, label, open])

  useEffect(() => {
    if (!register) return
    return () => register(null)
  }, [register])

  return Boolean(stage)
}

function OperarMobileStageButton({
  children,
  ariaLabel,
  disabled = false,
  onClick,
}: {
  children: ReactNode
  ariaLabel: string
  disabled?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={(event) => {
        onClick?.()
        event.currentTarget.blur()
      }}
      className={cn(
        layoutsOperarCatalogToolbarControlShellClass,
        layoutsOperarCatalogToolbarControlFocusClass,
        "inline-flex h-10 max-h-10 min-w-0 flex-1 items-center justify-center gap-1.5 px-3",
        "text-sm font-medium text-[var(--rootsy-sombra-300)]",
        "hover:!border-[var(--layouts-operar-border-dark-hairline)] hover:!bg-transparent",
        "focus:!border-[var(--layouts-operar-border-dark-hairline)] focus:!bg-transparent focus:!text-[var(--rootsy-sombra-300)]",
        "focus-visible:!border-[var(--layouts-operar-border-dark-hairline)] focus-visible:!bg-transparent focus-visible:!text-[var(--rootsy-sombra-300)]",
        "active:!bg-transparent",
        disabled && "pointer-events-none opacity-45",
      )}
    >
      {children}
    </button>
  )
}

export function OperarMobileStageBar() {
  const api = useOperarMobileStage()
  if (!api) return null

  const { stage, setStage, homeLabel, catalogDisabled, categoryPicker } = api
  const inCatalog = stage === "catalog"
  const inTicket = stage === "ticket"
  const inHome = stage === "home"
  const categoryOpen = Boolean(categoryPicker?.open)
  const leftIsCategory = inCatalog
  const showHomeOnLeft = Boolean(homeLabel) && !inCatalog
  const pedidoDisabled = inTicket

  return (
    <div
      className={cn(
        "flex min-w-0 shrink-0 items-center gap-2 px-4 py-2",
        "bg-[var(--rootsy-sombra-700)]",
        "border-b border-[var(--layouts-operar-border-dark-hairline)]",
      )}
      role="group"
      aria-label="Navegación de la operación"
    >
      {leftIsCategory ? (
        <OperarMobileStageButton
          ariaLabel={categoryPicker?.label || "Categoría"}
          onClick={() => categoryPicker?.setOpen(!categoryPicker.open)}
        >
          <span className="min-w-0 truncate">
            {categoryPicker?.label || "Categoría"}
          </span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 transition-transform duration-200",
              layoutsOperarCatalogToolbarIconMutedClass,
              categoryOpen && "rotate-180",
            )}
            aria-hidden
          />
        </OperarMobileStageButton>
      ) : showHomeOnLeft ? (
        <OperarMobileStageButton
          ariaLabel={homeLabel ?? "Mesas"}
          disabled={inHome}
          onClick={() => setStage("home")}
        >
          {homeLabel}
        </OperarMobileStageButton>
      ) : (
        <OperarMobileStageButton
          ariaLabel="Catálogo"
          disabled={catalogDisabled}
          onClick={() => setStage("catalog")}
        >
          Catálogo
        </OperarMobileStageButton>
      )}
      {inCatalog || !homeLabel ? (
        <OperarMobileStageButton
          ariaLabel="Pedido"
          disabled={pedidoDisabled}
          onClick={() => setStage("ticket")}
        >
          Pedido
        </OperarMobileStageButton>
      ) : (
        <OperarMobileStageButton
          ariaLabel="Catálogo"
          disabled={catalogDisabled}
          onClick={() => setStage("catalog")}
        >
          Catálogo
        </OperarMobileStageButton>
      )}
    </div>
  )
}
