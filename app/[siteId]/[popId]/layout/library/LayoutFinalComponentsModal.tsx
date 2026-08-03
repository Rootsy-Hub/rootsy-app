"use client"

import {
  articleDialogBodyClass,
  articleDialogFooterClass,
  articleDialogHeaderClass,
  articleDialogSurfaceClass,
} from "@/app/[siteId]/[popId]/articles/articleConstants"
import {
  RootsFormMoneyField,
  RootsFormQuantityField,
  RootsFormTextField,
  RootsFormTextareaField,
} from "@/components/rootsy-form"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useState } from "react"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LayoutFinalComponentsModal({ open, onOpenChange }: Props) {
  const [salePrice, setSalePrice] = useState("1.250,00")
  const [stockQty, setStockQty] = useState("12")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={articleDialogSurfaceClass}
        data-rootsy-light-shell="true"
        showCloseButton
      >
        <DialogHeader className={articleDialogHeaderClass}>
          <DialogTitle className="text-base font-semibold tracking-tight">
            Componentes finales
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            Piezas aprobadas para reutilizar en modales. Solo lo que aparece acá
            define la familia unificada.
          </DialogDescription>
        </DialogHeader>

        <div className={cn(articleDialogBodyClass, "space-y-8")}>
          <section className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Label</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Siempre via prop <span className="font-mono">label</span> en los
                componentes de formulario, renderizado con{" "}
                <span className="font-mono">CheckoutSectionLabel</span>.
              </p>
            </div>
            <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs text-muted-foreground">
              Fuente:{" "}
              <span className="font-mono text-foreground">
                components/rootsy-form/RootsFormField.tsx
              </span>
            </p>
          </section>

          <section className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Texto · una línea
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Light form con <span className="font-mono">rounded-lg</span> y
                foco verde Roots más marcado.
              </p>
            </div>

            <RootsFormTextField
              label="Nombre del artículo"
              id="final-demo-name"
              defaultValue="Cola 500 ml"
            />

            <RootsFormTextField
              label="Referencia interna"
              id="final-demo-ref"
              placeholder="SKU o código"
            />

            <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs text-muted-foreground">
              Fuente:{" "}
              <span className="font-mono text-foreground">
                components/rootsy-form/RootsFormTextField.tsx
              </span>
            </p>
          </section>

          <section className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Multilínea
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Misma familia que texto una línea, con altura mínima y{" "}
                <span className="font-mono">resize-y</span>.
              </p>
            </div>

            <RootsFormTextareaField
              label="Descripción"
              id="final-demo-description"
              defaultValue="Descripción del artículo para el catálogo."
              rows={4}
            />

            <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs text-muted-foreground">
              Fuente:{" "}
              <span className="font-mono text-foreground">
                components/rootsy-form/RootsFormTextareaField.tsx
              </span>
            </p>
          </section>

          <section className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Montos y cantidades
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Prefijo siempre a la izquierda ($, uds., ícono). Misma shell que
                texto una línea con <span className="font-mono">focus-within</span>.
              </p>
            </div>

            <RootsFormMoneyField
              label="Precio de venta"
              id="final-demo-sale-price"
              value={salePrice}
              onChange={setSalePrice}
            />

            <RootsFormQuantityField
              label="Stock inicial"
              id="final-demo-stock"
              value={stockQty}
              onChange={setStockQty}
            />

            <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs text-muted-foreground">
              Fuente:{" "}
              <span className="font-mono text-foreground">
                RootsFormMoneyField · RootsFormQuantityField · RootsFormPrefixedInput
              </span>
            </p>
          </section>
        </div>

        <DialogFooter className={articleDialogFooterClass}>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
