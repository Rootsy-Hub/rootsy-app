"use client"

import {
  SALE_CATALOG_PRICE_LIST_HELP,
  type SaleCatalogPriceListOption,
} from "@/components/sale-operation/saleCatalogPriceLists"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogHeader,
  RootsDialogSingleActionFooter,
} from "@/components/rootsy-dialog"
import {
  RootsFormSelectContent,
  RootsFormSelectItem,
  RootsFormSelectTrigger,
  RootsFormSelectValue,
} from "@/components/rootsy-form"
import { Dialog } from "@/components/ui/dialog"
import { Select } from "@/components/ui/select"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  priceListId: string
  priceLists: SaleCatalogPriceListOption[]
  onPriceListChange: (priceListId: string) => void
}

function isSelectPortalEvent(event: { target: EventTarget | null }) {
  const target = event.target
  if (!(target instanceof Element)) return false
  return Boolean(
    target.closest(
      "[data-slot=select-content], [data-slot=roots-form-select-content], [data-radix-select-content]",
    ),
  )
}

export function SaleCatalogPriceListDialog({
  open,
  onOpenChange,
  priceListId,
  priceLists,
  onPriceListChange,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent
        onPointerDownOutside={(event) => {
          if (isSelectPortalEvent(event)) event.preventDefault()
        }}
        onInteractOutside={(event) => {
          if (isSelectPortalEvent(event)) event.preventDefault()
        }}
        onFocusOutside={(event) => {
          if (isSelectPortalEvent(event)) event.preventDefault()
        }}
      >
        <RootsDialogHeader
          open={open}
          title="Lista de precios"
          description={SALE_CATALOG_PRICE_LIST_HELP}
        />
        <RootsDialogBody>
          <div
            onPointerDown={(event) => event.stopPropagation()}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <Select
              modal={false}
              value={priceListId}
              onValueChange={onPriceListChange}
            >
              <RootsFormSelectTrigger
                aria-label="Lista de precios"
                className="w-full"
              >
                <RootsFormSelectValue placeholder="Principal" />
              </RootsFormSelectTrigger>
              <RootsFormSelectContent className="z-[540] pointer-events-auto">
                {priceLists.map((list) => (
                  <RootsFormSelectItem key={list.id} value={list.id}>
                    {list.label}
                  </RootsFormSelectItem>
                ))}
              </RootsFormSelectContent>
            </Select>
          </div>
        </RootsDialogBody>
        <RootsDialogSingleActionFooter
          label="Listo"
          onAction={() => onOpenChange(false)}
        />
      </RootsDialogContent>
    </Dialog>
  )
}
