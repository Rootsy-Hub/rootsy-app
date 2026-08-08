"use client"

import { cn } from "@/lib/utils"
import { LayoutGrid, PackageSearch } from "lucide-react"

export function MesasCatalogPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col items-center justify-center gap-4 p-8 text-center",
        className,
      )}
    >
      <div className="flex size-16 items-center justify-center rounded-2xl bg-white/5 text-emerald-300/80 ring-1 ring-white/10">
        <LayoutGrid className="size-8" aria-hidden />
      </div>
      <div>
        <p className="text-sm font-semibold text-white/90">Catálogo de productos</p>
        <p className="mt-1 max-w-sm text-xs leading-relaxed text-white/45">
          Acá irá el catálogo de ventas (categorías y productos) cuando tomes
          pedido en una mesa abierta. Reutilizaremos la UI de Vender.
        </p>
      </div>
    </div>
  )
}

export function MesasCartPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col items-center justify-center gap-4 p-8 text-center",
        className,
      )}
    >
      <div className="flex size-16 items-center justify-center rounded-2xl bg-slate-200/80 text-slate-500">
        <PackageSearch className="size-8" aria-hidden />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-700">Pedido de la mesa</p>
        <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
          El resumen del pedido aparecerá acá al tomar pedido. Por ahora es un
          placeholder hasta conectar con el carrito de ventas.
        </p>
      </div>
    </div>
  )
}
