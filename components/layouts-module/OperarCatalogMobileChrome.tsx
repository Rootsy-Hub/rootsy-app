"use client"

import { SaleCatalogPriceListDialog } from "@/components/sale-operation/SaleCatalogPriceListDialog"
import type { SaleCatalogPriceListOption } from "@/components/sale-operation/saleCatalogPriceLists"
import type { DataWorkspaceHeaderMoreAction } from "@/components/layouts-module/ModuleWorkspaceHeader"
import { DollarSign } from "lucide-react"
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

type PriceListRegistration = {
  priceListId: string
  priceLists: SaleCatalogPriceListOption[]
  onChange: (priceListId: string) => void
  onOpen?: () => void
}

type OperarCatalogMobileChromeValue = {
  registerPriceList: (next: PriceListRegistration | null) => void
  moreActions: DataWorkspaceHeaderMoreAction[]
}

const OperarCatalogMobileChromeContext =
  createContext<OperarCatalogMobileChromeValue | null>(null)

export function OperarCatalogMobileChromeProvider({
  children,
}: {
  children: ReactNode
}) {
  const [registration, setRegistration] = useState<PriceListRegistration | null>(
    null,
  )
  const [open, setOpen] = useState(false)

  const registerPriceList = useCallback((next: PriceListRegistration | null) => {
    setRegistration(next)
  }, [])

  const moreActions = useMemo<DataWorkspaceHeaderMoreAction[]>(
    () =>
      registration
        ? [
            {
              label: "Listas de precios",
              icon: DollarSign,
              onClick: () => {
                registration.onOpen?.()
                setOpen(true)
              },
            },
          ]
        : [],
    [registration],
  )

  return (
    <OperarCatalogMobileChromeContext.Provider
      value={{ registerPriceList, moreActions }}
    >
      {children}
      {registration ? (
        <SaleCatalogPriceListDialog
          open={open}
          onOpenChange={setOpen}
          priceListId={registration.priceListId}
          priceLists={registration.priceLists}
          onPriceListChange={registration.onChange}
        />
      ) : null}
    </OperarCatalogMobileChromeContext.Provider>
  )
}

export function useOperarCatalogMobileChrome() {
  return useContext(OperarCatalogMobileChromeContext)
}
