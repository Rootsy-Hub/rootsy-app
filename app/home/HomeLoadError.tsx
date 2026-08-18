"use client"

export function HomeLoadError() {
  return (
    <p className="mt-8 text-sm text-amber-200/90">
      No pudimos cargar tus puntos de venta.{" "}
      <button
        type="button"
        className="font-semibold underline underline-offset-2 hover:text-white"
        onClick={() => window.location.reload()}
      >
        Reintentar
      </button>
    </p>
  )
}
