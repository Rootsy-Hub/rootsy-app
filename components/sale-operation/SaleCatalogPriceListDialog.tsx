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
import { Dialog } from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  priceListId: string
  priceLists: SaleCatalogPriceListOption[]
  onPriceListChange: (priceListId: string) => void
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
      <RootsDialogContent>
        <RootsDialogHeader
          open={open}
          title="Lista de precios"
          description={SALE_CATALOG_PRICE_LIST_HELP}
        />
        <RootsDialogBody>
          <Select value={priceListId} onValueChange={onPriceListChange}>
            <SelectTrigger aria-label="Lista de precios" className="w-full">
              <SelectValue placeholder="Principal" />
            </SelectTrigger>
            <SelectContent>
              {priceLists.map((list) => (
                <SelectItem key={list.id} value={list.id}>
                  {list.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </RootsDialogBody>
        <RootsDialogSingleActionFooter
          label="Listo"
          onAction={() => onOpenChange(false)}
        />
      </RootsDialogContent>
    </Dialog>
  )
}
