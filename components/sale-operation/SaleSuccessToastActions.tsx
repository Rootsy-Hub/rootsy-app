"use client"

type Props = {
  onReprint: () => void
  onReview: () => void
}

export function SaleSuccessToastActions({ onReprint, onReview }: Props) {
  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <button
        type="button"
        className="font-canopy text-xs font-semibold text-[var(--rootsy-savia-700)]"
        onClick={onReprint}
      >
        Reimprimir
      </button>
      <button
        type="button"
        className="font-canopy text-xs font-medium text-[var(--rootsy-bruma-600)]"
        onClick={onReview}
      >
        Ver venta
      </button>
    </div>
  )
}
