"use client"

import type { PurchaseCatalogArticleCost } from "@/app/[siteId]/[popId]/purchases/actions"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import { unitCostInSaleUom } from "@/lib/articleCosts"
import { labelUnitOfMeasure, shortUnitOfMeasure } from "@/lib/articleItemKind"
import { cn } from "@/lib/utils"
import { Dialog } from "@/components/ui/dialog"

const fmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  articleName: string
  saleUnitOfMeasure: string
  costs: PurchaseCatalogArticleCost[]
  onSelect: (cost: PurchaseCatalogArticleCost) => void
}

export function PurchaseArticleCostPickerDialog({
  open,
  onOpenChange,
  articleName,
  saleUnitOfMeasure,
  costs,
  onSelect,
}: Props) {
  const saleUomShort = shortUnitOfMeasure(saleUnitOfMeasure)
  const saleUomLabel = labelUnitOfMeasure(saleUnitOfMeasure)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent size="default">
        <RootsDialogHeader
          title={articleName}
          description="Elegí cómo vas a comprar este artículo."
        />
        <RootsDialogBody>
          {costs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Este artículo no tiene costos de compra configurados. Agregalos en
              Stock → editar artículo.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {costs.map((cost) => {
                const unitCost = unitCostInSaleUom(cost)
                return (
                  <li key={cost.id}>
                    <button
                      type="button"
                      className={cn(
                        "flex w-full flex-col gap-1 rounded-xl border border-border/70 bg-muted/10 px-3 py-3 text-left transition-colors",
                        "hover:border-emerald-300 hover:bg-emerald-50/50",
                      )}
                      onClick={() => {
                        onSelect(cost)
                        onOpenChange(false)
                      }}
                    >
                      <span className="text-sm font-semibold text-foreground">
                        {cost.costUnitLabel}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {fmt.format(cost.unitPrice)} / {cost.costUnitLabel} ·{" "}
                        {cost.saleUnitsPerCostUnit}{" "}
                        {saleUomShort || saleUomLabel}
                        {unitCost > 0
                          ? ` · ≈ ${fmt.format(unitCost)}/${saleUomShort || "u."}`
                          : null}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </RootsDialogBody>
      </RootsDialogContent>
    </Dialog>
  )
}
