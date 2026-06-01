"use client"

import {
  getOperationsSales,
  type OperationExpenseLedgerRow,
  type OperationSaleRow,
} from "@/app/[siteId]/[popId]/operations/actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAuth } from "@/context/AuthContextSupabase"
import withAuth from "@/hoc/withAuth"
import { popMenuHref } from "@/lib/popRoutes"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Leaf,
  Maximize2,
  Minimize2,
  Wifi,
  WifiOff,
} from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Fragment, useCallback, useEffect, useRef, useState } from "react"

const fmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

function formatDateTime(iso: string) {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d)
}

function formatQty(n: number) {
  const t = Math.round(n * 1e6) / 1e6
  if (Number.isInteger(t)) return String(t)
  return t.toLocaleString("es-AR", { maximumFractionDigits: 6 })
}

const STATUS_LABEL: Record<string, string> = {
  draft: "Borrador",
  completed: "Completada",
  cancelled: "Anulada",
}

function statusLabel(s: string) {
  return STATUS_LABEL[s] ?? s
}

function expenseLedgerKindLabel(row: OperationExpenseLedgerRow) {
  if (row.sourceType === "expense_void") return "Anulación gasto"
  return "Gasto"
}

function formatLedgerDate(d: string) {
  if (!d || d.length < 10) return "—"
  const y = Number(d.slice(0, 4))
  const m = Number(d.slice(5, 7))
  const day = Number(d.slice(8, 10))
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(day)) return "—"
  return new Date(y, m - 1, day).toLocaleDateString("es-AR")
}

