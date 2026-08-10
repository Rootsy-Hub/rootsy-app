"use client"

import { COLOR_TOKENS } from "@/app/library/color/rootsyColorSystem"
import { cn } from "@/lib/utils"
import { Check, ChevronDown, Package, Search, Settings, Users } from "lucide-react"
import type { ReactNode } from "react"

const ON_DARK = "#F4F8F6"

function ExampleWrap({
  title,
  foundations,
  children,
  caption,
}: {
  title: string
  foundations: string
  children: ReactNode
  caption?: string
}) {
  return (
    <div className="space-y-3">
      <div>
        <p className="font-canopy text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{foundations}</p>
      </div>
      {children}
      {caption ? (
        <p className="font-stream text-xs leading-relaxed text-muted-foreground">{caption}</p>
      ) : null}
    </div>
  )
}

/** Formulario workspace — bruma + borde + radio + savia en acción */
export function ColorExampleWorkspaceForm() {
  return (
    <ExampleWrap
      title="Formulario · workspace"
      foundations="color.bruma · typography UI · spacing 8px · border 1px · radius lg · savia acción"
      caption="Bruma respira el cuerpo; savia confirma una sola acción primaria."
    >
      <div
        className="overflow-hidden rounded-2xl border p-6"
        style={{ backgroundColor: COLOR_TOKENS.bruma100, borderColor: COLOR_TOKENS.bruma200 }}
      >
        <p className="font-canopy text-base font-semibold" style={{ color: COLOR_TOKENS.bruma900 }}>
          Nuevo artículo
        </p>
        <p className="mt-1 font-stream text-sm" style={{ color: COLOR_TOKENS.bruma500 }}>
          Completá los datos básicos del catálogo.
        </p>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <label
              className="font-canopy text-xs font-medium uppercase tracking-wide"
              style={{ color: COLOR_TOKENS.bruma500 }}
            >
              Nombre
            </label>
            <input
              readOnly
              value="Medialuna clásica"
              className="w-full rounded-lg border px-3 py-2 font-canopy text-sm outline-none"
              style={{
                backgroundColor: COLOR_TOKENS.white,
                borderColor: COLOR_TOKENS.bruma200,
                color: COLOR_TOKENS.bruma900,
              }}
            />
          </div>
          <div className="space-y-2">
            <label
              className="font-canopy text-xs font-medium uppercase tracking-wide"
              style={{ color: COLOR_TOKENS.bruma500 }}
            >
              Precio
            </label>
            <input
              readOnly
              value="$ 1.200"
              className="w-full rounded-lg border px-3 py-2 font-ledger text-sm font-semibold tabular-nums outline-none"
              style={{
                backgroundColor: COLOR_TOKENS.white,
                borderColor: COLOR_TOKENS.savia500,
                boxShadow: "0 0 0 2px rgb(5 150 105 / 0.18)",
                color: COLOR_TOKENS.bruma900,
              }}
            />
            <p className="font-stream text-xs" style={{ color: COLOR_TOKENS.bruma500 }}>
              Precio de lista · actualizado hoy
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            className="rounded-lg border px-4 py-2 font-canopy text-sm font-medium"
            style={{
              borderColor: COLOR_TOKENS.bruma200,
              backgroundColor: COLOR_TOKENS.white,
              color: COLOR_TOKENS.bruma900,
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="rounded-lg px-4 py-2 font-canopy text-sm font-medium"
            style={{ backgroundColor: COLOR_TOKENS.savia600, color: COLOR_TOKENS.white }}
          >
            Guardar
          </button>
        </div>
      </div>
    </ExampleWrap>
  )
}

/** Fila de listado — tabla workspace con selección savia */
export function ColorExampleListRow() {
  const rows = [
    { name: "Café con leche", meta: "Bebidas", price: "$ 2.800", active: true },
    { name: "Tostado completo", meta: "Sandwich", price: "$ 4.500", active: false },
    { name: "Agua sin gas", meta: "Bebidas", price: "$ 900", active: false },
  ]

  return (
    <ExampleWrap
      title="Listado · tabla workspace"
      foundations="color.bruma · elevación flat · border hairline · spacing fila · tipografía métrica"
      caption="Filas alternadas en bruma; selección con tinte savia — sin decoración extra."
    >
      <div
        className="overflow-hidden rounded-2xl border"
        style={{ backgroundColor: COLOR_TOKENS.white, borderColor: COLOR_TOKENS.bruma200 }}
      >
        <div
          className="flex items-center gap-3 border-b px-4 py-3"
          style={{ borderColor: COLOR_TOKENS.bruma200, backgroundColor: COLOR_TOKENS.bruma50 }}
        >
          <Search className="size-4 shrink-0" style={{ color: COLOR_TOKENS.bruma500 }} aria-hidden />
          <span className="font-canopy text-sm" style={{ color: COLOR_TOKENS.bruma500 }}>
            Buscar artículos…
          </span>
        </div>
        {rows.map((row) => (
          <div
            key={row.name}
            className={cn(
              "flex items-center justify-between gap-4 border-b px-4 py-3 last:border-b-0",
            )}
            style={{
              borderColor: COLOR_TOKENS.bruma200,
              backgroundColor: row.active ? COLOR_TOKENS.savia100 : COLOR_TOKENS.white,
            }}
          >
            <div className="min-w-0">
              <p className="font-canopy text-sm font-medium" style={{ color: COLOR_TOKENS.bruma900 }}>
                {row.name}
              </p>
              <p className="font-stream text-xs" style={{ color: COLOR_TOKENS.bruma500 }}>
                {row.meta}
              </p>
            </div>
            <p className="font-ledger text-sm font-semibold tabular-nums" style={{ color: COLOR_TOKENS.bruma900 }}>
              {row.price}
            </p>
          </div>
        ))}
      </div>
    </ExampleWrap>
  )
}

/** Tile POS — sombra + savia */
export function ColorExamplePosTile() {
  return (
    <ExampleWrap
      title="Tile · mostrador POS"
      foundations="color.sombra · radius lg · spacing compacto · savia CTA · tipografía on-dark"
      caption="Dosel sombra con profundidad por capas; savia solo en el botón Vender."
    >
      <div
        className="mx-auto max-w-xs overflow-hidden rounded-2xl border p-4"
        style={{
          backgroundColor: COLOR_TOKENS.sombra600,
          borderColor: COLOR_TOKENS.sombraBorder,
        }}
      >
        <p
          className="font-canopy text-[10px] font-semibold uppercase tracking-wide"
          style={{ color: COLOR_TOKENS.sombra300 }}
        >
          Bebidas
        </p>
        <div
          className="mt-3 rounded-xl border p-4"
          style={{
            backgroundColor: COLOR_TOKENS.sombra500,
            borderColor: COLOR_TOKENS.sombraBorder,
          }}
        >
          <p className="font-canopy text-sm font-medium" style={{ color: ON_DARK }}>
            Cola 500 ml
          </p>
          <p
            className="mt-2 font-ledger text-lg font-bold tabular-nums"
            style={{ color: ON_DARK }}
          >
            $ 1.250
          </p>
        </div>
        <button
          type="button"
          className="mt-4 w-full rounded-lg py-2.5 font-canopy text-sm font-semibold"
          style={{ backgroundColor: COLOR_TOKENS.savia600, color: COLOR_TOKENS.white }}
        >
          Vender
        </button>
      </div>
    </ExampleWrap>
  )
}

/** Cards elevadas — bloques layout */
export function ColorExampleRaisedCards() {
  const cards = [
    { title: "Caja principal", balance: "$ 842.500", meta: "Actualizado hace 2 h" },
    { title: "Mercado Pago", balance: "$ 128.300", meta: "Sincronizado" },
  ]

  return (
    <ExampleWrap
      title="Cards · bloques workspace"
      foundations="color.bruma + white · elevación raised · radius 2xl · spacing card · hover shadow"
      caption="Superficie blanca sobre bruma; sombra raised al elevar — entidad con cara propia."
    >
      <div
        className="rounded-2xl p-6"
        style={{ backgroundColor: COLOR_TOKENS.bruma100 }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border p-5 transition-shadow"
              style={{
                backgroundColor: COLOR_TOKENS.white,
                borderColor: COLOR_TOKENS.bruma200,
                boxShadow: "0 1px 3px rgb(15 23 42 / 0.06), 0 1px 2px rgb(15 23 42 / 0.04)",
              }}
            >
              <p className="font-canopy text-sm font-medium" style={{ color: COLOR_TOKENS.bruma500 }}>
                {card.title}
              </p>
              <p
                className="mt-2 font-ledger text-2xl font-bold tabular-nums tracking-tight"
                style={{ color: COLOR_TOKENS.bruma900 }}
              >
                {card.balance}
              </p>
              <p className="mt-2 font-stream text-xs" style={{ color: COLOR_TOKENS.bruma500 }}>
                {card.meta}
              </p>
            </div>
          ))}
        </div>
      </div>
    </ExampleWrap>
  )
}

