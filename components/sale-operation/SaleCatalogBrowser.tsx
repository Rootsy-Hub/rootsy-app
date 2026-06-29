"use client"

import type { SaleCatalogCategory } from "@/app/[siteId]/[popId]/sale/actions"
import type { SaleCatalogProduct } from "@/components/sale-operation/saleCatalogProduct"
import { saleOpFmt, saleOpImporteBaseClass } from "@/components/sale-operation/saleOperationStyles"
import { useDataWorkspaceSidebar } from "@/components/layouts/useDataWorkspaceSidebar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  readSavedSaleCatalogView,
  writeSavedSaleCatalogView,
  type SaleCatalogViewPersisted,
} from "@/lib/saleCatalogPreference"
import { cn } from "@/lib/utils"
import {
  LayoutGrid,
  Percent,
  Plus,
  Rows3,
  Search,
  Tag,
} from "lucide-react"
import Image from "next/image"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

const CATEGORIA_TODOS = "Todos"

const importeCardClass = cn(
  saleOpImporteBaseClass,
  "block text-[clamp(1.05rem,1.65vw,1.3125rem)] leading-none font-semibold text-white/90",
)

function IconoLimpiarBusqueda({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("size-[14px] shrink-0", className)}
      aria-hidden
    >
      <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  )
}

type Props = {
  siteId: string
  popId: string
  categories: SaleCatalogCategory[]
  products: SaleCatalogProduct[]
  loading: boolean
  error: string | null
  onAddProduct: (productId: string) => void
  addDisabled?: boolean
  /** Control externo del panel de categorías (p. ej. botón del header). */
  catalogSidebarOpen?: boolean
}