function OperationsPage() {
  const router = useRouter()
  const routerRef = useRef(router)
  routerRef.current = router
  const params = useParams()
  const { user } = useAuth()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : undefined

  const [popName, setPopName] = useState("")
  const [sales, setSales] = useState<OperationSaleRow[]>([])
  const [expenseLedger, setExpenseLedger] = useState<OperationExpenseLedgerRow[]>(
    [],
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const load = useCallback(async () => {
    if (!popId || !siteId) return
    const res = await getOperationsSales(popId)
    if (!res.success) {
      setError(res.error || "Error")
      setSales([])
      setExpenseLedger(res.expenseLedger ?? [])
      setPopName(res.popName ?? "")
      if (res.redirect) {
        setTimeout(() => routerRef.current.push(res.redirect!), 1200)
      }
      return
    }
    setSales(res.sales)
    setExpenseLedger(res.expenseLedger)
    setPopName(res.popName)
    setError(null)
  }, [popId, siteId])

  useEffect(() => {
    if (!popId || !siteId) {
      setLoading(false)
      setError("Punto de venta no encontrado")
      return
    }
    let cancelled = false
    ;(async () => {
      setLoading(true)
      await load()
      if (!cancelled) setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [load, popId, siteId])

  const toggleFullscreen = useCallback(async () => {
    if (typeof document === "undefined") return
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
        setIsFullscreen(true)
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }
  }, [])

  useEffect(() => {
    const onFs = () =>
      setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener("fullscreenchange", onFs)
    return () => document.removeEventListener("fullscreenchange", onFs)
  }, [])

  useEffect(() => {
    setIsOnline(navigator.onLine)
    const up = () => setIsOnline(true)
    const down = () => setIsOnline(false)
    window.addEventListener("online", up)
    window.addEventListener("offline", down)
    return () => {
      window.removeEventListener("online", up)
      window.removeEventListener("offline", down)
    }
  }, [])

  const headerUserName =
    (typeof user?.user_metadata?.full_name === "string" &&
      user.user_metadata.full_name.trim()) ||
    user?.email?.split("@")[0] ||
    "Usuario"
  const userAvatarSrc =
    user?.user_metadata?.avatar_url ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.email || "u")}`

  const popLogoSrc = `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(popId || "pop")}&backgroundColor=e8f5ef`

  if (!popId || !siteId) {
    return (
      <div className="rootsy-app-light min-h-screen bg-background p-10 text-foreground">
        <p className="text-sm">Punto de venta no encontrado</p>
      </div>
    )
  }

  return (
    <div className="rootsy-app-light relative min-h-screen overflow-hidden bg-background text-foreground">
      <div
        className="pointer-events-none absolute inset-0 motion-reduce:opacity-50"
        aria-hidden
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.75_0.12_155/0.35),transparent),radial-gradient(ellipse_60%_40%_at_100%_50%,oklch(0.85_0.08_140/0.2),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(oklch(0.92_0.02_130/0.35)_1px,transparent_1px),linear-gradient(90deg,oklch(0.92_0.02_130/0.35)_1px,transparent_1px)] bg-size-[48px_48px] opacity-40" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="border-b border-rootsy-hairline bg-card/90 shadow-sm backdrop-blur-xl">
          <div className="grid h-18 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 px-4">
            <div className="flex min-w-0 items-center gap-3">
              <Link
                href={popMenuHref(siteId, popId)}
                className="group inline-flex size-10 items-center justify-center rounded-xl border border-foreground/10 bg-secondary text-foreground/70 transition-all hover:border-primary/25 hover:bg-muted hover:text-foreground"
                aria-label="Volver al menú"
              >
                <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-0.5" />
              </Link>
              <div className="h-6 w-px bg-border" />
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="size-8 overflow-hidden rounded-lg ring-1 ring-border">
                  <img
                    src={popLogoSrc}
                    alt=""
                    className="size-full object-cover"
                  />
                </div>
                <span className="truncate text-sm font-semibold text-foreground/90">
                  {popName || (loading ? "…" : "—")}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <h1 className="flex items-center gap-2 text-[1.65rem] font-black tracking-tight text-foreground">
                <span className="inline-flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <ClipboardList className="size-5" aria-hidden />
                </span>
                Operaciones
              </h1>
              <div
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest",
                  isOnline
                    ? "border-primary/30 bg-primary/10 text-forest"
                    : "border-destructive/30 bg-destructive/10 text-destructive",
                )}
              >
                {isOnline ? (
                  <Wifi className="size-3" aria-hidden />
                ) : (
                  <WifiOff className="size-3" aria-hidden />
                )}
                {isOnline ? "Online" : "Offline"}
              </div>
            </div>

            <div className="flex shrink-0 items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => void toggleFullscreen()}
                className="group inline-flex size-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label={
                  isFullscreen
                    ? "Salir de pantalla completa"
                    : "Pantalla completa"
                }
              >
                {isFullscreen ? (
                  <Minimize2 className="size-4.5" />
                ) : (
                  <Maximize2 className="size-4.5" />
                )}
              </button>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="size-10 ring-1 ring-border">
                    <AvatarImage src={userAvatarSrc} alt="" />
                    <AvatarFallback className="bg-primary/10 text-xs text-primary">
                      {headerUserName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-card bg-primary" />
                </div>
                <div className="hidden min-w-0 flex-col leading-tight sm:flex">
                  <span className="truncate text-sm font-semibold text-foreground/90">
                    {headerUserName}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-meadow">
                    <Leaf className="size-3" aria-hidden />
                    Ventas
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
          {error ? (
            <div
              role="alert"
              className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Registro de ventas
                  </h2>
                  <p className="max-w-xl text-sm text-muted-foreground">
                    Ventas y movimientos de gastos del punto de venta. En ventas,
                    expandí una fila para ver ítems, cobros e importes.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full bg-muted px-3 py-1 font-medium text-foreground/80">
                    {loading
                      ? "…"
                      : `${sales.length} ventas · ${expenseLedger.length} gastos`}
                  </span>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-border bg-card/95 shadow-md shadow-primary/5 backdrop-blur-sm">
                <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                  <ClipboardList className="size-4 text-primary" aria-hidden />
                  <span className="text-sm font-semibold text-foreground">
                    Listado
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {loading ? "Cargando…" : `${sales.length} ventas`}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border bg-muted/40 hover:bg-muted/40">
                        <TableHead className="w-10" />
                        <TableHead className="font-semibold text-foreground">
                          Fecha
                        </TableHead>
                        <TableHead className="font-semibold text-foreground">
                          Estado
                        </TableHead>
                        <TableHead className="font-semibold text-foreground">
                          Cliente
                        </TableHead>
                        <TableHead className="text-right font-semibold text-foreground">
                          Total
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow className="border-border">
                          <TableCell
                            colSpan={5}
                            className="py-10 text-center text-muted-foreground"
                          >
                            Cargando ventas…
                          </TableCell>
                        </TableRow>
                      ) : sales.length === 0 ? (
                        <TableRow className="border-border">
                          <TableCell
                            colSpan={5}
                            className="py-10 text-center text-muted-foreground"
                          >
                            No hay ventas registradas en este punto.
                          </TableCell>
                        </TableRow>
                      ) : (
                        sales.map((sale) => {
                          const open = expandedId === sale.id
                          return (
                            <Fragment key={sale.id}>
                              <TableRow
                                className={cn(
                                  "border-border transition-[box-shadow,background-color]",
                                  open
                                    ? "bg-muted/50"
                                    : "hover:bg-muted/30",
                                )}
                              >
                                <TableCell className="align-middle">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 text-muted-foreground hover:text-foreground"
                                    aria-expanded={open}
                                    aria-label={
                                      open
                                        ? "Ocultar detalle de la venta"
                                        : "Ver detalle de la venta"
                                    }
                                    onClick={() =>
                                      setExpandedId((id) =>
                                        id === sale.id ? null : sale.id,
                                      )
                                    }
                                  >
                                    {open ? (
                                      <ChevronDown className="size-4" />
                                    ) : (
                                      <ChevronRight className="size-4" />
                                    )}
                                  </Button>
                                </TableCell>
                                <TableCell className="text-sm tabular-nums text-foreground">
                                  {formatDateTime(sale.soldAt)}
                                </TableCell>
                                <TableCell>
                                  <span
                                    className={cn(
                                      "inline-flex rounded-md border px-2 py-0.5 text-xs font-medium",
                                      sale.status === "completed"
                                        ? "border-emerald-500/35 bg-emerald-50 text-emerald-900"
                                        : sale.status === "cancelled"
                                          ? "border-border bg-muted text-muted-foreground"
                                          : "border-amber-500/35 bg-amber-50 text-amber-950",
                                    )}
                                  >
                                    {statusLabel(sale.status)}
                                  </span>
                                </TableCell>
                                <TableCell className="max-w-[200px] truncate text-sm text-foreground">
                                  {sale.customerName ?? "—"}
                                </TableCell>
                                <TableCell className="text-right text-sm font-semibold tabular-nums text-primary">
                                  {fmt.format(sale.total)}
                                </TableCell>
                              </TableRow>
                              {open ? (
                                <TableRow className="border-border bg-muted/30 hover:bg-muted/30">
                                  <TableCell colSpan={5} className="p-0">
                                    <div className="space-y-4 px-4 py-4 sm:px-6">
                                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                        <div className="rounded-lg border border-border bg-card px-3 py-2">
                                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                            Subtotal (neto)
                                          </p>
                                          <p className="text-sm font-medium tabular-nums text-foreground">
                                            {fmt.format(sale.subtotal)}
                                          </p>
                                        </div>
                                        <div className="rounded-lg border border-border bg-card px-3 py-2">
                                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                            IVA
                                          </p>
                                          <p className="text-sm font-medium tabular-nums text-foreground">
                                            {fmt.format(sale.taxTotal)}
                                          </p>
                                        </div>
                                        <div className="rounded-lg border border-border bg-card px-3 py-2">
                                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                            Descuentos
                                          </p>
                                          <p className="text-sm font-medium tabular-nums text-foreground">
                                            {fmt.format(sale.discountTotal)}
                                          </p>
                                        </div>
                                        <div className="rounded-lg border border-border bg-card px-3 py-2">
                                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                            Moneda
                                          </p>
                                          <p className="text-sm font-medium text-foreground">
                                            {sale.currency}
                                          </p>
                                        </div>
                                      </div>

                                      {sale.payments.length > 0 ? (
                                        <div>
                                          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Cobros
                                          </p>
                                          <ul className="space-y-1 rounded-lg border border-border bg-muted/50 px-3 py-2">
                                            {sale.payments.map((p, i) => (
                                              <li
                                                key={`${sale.id}-p-${i}`}
                                                className="flex justify-between text-sm text-foreground"
                                              >
                                                <span>{p.methodName}</span>
                                                <span className="tabular-nums">
                                                  {fmt.format(p.amount)}
                                                </span>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      ) : null}

                                      <div>
                                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                          Ítems
                                        </p>
                                        <div className="overflow-x-auto rounded-lg border border-border">
                                          <Table>
                                            <TableHeader>
                                              <TableRow className="border-border bg-muted/40 hover:bg-muted/40">
                                                <TableHead className="font-semibold text-foreground">
                                                  Producto
                                                </TableHead>
                                                <TableHead className="text-right font-semibold text-foreground">
                                                  Cant.
                                                </TableHead>
                                                <TableHead className="text-right font-semibold text-foreground">
                                                  P. unit.
                                                </TableHead>
                                                <TableHead className="text-right font-semibold text-foreground">
                                                  IVA %
                                                </TableHead>
                                                <TableHead className="text-right font-semibold text-foreground">
                                                  Desc.
                                                </TableHead>
                                                <TableHead className="text-right font-semibold text-foreground">
                                                  Línea
                                                </TableHead>
                                              </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                              {sale.lineItems.length === 0 ? (
                                                <TableRow className="border-border">
                                                  <TableCell
                                                    colSpan={6}
                                                    className="text-center text-muted-foreground"
                                                  >
                                                    Sin líneas en el comprobante.
                                                  </TableCell>
                                                </TableRow>
                                              ) : (
                                                sale.lineItems.map(
                                                  (line, li) => (
                                                    <TableRow
                                                      key={`${sale.id}-line-${li}`}
                                                      className="border-border"
                                                    >
                                                      <TableCell className="max-w-[220px]">
                                                        <span className="font-medium text-foreground">
                                                          {line.nameSnapshot}
                                                        </span>
                                                        {line.comment ? (
                                                          <span className="mt-0.5 block text-xs text-muted-foreground">
                                                            {line.comment}
                                                          </span>
                                                        ) : null}
                                                      </TableCell>
                                                      <TableCell className="text-right text-sm tabular-nums text-foreground">
                                                        {formatQty(
                                                          line.quantity,
                                                        )}
                                                      </TableCell>
                                                      <TableCell className="text-right text-sm tabular-nums text-foreground">
                                                        {fmt.format(
                                                          line.unitPrice,
                                                        )}
                                                      </TableCell>
                                                      <TableCell className="text-right text-sm tabular-nums text-foreground">
                                                        {line.iva > 0
                                                          ? `${line.iva}%`
                                                          : "—"}
                                                      </TableCell>
                                                      <TableCell className="text-right text-sm tabular-nums text-foreground">
                                                        {fmt.format(
                                                          line.lineDiscount,
                                                        )}
                                                      </TableCell>
                                                      <TableCell className="text-right text-sm font-medium tabular-nums text-primary">
                                                        {fmt.format(
                                                          line.lineTotal,
                                                        )}
                                                      </TableCell>
                                                    </TableRow>
                                                  ),
                                                )
                                              )}
                                            </TableBody>
                                          </Table>
                                        </div>
                                      </div>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ) : null}
                            </Fragment>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Gastos (contabilidad)
                  </h2>
                  <p className="max-w-xl text-sm text-muted-foreground">
                    Pagos de gastos y anulaciones registrados como asientos
                    contables.
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-border bg-card/95 shadow-md shadow-primary/5 backdrop-blur-sm">
                <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                  <ClipboardList className="size-4 text-primary" aria-hidden />
                  <span className="text-sm font-semibold text-foreground">
                    Libro de gastos
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {loading ? "Cargando…" : `${expenseLedger.length} movimientos`}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border bg-muted/40 hover:bg-muted/40">
                        <TableHead className="font-semibold text-foreground">
                          Fecha asiento
                        </TableHead>
                        <TableHead className="font-semibold text-foreground">
                          Tipo
                        </TableHead>
                        <TableHead className="font-semibold text-foreground">
                          Medio
                        </TableHead>
                        <TableHead className="font-semibold text-foreground">
                          Detalle
                        </TableHead>
                        <TableHead className="text-right font-semibold text-foreground">
                          Importe
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow className="border-border">
                          <TableCell
                            colSpan={5}
                            className="py-10 text-center text-muted-foreground"
                          >
                            Cargando gastos…
                          </TableCell>
                        </TableRow>
                      ) : expenseLedger.length === 0 ? (
                        <TableRow className="border-border">
                          <TableCell
                            colSpan={5}
                            className="py-10 text-center text-muted-foreground"
                          >
                            No hay pagos de gastos contabilizados en este punto.
                          </TableCell>
                        </TableRow>
                      ) : (
                        expenseLedger.map((row) => (
                          <TableRow key={row.entryId} className="border-border">
                            <TableCell className="text-sm text-foreground">
                              {formatLedgerDate(row.entryDate)}
                            </TableCell>
                            <TableCell className="text-sm">
                              <span
                                className={cn(
                                  "rounded-full border px-2 py-0.5 text-xs font-medium",
                                  row.sourceType === "expense_void"
                                    ? "border-border bg-muted text-muted-foreground"
                                    : "border-primary/25 bg-primary/10 text-primary",
                                )}
                              >
                                {expenseLedgerKindLabel(row)}
                              </span>
                            </TableCell>
                            <TableCell className="max-w-[140px] truncate text-sm text-foreground">
                              {row.methodName ?? "—"}
                            </TableCell>
                            <TableCell className="max-w-[280px] text-sm text-foreground">
                              <span className="line-clamp-2">{row.description}</span>
                            </TableCell>
                            <TableCell
                              className={cn(
                                "text-right text-sm font-semibold tabular-nums",
                                row.sourceType === "expense_void"
                                  ? "text-muted-foreground"
                                  : "text-primary",
                              )}
                            >
                              {fmt.format(row.amount)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default withAuth(OperationsPage)