/** Banner de éxito — savia tint + borde */
export function ColorExampleBanner() {
  return (
    <ExampleWrap
      title="Banner · confirmación"
      foundations="color.savia tint · border selected · radius lg · tipografía UI + stream"
      caption="Savia en fondo tenue — mensaje positivo sin saturar la pantalla."
    >
      <div
        className="flex items-start gap-3 rounded-xl border px-4 py-3"
        style={{
          backgroundColor: COLOR_TOKENS.savia100,
          borderColor: COLOR_TOKENS.savia500,
        }}
      >
        <Check className="mt-0.5 size-4 shrink-0" style={{ color: COLOR_TOKENS.savia600 }} aria-hidden />
        <div>
          <p className="font-canopy text-sm font-medium" style={{ color: COLOR_TOKENS.bruma900 }}>
            Venta registrada
          </p>
          <p className="mt-0.5 font-stream text-sm" style={{ color: COLOR_TOKENS.bruma700 }}>
            Ticket #1842 · Medialuna x2, Café x1
          </p>
        </div>
      </div>
    </ExampleWrap>
  )
}

/** Dropdown — overlay elevado */
export function ColorExampleDropdown() {
  return (
    <ExampleWrap
      title="Menú · dropdown"
      foundations="color.white · elevación overlay · radius lg · border bruma · motion implícito"
      caption="Panel flotante con shadow overlay — misma savia en ítem seleccionado."
    >
      <div className="relative mx-auto max-w-[220px]">
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-lg border px-3 py-2 font-canopy text-sm"
          style={{
            backgroundColor: COLOR_TOKENS.white,
            borderColor: COLOR_TOKENS.bruma200,
            color: COLOR_TOKENS.bruma900,
          }}
        >
          Panadería Centro
          <ChevronDown className="size-4 opacity-60" aria-hidden />
        </button>
        <div
          className="absolute left-0 right-0 top-[calc(100%+6px)] overflow-hidden rounded-xl border py-1"
          style={{
            backgroundColor: COLOR_TOKENS.white,
            borderColor: COLOR_TOKENS.bruma200,
            boxShadow: "0 10px 24px rgb(15 23 42 / 0.12), 0 4px 8px rgb(15 23 42 / 0.06)",
          }}
        >
          {["Panadería Centro", "Sucursal Norte", "Depósito"].map((item, i) => (
            <div
              key={item}
              className="px-3 py-2 font-canopy text-sm"
              style={{
                backgroundColor: i === 0 ? COLOR_TOKENS.savia100 : "transparent",
                color: COLOR_TOKENS.bruma900,
                fontWeight: i === 0 ? 500 : 400,
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </ExampleWrap>
  )
}

/** Nav lateral — rail sombra en workspace */
export function ColorExampleSideNav() {
  const items = [
    { label: "General", icon: Settings, active: false },
    { label: "Artículos", icon: Package, active: true },
    { label: "Usuarios", icon: Users, active: false },
  ]

  return (
    <ExampleWrap
      title="Nav lateral · rail oscuro"
      foundations="color.sombra 700 · sombra 300 texto · tipografía body · spacing 8px · radius lg"
      caption="Dosel sombra para navegación fija; texto secundario legible — activo en primer plano sin decoración."
    >
      <div
        className="mx-auto max-w-[240px] overflow-hidden rounded-2xl border p-4"
        style={{
          backgroundColor: COLOR_TOKENS.sombra700,
          borderColor: COLOR_TOKENS.sombraBorder,
        }}
      >
        <p
          className="mb-3 px-2 font-canopy text-xs font-semibold uppercase tracking-wide"
          style={{ color: COLOR_TOKENS.sombra300 }}
        >
          Configuración
        </p>
        <nav className="space-y-0.5" aria-label="Ejemplo de navegación lateral">
          {items.map(({ label, icon: Icon, active }) => (
            <div
              key={label}
              className={cn(
                "flex min-h-9 items-center gap-2 rounded-lg px-2 font-canopy text-sm",
                active && "font-medium",
              )}
              style={{ color: active ? ON_DARK : COLOR_TOKENS.sombra300 }}
            >
              <Icon className="size-4 shrink-0 opacity-80" aria-hidden />
              {label}
            </div>
          ))}
        </nav>
      </div>
    </ExampleWrap>
  )
}

/** Split header + body — layouts shell */
export function ColorExampleShellSplit() {
  return (
    <ExampleWrap
      title="Shell · header + cuerpo"
      foundations="layouts shell · color.sombra header · color.bruma body · spacing h-17"
      caption="Header nocturno compartido; cuerpo bruma — el patrón de toda pantalla operativa."
    >
      <div
        className="overflow-hidden rounded-2xl border"
        style={{ borderColor: COLOR_TOKENS.bruma200 }}
      >
        <div
          className="flex h-14 items-center border-b px-4"
          style={{
            backgroundColor: COLOR_TOKENS.sombra700,
            borderColor: COLOR_TOKENS.sombraBorder,
          }}
        >
          <p className="font-canopy text-sm font-semibold" style={{ color: ON_DARK }}>
            Artículos
          </p>
          <span
            className="ml-auto rounded-md px-2 py-1 font-canopy text-xs font-medium"
            style={{ backgroundColor: COLOR_TOKENS.savia600, color: COLOR_TOKENS.white }}
          >
            Nuevo
          </span>
        </div>
        <div className="p-4" style={{ backgroundColor: COLOR_TOKENS.bruma100 }}>
          <div
            className="rounded-xl border p-4"
            style={{
              backgroundColor: COLOR_TOKENS.white,
              borderColor: COLOR_TOKENS.bruma200,
            }}
          >
            <p className="font-canopy text-sm" style={{ color: COLOR_TOKENS.bruma900 }}>
              Contenido del listado — scroll en el cuerpo, chrome fijo arriba.
            </p>
          </div>
        </div>
      </div>
    </ExampleWrap>
  )
}

const MODAL_SCRIM = "rgb(5 8 7 / 0.4)"

function ModalChrome({
  title,
  description,
  children,
  footer,
}: {
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{ minHeight: 300, backgroundColor: MODAL_SCRIM }}
    >
      <div
        className="relative mx-auto mt-10 max-w-sm overflow-hidden rounded-2xl border"
        style={{
          backgroundColor: COLOR_TOKENS.white,
          borderColor: COLOR_TOKENS.bruma200,
          boxShadow: "0 16px 40px rgb(15 23 42 / 0.18), 0 6px 16px rgb(15 23 42 / 0.1)",
        }}
      >
        <div
          className="border-b px-5 pb-3.5 pt-5"
          style={{ borderColor: "rgb(0 0 0 / 0.06)" }}
        >
          <p className="font-canopy text-base font-semibold tracking-tight" style={{ color: COLOR_TOKENS.bruma900 }}>
            {title}
          </p>
          {description ? (
            <p className="mt-0.5 font-stream text-sm" style={{ color: COLOR_TOKENS.bruma500 }}>
              {description}
            </p>
          ) : null}
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer ? (
          <div
            className="flex items-center justify-between gap-3 border-t px-5 py-3"
            style={{ borderColor: "rgb(0 0 0 / 0.06)" }}
          >
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )
}

/** Modal · formulario con footer dual */
export function ColorExampleModalForm() {
  return (
    <ExampleWrap
      title="Modal · formulario"
      foundations="color.white · scrim sombra · elevación overlay · radius 2xl · savia acción"
      caption="Scrim sombra 950 al 40%; superficie blanca; savia solo en confirmar."
    >
      <ModalChrome
        title="Editar artículo"
        description="Cambios en catálogo y precio de venta."
        footer={
          <>
            <button
              type="button"
              className="rounded-lg border px-4 py-2 font-canopy text-sm font-medium"
              style={{
                borderColor: COLOR_TOKENS.bruma200,
                backgroundColor: COLOR_TOKENS.white,
                color: COLOR_TOKENS.bruma900,
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="rounded-lg px-4 py-2 font-canopy text-sm font-medium"
              style={{ backgroundColor: COLOR_TOKENS.savia600, color: COLOR_TOKENS.white }}
            >
              Guardar
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="space-y-1.5">
            <p className="font-canopy text-xs font-medium uppercase tracking-wide" style={{ color: COLOR_TOKENS.bruma500 }}>
              Nombre
            </p>
            <div
              className="rounded-lg border px-3 py-2 font-canopy text-sm"
              style={{
                borderColor: COLOR_TOKENS.bruma200,
                color: COLOR_TOKENS.bruma900,
              }}
            >
              Medialuna clásica
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="font-canopy text-xs font-medium uppercase tracking-wide" style={{ color: COLOR_TOKENS.bruma500 }}>
              Precio
            </p>
            <div
              className="rounded-lg border px-3 py-2 font-ledger text-sm font-semibold tabular-nums"
              style={{
                borderColor: COLOR_TOKENS.bruma200,
                color: COLOR_TOKENS.bruma900,
              }}
            >
              $ 1.200
            </div>
          </div>
        </div>
      </ModalChrome>
    </ExampleWrap>
  )
}

/** Modal · confirmación simple */
export function ColorExampleModalConfirm() {
  return (
    <ExampleWrap
      title="Modal · confirmación"
      foundations="color.white · scrim sombra · tipografía UI + stream · footer single savia"
      caption="Una acción primaria — cierre con × o scrim fuera del panel."
    >
      <ModalChrome
        title="Registrar venta"
        description="¿Confirmás el ticket por $ 4.500?"
        footer={
          <button
            type="button"
            className="ml-auto rounded-lg px-4 py-2 font-canopy text-sm font-medium"
            style={{ backgroundColor: COLOR_TOKENS.savia600, color: COLOR_TOKENS.white }}
          >
            Confirmar
          </button>
        }
      >
        <p className="font-stream text-sm leading-relaxed" style={{ color: COLOR_TOKENS.bruma700 }}>
          Medialuna x2 · Café con leche x1
        </p>
      </ModalChrome>
    </ExampleWrap>
  )
}

/** Alert dialog · acción destructiva */
export function ColorExampleModalAlert() {
  return (
    <ExampleWrap
      title="Alert dialog · destructivo"
      foundations="color.white · scrim sombra · funcional danger · radius 2xl"
      caption="Rojo funcional solo en acciones irreversibles — no es familia de marca."
    >
      <ModalChrome
        title="Eliminar artículo"
        description="Esta acción no se puede deshacer."
        footer={
          <>
            <button
              type="button"
              className="rounded-lg border px-4 py-2 font-canopy text-sm font-medium"
              style={{
                borderColor: COLOR_TOKENS.bruma200,
                color: COLOR_TOKENS.bruma900,
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="rounded-lg px-4 py-2 font-canopy text-sm font-medium text-white"
              style={{ backgroundColor: "#DC2626" }}
            >
              Eliminar
            </button>
          </>
        }
      >
        <p className="font-stream text-sm" style={{ color: COLOR_TOKENS.bruma700 }}>
          Se quitará &quot;Medialuna clásica&quot; del catálogo de la sucursal.
        </p>
      </ModalChrome>
    </ExampleWrap>
  )
}

export function ColorModalExamplesGallery() {
  return (
    <div className="grid gap-10 lg:grid-cols-2 xl:grid-cols-3">
      <ColorExampleModalForm />
      <ColorExampleModalConfirm />
      <ColorExampleModalAlert />
    </div>
  )
}

export function ColorUiExamplesGallery() {
  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <ColorExampleWorkspaceForm />
      <ColorExampleListRow />
      <ColorExamplePosTile />
      <ColorExampleRaisedCards />
      <ColorExampleBanner />
      <ColorExampleDropdown />
      <ColorExampleSideNav />
      <div className="lg:col-span-2">
        <ColorExampleShellSplit />
      </div>
    </div>
  )
}
