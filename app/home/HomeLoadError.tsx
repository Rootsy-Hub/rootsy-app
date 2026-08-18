"use client"

type HomeLoadErrorProps = {
  onRetry?: () => void | Promise<unknown>
}

export function HomeLoadError({ onRetry }: HomeLoadErrorProps) {
  return (
    <p className="mt-8 text-sm text-amber-200/90">
      No pudimos cargar tus puntos de venta.{" "}
      <button
        type="button"
        className="font-semibold underline underline-offset-2 hover:text-white"
        onClick={() => {
          if (onRetry) {
            void onRetry()
            return
          }
          window.location.reload()
        }}
      >
        Reintentar
      </button>
    </p>
  )
}