export function SaleCatalogBrowser({
  siteId,
  popId,
  categories,
  products,
  loading,
  error,
  onAddProduct,
  addDisabled = false,
  catalogSidebarOpen: catalogSidebarOpenProp,
}: Props) {
  const internalSidebar = useDataWorkspaceSidebar(
    siteId,
    popId,
    catalogSidebarOpenProp === undefined,
  )
  const sidebarOpen = catalogSidebarOpenProp ?? internalSidebar.open

  const [vistaCatalogo, setVistaCatalogo] = useState<SaleCatalogViewPersisted>(() => {
    return (
      readSavedSaleCatalogView(popId) ?? {
        modo: "categoria",
        categoria: CATEGORIA_TODOS,
      }
    )
  })
  const [modoVista, setModoVista] = useState<"grid" | "lista">("grid")
  const [busqueda, setBusqueda] = useState("")
  const busquedaInputRef = useRef<HTMLInputElement>(null)
  const vistaAntesBusquedaRef = useRef<SaleCatalogViewPersisted | null>(null)
  const busquedaTrimPrevRef = useRef("")

  const persistVistaCatalogo = useCallback(
    (view: SaleCatalogViewPersisted) => {
      setVistaCatalogo(view)
      writeSavedSaleCatalogView(popId, view)
    },
    [popId],
  )

  const productosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    const hayBusqueda = q.length > 0
    return products.filter((p) => {
      const matchVista = hayBusqueda
        ? true
        : vistaCatalogo.modo === "categoria"
          ? vistaCatalogo.categoria === CATEGORIA_TODOS ||
            p.categoria === vistaCatalogo.categoria
          : vistaCatalogo.modo === "promociones"
            ? Boolean(p.promo?.trim())
            : p.precioOriginal != null && p.precioOriginal > p.precio
      const matchQ =
        !q ||
        p.nombre.toLowerCase().includes(q) ||
        p.descripcion.toLowerCase().includes(q)
      return matchVista && matchQ
    })
  }, [busqueda, vistaCatalogo, products])

  useEffect(() => {
    const trimmed = busqueda.trim()
    const prevTrimmed = busquedaTrimPrevRef.current
    const wasEmpty = prevTrimmed.length === 0
    const isEmpty = trimmed.length === 0

    if (!isEmpty && wasEmpty) {
      vistaAntesBusquedaRef.current = vistaCatalogo
    }

    if (isEmpty && !wasEmpty) {
      const saved = vistaAntesBusquedaRef.current
      if (saved != null) {
        setVistaCatalogo(saved)
        vistaAntesBusquedaRef.current = null
      }
    }

    if (!isEmpty) {
      setVistaCatalogo((prev) => {
        if (prev.modo === "categoria" && prev.categoria === CATEGORIA_TODOS) {
          return prev
        }
        return { modo: "categoria", categoria: CATEGORIA_TODOS }
      })
    }

    busquedaTrimPrevRef.current = trimmed
  }, [busqueda, vistaCatalogo])

  const sidebarNav = (
    <nav
      className="game-scroll flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-3 py-4"
      aria-label="Filtros del catálogo"
    >
      <div>
        <p className="mb-2.5 px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          Categorías
        </p>
        <ul className="flex flex-col gap-0.5 p-0" role="list">
          <li>
            <button
              type="button"
              onClick={() =>
                persistVistaCatalogo({
                  modo: "categoria",
                  categoria: CATEGORIA_TODOS,
                })
              }
              className={cn(
                "relative flex min-h-11 w-full items-center rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a2027]",
                vistaCatalogo.modo === "categoria" &&
                  vistaCatalogo.categoria === CATEGORIA_TODOS
                  ? "bg-white/10 text-white before:absolute before:top-1/2 before:left-0 before:h-5 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-emerald-400 before:content-['']"
                  : "text-slate-400 hover:bg-white/6 hover:text-slate-100",
              )}
            >
              {CATEGORIA_TODOS}
            </button>
          </li>
          {categories.map((cat) => {
            const seleccionado =
              vistaCatalogo.modo === "categoria" &&
              vistaCatalogo.categoria === cat.name
            return (
              <li key={cat.id}>
                <button
                  type="button"
                  onClick={() =>
                    persistVistaCatalogo({
                      modo: "categoria",
                      categoria: cat.name,
                    })
                  }
                  className={cn(
                    "relative flex min-h-11 w-full items-center rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a2027]",
                    seleccionado
                      ? "bg-white/10 text-white before:absolute before:top-1/2 before:left-0 before:h-5 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-emerald-400 before:content-['']"
                      : "text-slate-400 hover:bg-white/6 hover:text-slate-100",
                  )}
                >
                  {cat.name}
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <div>
        <p className="mb-2.5 px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          Listados rápidos
        </p>
        <ul className="flex flex-col gap-0.5 p-0" role="list">
          <li>
            <button
              type="button"
              aria-pressed={vistaCatalogo.modo === "promociones"}
              onClick={() => persistVistaCatalogo({ modo: "promociones" })}
              className={cn(
                "relative flex min-h-11 w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a2027]",
                vistaCatalogo.modo === "promociones"
                  ? "bg-emerald-500/12 text-emerald-100 before:absolute before:top-1/2 before:left-0 before:h-5 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-emerald-400 before:content-['']"
                  : "text-slate-400 hover:bg-white/6 hover:text-slate-100",
              )}
            >
              <Tag className="size-4 shrink-0 opacity-80" aria-hidden />
              Promociones
            </button>
          </li>
          <li>
            <button
              type="button"
              aria-pressed={vistaCatalogo.modo === "con_descuento"}
              onClick={() => persistVistaCatalogo({ modo: "con_descuento" })}
              className={cn(
                "relative flex min-h-11 w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a2027]",
                vistaCatalogo.modo === "con_descuento"
                  ? "bg-amber-500/12 text-amber-100 before:absolute before:top-1/2 before:left-0 before:h-5 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-amber-400 before:content-['']"
                  : "text-slate-400 hover:bg-white/6 hover:text-slate-100",
              )}
            >
              <Percent className="size-4 shrink-0 opacity-80" aria-hidden />
              Con descuento
            </button>
          </li>
        </ul>
      </div>
    </nav>
  )

  return (
    <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
      <aside
        id="data-workspace-sidebar"
        className={cn(
          "relative shrink-0 overflow-hidden border-r border-white/10 bg-[#1a2027] transition-[width,border-color] duration-300 ease-in-out motion-reduce:transition-none",
          sidebarOpen ? "w-[280px]" : "w-0 border-r-0",
        )}
        aria-hidden={!sidebarOpen}
        {...(!sidebarOpen ? { inert: true } : {})}
        aria-label="Filtros del catálogo"
      >
        <div className="flex h-full w-[280px] min-w-[280px] flex-col">
          {sidebarNav}
        </div>
      </aside>

      <section className="grid min-h-0 min-w-0 flex-1 grid-rows-[auto_minmax(0,1fr)] bg-[#20262e]">
        <div className="flex min-w-0 items-center gap-3 border-b border-white/10 px-4 py-3">
          <div className="relative flex h-10 shrink-0 items-center rounded-lg border border-white/12 bg-black/25 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_0_1px_rgba(16,185,129,0.06)]">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-1 left-1 w-10 rounded-md border border-emerald-300/35 bg-linear-to-b from-emerald-300/22 via-emerald-400/16 to-emerald-500/12 shadow-[0_0_18px_rgba(16,185,129,0.45),inset_0_1px_0_rgba(255,255,255,0.25)] transition-transform duration-300 ease-out"
              style={{
                transform:
                  modoVista === "lista" ? "translateX(2.5rem)" : "translateX(0)",
              }}
            />
            <button
              type="button"
              onClick={() => setModoVista("grid")}
              className={cn(
                "relative z-10 flex h-8 w-10 items-center justify-center rounded-md transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70",
                modoVista === "grid"
                  ? "text-white drop-shadow-[0_0_10px_rgba(110,231,183,0.6)]"
                  : "text-slate-300/80 hover:text-white/95",
              )}
              aria-label="Vista en grilla"
              aria-pressed={modoVista === "grid"}
            >
              <LayoutGrid className="size-4.5" />
            </button>
            <button
              type="button"
              onClick={() => setModoVista("lista")}
              className={cn(
                "relative z-10 flex h-8 w-10 items-center justify-center rounded-md transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70",
                modoVista === "lista"
                  ? "text-white drop-shadow-[0_0_10px_rgba(110,231,183,0.6)]"
                  : "text-slate-300/80 hover:text-white/95",
              )}
              aria-label="Vista en columna"
              aria-pressed={modoVista === "lista"}
            >
              <Rows3 className="size-4.5" />
            </button>
          </div>
          <div className="relative min-w-0 max-w-md flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/40" />
            <Input
              ref={busquedaInputRef}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar o escanear producto..."
              className={cn(
                "h-10 border-white/10 bg-black/20 pl-9 text-white placeholder:text-white/35",
                busqueda.length > 0 && "pr-9",
              )}
            />
            {busqueda.length > 0 ? (
              <button
                type="button"
                aria-label="Limpiar búsqueda"
                className="absolute top-1/2 right-1.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/[0.07] hover:text-white/90"
                onClick={() => {
                  setBusqueda("")
                  busquedaInputRef.current?.focus()
                }}
              >
                <IconoLimpiarBusqueda />
              </button>
            ) : null}
          </div>
          <span className="shrink-0 text-sm font-medium text-white/60">
            {productosFiltrados.length} productos mostrados
          </span>
        </div>

        <div
          className={cn(
            "min-h-0",
            loading && !error
              ? "flex flex-1 flex-col p-6"
              : error
                ? "flex flex-1 flex-col p-6"
                : productosFiltrados.length === 0
                  ? "relative overflow-hidden p-0"
                  : "game-scroll overflow-y-auto p-3",
          )}
        >
          {loading && !error ? (
            <div className="flex min-h-[200px] flex-1 items-center justify-center">
              <p className="text-sm text-slate-400">Cargando productos…</p>
            </div>
          ) : error ? (
            <div className="flex min-h-[200px] flex-1 flex-col items-center justify-center gap-2 text-center">
              <p className="max-w-md text-sm text-rose-300">{error}</p>
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div
              aria-live="polite"
              className="rootsy-hero-slide-in-right pointer-events-none absolute right-[-50px] bottom-[-25px] z-10"
            >
              <Image
                src="/empty-products-mascot.png"
                alt=""
                width={260}
                height={260}
                className="h-auto w-full max-w-[260px] object-contain opacity-95"
              />
            </div>
          ) : (
            <div
              className={
                modoVista === "grid"
                  ? "grid grid-cols-3 gap-3"
                  : "flex flex-col gap-2"
              }
            >
              {productosFiltrados.map((p) => {
                const descuentoPct =
                  p.precioOriginal != null && p.precioOriginal > p.precio
                    ? Math.round(
                        ((p.precioOriginal - p.precio) / p.precioOriginal) *
                          100,
                      )
                    : null
                const promoTrim = p.promo?.trim() ?? ""
                const mostrarBadgeOferta =
                  descuentoPct != null || promoTrim.length > 0

                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={addDisabled}
                    onClick={() => onAddProduct(p.id)}
                    className={cn(
                      "group relative w-full overflow-hidden rounded-2xl border border-white/10 bg-[#252b34] text-left",
                      "shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_0_0_1px_rgba(0,0,0,0.45),0_1px_2px_rgba(0,0,0,0.22),0_6px_16px_rgba(0,0,0,0.28),0_16px_40px_rgba(0,0,0,0.38)]",
                      "before:pointer-events-none before:absolute before:inset-y-4 before:left-0 before:z-10 before:w-0.5 before:rounded-full before:bg-emerald-400 before:opacity-0 before:transition-opacity before:duration-300 group-hover:before:opacity-90",
                      addDisabled && "cursor-not-allowed opacity-50",
                      modoVista === "lista"
                        ? "flex min-h-[152px] items-stretch"
                        : "grid h-[318px] grid-rows-[152px_1fr]",
                    )}
                  >
                    <div
                      className={cn(
                        "relative overflow-hidden bg-[#0f1416]",
                        modoVista === "grid"
                          ? "h-full w-full"
                          : "h-[152px] w-48 shrink-0",
                      )}
                    >
                      <Image
                        src={p.imagen}
                        alt={p.nombre}
                        fill
                        className="h-full w-full transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                        unoptimized
                        sizes={modoVista === "grid" ? "33vw" : "280px"}
                        style={{
                          objectFit: "cover",
                          objectPosition: "center",
                        }}
                      />
                      {mostrarBadgeOferta ? (
                        <div
                          className="pointer-events-none absolute inset-x-0 top-0 z-15 p-3"
                          aria-hidden
                        >
                          <Badge className="w-fit border border-emerald-400/40 bg-emerald-950/85 px-2 py-0.5 text-[10px] font-bold tracking-wider text-emerald-100 shadow-sm backdrop-blur-sm">
                            OFERTA
                          </Badge>
                        </div>
                      ) : null}
                      {!addDisabled ? (
                        <span
                          className="pointer-events-none absolute right-2 bottom-2 z-20 flex size-9 translate-y-1 scale-95 items-center justify-center rounded-full border border-emerald-300/45 bg-emerald-500 text-emerald-950 opacity-0 shadow-[0_4px_20px_rgba(16,185,129,0.5)] transition-[opacity,transform] duration-200 group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100"
                          aria-hidden
                        >
                          <Plus className="size-4.5" strokeWidth={2.5} />
                        </span>
                      ) : null}
                    </div>
                    <div
                      className={
                        modoVista === "grid"
                          ? "grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto] gap-2 p-5"
                          : "flex min-h-0 min-w-0 flex-1 flex-col justify-between gap-2 p-5"
                      }
                    >
                      <div className="min-h-0 self-start">
                        <h3 className="line-clamp-2 text-lg leading-tight font-bold text-foreground">
                          {p.nombre}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                          {p.descripcion}
                        </p>
                      </div>
                      <div className={modoVista === "grid" ? "self-end" : "shrink-0"}>
                        {p.precioOriginal != null &&
                        p.precioOriginal > p.precio ? (
                          <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span
                              className={cn(
                                saleOpImporteBaseClass,
                                "text-sm font-semibold text-muted-foreground line-through",
                              )}
                            >
                              {saleOpFmt.format(p.precioOriginal)}
                            </span>
                            {descuentoPct != null ? (
                              <span
                                className={cn(
                                  saleOpImporteBaseClass,
                                  "inline-flex h-6 items-center justify-center rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 text-[10px] leading-none font-bold tracking-wider text-emerald-200 uppercase",
                                )}
                              >
                                −{descuentoPct}%
                              </span>
                            ) : null}
                          </div>
                        ) : null}
                        <span className={importeCardClass}>
                          {saleOpFmt.format(p.precio)}
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
